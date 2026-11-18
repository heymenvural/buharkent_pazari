"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GROUND_HALF, HOUSE_INNER, HOUSE_X, SPACING, STALL_X, type MarketPlan, type StreetPlan } from "./layout";
import { archTexture, cobbleTexture, facadeTexture, skyTexture, streetSignTexture } from "./textures";

const WALLS = [
  ["#f4ead8", "#4a6b6b"],
  ["#efd9b4", "#6e3b4e"],
  ["#f7f1e6", "#2f5a6b"],
  ["#e8c99a", "#4a5627"],
  ["#f1dfc8", "#8a4b2a"],
] as const;

const roofMat = new THREE.MeshStandardMaterial({ color: "#a8532f", roughness: 0.9 });
const trunkMat = new THREE.MeshStandardMaterial({ color: "#5a4632", roughness: 1 });
const leafMat = new THREE.MeshStandardMaterial({ color: "#7d8a5a", roughness: 1, flatShading: true });
const stoneMat = new THREE.MeshStandardMaterial({ color: "#d9c8a8", roughness: 0.95 });
const curbMat = new THREE.MeshStandardMaterial({ color: "#b8a98f", roughness: 1 });
const poleMat = new THREE.MeshStandardMaterial({ color: "#3a3028", roughness: 0.6, metalness: 0.3 });
const leafGeo = new THREE.IcosahedronGeometry(1, 0);
const bulbGeo = new THREE.SphereGeometry(0.045, 8, 6);
const bulbMat = new THREE.MeshStandardMaterial({ color: "#fff3c4", emissive: "#ffcf6b", emissiveIntensity: 2.2 });
const wireMat = new THREE.LineBasicMaterial({ color: "#3a3028" });

/** Bir sokağın bir yanında, [from, to] aralığında ev/bordür olmayacak boşluk (kavşak ağzı) */
type Gap = { side: -1 | 1; from: number; to: number };

function rand(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

const inGap = (gaps: Gap[], side: number, a: number, b: number) => gaps.some((g) => g.side === side && a < g.to && b > g.from);

/** [s0, s1] aralığını boşluklar dışında kalan parçalara böler */
function segments(s0: number, s1: number, gaps: Gap[], side: number): [number, number][] {
  const cuts = gaps.filter((g) => g.side === side).sort((a, b) => a.from - b.from);
  const out: [number, number][] = [];
  let cur = s0;
  for (const g of cuts) {
    if (g.from > cur) out.push([cur, Math.min(g.from, s1)]);
    cur = Math.max(cur, g.to);
  }
  if (cur < s1) out.push([cur, s1]);
  return out.filter(([a, b]) => b - a > 0.2);
}

/** Gökyüzü kamerayla birlikte gezer (pazar ne kadar büyürse büyüsün hep görünür) */
function Sky() {
  const tex = useMemo(() => skyTexture(), []);
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ camera }) => {
    ref.current?.position.set(camera.position.x, 0, camera.position.z);
  });
  return (
    <mesh ref={ref} renderOrder={-1}>
      <sphereGeometry args={[140, 24, 16]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  );
}

function Ground({ s0, s1 }: { s0: number; s1: number }) {
  const len = s1 - s0;
  const tex = useMemo(() => cobbleTexture(Math.max(1, Math.round(len / 2.7))), [len]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -(s0 + s1) / 2]} receiveShadow>
      <planeGeometry args={[GROUND_HALF * 2, len]} />
      <meshStandardMaterial map={tex} roughness={1} />
    </mesh>
  );
}

function Curbs({ s0, s1, gaps }: { s0: number; s1: number; gaps: Gap[] }) {
  return (
    <group>
      {([-1, 1] as const).flatMap((side) =>
        segments(s0, s1, gaps, side).map(([a, b]) => (
          <mesh key={`${side}-${a}`} position={[side * 7.6, 0.06, -(a + b) / 2]} material={curbMat} receiveShadow>
            <boxGeometry args={[0.3, 0.12, b - a]} />
          </mesh>
        ))
      )}
    </group>
  );
}

