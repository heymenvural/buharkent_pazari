"use server";

import { randomBytes, randomInt } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { isValidObjectId, trusted, Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import { HUMAN_ERROR, verifyHuman } from "@/lib/turnstile";
import { round2, shippingForPart, type PartStatus } from "@/lib/orders";
import { lookupSchema, orderSchema } from "@/lib/validation/checkout";
import { sendOrderPlacedEmail, sendSellerNewOrderEmail } from "@/lib/mailer";
import { Listing } from "@/models/Listing";
import { productPhotos } from "@/lib/stockPhotos";
import { returnStock, takeStock } from "@/lib/stock";
import { Order, type IOrderPart } from "@/models/Order";
import { Product } from "@/models/Product";
import { SellerProfile } from "@/models/SellerProfile";
import { User } from "@/models/User";

export type CartFix = {
  offerId: string;
  variantId: string;
  price?: number;
  maxQty?: number;
  removed?: boolean;
  name?: string;
};

export type OrderResult = {
  ok: boolean;
  orderNo?: string;
  token?: string;
  errors?: Record<string, string>;
  fixes?: CartFix[];
};

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const newOrderNo = () =>
  "BP-" +
  Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join(
    "",
  );

const ip = async () =>
  (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

/* ---------- Sipariş oluştur ---------- */
export async function createOrder(input: unknown): Promise<OrderResult> {
  const clientIp = await ip();
  if (!await rateLimit(`order:${clientIp}`, 10, 60 * 60_000)) {
    return {
      ok: false,
      errors: {
        form: "Çok fazla sipariş denemesi yaptın. Biraz sonra tekrar dene.",
      },
    };
  }

  if (!(await verifyHuman((input as { turnstile?: unknown } | null)?.turnstile, clientIp))) return { ok: false, errors: { form: HUMAN_ERROR } };
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    parsed.error.issues.forEach((i) => {
      const k = i.path[0] === "form" ? String(i.path[1] ?? "form") : "form";
      errors[k] ??= i.message;
    });
    return { ok: false, errors };
  }
  const { form, items } = parsed.data;

  // Aynı ürün iki kez gelirse birleştir
  const merged = new Map<
    string,
    { offerId: string; variantId: string; qty: number; price: number }
  >();
  for (const it of items) {
    const k = `${it.offerId}:${it.variantId}`;
    const prev = merged.get(k);
    merged.set(
      k,
      prev ? { ...prev, qty: Math.min(99, prev.qty + it.qty) } : { ...it },
    );
  }
  const lines = [...merged.values()];

  try {
    await connectDB();
    const session = await auth();

    // Fiyat ve stok tarayıcıdan değil, veritabanından okunur
    const listings = await Listing.find({
      _id: trusted({ $in: lines.map((l) => l.offerId) }),
    }).lean();
    const sellerIds = [...new Set(listings.map((l) => l.seller.toString()))];
    const [sellers, profiles, products] = await Promise.all([
      User.find({ _id: trusted({ $in: sellerIds }) })
        .select("name phone sellerStatus")
        .lean(),
      SellerProfile.find({ user: trusted({ $in: sellerIds }) }).lean(),
      Product.find({ _id: trusted({ $in: listings.map((l) => l.product) }) })
        .select("name slug active images productType category")
        .lean(),
    ]);

    const fixes: CartFix[] = [];
    type Line = {
      listing: (typeof listings)[number];
      variant: (typeof listings)[number]["variants"][number];
      qty: number;
      product: (typeof products)[number];
    };
    const ok: Line[] = [];

    for (const l of lines) {
      const listing = listings.find((x) => x._id.toString() === l.offerId);
      const variant = listing?.variants.find(
        (v) => v._id.toString() === l.variantId,
      );
      const product =
        listing &&
        products.find((p) => p._id.toString() === listing.product.toString());
      const seller =
        listing &&
        sellers.find((s) => s._id.toString() === listing.seller.toString());
      const available =
        listing &&
        variant &&
        product &&
        product.active &&
        listing.status === "active" &&
        seller?.sellerStatus === "approved";
      if (!available) {
        fixes.push({
          offerId: l.offerId,
          variantId: l.variantId,
          removed: true,
          name: product?.name,
        });
        continue;
      }
      if (variant.stock < l.qty) {
        fixes.push({
          offerId: l.offerId,
          variantId: l.variantId,
          maxQty: variant.stock,
          removed: variant.stock === 0,
          name: product.name,
        });
        continue;
      }
      if (Math.abs(variant.price - l.price) > 0.009) {
        fixes.push({
          offerId: l.offerId,
          variantId: l.variantId,
          price: variant.price,
          name: product.name,
        });
        continue;
      }
      ok.push({ listing, variant, qty: l.qty, product });
    }

    if (fixes.length) {
      return {
        ok: false,
        fixes,
        errors: {
          form: "Sepetindeki bazı ürünlerin fiyatı veya stoğu değişti. Sepetini güncelledik, lütfen kontrol edip tekrar onayla.",
        },
      };
    }

    // Kapıda ödeme: tüm üreticiler kabul etmeli
    if (form.payment === "kapida") {
      const noCod = sellerIds.filter(
        (id) => !profiles.find((p) => p.user.toString() === id)?.codEnabled,
      );
      if (noCod.length) {
        const names = noCod
          .map(
            (id) =>
              profiles.find((p) => p.user.toString() === id)?.shopName ??
              sellers.find((s) => s._id.toString() === id)?.name,
          )
          .join(", ");
        return {
          ok: false,
          errors: {
            payment: `Şu üreticiler kapıda ödeme kabul etmiyor: ${names}. Havale/EFT seç.`,
          },
        };
      }
    }

    // Stok düşümü: aynı anda iki kişi son ürünü alamasın diye atomik yapılır
    const done: Line[] = [];
    for (const line of ok) {
      const taken = await takeStock(line.listing._id, line.variant._id, line.qty);
      if (!taken) {
        // Geri al
        for (const d of done) {
          await returnStock(d.listing._id, d.variant._id, d.qty);
        }
        return {
          ok: false,
          fixes: [
            {
              offerId: line.listing._id.toString(),
              variantId: line.variant._id.toString(),
              maxQty: 0,
              removed: true,
              name: line.product.name,
            },
          ],
          errors: {
            form: `${line.product.name} az önce tükendi. Sepetini güncelledik.`,
          },
        };
      }
      done.push(line);
    }

    // Üretici bazında alt siparişler
    const firstStatus: PartStatus =
      form.payment === "havale" ? "pending_payment" : "preparing";
    const now = new Date();
    const parts: Omit<IOrderPart, "_id">[] = sellerIds.map((sid) => {
      const mine = ok.filter((l) => l.listing.seller.toString() === sid);
      const profile = profiles.find((p) => p.user.toString() === sid);
      const seller = sellers.find((s) => s._id.toString() === sid)!;
      const subtotal = round2(
        mine.reduce((a, l) => a + l.variant.price * l.qty, 0),
      );
      const shipping = shippingForPart(
        subtotal,
        mine.map((l) => l.listing.shippingFee),
        profile?.freeShippingOver,
      );
      return {
        seller: new Types.ObjectId(sid),
        sellerName: profile?.shopName ?? seller.name,
        sellerPhone: profile?.phone ?? seller.phone,
        iban: profile?.iban,
        ibanName: profile?.ibanName,
        items: mine.map((l) => ({
          listing: l.listing._id,
          variantId: l.variant._id,
          product: l.product._id,
          slug: l.product.slug,
          name: l.product.name,
          label: l.variant.label,
          price: l.variant.price,
          qty: l.qty,
          image: l.listing.images?.[0] ?? productPhotos(l.product)[0],
        })),
        subtotal,
        shipping,
        total: round2(subtotal + shipping),
        status: firstStatus,
        history: [{ status: firstStatus, at: now, by: "customer" }],
      };
    });

    const subtotal = round2(parts.reduce((a, p) => a + p.subtotal, 0));
    const shipping = round2(parts.reduce((a, p) => a + p.shipping, 0));
    let order = null;
    try {
      for (let i = 0; i < 5 && !order; i++) {
        try {
          order = await Order.create({
            orderNo: newOrderNo(),
            token: randomBytes(24).toString("hex"),
            user:
              session?.user?.id && isValidObjectId(session.user.id)
                ? session.user.id
                : undefined,
            customer: {
              name: form.fullName,
              email: form.email.toLowerCase(),
              phone: form.phone,
            },
            address: {
              city: form.city,
              district: form.district,
              address: form.address,
            },
            note: form.note || undefined,
            payment: form.payment,
            parts,
            subtotal,
            shipping,
            total: round2(subtotal + shipping),
            ip: clientIp,
          });
        } catch (e) {
          if ((e as { code?: number }).code !== 11000) throw e; // sipariş no çakışması değilse
        }
      }
      if (!order) throw new Error("Sipariş numarası üretilemedi");
    } catch (e) {
      // Sipariş kaydedilemediyse düşülen stok geri verilir
      for (const d of done)
        await returnStock(d.listing._id, d.variant._id, d.qty);
      throw e;
    }

    updateTag("catalog");

    // E-postalar siparişi bekletmez; hata olursa sipariş yine geçerli
    const sellerEmails = await User.find({ _id: trusted({ $in: sellerIds }) })
      .select("email name")
      .lean();
    await Promise.allSettled([
      sendOrderPlacedEmail(order),
      ...order.parts.map((p) => {
        const u = sellerEmails.find(
          (s) => s._id.toString() === p.seller.toString(),
        );
        return u
          ? sendSellerNewOrderEmail(u.email, u.name, order, p)
          : Promise.resolve();
      }),
    ]).then((r) =>
      r.forEach(
        (x) =>
          x.status === "rejected" &&
          console.error("order mail error", x.reason),
      ),
    );

    return { ok: true, orderNo: order.orderNo, token: order.token };
  } catch (e) {
    console.error("order error", e);
    return {
      ok: false,
      errors: { form: "Sipariş oluşturulamadı, lütfen tekrar dene." },
    };
  }
}

/* ---------- Misafir sipariş sorgulama ---------- */
export async function lookupOrder(
  _: unknown,
  fd: FormData,
): Promise<{ error?: string }> {
  if (!await rateLimit(`lookup:${await ip()}`, 10, 15 * 60_000))
    return { error: "Çok fazla deneme yaptın. Biraz sonra tekrar dene." };
  const parsed = lookupSchema.safeParse({
    orderNo: fd.get("orderNo"),
    email: fd.get("email"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await connectDB();
  const order = await Order.findOne({ orderNo: parsed.data.orderNo })
    .select("customer.email token orderNo")
    .lean();
  if (!order || order.customer.email !== parsed.data.email)
    return { error: "Bu bilgilerle eşleşen bir sipariş bulamadık." };
  redirect(`/siparis/${order.orderNo}?t=${order.token}`);
}
