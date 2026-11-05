// Basit deneme sınırlayıcı. Sunucusuz ortamda "en iyi çaba" düzeyindedir;
// trafik artınca ücretsiz Upstash Redis ile kalıcı hale getireceğiz.
const hits = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
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