function Houses({ s0, s1, gaps, seed, low }: { s0: number; s1: number; gaps: Gap[]; seed: number; low: boolean }) {
  const houses = useMemo(() => {
    const r = rand(seed);
    const out: { x: number; s: number; w: number; h: number; i: number; side: number }[] = [];
    for (const side of [-1, 1] as const) {
      let i = side === 1 ? 2 + seed : seed;
      for (const [a, b] of segments(s0, s1, gaps, side)) {
        let s = a;
        while (s < b - 0.5) {
          const w = Math.min(5 + r() * 3, b - s);
          out.push({ side, x: side * HOUSE_X, s: s + w / 2, w, h: 5.5 + r() * 3.5, i: i++ });
          s += w + 0.15;
        }
      }
    }
    return out;
  }, [s0, s1, gaps, seed]);

  const textures = useMemo(
    () =>
      houses.map((h) => {
        const [wall, shutter] = WALLS[h.i % WALLS.length];
        const t = facadeTexture(wall, shutter, h.i % 4).clone();
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(Math.max(1, Math.round(h.w / 3)), Math.max(1, Math.round(h.h / 3.2)));
        t.needsUpdate = true;
        return t;
      }),
    [houses]
  );

  return (
    <group>
      {houses.map((h, k) => (
        <group key={k} position={[h.x, 0, -h.s]}>
          <mesh position={[0, h.h / 2, 0]} castShadow={!low} receiveShadow>
            <boxGeometry args={[7, h.h, h.w]} />
            <meshStandardMaterial map={textures[k]} roughness={0.95} />
          </mesh>
          <mesh position={[-h.side * 0.35, h.h + 0.12, 0]} material={roofMat}>
            <boxGeometry args={[7.9, 0.24, h.w + 0.3]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function OliveTree({ position, seed }: { position: [number, number, number]; seed: number }) {
  const blobs = useMemo(() => {
    const r = rand(seed + 5);
    return Array.from({ length: 5 }, () => ({ p: [(r() - 0.5) * 1.1, 3 + r() * 0.8, (r() - 0.5) * 1.1] as [number, number, number], s: 0.45 + r() * 0.35 }));
  }, [seed]);
  return (
    <group position={position}>
      <mesh position={[0, 1.45, 0]} rotation={[0, 0, 0.1]} material={trunkMat} castShadow>
        <cylinderGeometry args={[0.12, 0.2, 3, 7]} />
      </mesh>
      {blobs.map((b, i) => (
        <mesh key={i} geometry={leafGeo} material={leafMat} position={b.p} scale={b.s} castShadow />
      ))}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={curbMat}>
        <ringGeometry args={[0.55, 0.7, 16]} />
      </mesh>
    </group>
  );
}

/** Sokağın iki yanı arasına gerilmiş ampul dizileri */
function StringLights({ ss }: { ss: number[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const perRow = 15;
  const { points, wires } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const ws: THREE.Line[] = [];
    for (const s of ss) {
      const z = -s;
      const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-STALL_X - 1.2, 3.7, z), new THREE.Vector3(0, 2.6, z + 0.6), new THREE.Vector3(STALL_X + 1.2, 3.7, z));
      ws.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(24)), wireMat));
      for (let i = 1; i < perRow; i++) pts.push(curve.getPoint(i / perRow).add(new THREE.Vector3(0, -0.06, 0)));
    }
    return { points: pts, wires: ws };
  }, [ss]);

  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    points.forEach((p, i) => {
      o.position.copy(p);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [points]);

  if (!points.length) return null;
  return (
    <group>
      {wires.map((w, i) => (
        <primitive key={i} object={w} />
      ))}
      <instancedMesh ref={ref} args={[bulbGeo, bulbMat, points.length]} />
    </group>
  );
}

function Arch({ s, text }: { s: number; text: string }) {
  const tex = useMemo(() => archTexture(text), [text]);
  return (
    <group position={[0, 0, -s]}>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * 5.2, 2.2, 0]} material={stoneMat} castShadow>
          <boxGeometry args={[0.55, 4.4, 0.55]} />
        </mesh>
      ))}
      <mesh position={[0, 4.6, 0]} material={stoneMat} castShadow>
        <boxGeometry args={[11.2, 0.9, 0.6]} />
      </mesh>
      <mesh position={[0, 4.6, 0.31]}>
        <planeGeometry args={[5.6, 0.82]} />
        <meshStandardMaterial map={tex} roughness={0.8} />
      </mesh>
      <mesh position={[0, 4.6, -0.31]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[5.6, 0.82]} />
        <meshStandardMaterial map={tex} roughness={0.8} />
      </mesh>
    </group>
  );
}

function EndWall({ s }: { s: number }) {
  const tex = useMemo(() => {
    const t = facadeTexture("#efd9b4", "#4a5627", 7).clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(5, 2);
    t.needsUpdate = true;
    return t;
  }, []);
  return (
    <group position={[0, 0, -s]}>
      <mesh position={[0, 3.6, 0]} receiveShadow>
        <boxGeometry args={[30, 7.2, 1]} />
        <meshStandardMaterial map={tex} roughness={0.95} />
      </mesh>
      <mesh position={[0, 7.32, 0.3]} material={roofMat}>
        <boxGeometry args={[30.5, 0.24, 1.6]} />
      </mesh>
    </group>
  );
}

