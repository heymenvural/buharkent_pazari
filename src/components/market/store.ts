import { create } from "zustand";
import { ENTRY_Z, inside, type Rect } from "./layout";

/** Canlı Pazar'ın anlık durumu (3D sahne ile arayüz arasında paylaşılır) */
type Keys = { forward: boolean; back: boolean; left: boolean; right: boolean };

type MarketState = {
  started: boolean;
  targetX: number;
  targetZ: number;
  targetYaw: number; // sınırsız; 0 = girişten pazara (-Z) bakış
  rects: Rect[]; // yürünebilir alanlar
  jump: number; // uzak bir noktaya ışınlanma sayacı (kamera yumuşak geçiş yerine atlar)
  keys: Keys;
  dragDistance: number;
  near: string | null; // yakındaki tezgâh
  hovered: string | null;
  selected: string | null; // açık tezgâh penceresi
  street: string | null; // şu an bulunulan yan sokak (ana caddedeyse null)
  start: () => void;
  walk: (forward: number) => void;
  look: (dyaw: number) => void;
  setKey: (k: keyof Keys, v: boolean) => void;
  setRects: (r: Rect[]) => void;
  goTo: (x: number, z: number, yaw: number, jump?: boolean) => void;
  set: (p: Partial<Pick<MarketState, "near" | "hovered" | "selected" | "dragDistance" | "street">>) => void;
};

export const START_Z = 7.5;
export { ENTRY_Z };

/** İstenen açıyı mevcut açıya en yakın eşdeğerine çevirir (kamera ters yönden dönmesin) */
const nearestYaw = (from: number, to: number) => to + 2 * Math.PI * Math.round((from - to) / (2 * Math.PI));

export const useMarket = create<MarketState>((set, get) => ({
  started: false,
  targetX: 0,
  targetZ: START_Z,
  targetYaw: 0,
  rects: [],
  jump: 0,
  keys: { forward: false, back: false, left: false, right: false },
  dragDistance: 0,
  near: null,
  hovered: null,
  selected: null,
  street: null,
  start: () => set({ started: true, targetX: 0, targetZ: ENTRY_Z, targetYaw: 0 }),
  walk: (forward) => {
    const s = get();
    if (!s.started || s.selected || !s.rects.length) return;
    const fx = -Math.sin(s.targetYaw) * forward;
    const fz = -Math.cos(s.targetYaw) * forward;
    const { targetX: x, targetZ: z, rects } = s;
    // Duvarlara çarpınca kayarak devam et
    if (inside(rects, x + fx, z + fz)) set({ targetX: x + fx, targetZ: z + fz });
    else if (inside(rects, x + fx, z)) set({ targetX: x + fx });
    else if (inside(rects, x, z + fz)) set({ targetZ: z + fz });
  },
  look: (dyaw) => {
    const s = get();
    if (!s.started || s.selected) return;
    set({ targetYaw: s.targetYaw + dyaw });
  },
  setKey: (k, v) => set((s) => ({ keys: { ...s.keys, [k]: v } })),
  setRects: (rects) => set({ rects }),
  goTo: (x, z, yaw, jump) => {
    const s = get();
    const far = jump ?? Math.hypot(x - s.targetX, z - s.targetZ) > 10;
    set({ targetX: x, targetZ: z, targetYaw: nearestYaw(s.targetYaw, yaw), jump: far ? s.jump + 1 : s.jump });
  },
  set: (p) => set(p),
}));
