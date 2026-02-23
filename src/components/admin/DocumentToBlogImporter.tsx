"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createBlogPost } from "@/actions/blog";
import { Sparkles, Upload, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-hot-toast";

type State =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "creating" }
  | { status: "done" };

export function DocumentToBlogImporter() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<State>({ status: "idle" });
  const [open, setOpen] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setState({ status: "uploading" });

    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/ai/parse-document", {
        method: "POST",
        body,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error ?? "Failed to parse document");
      }

      const data = await res.json();

      setState({ status: "creating" });

      const result = await createBlogPost({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt ?? "",
        content: data.content,
        contentJson: "{}",
        category: data.category,
        tags: data.tags ?? [],
        readTime: data.readTime ?? "",
        published: false,
        featured: false,
        coverImage: "",
      });

      if (!result.success) {
        throw new Error("Failed to create blog post draft");
      }

      setState({ status: "done" });
      toast.success("Draft created! Opening editor…");
      router.push(`/admin/blog/${result.data!.id}/edit`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to import document"
      );
      setState({ status: "idle" });
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const isLoading =
    state.status === "uploading" || state.status === "creating";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isLoading}
        className="inline-flex items-center gap-2 bg-[rgba(58,58,56,0.08)] px-4 py-2 text-sm font-semibold text-[#1A3C2B] ring-1 ring-[rgba(58,58,56,0.2)] transition-colors hover:bg-[rgba(58,58,56,0.14)] disabled:opacity-60"
        style={{ borderRadius: "2px" }}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {state.status === "uploading" ? "Analyzing…" : "Creating draft…"}
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 text-[#1A3C2B]" />
            Import from Document
            {open ? (
              <ChevronUp className="h-3.5 w-3.5 text-[rgba(58,58,56,0.45)]" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-[rgba(58,58,56,0.45)]" />
            )}
          </>
        )}
      </button>

      {open && !isLoading && (
        <div className="absolute right-0 top-full z-10 mt-1 w-72 border border-[rgba(58,58,56,0.15)] bg-white p-4 shadow-lg" style={{ borderRadius: "2px" }}>
          <p className="text-sm font-medium text-[#1A3C2B]">Generate Blog Draft</p>
          <p className="mt-1 text-xs text-[rgba(58,58,56,0.6)]">
            Upload a PDF, Markdown, or text file. Claude will generate a full
            draft blog post and open it in the editor.
          </p>
          <button
            onClick={() => {
              setOpen(false);
              inputRef.current?.click();
            }}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 bg-[rgba(26,60,43,0.08)] px-3 py-2 text-sm font-medium text-[#1A3C2B] ring-1 ring-[rgba(26,60,43,0.25)] transition-colors hover:bg-[rgba(26,60,43,0.14)]"
            style={{ borderRadius: "2px" }}
          >
            <Upload className="h-4 w-4" />
            Choose File
          </button>
          <p className="mt-2 text-center text-xs text-[rgba(58,58,56,0.45)]">
            PDF · Markdown · TXT · up to 10 MB
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,text/plain,text/markdown,.md,.txt"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
