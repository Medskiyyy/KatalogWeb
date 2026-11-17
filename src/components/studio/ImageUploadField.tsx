"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Check, UploadSimple, Warning } from "@phosphor-icons/react";
import { SlugSchema } from "@/lib/schema";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  slug: string;
  studioConnected: boolean;
  onChange: (nextUrl: string) => void;
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Gagal membaca data gambar."));
      }
    };
    reader.onerror = () => reject(new Error("Gagal membaca file WebP."));
    reader.readAsDataURL(blob);
  });
}

async function compressImageToWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const maxDim = 1600;
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const targetWidth = Math.max(1, Math.round(bitmap.width * scale));
    const targetHeight = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas 2D tidak tersedia di browser ini.");
    }
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.82)
    );
    if (!blob) {
      throw new Error("Gagal mengonversi gambar ke WebP.");
    }
    return blob;
  } finally {
    bitmap.close();
  }
}

export function ImageUploadField({
  label,
  value,
  slug,
  studioConnected,
  onChange,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [sizeSummary, setSizeSummary] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setErrorText(null);
    setSizeSummary(null);

    if (!studioConnected) {
      setErrorText("Jalankan npm.cmd run dev untuk upload foto ke public/uploads.");
      return;
    }

    const slugResult = SlugSchema.safeParse(slug);
    if (!slugResult.success) {
      setErrorText(
        slugResult.error.issues[0]?.message ||
          "Isi nama subdomain yang valid sebelum upload foto."
      );
      return;
    }

    setIsUploading(true);
    try {
      const webpBlob = await compressImageToWebp(file);
      const dataBase64 = await readBlobAsDataUrl(webpBlob);
      const filename = `${file.name.replace(/\.[^.]+$/, "") || "foto"}.webp`;

      const res = await fetch("/__studio/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slugResult.data,
          filename,
          dataBase64,
        }),
      });

      const payload = (await res.json()) as {
        ok?: boolean;
        url?: string;
        bytes?: number;
        error?: string;
      };

      if (!res.ok || !payload.ok || !payload.url) {
        throw new Error(payload.error || "Upload foto gagal.");
      }

      const originalKb = Math.max(1, Math.round(file.size / 1024));
      const resultKb = Math.max(
        1,
        Math.round((payload.bytes ?? webpBlob.size) / 1024)
      );
      setSizeSummary(`${originalKb} KB -> ${resultKb} KB WebP`);
      onChange(payload.url);
    } catch (err) {
      setErrorText(
        err instanceof Error ? err.message : "Terjadi kesalahan saat upload foto."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-zinc-700">{label}</label>
      <div className="flex items-center gap-2.5">
        {value.trim() ? (
          <img
            src={value}
            alt={label}
            className="h-12 w-12 shrink-0 rounded-lg border border-zinc-200 bg-zinc-100 object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-[10px] font-medium text-zinc-400">
            48x48
          </div>
        )}

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/demo/foto.webp atau /uploads/..."
          className="h-10 min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-zinc-300 bg-zinc-50 px-3 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UploadSimple size={15} weight="bold" />
          <span>{isUploading ? "Mengunggah..." : "Upload WebP"}</span>
        </button>
      </div>

      {!studioConnected ? (
        <p className="flex items-center gap-1.5 text-xs text-amber-700">
          <Warning size={14} weight="bold" className="shrink-0" />
          <span>Jalankan npm.cmd run dev untuk upload foto ke public/uploads.</span>
        </p>
      ) : null}

      {sizeSummary ? (
        <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <Check size={14} weight="bold" className="shrink-0" />
          <span>{sizeSummary}</span>
        </p>
      ) : null}

      {errorText ? (
        <p className="flex items-center gap-1.5 text-xs text-rose-600">
          <Warning size={14} weight="bold" className="shrink-0" />
          <span>{errorText}</span>
        </p>
      ) : null}
    </div>
  );
}
