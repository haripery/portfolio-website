"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  acceptPdf?: boolean;
}

export function ImageUploader({
  value,
  onChange,
  label = "Image",
  folder = "uploads",
  acceptPdf = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = acceptPdf
    ? "image/jpeg,image/png,image/webp,image/gif,application/pdf"
    : "image/jpeg,image/png,image/webp,image/gif";

  async function handleFile(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(data.error ?? "Upload failed");
      }
      const { url } = await res.json();
      onChange(url);
      toast.success("Uploaded successfully");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  const IMAGE_EXTS = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
  const isImage = Boolean(value && IMAGE_EXTS.test(value));
  const isPdf = Boolean(value && !isImage);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-ink/75">{label}</label>

      {/* Preview */}
      {isImage && (
        <div className="relative h-24 w-36 overflow-hidden border border-ink/20" style={{ borderRadius: "2px" }}>
          <Image
            src={value}
            alt={label}
            fill
            className="object-cover"
            sizes="144px"
          />
        </div>
      )}
      {isPdf && (
        <div className="flex items-center gap-2 border border-ink/15 bg-ink/4 px-3 py-2 text-sm text-ink/60" style={{ borderRadius: "2px" }}>
          <span className="font-mono text-xs">PDF</span>
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-coral hover:underline truncate"
          >
            View current file
          </a>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 border border-ink/20 px-3 py-1.5 text-sm text-ink/60 transition-colors hover:border-forest hover:text-forest disabled:cursor-not-allowed disabled:opacity-50"
          style={{ borderRadius: "2px" }}
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-400"
          >
            <X className="h-3 w-3" />
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
