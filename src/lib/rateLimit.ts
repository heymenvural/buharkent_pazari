import { createHash } from "node:crypto";
import { connectDB } from "@/lib/db";
import { RateLimit } from "@/models/RateLimit";

// Yedek: veritabanına ulaşılamazsa sunucu hafızasında sayılır
const hits = new Map<string, { count: number; reset: number }>();
function memoryLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

/**
 * Deneme sınırlayıcı. Sayaç veritabanında tutulur, böylece Vercel'in tüm sunucuları
 * aynı sayacı görür. Anahtar (IP, e-posta) özetlenerek saklanır.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const win = Math.floor(Date.now() / windowMs);
  const id = `${createHash("sha256").update(key).digest("hex").slice(0, 32)}:${win}`;
  try {
    await connectDB();
    const doc = await RateLimit.findOneAndUpdate(
      { _id: id },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((win + 1) * windowMs + 60_000) } },
      { upsert: true, returnDocument: "after", lean: true }
    );
    return (doc?.count ?? 1) <= limit;
  } catch {
    return memoryLimit(key, limit, windowMs);
  }
}
