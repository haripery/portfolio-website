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
      <div className="rounded-lg border border-dashed border-teal-500/40 bg-teal-500/5 p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/10">
            <Sparkles className="h-6 w-6 text-teal-400" />
          </div>
          <div>
            <p className="font-medium text-white">AI Experience Import</p>
            <p className="mt-1 text-sm text-slate-400">
              Upload your resume PDF and Claude will extract your work history automatically.
            </p>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            className="mt-1 inline-flex items-center gap-2 rounded-md bg-teal-500/20 px-4 py-2 text-sm font-medium text-teal-300 ring-1 ring-teal-500/30 transition-colors hover:bg-teal-500/30"
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
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
          <div>
            <p className="font-medium text-white">Analyzing resume…</p>
            <p className="mt-1 text-sm text-slate-400">
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
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/50">
        <div className="flex items-center justify-between border-b border-slate-700/50 px-4 py-3">
          <div>
            <p className="font-medium text-white">
              Found {state.experiences.length} experience{state.experiences.length !== 1 ? "s" : ""}
            </p>
            <p className="text-sm text-slate-400">
              Review and select which ones to import
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setState({ status: "idle" })}
              className="rounded-md px-3 py-1.5 text-sm text-slate-400 ring-1 ring-slate-600 transition-colors hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={selectedCount === 0}
              className="inline-flex items-center gap-2 rounded-md bg-teal-500 px-3 py-1.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-teal-400 disabled:opacity-40"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Import {selectedCount} Selected
            </button>
          </div>
        </div>

        <ul className="divide-y divide-slate-700/30">
          {state.experiences.map((exp, i) => (
            <li key={i} className="flex gap-3 p-4">
              <input
                type="checkbox"
                id={`exp-${i}`}
                checked={state.checked[i]}
                onChange={() => toggleCheck(i)}
                className="mt-1 h-4 w-4 shrink-0 accent-teal-500"
              />
              <label htmlFor={`exp-${i}`} className="cursor-pointer">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="font-medium text-white">{exp.title}</span>
                  <span className="text-slate-300">· {exp.company}</span>
                  <span className="text-xs text-slate-500">{exp.period}</span>
                </div>
                {exp.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {exp.tags.slice(0, 6).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-teal-400/10 px-2 py-0.5 text-xs text-teal-300 ring-1 ring-teal-400/20"
                      >
                        {tag}
                      </span>
                    ))}
                    {exp.tags.length > 6 && (
                      <span className="text-xs text-slate-500">+{exp.tags.length - 6} more</span>
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
                        className="inline-flex items-center gap-1 text-xs text-teal-400 hover:underline"
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
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
          <div>
            <p className="font-medium text-white">
              Importing {state.current} / {state.total}…
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Saving experiences to the database
            </p>
          </div>
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-teal-500 transition-all duration-300"
              style={{ width: `${(state.current / state.total) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // done
  return (
    <div className="rounded-lg border border-teal-500/30 bg-teal-500/5 p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle className="h-10 w-10 text-teal-400" />
        <div>
          <p className="font-medium text-white">
            Imported {state.imported} experience{state.imported !== 1 ? "s" : ""}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Your work history has been added successfully.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setState({ status: "idle" })}
            className="rounded-md px-3 py-1.5 text-sm text-slate-400 ring-1 ring-slate-600 transition-colors hover:text-white"
          >
            Import Another
          </button>
          <Link
            href="/admin/experience"
            className="rounded-md bg-teal-500 px-3 py-1.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-teal-400"
          >
            View Experiences →
          </Link>
        </div>
      </div>
    </div>
  );
}
