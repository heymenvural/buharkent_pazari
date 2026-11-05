export function safeNext(raw: string | string[] | undefined, fallback = "/hesabim") {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v || !v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\")) return fallback;
  return v.slice(0, 200);
}