"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/actions/profile";
import { ImageUploader } from "./ImageUploader";
import toast from "react-hot-toast";
import { FileText, ExternalLink } from "lucide-react";

export function ResumeUploadForm({ currentUrl }: { currentUrl: string }) {
  const [url, setUrl] = useState(currentUrl);
  const [isPending, startTransition] = useTransition();

  async function handleSave() {
    startTransition(async () => {
      const result = await updateProfile({
        resumeUrl: url,
        // These will be ignored if not provided — pass empty to avoid validation errors
        name: "",
        role: "",
        tagline: "",
        bio: "",
        email: "",
        photoUrl: "",
      });
      if (result.success) {
        toast.success("Resume URL saved!");
      } else {
        toast.error("Failed to save.");
      }
    });
  }

  return (
    <div className="max-w-md space-y-6">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Resume URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="https://..."
          />
          <p className="text-xs text-slate-500">
            Enter a direct link to your resume PDF, or upload one below.
          </p>
        </div>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-teal-400 hover:underline"
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
          className="rounded-md bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-teal-400 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save URL"}
        </button>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">
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
        <p className="mt-3 text-xs text-slate-500">
          Uploading will update the URL above. Click &ldquo;Save URL&rdquo; to apply.
        </p>
      </div>
    </div>
  );
}
