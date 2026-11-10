import * as THREE from "three";

/* Tüm dokular tarayıcıda canvas ile çiziliyor: dışarıdan dosya indirilmez, sayfa hızlı açılır. */

const cache = new Map<string, THREE.Texture>();

function fontVar(name: string, fallback: string) {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
export const displayFont = () => fontVar("--font-fraunces", "Georgia, serif");
export const sansFont = () => fontVar("--font-manrope", "system-ui, sans-serif");

function make(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void, opts?: { repeat?: [number, number] }) {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  draw(ctx);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (opts?.repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...opts.repeat);
  }
  cache.set(key, t);
  return t;
}

function rand(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

/** Arnavut kaldırımı */
export function cobbleTexture(repeatZ: number) {
  return make(`cobble-${repeatZ}`, 512, 512, (ctx) => {
    const r = rand(42);
    ctx.fillStyle = "#8f8270";
    ctx.fillRect(0, 0, 512, 512);
    const rows = 10;
    const h = 512 / rows;
    for (let y = 0; y < rows; y++) {
      let x = y % 2 ? -h / 2 : 0;
      const start = x;
      while (x < start + 512) {
        // Son taş tam kenara otursun (döşemede dikiş görünmesin)
        let w = h * (0.8 + r() * 0.6);
        if (start + 512 - (x + w) < h * 0.6) w = start + 512 - x;
        const shade = 150 + Math.floor(r() * 50);
        for (const off of [0, -512, 512]) {
          ctx.fillStyle = `rgb(${shade + 18},${shade + 6},${shade - 12})`;
          ctx.beginPath();
          ctx.roundRect(x + off + 3, y * h + 3, w - 6, h - 6, 10);
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.08)";
          ctx.beginPath();
          ctx.roundRect(x + off + 6, y * h + 5, w - 14, (h - 10) / 2, 8);
          ctx.fill();
        }
        x += w;
      }
    }
  }, { repeat: [9, repeatZ] });
}

/** Çizgili tente */
export function awningTexture(a: string, b: string) {
  return make(`awning-${a}-${b}`, 256, 256, (ctx) => {
    const n = 8;
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = i % 2 ? b : a;
      ctx.fillRect((i * 256) / n, 0, 256 / n, 256);
    }
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "rgba(0,0,0,0.18)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  });
}

/** Tentenin dalgalı ön saçağı (alt kenarı kesik) */
export function valanceTexture(a: string, b: string) {
  return make(`valance-${a}-${b}`, 512, 64, (ctx) => {
    const n = 8;
    const w = 512 / n;
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = i % 2 ? b : a;
      ctx.beginPath();
      ctx.moveTo(i * w, 0);
      ctx.lineTo((i + 1) * w, 0);
      ctx.lineTo((i + 1) * w, 34);
      ctx.arc(i * w + w / 2, 34, w / 2, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
    }
  });
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, "…");
  }
  return lines;
}

/** Tezgâh tabelası */
export function signTexture(title: string, subtitle: string, empty = false) {
  return make(`sign-${title}-${subtitle}`, 1024, 220, (ctx) => {
    ctx.fillStyle = empty ? "#e9e3d6" : "#3b2a1c";
    ctx.beginPath();
    ctx.roundRect(4, 4, 1016, 212, 28);
    ctx.fill();
    // Ahşap damarı
    const r = rand(title.length + 3);
    ctx.strokeStyle = empty ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 14; i++) {
      const y = 20 + r() * 180;
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.bezierCurveTo(300, y + (r() - 0.5) * 20, 700, y + (r() - 0.5) * 20, 1000, y);
      ctx.stroke();
    }
    ctx.strokeStyle = empty ? "#b9af9c" : "#c9a46a";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(18, 18, 988, 184, 20);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = empty ? "#5b5246" : "#fbf1dc";
    let size = 84;
    ctx.font = `600 ${size}px ${displayFont()}`;
    while (ctx.measureText(title).width > 920 && size > 40) {
      size -= 4;
      ctx.font = `600 ${size}px ${displayFont()}`;
    }
    ctx.fillText(title, 512, subtitle ? 92 : 110);
    if (subtitle) {
      ctx.font = `600 34px ${sansFont()}`;
      ctx.fillStyle = empty ? "#8a7f6e" : "#e2c48e";
      ctx.fillText(subtitle.toLocaleUpperCase("tr"), 512, 165);
    }
  });
}

