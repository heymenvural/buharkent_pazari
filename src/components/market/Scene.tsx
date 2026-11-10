"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Environment from "./Environment";
import Stall from "./Stall";
import { streetEnd, type StallInfo } from "./layout";
import { START_Z, useMarket } from "./store";

const EYE = 1.62;
const PITCH = -0.06;
const WALK_SPEED = 3.4; // m/sn (tuşla)
const TURN_SPEED = 1.7; // rad/sn

/** Kamerayı (ziyaretçinin gözünü) hareket ettirir */
function Walker({ stalls, shadows }: { stalls: StallInfo[]; shadows: boolean }) {
  const get = useThree((s) => s.get);
  const sun = useRef<THREE.DirectionalLight>(null);
  const yaw = useRef(0);
  const bob = useRef(0);

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
      const walk = (keys.back ? 1 : 0) - (keys.forward ? 1 : 0);
      const turn = (keys.left ? 1 : 0) - (keys.right ? 1 : 0);
      if (walk) st.walk(walk * WALK_SPEED * dt);
      if (turn) st.look(turn * TURN_SPEED * dt);
    }

    const prevZ = camera.position.z;
    camera.position.z = THREE.MathUtils.damp(camera.position.z, st.targetZ, st.started ? 3.2 : 1.2, dt);
    yaw.current = THREE.MathUtils.damp(yaw.current, st.targetYaw, 4, dt);

    // Yürürken hafif baş sallanması
    const speed = Math.abs(camera.position.z - prevZ) / Math.max(dt, 1e-4);
    bob.current += dt * (6 + speed * 2);
    const amp = Math.min(speed / WALK_SPEED, 1) * 0.025;
    camera.position.y = EYE + Math.sin(bob.current) * amp;
    camera.position.x = Math.cos(bob.current * 0.5) * amp * 0.6;
    camera.rotation.set(PITCH + Math.sin(state.clock.elapsedTime * 0.6) * 0.004, yaw.current, 0);

    // Güneş kamerayla birlikte ilerler (gölgeler hep yakında hesaplansın)
    if (sun.current && shadows) {
      sun.current.position.set(9, 16, camera.position.z + 6);
      sun.current.target.position.set(0, 0, camera.position.z - 6);
      sun.current.target.updateMatrixWorld();
    }

    // Yakındaki ve bakılan tezgâhı bul
    const fwd = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    let best: string | null = null;
    let bestScore = 0;
    for (const s of stalls) {
      const dx = s.x - camera.position.x;
      const dz = s.z - camera.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 7.5) continue;
      const facing = (dx * fwd.x + dz * fwd.z) / dist;
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

export default function Scene({ stalls, low, onReady }: { stalls: StallInfo[]; low: boolean; onReady: () => void }) {
  const endZ = useMemo(() => streetEnd(stalls), [stalls]);
  const setBounds = useMarket((s) => s.setBounds);

  useEffect(() => {
    setBounds(endZ + 3.5, 3.8);
  }, [endZ, setBounds]);

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
      <Walker stalls={stalls} shadows={!low} />
      <Environment stalls={stalls} endZ={endZ} low={low} />
      {stalls.map((s) => (
        <Stall key={s.key} s={s} lowDetail={low} />
      ))}
    </Canvas>
  );
}
