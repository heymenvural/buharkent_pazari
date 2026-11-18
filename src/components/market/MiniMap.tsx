"use client";

import { useMarket } from "./store";
import type { MarketPlan } from "./layout";

/** Pazarın kuşbakışı haritası: sokaklar, tezgâhlar ve senin konumun */
export default function MiniMap({ plan, onStreet }: { plan: MarketPlan; onStreet: (id: string) => void }) {
  const x = useMarket((s) => s.targetX);
  const z = useMarket((s) => s.targetZ);
  const yaw = useMarket((s) => s.targetYaw);
  const current = useMarket((s) => s.street);

  const pad = 6;
  const xs = plan.rects.flatMap((r) => [r.x0, r.x1]);
  const zs = plan.rects.flatMap((r) => [r.z0, r.z1]);
  const minX = Math.min(...xs, -8) - pad;
  const maxX = Math.max(...xs, 8) + pad;
  const minZ = Math.min(...zs) - pad;
  const maxZ = Math.max(...zs, 8) + pad;
  const w = maxX - minX;
  const h = maxZ - minZ;
  const deg = (-yaw * 180) / Math.PI;

  return (
    <svg viewBox={`${minX} ${minZ} ${w} ${h}`} className="h-auto max-h-56 w-full rounded-2xl bg-[#efdcbc]" role="img" aria-label="Pazar haritası">
      {plan.rects.map((r, i) => (
        <rect
          key={i}
          x={r.x0 - 1.6}
          y={r.z0 - 1.6}
          width={r.x1 - r.x0 + 3.2}
          height={r.z1 - r.z0 + 3.2}
          rx={1.5}
          className={r.street && r.street === current ? "fill-olive-500/60" : "fill-cream-50"}
          onClick={() => r.street && onStreet(r.street)}
          style={{ cursor: r.street ? "pointer" : undefined }}
        />
      ))}
      {plan.stalls.map((s) => (
        <circle key={s.key} cx={s.x} cy={s.z} r={1.3} fill={s.seller ? s.colors[0] : "#b8ad9c"} />
      ))}
      <g transform={`translate(${x} ${z}) rotate(${deg})`}>
        <circle r={2.6} className="fill-terra-500" stroke="#fff" strokeWidth={0.8} />
        <path d="M0 -5.2 L2.2 -1.6 L-2.2 -1.6 Z" className="fill-terra-500" />
      </g>
    </svg>
  );
}
