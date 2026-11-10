// Veritabanının tamamını tek bir sıkıştırılmış dosyaya yazar (GitHub Actions her gece çalıştırır).
// Kullanım: MONGODB_URI=... node scripts/backup.mjs yedek.jsonl.gz
import { createWriteStream } from "node:fs";
import { createGzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { EJSON } from "bson";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const out = process.argv[2] ?? "yedek.jsonl.gz";
if (!uri) {
  console.error("MONGODB_URI tanımlı değil. GitHub → Settings → Secrets and variables → Actions kısmına ekle.");
  process.exit(1);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20_000 });
await client.connect();
const db = client.db();
const collections = (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name).filter((n) => !n.startsWith("system."));

const counts = {};
async function* lines() {
  yield JSON.stringify({ meta: { db: db.databaseName, at: new Date().toISOString(), collections } }) + "\n";
  for (const name of collections) {
    counts[name] = 0;
    for await (const doc of db.collection(name).find()) {
      counts[name]++;
      // EJSON tarih, ObjectId ve dosya içeriklerini (GridFS) kayıpsız saklar
      yield EJSON.stringify({ c: name, d: doc }, { relaxed: false }) + "\n";
    }
  }
}

await pipeline(Readable.from(lines()), createGzip({ level: 9 }), createWriteStream(out));
await client.close();
console.log("Yedek alındı:", out);
console.table(counts);
