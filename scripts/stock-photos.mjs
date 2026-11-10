// public/gorseller altındaki genel ürün fotoğraflarını tarar ve listesini çıkarır.
// "npm run dev" ve "npm run build" öncesi otomatik çalışır.
import { readdirSync, writeFileSync, existsSync } from "node:fs";

const root = "public/gorseller";
const out = {};
for (const dir of ["urun", "tur", "kategori"]) {
  out[dir] = {};
  if (!existsSync(`${root}/${dir}`)) continue;
  for (const f of readdirSync(`${root}/${dir}`).sort()) {
    const m = f.match(/^([a-z0-9-]+)\.(webp|jpe?g|png|avif)$/i);
    if (m) out[dir][m[1].toLowerCase()] = `/gorseller/${dir}/${f}`;
  }
}
writeFileSync("src/lib/stockPhotos.generated.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Genel fotoğraflar: ${Object.values(out).reduce((a, o) => a + Object.keys(o).length, 0)} adet`);
