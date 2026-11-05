import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import type { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { EmailCode } from "@/models/EmailCode";
import { sendVerificationEmail } from "@/lib/mailer";

const TTL = 10 * 60_000;
const RESEND_GAP = 60_000;
const MAX_ATTEMPTS = 5;

const hash = (code: string) => createHash("sha256").update(`${code}:${process.env.AUTH_SECRET ?? ""}`).digest("hex");

export async function issueCode(userId: Types.ObjectId, email: string, name: string): Promise<{ ok: boolean; wait?: number }> {
  await connectDB();
  const existing = await EmailCode.findOne({ user: userId });
  if (existing) {
    const since = Date.now() - existing.lastSentAt.getTime();
    if (since < RESEND_GAP) return { ok: false, wait: Math.ceil((RESEND_GAP - since) / 1000) };
  }
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await EmailCode.updateOne(
    { user: userId },
    { $set: { codeHash: hash(code), expiresAt: new Date(Date.now() + TTL), attempts: 0, lastSentAt: new Date() } },
    { upsert: true }
  );
  await sendVerificationEmail(email, name, code);
  return { ok: true };
}

export async function checkCode(userId: Types.ObjectId, code: string): Promise<"ok" | "invalid" | "expired" | "locked"> {
  await connectDB();
  const rec = await EmailCode.findOne({ user: userId });
  if (!rec || rec.expiresAt.getTime() < Date.now()) return "expired";
  if (rec.attempts >= MAX_ATTEMPTS) return "locked";

  const a = Buffer.from(rec.codeHash, "hex");
  const b = Buffer.from(hash(code), "hex");
  if (a.length === b.length && timingSafeEqual(a, b)) {
    await EmailCode.deleteOne({ _id: rec._id });
    return "ok";
  }
  rec.attempts += 1;
  await rec.save();
  return rec.attempts >= MAX_ATTEMPTS ? "locked" : "invalid";
}