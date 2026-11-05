import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { SellerProfile, type SellerKind } from "@/models/SellerProfile";
import { Product } from "@/models/Product";
import { Listing } from "@/models/Listing";
import { Review } from "@/models/Review";
import { catalog, offers, reviewsData, sellers } from "./seed-data";

const reset = process.argv.includes("--reset");
const iconKeyOf = (icon: unknown) =>
  (icon as { displayName?: string })?.displayName?.replace(/Icon$/, "") ?? "Package";

async function main() {
  await connectDB();
  console.log("✓ Veritabanına bağlanıldı");

  if (reset) {
    const demoUsers = await SellerProfile.find({ demo: true }).distinct("user");
    await Promise.all([
      Review.deleteMany({ demo: true }),
      Listing.deleteMany({ demo: true }),
      SellerProfile.deleteMany({ demo: true }),
      User.deleteMany({ _id: { $in: demoUsers } }),
    ]);
    console.log("✓ Demo veriler silindi");
    if (process.argv.includes("--only-reset")) return;
  }

  // 1) Ürünler (katalog)
  const productIds = new Map<string, mongoose.Types.ObjectId>();
  for (const p of catalog) {
    const doc = await Product.findOneAndUpdate(
      { slug: p.slug },
      {
        $set: {
          name: p.name,
          category: p.category,
          description: p.description,
          iconKey: iconKeyOf(p.icon),
          bg: p.bg,
          light: !!p.light,
          tags: p.tags,
          active: true,
        },
      },
      { upsert: true, returnDocument: "after" }
    );
    productIds.set(p.id, doc._id);
  }
  console.log(`✓ ${catalog.length} ürün`);

  // 2) Demo üreticiler (giriş yapamazlar: şifreleri yok)
  const sellerUserIds = new Map<string, mongoose.Types.ObjectId>();
  for (const s of sellers) {
    const email = `demo-${s.slug}@buharkentpazari.local`;
    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: { name: s.owner, role: "seller", sellerStatus: "approved", emailVerified: new Date() },
        $setOnInsert: { email, providers: [] },
      },
      { upsert: true, new: true }
    );
    const kind: SellerKind = s.type === "Kadın Girişimci" ? "kadin-girisimci" : "genc-ciftci";
    const cats = [...new Set(offers.filter((o) => o.sellerId === s.id).map((o) => catalog.find((p) => p.id === o.productId)!.category))];
    await SellerProfile.findOneAndUpdate(
      { user: user._id },
      {
        $set: {
          phone: "0",
          village: s.village,
          sellerType: kind,
          categories: cats,
          description: s.tagline,
          slug: s.slug,
          shopName: s.name,
          tagline: s.tagline,
          story: s.story,
          since: s.since,
          verified: s.verified,
          demo: true,
        },
      },
      { upsert: true, new: true }
    );
    sellerUserIds.set(s.id, user._id);
  }
  console.log(`✓ ${sellers.length} demo üretici`);

  // 3) İlanlar
  const listingIds = new Map<string, mongoose.Types.ObjectId>();
  for (const o of offers) {
    const product = productIds.get(o.productId)!;
    const seller = sellerUserIds.get(o.sellerId)!;
    const doc = await Listing.findOneAndUpdate(
      { product, seller },
      {
        $set: {
          variants: o.variants.map((v) => ({ label: v.label, size: v.size, price: v.price, oldPrice: v.oldPrice, stock: v.stock })),
          shippingFee: o.shippingFee,
          shipsIn: o.shipsIn,
          note: o.note,
          details: o.details.map(([k, v]) => ({ k, v })),
          rating: o.rating,
          reviewCount: o.reviews,
          status: "active",
          demo: true,
        },
      },
      { upsert: true, new: true }
    );
    listingIds.set(o.id, doc._id);
  }
  console.log(`✓ ${offers.length} ilan`);

  // 4) Yorumlar
  await Review.deleteMany({ demo: true });
  await Review.insertMany(
    reviewsData.map((r) => ({ listing: listingIds.get(r.offerId), name: r.name, rating: r.rating, text: r.text, demo: true }))
  );
  console.log(`✓ ${reviewsData.length} yorum`);
}

main()
  .then(() => console.log("Tamamlandı."))
  .catch((e) => {
    console.error("Hata:", e);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());