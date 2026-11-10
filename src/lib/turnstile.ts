/** Cloudflare Turnstile doğrulaması (bot koruması). Anahtar tanımlı değilse koruma devre dışıdır. */
export async function verifyHuman(token: unknown, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token || token.length > 2048) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "unknown") body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body, cache: "no-store" });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch (e) {
    console.error("turnstile error", e);
    return false;
  }
}

export const HUMAN_ERROR = "Güvenlik doğrulaması tamamlanamadı. Sayfadaki doğrulama kutusunu işaretleyip tekrar dene.";
