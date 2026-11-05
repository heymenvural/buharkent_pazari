"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Camera, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { compressImage } from "@/lib/compressImage";

type Sign = { ok: boolean; error?: string; cloudName: string; apiKey: string; timestamp: number; signature: string; folder: string; allowedFormats: string };

/** Fotoğrafı telefonda küçültür, sunucudan imza alır ve doğrudan Cloudinary'ye yükler */
export async function uploadImage(file: File): Promise<string> {
  const small = await compressImage(file, 1800, 0.82);
  if (small.size > 8 * 1024 * 1024) throw new Error("Fotoğraf çok büyük.");

  const res = await fetch("/api/gorsel/imza", { method: "POST" });
  const sign = (await res.json().catch(() => ({}))) as Sign;
  if (!res.ok || !sign.ok) throw new Error(sign.error ?? "Yükleme başlatılamadı.");

  const fd = new FormData();
  fd.append("file", small);
  fd.append("api_key", sign.apiKey);
  fd.append("timestamp", String(sign.timestamp));
  fd.append("signature", sign.signature);
  fd.append("folder", sign.folder);
  fd.append("allowed_formats", sign.allowedFormats);

  const up = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, { method: "POST", body: fd });
  const json = (await up.json().catch(() => ({}))) as { secure_url?: string; error?: { message?: string } };
  if (!up.ok || !json.secure_url) {
    const msg = json.error?.message ?? "";
    console.error("Cloudinary yükleme hatası:", msg);
    if (/format/i.test(msg)) throw new Error("Sadece JPG, PNG veya WEBP yükleyebilirsin.");
    if (/signature|api_key|api key|cloud_name|unknown/i.test(msg)) throw new Error(`Fotoğraf servisi ayarlarında sorun var: ${msg}`);
    throw new Error(msg ? `Yükleme başarısız: ${msg}` : "Yükleme başarısız.");
  }
  return json.secure_url;
}

/** Çoklu ürün fotoğrafı: ekle, sırala, sil. İlk fotoğraf kapak olur. */
export default function ImageUploader({ value, onChange, max = 6, error }: { value: string[]; onChange: (v: string[]) => void; max?: number; error?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [err, setErr] = useState("");

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setErr("");
    const list = [...files].slice(0, max - value.length);
    setBusy(list.length);
    let next = [...value];
    for (const f of list) {
      try {
        next = [...next, await uploadImage(f)];
        onChange(next);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Yükleme başarısız.");
      } finally {
        setBusy((b) => b - 1);
      }
    }
    if (ref.current) ref.current.value = "";
  };

  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };

  return (
    <div>
      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {value.map((src, i) => (
          <div key={src} className="group relative aspect-square overflow-hidden rounded-2xl bg-sand-300">
            <Image src={src} alt="" fill sizes="(max-width: 640px) 50vw, 200px" className="object-cover" />
            {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-olive-700 px-2.5 py-1 text-xs font-bold text-cream-50">Kapak</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-ink/70 to-transparent p-2">
              <span className="flex gap-1">
                {i > 0 && (
                  <button type="button" onClick={() => move(i, -1)} aria-label="Sola al" className="grid h-9 w-9 place-items-center rounded-full bg-cream-50/90 text-ink">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                {i < value.length - 1 && (
                  <button type="button" onClick={() => move(i, 1)} aria-label="Sağa al" className="grid h-9 w-9 place-items-center rounded-full bg-cream-50/90 text-ink">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </span>
              <button type="button" onClick={() => onChange(value.filter((x) => x !== src))} aria-label="Sil" className="grid h-9 w-9 place-items-center rounded-full bg-terra-600 text-cream-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {Array.from({ length: busy }).map((_, i) => (
          <div key={`b${i}`} className="grid aspect-square place-items-center rounded-2xl bg-cream-200">
            <Loader2 className="h-8 w-8 animate-spin text-olive-700" />
          </div>
        ))}
        {value.length + busy < max && (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-olive-700 transition-colors hover:bg-cream-200 ${error ? "border-terra-500" : "border-sand-400"}`}
          >
            {value.length ? <ImagePlus className="h-8 w-8" /> : <Camera className="h-8 w-8" />}
            <span className="px-2 text-center text-sm font-semibold">{value.length ? "Fotoğraf ekle" : "Fotoğraf çek / seç"}</span>
          </button>
        )}
      </div>
      <p className="mt-2 text-sm text-muted">En fazla {max} fotoğraf. İlk fotoğraf kapak olarak görünür; okları kullanarak sıralayabilirsin.</p>
      {(err || error) && <p className="mt-1 text-sm font-medium text-terra-600">{err || error}</p>}
    </div>
  );
}

/** Tek fotoğraf (profil / kapak) */
export function SingleImage({ value, onChange, label, round }: { value: string; onChange: (v: string) => void; label: string; round?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onFile = async (f?: File) => {
    if (!f) return;
    setErr("");
    setBusy(true);
    try {
      onChange(await uploadImage(f));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Yükleme başarısız.");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      <div className="flex items-center gap-4">
        <div className={`relative shrink-0 overflow-hidden bg-sand-300 ${round ? "h-24 w-24 rounded-full" : "h-24 w-40 rounded-2xl"}`}>
          {value && <Image src={value} alt="" fill sizes="160px" className="object-cover" />}
          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-cream-50/70">
              <Loader2 className="h-6 w-6 animate-spin text-olive-700" />
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <button type="button" onClick={() => ref.current?.click()} disabled={busy} className="flex items-center gap-2 rounded-full border-2 border-olive-700 px-4 py-2 text-sm font-semibold text-olive-700 disabled:opacity-60">
            <Camera className="h-4 w-4" /> {value ? `${label} değiştir` : `${label} ekle`}
          </button>
          {value && (
            <button type="button" onClick={() => onChange("")} className="text-left text-sm text-muted hover:text-terra-600">
              Kaldır
            </button>
          )}
        </div>
      </div>
      {err && <p className="mt-1 text-sm font-medium text-terra-600">{err}</p>}
    </div>
  );
}
