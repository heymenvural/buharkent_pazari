import { connectDB } from "@/lib/db";
import { Setting } from "@/models/Setting";

/**
 * Prototip (örnek) üreticiler ve ürünler varsayılan olarak gizlidir.
 * Yönetici tanıtım için açabilir; süreli açıldıysa süre dolunca kendiliğinden gizlenir.
 */
export type DemoMode = { on: boolean; until: string | null };

export async function getDemoMode(): Promise<DemoMode> {
  await connectDB();
  const s = await Setting.findOne({ key: "demo" }).lean();
  const v = (s?.value ?? {}) as { on?: boolean; until?: string | null };
  if (!v.on) return { on: false, until: null };
  if (v.until && new Date(v.until).getTime() < Date.now()) return { on: false, until: null };
  return { on: true, until: v.until ?? null };
}

export async function setDemoMode(on: boolean, hours: number | null) {
  await connectDB();
  const until = on && hours ? new Date(Date.now() + hours * 3_600_000).toISOString() : null;
  await Setting.updateOne({ key: "demo" }, { $set: { value: { on, until } } }, { upsert: true });
  return { on, until };
}
