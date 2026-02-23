"use client";

import { useState, useTransition } from "react";
import { updateResumeUrl } from "@/actions/profile";
import { ImageUploader } from "./ImageUploader";
import toast from "react-hot-toast";
import { FileText, ExternalLink } from "lucide-react";

export function ResumeUploadForm({ currentUrl }: { currentUrl: string }) {
  const [url, setUrl] = useState(currentUrl);
  const [isPending, startTransition] = useTransition();

  async function handleSave() {
    startTransition(async () => {
      const result = await updateResumeUrl(url);
      if (result.success) {
        toast.success("Resume URL saved!");
      } else {
        toast.error("Failed to save.");
      }
    });
  }

  return (
    <div className="max-w-md space-y-6">
      <div className="border border-[rgba(58,58,56,0.12)] bg-white p-6 space-y-4" style={{ borderRadius: "2px" }}>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[rgba(58,58,56,0.75)]">
            Resume URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full border border-[rgba(58,58,56,0.2)] bg-white px-3 py-2 text-sm text-[#1A3C2B] placeholder:text-[rgba(58,58,56,0.35)] focus:border-[#1A3C2B] focus:outline-none focus:ring-1 focus:ring-[#1A3C2B]"
            style={{ borderRadius: "2px" }}
            placeholder="https://..."
          />
          <p className="text-xs text-[rgba(58,58,56,0.45)]">
            Enter a direct link to your resume PDF, or upload one below.
          </p>
        </div>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[#FF8C69] hover:underline"
          >
            <FileText className="h-4 w-4" />
            View current resume
            <ExternalLink className="h-3 w-3" />
          </a>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="bg-[#1A3C2B] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1D4531] disabled:opacity-50"
          style={{ borderRadius: "2px" }}
        >
          {isPending ? "Saving…" : "Save URL"}
        </button>
      </div>

      <div className="border border-[rgba(58,58,56,0.12)] bg-white p-6" style={{ borderRadius: "2px" }}>
        <h2
          className="mb-4 text-xs font-semibold uppercase tracking-widest text-[rgba(58,58,56,0.5)]"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          Upload PDF
        </h2>
        <ImageUploader
          label="Resume PDF"
          value={url}
          onChange={(newUrl) => {
            setUrl(newUrl);
          }}
          folder="resume"
          acceptPdf
        />
        <p className="mt-3 text-xs text-[rgba(58,58,56,0.45)]">
          Uploading will update the URL above. Click &ldquo;Save URL&rdquo; to apply.
        </p>
      </div>
    </div>
  );
}
