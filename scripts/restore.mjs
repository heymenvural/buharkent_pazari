// Yedeği veritabanına geri yükler. DİKKAT: --sil verilirse hedefteki koleksiyonlar önce silinir.
//
// 1) GitHub → Actions → "Veritabanı yedeği" → son çalıştırma → Artifacts'tan dosyayı indir, zip'i aç.
// 2) Şifreyi çöz:
//      openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -in yedek-....jsonl.gz.enc -out yedek.jsonl.gz
//    (şifre: GitHub'a BACKUP_PASSWORD olarak kaydettiğin parola)
// 3) Geri yükle:
//      MONGODB_URI=... node scripts/restore.mjs yedek.jsonl.gz --sil
import { createReadStream } from "node:fs";
import { createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { EJSON } from "bson";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const file = process.argv[2];
const wipe = process.argv.includes("--sil");
if (!uri || !file) {
  console.error("Kullanım: MONGODB_URI=... node scripts/restore.mjs yedek.jsonl.gz [--sil]");
  process.exit(1);
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db();
const rl = createInterface({ input: createReadStream(file).pipe(createGunzip()), crlfDelay: Infinity });

const batches = new Map();
const counts = {};
const flush = async (name) => {
  const docs = batches.get(name);
  if (docs?.length) await db.collection(name).insertMany(docs, { ordered: false });
  batches.set(name, []);
};

for await (const line of rl) {
  if (!line) continue;
  if (line.startsWith('{"meta"')) {
    const { meta } = JSON.parse(line);
    console.log("Yedek tarihi:", meta.at, "· koleksiyonlar:", meta.collections.join(", "));
    if (wipe) for (const c of meta.collections) await db.collection(c).deleteMany({});
    continue;
  }
  const { c, d } = EJSON.parse(line, { relaxed: false });
  if (!batches.has(c)) batches.set(c, []);
  batches.get(c).push(d);
  counts[c] = (counts[c] ?? 0) + 1;
  if (batches.get(c).length >= 500) await flush(c);
}
for (const name of batches.keys()) await flush(name);
await client.close();
console.log("Geri yükleme tamamlandı.");
console.table(counts);
