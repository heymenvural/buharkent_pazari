export const INTRO_KEY = "bp-intro";

export function introSeen(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
}

export function markIntroSeen() {
  try {
    sessionStorage.setItem(INTRO_KEY, "1");
  } catch {}
}

export const introDelay = (base: number) => (introSeen() ? 0.1 : base);