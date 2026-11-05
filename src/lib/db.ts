import dns from "node:dns";
import mongoose from "mongoose";

// Bazı internet sağlayıcıları/modemler MongoDB'nin SRV DNS sorgusunu desteklemiyor.
// Yerel geliştirmede güvenilir DNS sunucularını kullanıyoruz (Vercel'de gerek yok).
if (process.env.NODE_ENV !== "production") {
  try {
    const servers = ["1.1.1.1", "8.8.8.8"];
    dns.setServers(servers);
    dns.promises.setServers(servers);
    dns.setDefaultResultOrder("ipv4first");
  } catch {}
}

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const g = globalThis as unknown as { _mongoose?: Cache };
const cached: Cache = g._mongoose ?? (g._mongoose = { conn: null, promise: null });

export async function connectDB() {
  if (cached.conn) return cached.conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI tanımlı değil");

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    mongoose.set("sanitizeFilter", true); // NoSQL injection koruması
    cached.promise = mongoose.connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 10_000 });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}