/** Fiyat etiketi */
export function priceTagTexture(name: string, price: string, unit: string) {
  return make(`tag-${name}-${price}-${unit}`, 320, 200, (ctx) => {
    ctx.fillStyle = "#fdf8ec";
    ctx.beginPath();
    ctx.roundRect(4, 4, 312, 192, 18);
    ctx.fill();
    ctx.strokeStyle = "#2b2620";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "#2b2620";
    ctx.font = `700 30px ${sansFont()}`;
    ctx.textBaseline = "top";
    const lines = wrap(ctx, name, 280, 2);
    lines.forEach((l, i) => ctx.fillText(l, 20, 18 + i * 34));
    ctx.fillStyle = "#a65a2e";
    ctx.font = `600 54px ${displayFont()}`;
    ctx.fillText(price, 20, 96);
    ctx.fillStyle = "#7a6f60";
    ctx.font = `600 24px ${sansFont()}`;
    ctx.fillText(unit, 20, 156);
  });
}

/** Ev cephesi (pencereler, panjurlar) */
export function facadeTexture(wall: string, shutter: string, seed: number) {
  return make(`facade-${wall}-${shutter}-${seed}`, 256, 256, (ctx) => {
    const r = rand(seed + 11);
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = `rgba(0,0,0,${r() * 0.04})`;
      ctx.fillRect(r() * 256, r() * 256, 3 + r() * 8, 3 + r() * 8);
    }
    const cols = 2;
    for (let row = 0; row < 2; row++) {
      for (let c = 0; c < cols; c++) {
        const x = 40 + c * 120;
        const y = 34 + row * 116;
        ctx.fillStyle = "#3b4446";
        ctx.fillRect(x, y, 56, 74);
        ctx.fillStyle = shutter;
        ctx.fillRect(x - 22, y, 20, 74);
        ctx.fillRect(x + 58, y, 20, 74);
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.fillRect(x + 4, y + 4, 22, 30);
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.fillRect(x - 4, y + 74, 64, 6);
        if (r() > 0.5) {
          // Saksı
          ctx.fillStyle = "#b5532f";
          ctx.fillRect(x + 6, y + 64, 44, 12);
          ctx.fillStyle = "#5d7a3a";
          ctx.beginPath();
          ctx.arc(x + 18, y + 62, 9, 0, Math.PI * 2);
          ctx.arc(x + 36, y + 60, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#d04a5a";
          ctx.beginPath();
          ctx.arc(x + 28, y + 56, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  });
}

/** Giriş takı yazısı */
export function archTexture() {
  return make("arch", 1024, 160, (ctx) => {
    ctx.fillStyle = "#4a5627";
    ctx.fillRect(0, 0, 1024, 160);
    ctx.strokeStyle = "#e2c48e";
    ctx.lineWidth = 6;
    ctx.strokeRect(14, 14, 996, 132);
    ctx.fillStyle = "#fbf1dc";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `600 78px ${displayFont()}`;
    ctx.fillText("Buharkent Pazarı", 512, 84);
  });
}

/** Gökyüzü geçişi */
export function skyTexture() {
  return make("sky", 4, 256, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "#8fb9d1");
    g.addColorStop(0.45, "#cfe0e4");
    g.addColorStop(0.62, "#f6e3c4");
    g.addColorStop(1, "#f2d7b0");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 256);
  });
}

/** Satıcı fotoğrafı yoksa baş harfli yuvarlak rozet */
export function initialsTexture(text: string, bg: string) {
  return make(`ini-${text}-${bg}`, 256, 256, (ctx) => {
    ctx.fillStyle = "#fbf1dc";
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(128, 128, 110, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fbf1dc";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `600 100px ${displayFont()}`;
    ctx.fillText(text, 128, 136);
  });
}
