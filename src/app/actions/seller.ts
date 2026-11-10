"use server";

import { isValidObjectId, Types } from "mongoose";
import { revalidatePath, updateTag } from "next/cache";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { SellerProfile } from "@/models/SellerProfile";
import { Listing } from "@/models/Listing";
import { Product } from "@/models/Product";
import { PRODUCT_TYPES } from "@/lib/compliance";
import { categories } from "@/lib/catalog";
import { isOwnImage } from "@/lib/cloudinary";
import { makeVariant } from "@/lib/units";
import { slugify } from "@/lib/slug";
import { listingSchema, shopSchema } from "@/lib/validation/listing";

type Result = { ok: boolean; id?: string; status?: string; errors?: Record<string, string> };

const fail = (form: string): Result => ({ ok: false, errors: { form } });

const collect = (issues: { path: PropertyKey[]; message: string }[]) => {
  const out: Record<string, string> = {};
  issues.forEach((i) => {
    const k = i.path.map(String).join(".") || "form";
    if (!out[k]) out[k] = i.message;
  });
  return out;
};

const ICON_BY_CATEGORY: Record<string, string> = {
  "incir-kuru-urunler": "Nut",
  "zeytin-zeytinyagi": "Droplets",
  "bal-recel-pekmez": "Hexagon",
  "meyve-sebze": "Apple",
  "sut-yumurta": "Egg",
  "el-emegi": "Scissors",
};

// Satıcı durumu her istekte veritabanından kontrol edilir (oturumdaki bilgiye güvenilmez)
async function requireSeller() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id || !isValidObjectId(id)) return null;
  await connectDB();
  const user = await User.findById(id).select("role sellerStatus").lean();
  if (!user || user.role !== "seller" || user.sellerStatus !== "approved") return null;
  const profile = await SellerProfile.findOne({ user: id });
  return profile ? { userId: id, profile } : null;
}

async function uniqueProductSlug(name: string) {
  const root = slugify(name);
  let slug = root;
  for (let i = 2; await Product.exists({ slug }); i++) slug = `${root}-${i}`;
  return slug;
}

