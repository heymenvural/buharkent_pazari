import { create } from "zustand";

/** Canlı Pazar'ın anlık durumu (3D sahne ile arayüz arasında paylaşılır) */
type Keys = { forward: boolean; back: boolean; left: boolean; right: boolean };

type MarketState = {
  started: boolean;
  targetZ: number;
  targetYaw: number;
  zMin: number;
  zMax: number;
  keys: Keys;
  dragDistance: number;
  near: string | null; // yakındaki tezgâh
  hovered: string | null;
  selected: string | null; // açık tezgâh penceresi
  start: () => void;
  walk: (dz: number) => void;
  look: (dyaw: number) => void;
  setKey: (k: keyof Keys, v: boolean) => void;
  setBounds: (zMin: number, zMax: number) => void;
  goTo: (z: number, yaw: number) => void;
  set: (p: Partial<Pick<MarketState, "near" | "hovered" | "selected" | "dragDistance">>) => void;
};

export const YAW_LIMIT = 1.75;
export const START_Z = 7.5;
export const ENTRY_Z = 3.8;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const useMarket = create<MarketState>((set, get) => ({
  started: false,
  targetZ: START_Z,
  targetYaw: 0,
  zMin: -20,
  zMax: ENTRY_Z,
  keys: { forward: false, back: false, left: false, right: false },
  dragDistance: 0,
  near: null,
  hovered: null,
  selected: null,
  start: () => set({ started: true, targetZ: ENTRY_Z, targetYaw: 0 }),
  walk: (dz) => {
    const s = get();
    if (!s.started || s.selected) return;
    set({ targetZ: clamp(s.targetZ + dz, s.zMin, s.zMax) });
  },
  look: (dyaw) => {
    const s = get();
    if (!s.started || s.selected) return;
    set({ targetYaw: clamp(s.targetYaw + dyaw, -YAW_LIMIT, YAW_LIMIT) });
  },
  setKey: (k, v) => set((s) => ({ keys: { ...s.keys, [k]: v } })),
  setBounds: (zMin, zMax) => set({ zMin, zMax }),
  goTo: (z, yaw) => {
    const s = get();
    set({ targetZ: clamp(z, s.zMin, s.zMax), targetYaw: clamp(yaw, -YAW_LIMIT, YAW_LIMIT) });
  },
  set: (p) => set(p),
}));
