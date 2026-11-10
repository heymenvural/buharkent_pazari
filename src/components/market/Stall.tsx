"use client";

import { useEffect, useMemo, useState } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { formatPrice, initials } from "@/lib/catalog";
import Goods from "./Goods";
import type { StallInfo } from "./layout";
import { useMarket } from "./store";
import { awningTexture, initialsTexture, priceTagTexture, signTexture, valanceTexture } from "./textures";

const W = 3.2; // tezgâh genişliği
const wood = new THREE.MeshStandardMaterial({ color: "#8a5f3a", roughness: 0.85 });
const darkWood = new THREE.MeshStandardMaterial({ color: "#5e3f26", roughness: 0.9 });
const post = new THREE.CylinderGeometry(0.045, 0.05, 1, 8);

const textureLoader = typeof window !== "undefined" ? new THREE.TextureLoader().setCrossOrigin("anonymous") : null;
const photoCache = new Map<string, Promise<THREE.Texture | null>>();

// Cloudinary görselini küçük boyutta yükler; hata olursa sessizce vazgeçer
function loadPhoto(url: string) {
  const small = url.includes("res.cloudinary.com") ? url.replace("/image/upload/", "/image/upload/c_fill,w_256,h_256,q_auto,f_jpg/") : url;
  let p = photoCache.get(small);
  if (!p) {
    p = new Promise((resolve) => {
      if (!textureLoader) return resolve(null);
      textureLoader.load(
        small,
        (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          resolve(t);
        },
        undefined,
        () => resolve(null)
      );
    });
    photoCache.set(small, p);
  }
  return p;
}

function usePhoto(url?: string) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!url) return;
    let alive = true;
    loadPhoto(url).then((t) => alive && setTex(t));
    return () => {
      alive = false;
    };
  }, [url]);
  return url ? tex : null;
}

function PhotoFrame({ url, position, size = 0.34 }: { url?: string; position: [number, number, number]; size?: number }) {
  const tex = usePhoto(url);
  if (!tex) return null;
  return (
    <group position={position} rotation={[-0.12, 0, 0]}>
      <mesh position={[0, 0, -0.006]} material={darkWood}>
        <boxGeometry args={[size + 0.04, size + 0.04, 0.012]} />
      </mesh>
      <mesh>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
    </group>
  );
}

