"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Environment, { SideStreet } from "./Environment";
import Stall from "./Stall";
import { streetAt, type MarketPlan, type StallInfo, type StreetPlan } from "./layout";
import { START_Z, useMarket } from "./store";

const EYE = 1.62;
const PITCH = -0.06;
const WALK_SPEED = 3.4; // m/sn (tuşla)
const TURN_SPEED = 1.7; // rad/sn
const VIEW_DIST = 58; // bundan uzak sokaklar çizilmez (sis zaten 48 m'de kapatıyor)

/** Kamerayı (ziyaretçinin gözünü) hareket ettirir */
function Walker({ plan, shadows }: { plan: MarketPlan; shadows: boolean }) {
  const get = useThree((s) => s.get);
  const sun = useRef<THREE.DirectionalLight>(null);
  const yaw = useRef(0);
  const bob = useRef(0);
  const base = useRef(new THREE.Vector2(0, START_Z + 2));
  const lastJump = useRef(0);

  useEffect(() => {
    const cam = get().camera;
    cam.position.set(0, EYE, START_Z + 2);
    cam.rotation.order = "YXZ";
  }, [get]);

  useFrame((state, rawDt) => {
    const camera = state.camera as THREE.PerspectiveCamera;
    const dt = Math.min(rawDt, 0.1);

    // Dikey telefonda görüş açısı genişler, iki yandaki tezgâhlar ekrana sığsın
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const fov = aspect < 0.75 ? 82 : aspect < 1.1 ? 72 : 62;
    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    const st = useMarket.getState();
    const { keys } = st;

    // Tuşlar / ekran butonları basılı tutuldukça yürü ve dön
    if (st.started && !st.selected) {
      const walk = (keys.forward ? 1 : 0) - (keys.back ? 1 : 0);
      const turn = (keys.left ? 1 : 0) - (keys.right ? 1 : 0);
      if (walk) st.walk(walk * WALK_SPEED * dt);
      if (turn) st.look(turn * TURN_SPEED * dt);
    }

    const b = base.current;
    const prevX = b.x;
    const prevZ = b.y;
    if (st.jump !== lastJump.current) {
      // Uzak tezgâha/sokağa ışınlan: evlerin içinden geçerek süzülme
      lastJump.current = st.jump;
      b.set(st.targetX, st.targetZ);
      yaw.current = st.targetYaw;
    } else {
      const k = st.started ? 3.2 : 1.2;
      b.x = THREE.MathUtils.damp(b.x, st.targetX, k, dt);
      b.y = THREE.MathUtils.damp(b.y, st.targetZ, k, dt);
      yaw.current = THREE.MathUtils.damp(yaw.current, st.targetYaw, 4, dt);
    }

    // Yürürken hafif baş sallanması (yürüme yönüne dik)
    const speed = Math.hypot(b.x - prevX, b.y - prevZ) / Math.max(dt, 1e-4);
    bob.current += dt * (6 + Math.min(speed, 8) * 2);
    const amp = Math.min(speed / WALK_SPEED, 1) * 0.025;
    const side = Math.cos(bob.current * 0.5) * amp * 0.6;
    camera.position.set(b.x + Math.cos(yaw.current) * side, EYE + Math.sin(bob.current) * amp, b.y - Math.sin(yaw.current) * side);
    camera.rotation.set(PITCH + Math.sin(state.clock.elapsedTime * 0.6) * 0.004, yaw.current, 0);

    // Güneş kamerayla birlikte ilerler (gölgeler hep yakında hesaplansın)
    if (sun.current && shadows) {
      sun.current.position.set(b.x + 9, 16, b.y + 6);
      sun.current.target.position.set(b.x, 0, b.y - 6);
      sun.current.target.updateMatrixWorld();
    }

    // Hangi sokaktayız?
    const street = streetAt(st.rects, b.x, b.y);
    if (street !== st.street) st.set({ street });

    // Yakındaki ve bakılan tezgâhı bul
    const fx = -Math.sin(yaw.current);
    const fz = -Math.cos(yaw.current);
    let best: string | null = null;
    let bestScore = 0;
    for (const s of plan.stalls) {
      const dx = s.x - b.x;
      const dz = s.z - b.y;
      if (Math.abs(dx) > 8 || Math.abs(dz) > 8) continue;
      const dist = Math.hypot(dx, dz);
      if (dist > 7.5) continue;
      const facing = (dx * fx + dz * fz) / dist;
      const score = facing + 1.2 - dist / 7.5;
      if (facing > 0.15 && score > bestScore) {
        bestScore = score;
        best = s.key;
      }
    }
    if (best !== st.near) st.set({ near: best });
  });

  return (
    <directionalLight
      ref={sun}
      position={[9, 16, 6]}
      intensity={2.4}
      color="#ffe4b8"
      castShadow={shadows}
      shadow-mapSize={[1024, 1024]}
      shadow-camera-left={-14}
      shadow-camera-right={14}
      shadow-camera-top={14}
      shadow-camera-bottom={-14}
      shadow-camera-far={50}
      shadow-bias={-0.0004}
    />
  );
}

/** Kameraya uzak sokakları (ve tezgâhlarını) hiç çizmez: 30+ üreticide de akıcı kalsın */
function CullGroup({ box, children }: { box: StreetPlan["box"]; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ camera }) => {
    if (!ref.current) return;
    const { x, z } = camera.position;
    const dx = Math.max(box[0] - x, 0, x - box[2]);
    const dz = Math.max(box[1] - z, 0, z - box[3]);
    const vis = Math.hypot(dx, dz) < VIEW_DIST;
    if (ref.current.visible !== vis) ref.current.visible = vis;
  });
  return <group ref={ref}>{children}</group>;
}

function StreetWithStalls({ street, low }: { street: StreetPlan; low: boolean }) {
  return (
    <CullGroup box={street.box}>
      <SideStreet street={street} low={low} />
      {street.stalls.map((s: StallInfo) => (
        <Stall key={s.key} s={s} lowDetail={low} />
      ))}
    </CullGroup>
  );
}

export default function Scene({ plan, low, onReady }: { plan: MarketPlan; low: boolean; onReady: () => void }) {
  const setRects = useMarket((s) => s.setRects);

  useEffect(() => {
    setRects(plan.rects);
  }, [plan, setRects]);

  return (
    <Canvas
      shadows={!low}
      dpr={low ? [1, 1.5] : [1, 2]}
      gl={{ antialias: !low, powerPreference: "high-performance" }}
      camera={{ fov: 62, near: 0.1, far: 300 }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        scene.fog = new THREE.Fog("#efdcbc", 14, 48);
        requestAnimationFrame(() => onReady());
      }}
      onPointerMissed={() => useMarket.getState().set({ hovered: null })}
    >
      <hemisphereLight args={["#fff1d6", "#8a6a4a", 1.25]} />
      <ambientLight intensity={0.25} />
      <Walker plan={plan} shadows={!low} />
      <Environment plan={plan} low={low} />
      {plan.streets.map((st) => (
        <StreetWithStalls key={st.id} street={st} low={low} />
      ))}
    </Canvas>
  );
}
