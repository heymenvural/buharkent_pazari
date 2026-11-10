"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SPACING, STALL_X, type StallInfo } from "./layout";
import { archTexture, cobbleTexture, facadeTexture, skyTexture } from "./textures";

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
const leafGeo = new THREE.IcosahedronGeometry(1, 0);
const bulbGeo = new THREE.SphereGeometry(0.045, 8, 6);
const bulbMat = new THREE.MeshStandardMaterial({ color: "#fff3c4", emissive: "#ffcf6b", emissiveIntensity: 2.2 });

function rand(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

function Sky() {
  const tex = useMemo(() => skyTexture(), []);
  return (
    <mesh renderOrder={-1}>
      <sphereGeometry args={[140, 24, 16]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  );
}

function Ground({ zFrom, zTo }: { zFrom: number; zTo: number }) {
  const len = zFrom - zTo;
  const tex = useMemo(() => cobbleTexture(Math.round(len / 2.7)), [len]);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, (zFrom + zTo) / 2]} receiveShadow>
        <planeGeometry args={[24, len]} />
        <meshStandardMaterial map={tex} roughness={1} />
      </mesh>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * 7.6, 0.06, (zFrom + zTo) / 2]} material={curbMat} receiveShadow>
          <boxGeometry args={[0.3, 0.12, len]} />
        </mesh>
      ))}
    </group>
  );
}

function Houses({ zFrom, zTo, low }: { zFrom: number; zTo: number; low: boolean }) {
  const houses = useMemo(() => {
    const r = rand(9);
    const out: { x: number; z: number; w: number; h: number; d: number; i: number; side: number }[] = [];
    for (const side of [-1, 1]) {
      let z = zFrom;
      let i = side === 1 ? 2 : 0;
      while (z > zTo) {
        const w = 5 + r() * 3;
        out.push({ side, x: side * 11.5, z: z - w / 2, w, h: 5.5 + r() * 3.5, d: 7, i: i++ });
        z -= w + 0.15;
      }
    }
    return out;
  }, [zFrom, zTo]);

  return (
    <group>
      {houses.map((h, k) => {
        const [wall, shutter] = WALLS[h.i % WALLS.length];
        const tex = facadeTexture(wall, shutter, h.i % 4);
        const t = tex.clone();
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(Math.max(1, Math.round(h.w / 3)), Math.max(1, Math.round(h.h / 3.2)));
        t.needsUpdate = true;
        return (
          <group key={k} position={[h.x, 0, h.z]}>
            <mesh position={[0, h.h / 2, 0]} castShadow={!low} receiveShadow>
              <boxGeometry args={[h.d, h.h, h.w]} />
              <meshStandardMaterial map={t} roughness={0.95} />
            </mesh>
            <mesh position={[-h.side * 0.35, h.h + 0.12, 0]} material={roofMat}>
              <boxGeometry args={[h.d + 0.9, 0.24, h.w + 0.3]} />
            </mesh>
          </group>
        );
      })}
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
function StringLights({ zs }: { zs: number[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const perRow = 15;
  const { points, wires } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const ws: THREE.Line[] = [];
    const wireMat = new THREE.LineBasicMaterial({ color: "#3a3028" });
    for (const z of zs) {
      const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-STALL_X - 1.2, 3.7, z), new THREE.Vector3(0, 2.6, z + 0.6), new THREE.Vector3(STALL_X + 1.2, 3.7, z));
      ws.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(24)), wireMat));
      for (let i = 1; i < perRow; i++) pts.push(curve.getPoint(i / perRow).add(new THREE.Vector3(0, -0.06, 0)));
    }
    return { points: pts, wires: ws };
  }, [zs]);

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

  return (
    <group>
      {wires.map((w, i) => (
        <primitive key={i} object={w} />
      ))}
      <instancedMesh ref={ref} args={[bulbGeo, bulbMat, points.length]} />
    </group>
  );
}

function Arch({ z }: { z: number }) {
  const tex = useMemo(() => archTexture(), []);
  return (
    <group position={[0, 0, z]}>
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

function EndWall({ z }: { z: number }) {
  const tex = useMemo(() => {
    const t = facadeTexture("#efd9b4", "#4a5627", 7).clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(5, 2);
    t.needsUpdate = true;
    return t;
  }, []);
  return (
    <group position={[0, 0, z]}>
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

export default function Environment({ stalls, endZ, low }: { stalls: StallInfo[]; endZ: number; low: boolean }) {
  const rows = useMemo(() => [...new Set(stalls.map((s) => s.z))].sort((a, b) => b - a), [stalls]);
  const lightZs = useMemo(() => [1.5 - 1.2, ...rows.map((z) => z - SPACING / 2)], [rows]);
  const trees = useMemo(
    () => rows.flatMap((z, i) => [[-7, 0, z - SPACING / 2] as [number, number, number], [7, 0, z - SPACING / 2 + (i % 2 ? 0.8 : -0.8)] as [number, number, number]]),
    [rows]
  );
  const zFrom = 22;
  const zTo = endZ - 2;

  return (
    <group>
      <Sky />
      <Ground zFrom={zFrom} zTo={zTo} />
      <Houses zFrom={zFrom - 2} zTo={endZ} low={low} />
      <Arch z={1.5} />
      <EndWall z={endZ} />
      <StringLights zs={lightZs} />
      {trees.map((p, i) => (
        <OliveTree key={i} position={p} seed={i} />
      ))}
    </group>
  );
}
