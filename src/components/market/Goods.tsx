"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { GoodsKind } from "./layout";

/* Ürün türüne göre tezgâhtaki mallar. Aynı geometri/malzeme tüm tezgâhlarda paylaşılır,
   her tepsi tek bir "instanced" çizimle çizilir (telefonlarda da akıcı kalsın diye). */

const G = {
  sphere: new THREE.SphereGeometry(1, 10, 8),
  jar: new THREE.CylinderGeometry(0.05, 0.05, 0.11, 14),
  lid: new THREE.CylinderGeometry(0.054, 0.054, 0.025, 14),
  bottle: new THREE.CylinderGeometry(0.038, 0.04, 0.2, 12),
  neck: new THREE.CylinderGeometry(0.014, 0.018, 0.08, 8),
  box: new THREE.BoxGeometry(1, 1, 1),
};

const M = {
  base: new THREE.MeshStandardMaterial({ roughness: 0.75 }),
  glossy: new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0.05 }),
  glass: new THREE.MeshStandardMaterial({ roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.88 }),
  cloth: new THREE.MeshStandardMaterial({ roughness: 1 }),
};

const crateMat = new THREE.MeshStandardMaterial({ color: "#a0764a", roughness: 0.9 });
const cartonMat = new THREE.MeshStandardMaterial({ color: "#cbbfa6", roughness: 1 });
const trayMat = new THREE.MeshStandardMaterial({ color: "#7b5634", roughness: 0.8 });

type Inst = { p: [number, number, number]; s: [number, number, number]; r?: number; c: string };

function rand(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

function shade(hex: string, amt: number) {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, amt);
  return `#${c.getHexString()}`;
}