/* ---------- Ürün ekle / düzenle ---------- */
export async function saveListing(input: unknown): Promise<Result> {
  const me = await requireSeller();
  if (!me) return fail("Bu işlem için onaylı üretici olarak giriş yapmalısın.");

  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: collect(parsed.error.issues) };
  const d = parsed.data;

  if (!d.images.every((u) => isOwnImage(u, me.userId))) return fail("Fotoğraflardan biri geçersiz. Lütfen tekrar yükle.");

  const allowedTypes = me.profile.productTypes ?? [];
  if (d.id && !isValidObjectId(d.id)) return fail("Ürün bulunamadı.");
  let listing = d.id ? await Listing.findOne({ _id: d.id, seller: me.userId }) : null;
  if (d.id && !listing) return fail("Ürün bulunamadı.");
  if (listing?.locked) return fail("Bu ürün bir bildirim sonrası yönetim tarafından kaldırıldı. Bizimle iletişime geç.");

  // Ürün seçimi (sadece yeni eklemede)
  let productId: Types.ObjectId;
  let productActive = true;
  if (listing) {
    productId = listing.product;
    productActive = !!(await Product.exists({ _id: productId, active: true }));
  } else if (d.productId) {
    if (!isValidObjectId(d.productId)) return fail("Geçersiz ürün.");
    const product = await Product.findById(d.productId).lean();
    if (!product) return fail("Ürün bulunamadı.");
    const own = product.createdBy?.toString() === me.userId;
    if (!product.productType || !allowedTypes.includes(product.productType) || (!product.active && !own)) {
      return fail("Bu ürünü satma iznin yok. Başvurunda seçtiğin ürün gruplarından birini seç.");
    }
    productId = product._id;
    productActive = product.active;
  } else {
    const np = d.newProduct!;
    if (!allowedTypes.includes(np.productType)) return fail("Bu ürün grubunda satış iznin yok.");
    const type = PRODUCT_TYPES.find((t) => t.key === np.productType)!;
    const existing = await Product.findOne({ productType: np.productType, name: new RegExp(`^${np.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") });
    if (existing) {
      productId = existing._id;
      productActive = existing.active;
    } else {
      const created = await Product.create({
        slug: await uniqueProductSlug(np.name),
        name: np.name,
        category: type.category,
        productType: type.key,
        description: "",
        iconKey: ICON_BY_CATEGORY[type.category] ?? "Package",
        bg: categories.find((c) => c.slug === type.category)?.bg ?? "from-sand-300 to-sand-400",
        active: false, // admin ilk ilanı onaylayınca açılır
        createdBy: me.userId,
      });
      productId = created._id;
      productActive = false;
    }
  }

  if (!listing && (await Listing.exists({ product: productId, seller: me.userId }))) {
    return fail("Bu ürün zaten ürünlerin arasında. Listeden düzenleyebilirsin.");
  }

  // Seçenekler: mevcut seçenek kimlikleri korunur (sepetteki ürünler bozulmasın)
  const oldIds = new Set(listing?.variants.map((v) => v._id.toString()) ?? []);
  const variants = d.variants.map((v) => {
    const { label, size } = makeVariant(v.amount, v.unit);
    return {
      ...(v.id && oldIds.has(v.id) ? { _id: new Types.ObjectId(v.id) } : {}),
      label,
      size,
      price: Math.round(v.price * 100) / 100,
      ...(v.oldPrice && v.oldPrice > v.price ? { oldPrice: Math.round(v.oldPrice * 100) / 100 } : {}),
      stock: v.stock,
    };
  });
  if (new Set(variants.map((v) => v.label)).size !== variants.length) return fail("Aynı miktarı iki kez ekledin.");

  // Durum: güvenilir üretici + yayındaki ürün → doğrudan yayına; diğerleri admin onayına
  const trusted = me.profile.trusted && productActive;
  let status: "active" | "paused" | "pending";
  if (!listing) status = trusted ? "active" : "pending";
  else if (listing.status === "active" || listing.status === "paused") status = trusted ? listing.status : "pending";
  else status = "pending";

  const fields = {
    variants,
    note: d.note,
    images: d.images,
    shippingFee: Math.round(d.shippingFee * 100) / 100,
    shipsIn: d.shipsIn,
    details: d.details,
    status,
    adminNote: undefined,
  };

  if (listing) {
    listing.set(fields);
    await listing.save();
  } else {
    listing = await Listing.create({ product: productId, seller: me.userId, ...fields });
  }

  updateTag("catalog");
  revalidatePath("/panel");
  return { ok: true, id: listing._id.toString(), status };
}

/* ---------- Satışa aç / durdur ---------- */
export async function setListingActive(id: string, active: boolean): Promise<Result> {
  const me = await requireSeller();
  if (!me) return fail("Bu işlem için onaylı üretici olarak giriş yapmalısın.");
  if (!isValidObjectId(id)) return fail("Geçersiz istek.");

  const listing = await Listing.findOne({ _id: id, seller: me.userId });
  if (!listing) return fail("Ürün bulunamadı.");
  if (listing.locked) return fail("Bu ürün yönetim tarafından kaldırıldı.");
  if (listing.status !== "active" && listing.status !== "paused") return fail("Bu ürün henüz onaylanmadı.");

  listing.status = active ? "active" : "paused";
  await listing.save();
  updateTag("catalog");
  revalidatePath("/panel");
  return { ok: true, status: listing.status };
}

/* ---------- Mağaza bilgileri ---------- */
export async function updateShop(input: unknown): Promise<Result> {
  const me = await requireSeller();
  if (!me) return fail("Bu işlem için onaylı üretici olarak giriş yapmalısın.");

  const parsed = shopSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: collect(parsed.error.issues) };
  const d = parsed.data;

  for (const key of ["avatar", "cover"] as const) {
    if (d[key] && !isOwnImage(d[key], me.userId)) return fail("Fotoğraf geçersiz. Lütfen tekrar yükle.");
  }

  const p = me.profile;
  p.shopName = d.shopName;
  p.tagline = d.tagline || undefined;
  p.story = d.story
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
  p.avatar = d.avatar || undefined;
  p.cover = d.cover || undefined;
  p.freeShippingOver = d.freeShippingOver && d.freeShippingOver > 0 ? Math.round(d.freeShippingOver) : undefined;
  p.codEnabled = d.codEnabled;
  await p.save();

  updateTag("catalog");
  revalidatePath("/panel");
  return { ok: true };
}
