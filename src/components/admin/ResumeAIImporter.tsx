"use client";

import { useRef, useState } from "react";
import { createExperience } from "@/actions/experience";
import { Sparkles, Upload, Loader2, CheckCircle, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

type ExperienceEntry = {
  period: string;
  title: string;
  company: string;
  companyUrl: string;
  description: string;
  sortOrder: number;
  tags: string[];
  links: { label: string; url: string }[];
};

type State =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "preview"; experiences: ExperienceEntry[]; checked: boolean[] }
  | { status: "importing"; current: number; total: number }
  | { status: "done"; imported: number };

export function ResumeAIImporter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setState({ status: "uploading" });

    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/ai/parse-resume", {
        method: "POST",
        body,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error ?? "Failed to parse resume");
      }

      const data = await res.json();
      const experiences: ExperienceEntry[] = data.experiences ?? [];

      setState({
        status: "preview",
        experiences,
        checked: experiences.map(() => true),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to parse resume");
      setState({ status: "idle" });
    } finally {
      // Reset input so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function toggleCheck(index: number) {
    if (state.status !== "preview") return;
    const next = [...state.checked];
    next[index] = !next[index];
    setState({ ...state, checked: next });
  }

  async function handleImport() {
    if (state.status !== "preview") return;

    const selected = state.experiences.filter((_, i) => state.checked[i]);
    if (selected.length === 0) {
      toast.error("Select at least one experience to import");
      return;
    }

    setState({ status: "importing", current: 0, total: selected.length });

    let imported = 0;
    for (let i = 0; i < selected.length; i++) {
      setState({ status: "importing", current: i + 1, total: selected.length });
      const result = await createExperience(selected[i]);
      if (result.success) {
        imported++;
      } else {
        toast.error(`Failed to import "${selected[i].title}" at ${selected[i].company}`);
      }
    }

    setState({ status: "done", imported });
    toast.success(`Imported ${imported} experience${imported !== 1 ? "s" : ""}`);
  }

  if (state.status === "idle") {
    return (
      <div className="border border-dashed border-[rgba(26,60,43,0.3)] bg-[rgba(26,60,43,0.03)] p-6" style={{ borderRadius: "2px" }}>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center bg-[rgba(26,60,43,0.08)]" style={{ borderRadius: "50%" }}>
            <Sparkles className="h-6 w-6 text-[#1A3C2B]" />
          </div>
          <div>
            <p className="font-medium text-[#1A3C2B]">AI Experience Import</p>
            <p className="mt-1 text-sm text-[rgba(58,58,56,0.6)]">
              Upload your resume PDF and Claude will extract your work history automatically.
            </p>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            className="mt-1 inline-flex items-center gap-2 bg-[rgba(26,60,43,0.08)] px-4 py-2 text-sm font-medium text-[#1A3C2B] ring-1 ring-[rgba(26,60,43,0.25)] transition-colors hover:bg-[rgba(26,60,43,0.14)]"
            style={{ borderRadius: "2px" }}
          >
            <Upload className="h-4 w-4" />
            Upload Resume PDF
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
    );
  }

  if (state.status === "uploading") {
    return (
      <div className="border border-[rgba(58,58,56,0.12)] bg-white p-6" style={{ borderRadius: "2px" }}>
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1A3C2B]" />
          <div>
            <p className="font-medium text-[#1A3C2B]">Analyzing resume…</p>
            <p className="mt-1 text-sm text-[rgba(58,58,56,0.6)]">
              Claude is extracting your work history. This may take up to 30 seconds.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === "preview") {
    const selectedCount = state.checked.filter(Boolean).length;

    return (
      <div className="border border-[rgba(58,58,56,0.12)] bg-white" style={{ borderRadius: "2px" }}>
        <div className="flex items-center justify-between border-b border-[rgba(58,58,56,0.08)] px-4 py-3">
          <div>
            <p className="font-medium text-[#1A3C2B]">
              Found {state.experiences.length} experience{state.experiences.length !== 1 ? "s" : ""}
            </p>
            <p className="text-sm text-[rgba(58,58,56,0.6)]">
              Review and select which ones to import
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setState({ status: "idle" })}
              className="px-3 py-1.5 text-sm text-[rgba(58,58,56,0.6)] ring-1 ring-[rgba(58,58,56,0.2)] transition-colors hover:text-[#1A3C2B]"
              style={{ borderRadius: "2px" }}
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={selectedCount === 0}
              className="inline-flex items-center gap-2 bg-[#1A3C2B] px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4531] disabled:opacity-40"
              style={{ borderRadius: "2px" }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Import {selectedCount} Selected
            </button>
          </div>
        </div>

        <ul className="divide-y divide-[rgba(58,58,56,0.07)]">
          {state.experiences.map((exp, i) => (
            <li key={i} className="flex gap-3 p-4">
              <input
                type="checkbox"
                id={`exp-${i}`}
                checked={state.checked[i]}
                onChange={() => toggleCheck(i)}
                className="mt-1 h-4 w-4 shrink-0 accent-[#1A3C2B]"
              />
              <label htmlFor={`exp-${i}`} className="cursor-pointer">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="font-medium text-[#1A3C2B]">{exp.title}</span>
                  <span className="text-[rgba(58,58,56,0.7)]">· {exp.company}</span>
                  <span className="text-xs text-[rgba(58,58,56,0.45)]">{exp.period}</span>
                </div>
                {exp.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {exp.tags.slice(0, 6).map((tag) => (
                      <span
                        key={tag}
                        className="bg-[rgba(26,60,43,0.08)] px-2 py-0.5 text-xs text-[#1A3C2B] ring-1 ring-[rgba(26,60,43,0.18)]"
                        style={{ borderRadius: "2px" }}
                      >
                        {tag}
                      </span>
                    ))}
                    {exp.tags.length > 6 && (
                      <span className="text-xs text-[rgba(58,58,56,0.4)]">+{exp.tags.length - 6} more</span>
                    )}
                  </div>
                )}
                {exp.links.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {exp.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-[#FF8C69] hover:underline"
                      >
                        <LinkIcon className="h-3 w-3" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </label>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (state.status === "importing") {
    return (
      <div className="border border-[rgba(58,58,56,0.12)] bg-white p-6" style={{ borderRadius: "2px" }}>
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1A3C2B]" />
          <div>
            <p className="font-medium text-[#1A3C2B]">
              Importing {state.current} / {state.total}…
            </p>
            <p className="mt-1 text-sm text-[rgba(58,58,56,0.6)]">
              Saving experiences to the database
            </p>
          </div>
          <div className="h-1.5 w-48 overflow-hidden bg-[rgba(58,58,56,0.1)]" style={{ borderRadius: "2px" }}>
            <div
              className="h-full bg-[#1A3C2B] transition-all duration-300"
              style={{ width: `${(state.current / state.total) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // done
  return (
    <div className="border border-[rgba(26,60,43,0.2)] bg-[rgba(26,60,43,0.03)] p-6" style={{ borderRadius: "2px" }}>
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle className="h-10 w-10 text-[#1A3C2B]" />
        <div>
          <p className="font-medium text-[#1A3C2B]">
            Imported {state.imported} experience{state.imported !== 1 ? "s" : ""}
          </p>
          <p className="mt-1 text-sm text-[rgba(58,58,56,0.6)]">
            Your work history has been added successfully.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setState({ status: "idle" })}
            className="px-3 py-1.5 text-sm text-[rgba(58,58,56,0.6)] ring-1 ring-[rgba(58,58,56,0.2)] transition-colors hover:text-[#1A3C2B]"
            style={{ borderRadius: "2px" }}
          >
            Import Another
          </button>
          <Link
            href="/admin/experience"
            className="bg-[#1A3C2B] px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4531]"
            style={{ borderRadius: "2px" }}
          >
            View Experiences →
          </Link>
        </div>
      </div>
    </div>
  );
}
