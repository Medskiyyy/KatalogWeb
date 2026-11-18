"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Check, MusicNote, UploadSimple, Warning } from "@phosphor-icons/react";
import { SlugSchema } from "@/lib/schema";

interface AudioUploadFieldProps {
  label: string;
  value: string;
  slug: string;
  studioConnected: boolean;
  placeholder?: string;
  onChange: (nextUrl: string) => void;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Gagal membaca file audio."));
      }
    };
    reader.onerror = () => reject(new Error("Gagal membaca file MP3."));
    reader.readAsDataURL(file);
  });
}

export function AudioUploadField({
  label,
  value,
  slug,
  studioConnected,
  placeholder = "/audio/music/romance-piano.mp3 atau /uploads/...",
  onChange,
}: AudioUploadFieldProps) {
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
      setErrorText(
        "Jalankan npm.cmd run dev untuk upload MP3 ke public/uploads."
      );
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorText("Ukuran MP3 maksimal 15 MB agar tetap ringan dibuka.");
      return;
    }

    const slugResult = SlugSchema.safeParse(slug);
    if (!slugResult.success) {
      setErrorText(
        slugResult.error.issues[0]?.message ||
          "Isi nama subdomain yang valid sebelum upload audio."
      );
      return;
    }

    setIsUploading(true);
    try {
      const dataBase64 = await readFileAsDataUrl(file);
      const rawBase = file.name.replace(/\.[^.]+$/, "") || "audio";
      const filename = `${rawBase}.mp3`;

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
        throw new Error(payload.error || "Upload MP3 gagal.");
      }

      const resultKb = Math.max(1, Math.round((payload.bytes ?? file.size) / 1024));
      setSizeSummary(`${resultKb} KB MP3 tersimpan`);
      onChange(payload.url);
    } catch (err) {
      setErrorText(
        err instanceof Error ? err.message : "Terjadi kesalahan saat upload MP3."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-zinc-700">{label}</label>
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600">
          <MusicNote size={16} weight="bold" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-10 min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mpeg,.mp3"
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
          <span>{isUploading ? "Mengunggah..." : "Upload MP3"}</span>
        </button>
      </div>

      {!studioConnected ? (
        <p className="flex items-center gap-1.5 text-xs text-amber-700">
          <Warning size={14} weight="bold" className="shrink-0" />
          <span>Jalankan npm.cmd run dev untuk upload MP3 ke public/uploads.</span>
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
