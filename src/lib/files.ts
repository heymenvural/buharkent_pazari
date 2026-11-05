import mongoose, { Types } from "mongoose";
import { connectDB } from "@/lib/db";

export const MAX_FILE_BYTES = 4 * 1024 * 1024; // Vercel istek sınırının altında

const bucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db!, { bucketName: "sellerDocs" });

// Uzantıya güvenilmez; dosyanın ilk baytlarına bakılır
export function sniffMime(buf: Buffer): "application/pdf" | "image/jpeg" | "image/png" | null {
  if (buf.length < 8) return null;
  if (buf.subarray(0, 5).toString("ascii") === "%PDF-") return "application/pdf";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  return null;
}

export const extOf = (mime: string) => (mime === "application/pdf" ? "pdf" : mime === "image/png" ? "png" : "jpg");

export async function saveFile(buf: Buffer, filename: string, metadata: Record<string, unknown>): Promise<Types.ObjectId> {
  await connectDB();
  return new Promise((resolve, reject) => {
    const up = bucket().openUploadStream(filename, { metadata });
    up.on("error", reject);
    up.on("finish", () => resolve(up.id as Types.ObjectId));
    up.end(buf);
  });
}

export async function readFile(id: Types.ObjectId): Promise<Buffer> {
  await connectDB();
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    bucket()
      .openDownloadStream(id)
      .on("data", (c: Buffer) => chunks.push(c))
      .on("error", reject)
      .on("end", () => resolve(Buffer.concat(chunks)));
  });
}

export async function deleteFile(id: Types.ObjectId) {
  await connectDB();
  await bucket().delete(id).catch(() => null);
}