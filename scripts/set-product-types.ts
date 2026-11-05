// Mevcut katalog ürünlerine ürün türü atar (bir kere çalıştırılır).
// npx tsx --env-file=.env.local scripts/set-product-types.ts
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";

const MAP: Record<string, string> = {
  "ekstra-kuru-incir": "kuru-meyve",
  "incir-receli": "recel-pekmez-salca",
  "erken-hasat-zeytinyagi": "zeytinyagi",
  "kirma-yesil-zeytin": "sofralik-zeytin",
  "suzme-cicek-bali": "bal",
  "gun-kurusu-uzum-pekmezi": "recel-pekmez-salca",
  "ev-yapimi-domates-salcasi": "recel-pekmez-salca",
  "gezen-tavuk-koy-yumurtasi": "yumurta",
  "el-orgusu-yun-patik": "orgu-dokuma",
  "taze-siyah-incir": "taze-meyve-sebze",
};

async function main() {
  await connectDB();
  for (const [slug, productType] of Object.entries(MAP)) {
    const r = await Product.updateOne({ slug }, { productType });
    console.log(`${r.modifiedCount ? "✓" : "·"} ${slug} → ${productType}`);
  }
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
