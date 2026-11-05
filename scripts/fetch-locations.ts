import { writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "https://api.turkiyeapi.dev/v1";
const TARGETS = [
  { id: 9, name: "Aydın" },
  { id: 20, name: "Denizli" },
  { id: 48, name: "Muğla" },
];

type Named = { id: number; name: string };

async function get<T>(url: string): Promise<T> {
  for (let i = 0; i < 4; i++) {
    const res = await fetch(url);
    if (res.ok) return ((await res.json()) as { data: T }).data;
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error(`İstek başarısız: ${url}`);
}

async function main() {
  const out: Record<string, Record<string, string[]>> = {};

  for (const p of TARGETS) {
    const prov = await get<{ districts: Named[] }>(`${BASE}/provinces/${p.id}`);
    out[p.name] = {};
    for (const d of prov.districts) {
      const det = await get<{ neighborhoods?: Named[]; villages?: Named[] }>(`${BASE}/districts/${d.id}`);
      const places = [
        ...(det.neighborhoods ?? []).map((n) => n.name),
        ...(det.villages ?? []).map((v) => `${v.name} (Köy)`),
      ];
      out[p.name][d.name] = [...new Set(places)].sort((a, b) => a.localeCompare(b, "tr"));
      console.log(`✓ ${p.name} / ${d.name}: ${out[p.name][d.name].length} yer`);
      await new Promise((r) => setTimeout(r, 300)); // servisi yormamak için
    }
  }

  const file = join(process.cwd(), "src", "data", "locations.json");
  writeFileSync(file, JSON.stringify(out));
  console.log(`\nKaydedildi: ${file}`);
}

main().catch((e) => {
  console.error("Hata:", e);
  process.exitCode = 1;
});