/** Kavşaktan önce, sokağın girdiği yanda yön tabelası */
function SignPost({ s, side, name }: { s: number; side: -1 | 1; name: string }) {
  const tex = useMemo(() => streetSignTexture(name, side), [name, side]);
  return (
    <group position={[side * 3.3, 0, -s]}>
      <mesh position={[0, 1.4, 0]} material={poleMat} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 2.8, 8]} />
      </mesh>
      <mesh position={[-side * 0.55, 2.55, 0.04]}>
        <planeGeometry args={[1.7, 0.42]} />
        <meshStandardMaterial map={tex} roughness={0.7} />
      </mesh>
      <mesh position={[-side * 0.55, 2.55, -0.04]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.7, 0.42]} />
        <meshStandardMaterial map={tex} roughness={0.7} />
      </mesh>
    </group>
  );
}

/** Yan sokak (kendi yerel koordinatında: kavşaktan -Z yönüne uzanır) */
export function SideStreet({ street, low }: { street: StreetPlan; low: boolean }) {
  const lights = useMemo(() => street.rows.map((s) => s - SPACING / 2), [street.rows]);
  const trees = useMemo(
    () => street.rows.flatMap((s, i) => [[-7, 0, -(s + SPACING / 2)] as [number, number, number], [7, 0, -(s + SPACING / 2) + (i % 2 ? 0.8 : -0.8)] as [number, number, number]]),
    [street.rows]
  );
  const noGaps = useMemo<Gap[]>(() => [], []);
  return (
    <group position={[street.origin[0], 0, street.origin[1]]} rotation={[0, street.theta, 0]}>
      <Ground s0={GROUND_HALF} s1={street.length + 2} />
      <Curbs s0={7.6} s1={street.length} gaps={noGaps} />
      <Houses s0={HOUSE_INNER} s1={street.length} gaps={noGaps} seed={Math.round(street.junction) + (street.side === 1 ? 3 : 0)} low={low} />
      <Arch s={GROUND_HALF + 1} text={street.name} />
      <EndWall s={street.length} />
      <StringLights ss={lights} />
      {trees.map((p, i) => (
        <OliveTree key={i} position={p} seed={i + street.junction} />
      ))}
    </group>
  );
}

/** Girişten uzanan ana cadde: kavşak ağızlarında ev ve bordür yok, her kavşakta tabela var */
function Avenue({ plan, low }: { plan: MarketPlan; low: boolean }) {
  const end = plan.avenueEnd;
  const houseGaps = useMemo<Gap[]>(
    () => plan.streets.map((st) => ({ side: st.side, from: st.junction - HOUSE_INNER, to: st.junction + HOUSE_INNER })),
    [plan.streets]
  );
  const curbGaps = useMemo<Gap[]>(() => plan.streets.map((st) => ({ side: st.side, from: st.junction - 7.6, to: st.junction + 7.6 })), [plan.streets]);
  // Işıklar ve ağaçlar kavşak ağızlarına denk gelmesin
  const lights = useMemo(() => {
    const out: number[] = [];
    for (let s = 2.7; s < end - 4; s += 10) if (!plan.junctions.some((j) => Math.abs(j.s - s) < 3)) out.push(s);
    return out;
  }, [end, plan.junctions]);
  const trees = useMemo(() => {
    const out: [number, number, number][] = [];
    let i = 0;
    for (let s = 6; s < end - 4; s += 9) {
      for (const side of [-1, 1] as const) if (!inGap(houseGaps, side, s - 1, s + 1)) out.push([side * 7, 0, -s + (i % 2 ? 0.6 : -0.6)]);
      i++;
    }
    return out;
  }, [end, houseGaps]);

  return (
    <group>
      <Ground s0={-22} s1={end + 2} />
      <Curbs s0={-22} s1={end} gaps={curbGaps} />
      <Houses s0={-20} s1={end} gaps={houseGaps} seed={9} low={low} />
      <Arch s={-1.5} text="Buharkent Pazarı" />
      <EndWall s={end} />
      <StringLights ss={lights} />
      {trees.map((p, i) => (
        <OliveTree key={i} position={p} seed={i} />
      ))}
      {plan.streets.map((st) => (
        <SignPost key={st.id} s={st.junction - HOUSE_INNER - 1} side={st.side} name={st.name} />
      ))}
    </group>
  );
}

export default function Environment({ plan, low }: { plan: MarketPlan; low: boolean }) {
  return (
    <group>
      <Sky />
      <Avenue plan={plan} low={low} />
    </group>
  );
}