export default function Stall({ s, lowDetail }: { s: StallInfo; lowDetail: boolean }) {
  const hovered = useMarket((st) => st.hovered === s.key);
  const selectStall = useMarket((st) => st.set);
  const empty = !s.seller;

  const tex = useMemo(
    () => ({
      awning: awningTexture(s.colors[0], s.colors[1]),
      valance: valanceTexture(s.colors[0], s.colors[1]),
      sign: empty ? signTexture("Bu tezgâh senin olabilir", "Üretici ol · tıkla") : signTexture(s.seller!.name, s.seller!.village.split(",")[0]),
      avatar: s.seller && !s.seller.avatar ? initialsTexture(initials(s.seller.name), s.colors[0]) : null,
    }),
    [s, empty]
  );

  const clothMat = useMemo(() => new THREE.MeshStandardMaterial({ color: s.cloth, roughness: 1 }), [s.cloth]);
  const backMat = useMemo(() => {
    const c = new THREE.Color(s.colors[1]).lerp(new THREE.Color(s.colors[0]), 0.35).offsetHSL(0, -0.05, -0.04);
    return new THREE.MeshStandardMaterial({ color: c, roughness: 1, side: THREE.DoubleSide });
  }, [s.colors]);

  // Az ürünlü tezgâh boş görünmesin: ürünler tekrarlanarak en az 3 kasa dizilir (etiket sadece ilkinde)
  const unique = s.items.slice(0, 4);
  const items = unique.length ? Array.from({ length: Math.max(3, unique.length) }, (_, i) => ({ it: unique[i % unique.length], tag: i < unique.length })) : [];
  const slotX = (i: number) => (items.length === 1 ? 0 : -1.05 + (2.1 / (items.length - 1)) * i);

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    selectStall({ hovered: s.key });
    document.body.style.cursor = "pointer";
  };
  const onOut = () => {
    if (useMarket.getState().hovered === s.key) selectStall({ hovered: null });
    document.body.style.cursor = "";
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const st = useMarket.getState();
    if (!st.started || st.dragDistance > 8) return; // sürükleme tıklama sayılmaz
    const yaw = s.side === -1 ? 1.15 : -1.15;
    st.goTo(s.z + 1.2, yaw);
    st.set({ selected: s.key });
  };

  return (
    <group position={[s.x, 0, s.z]} rotation={[0, s.rotY, 0]} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
      {/* Tezgâh gövdesi */}
      <mesh position={[0, 0.44, -0.05]} castShadow receiveShadow material={wood}>
        <boxGeometry args={[W, 0.88, 1]} />
      </mesh>
      {/* Örtü */}
      <mesh position={[0, 0.9, 0]} receiveShadow material={clothMat}>
        <boxGeometry args={[W + 0.12, 0.04, 1.16]} />
      </mesh>
      <mesh position={[0, 0.62, 0.585]} material={clothMat}>
        <boxGeometry args={[W + 0.12, 0.6, 0.02]} />
      </mesh>

      {/* Direkler */}
      {[-1, 1].map((sx) => (
        <group key={sx}>
          <mesh geometry={post} material={darkWood} position={[sx * (W / 2 + 0.04), 1.15, 0.62]} scale={[1, 2.3, 1]} castShadow />
          <mesh geometry={post} material={darkWood} position={[sx * (W / 2 + 0.04), 1.35, -1.15]} scale={[1, 2.7, 1]} castShadow />
        </group>
      ))}

      {/* Arka perde */}
      <mesh position={[0, 1.3, -1.16]} material={backMat}>
        <planeGeometry args={[W + 0.1, 2.5]} />
      </mesh>

      {/* Tente */}
      <mesh position={[0, 2.47, -0.27]} rotation={[-Math.PI / 2 + 0.24, 0, 0]} castShadow>
        <planeGeometry args={[W + 0.4, 1.9]} />
        <meshStandardMaterial map={tex.awning} side={THREE.DoubleSide} roughness={0.95} emissive={hovered ? "#3a2a10" : "#000000"} />
      </mesh>
      <mesh position={[0, 2.13, 0.66]}>
        <planeGeometry args={[W + 0.4, 0.3]} />
        <meshStandardMaterial map={tex.valance} transparent alphaTest={0.5} side={THREE.DoubleSide} roughness={0.95} />
      </mesh>

      {/* Tabela */}
      <group position={[0, 2.62, 0.7]}>
        <mesh position={[0, 0, -0.02]} material={darkWood}>
          <boxGeometry args={[2.66, 0.6, 0.03]} />
        </mesh>
        <mesh>
          <planeGeometry args={[2.6, 0.56]} />
          <meshStandardMaterial map={tex.sign} roughness={0.8} emissive={hovered ? "#ffffff" : "#000000"} emissiveMap={tex.sign} emissiveIntensity={hovered ? 0.35 : 0} />
        </mesh>
      </group>

      {/* Üretici fotoğrafı arka perdede */}
      {s.seller && (
        <group position={[1.05, 1.75, -1.13]}>
          {s.seller.avatar ? (
            <PhotoFrame url={s.seller.avatar} position={[0, 0, 0]} size={0.5} />
          ) : (
            <mesh>
              <circleGeometry args={[0.24, 32]} />
              <meshStandardMaterial map={tex.avatar!} roughness={0.9} />
            </mesh>
          )}
        </group>
      )}

      {/* Mallar ve fiyat etiketleri */}
      {items.map(({ it, tag }, i) => (
        <group key={`${it.offer.id}-${i}`} position={[slotX(i), 0.92, -0.02]}>
          <group scale={1.3}>
            <Goods kind={it.kind} color={it.color} seed={Math.abs(Math.round(i * 7 - s.z * 3)) + it.product.name.length + 1} />
          </group>
          {tag && !lowDetail && it.image && <PhotoFrame url={it.image} position={[0, 0.55, -0.42]} size={0.34} />}
          {tag && (
            <group position={[0.2, 0.16, 0.42]} rotation={[-0.5, 0, 0]}>
              <mesh>
                <planeGeometry args={[0.36, 0.225]} />
                <meshStandardMaterial map={priceTagTexture(it.product.name, formatPrice(it.price), it.label)} roughness={0.9} />
              </mesh>
            </group>
          )}
        </group>
      ))}

      {/* Boş tezgâh: kara tahta */}
      {empty && (
        <group position={[0, 1.25, -0.1]} rotation={[-0.15, 0, 0]}>
          <mesh material={darkWood}>
            <boxGeometry args={[1.3, 0.75, 0.04]} />
          </mesh>
          <mesh position={[0, 0, 0.022]}>
            <planeGeometry args={[1.2, 0.65]} />
            <meshStandardMaterial map={signTexture("Ürünlerini sat", "Başvuru ücretsiz", true)} roughness={1} />
          </mesh>
        </group>
      )}

      {/* Görünmez tıklama alanı: tezgâhın her yerine dokunulabilsin */}
      <mesh position={[0, 1.4, -0.2]}>
        <boxGeometry args={[W + 0.4, 2.9, 2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
    </group>
  );
}