function Instances({ geo, mat, items }: { geo: THREE.BufferGeometry; mat: THREE.Material; items: Inst[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    items.forEach((it, i) => {
      o.position.set(...it.p);
      o.scale.set(...it.s);
      o.rotation.set(0, it.r ?? 0, 0);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, col.set(it.c));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
  }, [items]);
  return <instancedMesh ref={ref} args={[geo, mat, items.length]} castShadow />;
}

/** Kasa içinde yığın (incir, zeytin, meyve) */
function heap(seed: number, color: string, radius: number, flat: number, w: number, d: number, layers: number) {
  const r = rand(seed);
  const out: Inst[] = [];
  const step = radius * 1.9;
  for (let l = 0; l < layers; l++) {
    const inset = l * radius * 1.2;
    for (let x = -w / 2 + radius + inset; x <= w / 2 - radius - inset; x += step) {
      for (let z = -d / 2 + radius + inset; z <= d / 2 - radius - inset; z += step) {
        const k = radius * (0.85 + r() * 0.3);
        out.push({
          p: [x + (r() - 0.5) * radius * 0.6, 0.13 + l * radius * 1.4 + k * flat, z + (r() - 0.5) * radius * 0.6],
          s: [k, k * flat, k],
          r: r() * Math.PI,
          c: shade(color, (r() - 0.5) * 0.12),
        });
      }
    }
  }
  return out;
}

export default function Goods({ kind, color, seed }: { kind: GoodsKind; color: string; seed: number }) {
  const parts = useMemo(() => {
    const r = rand(seed + 1);
    switch (kind) {
      case "fig":
        return { box: "crate", sets: [{ geo: G.sphere, mat: M.base, items: heap(seed, color, 0.045, 0.75, 0.56, 0.5, 2) }] };
      case "olive":
        return { box: "crate", sets: [{ geo: G.sphere, mat: M.glossy, items: heap(seed, color, 0.024, 0.8, 0.56, 0.5, 3) }] };
      case "produce":
        return { box: "crate", sets: [{ geo: G.sphere, mat: M.glossy, items: heap(seed, color, 0.055, 0.9, 0.56, 0.5, 2) }] };
      case "egg": {
        const items: Inst[] = [];
        for (let x = 0; x < 5; x++) for (let z = 0; z < 3; z++) items.push({ p: [-0.2 + x * 0.1, 0.13, -0.1 + z * 0.1], s: [0.032, 0.042, 0.032], c: shade(color, (r() - 0.5) * 0.1) });
        return { box: "carton", sets: [{ geo: G.sphere, mat: M.base, items }] };
      }
      case "jar": {
        const jars: Inst[] = [];
        const lids: Inst[] = [];
        for (let x = 0; x < 3; x++)
          for (let z = 0; z < 2; z++) {
            const px = -0.17 + x * 0.17;
            const pz = -0.08 + z * 0.17;
            jars.push({ p: [px, 0.105, pz], s: [1, 1, 1], c: shade(color, (r() - 0.5) * 0.06) });
            lids.push({ p: [px, 0.172, pz], s: [1, 1, 1], c: "#c0392b" });
          }
        return { box: "tray", sets: [{ geo: G.jar, mat: M.glass, items: jars }, { geo: G.lid, mat: M.base, items: lids }] };
      }
      case "bottle": {
        const b: Inst[] = [];
        const n: Inst[] = [];
        for (let x = 0; x < 4; x++)
          for (let z = 0; z < 2; z++) {
            const px = -0.18 + x * 0.12;
            const pz = -0.07 + z * 0.14;
            b.push({ p: [px, 0.15, pz], s: [1, 1, 1], c: color });
            n.push({ p: [px, 0.29, pz], s: [1, 1, 1], c: color });
          }
        const caps = b.map((x) => ({ p: [x.p[0], 0.335, x.p[2]] as [number, number, number], s: [0.017, 0.012, 0.017] as [number, number, number], c: "#d8b24a" }));
        return {
          box: "tray",
          sets: [
            { geo: G.bottle, mat: M.glass, items: b },
            { geo: G.neck, mat: M.glass, items: n },
            { geo: G.sphere, mat: M.glossy, items: caps },
          ],
        };
      }
      case "textile": {
        const palette = ["#b5532f", "#e0a84a", "#6e3b4e", "#4a5627", "#2f5a6b", "#f1e6cc"];
        const items: Inst[] = [];
        for (let s = 0; s < 3; s++)
          for (let k = 0; k < 4; k++) items.push({ p: [-0.18 + s * 0.18, 0.07 + k * 0.045, 0], s: [0.16, 0.04, 0.22], r: (r() - 0.5) * 0.2, c: palette[(s * 4 + k + seed) % palette.length] });
        return { box: "tray", sets: [{ geo: G.box, mat: M.cloth, items }] };
      }
      default: {
        const palette = ["#4a5627", "#b5532f", "#6e3b4e"];
        const items: Inst[] = [
          { p: [-0.13, 0.13, 0], s: [0.2, 0.16, 0.2], r: 0.2, c: palette[seed % 3] },
          { p: [0.12, 0.12, 0.02], s: [0.18, 0.14, 0.18], r: -0.3, c: palette[(seed + 1) % 3] },
          { p: [0, 0.27, 0], s: [0.14, 0.12, 0.14], r: 0.5, c: palette[(seed + 2) % 3] },
        ];
        return { box: "tray", sets: [{ geo: G.box, mat: M.base, items }] };
      }
    }
  }, [kind, color, seed]);

  return (
    <group>
      {parts.box === "crate" && (
        <mesh position={[0, 0.06, 0]} castShadow receiveShadow material={crateMat}>
          <boxGeometry args={[0.62, 0.12, 0.56]} />
        </mesh>
      )}
      {parts.box === "carton" && (
        <mesh position={[0, 0.05, 0]} receiveShadow material={cartonMat}>
          <boxGeometry args={[0.56, 0.1, 0.36]} />
        </mesh>
      )}
      {parts.box === "tray" && (
        <mesh position={[0, 0.025, 0]} receiveShadow material={trayMat}>
          <boxGeometry args={[0.6, 0.05, 0.42]} />
        </mesh>
      )}
      {parts.sets.map((s, i) => (
        <Instances key={i} geo={s.geo} mat={s.mat} items={s.items} />
      ))}
    </group>
  );
}
