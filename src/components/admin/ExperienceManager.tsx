"use client";

import { useState, useTransition } from "react";
import {
  createExperience,
  updateExperience,
  deleteExperience,
} from "@/actions/experience";
import { TagInput } from "./TagInput";
import { ConfirmDialog } from "./ConfirmDialog";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, X, Check } from "lucide-react";
import type { ExperienceWithRelations } from "@/types";

type ExperienceFormData = {
  period: string;
  title: string;
  company: string;
  companyUrl: string;
  description: string;
  sortOrder: number;
  tags: string[];
  links: { label: string; url: string }[];
};

const EMPTY_FORM: ExperienceFormData = {
  period: "",
  title: "",
  company: "",
  companyUrl: "",
  description: "",
  sortOrder: 0,
  tags: [],
  links: [],
};

function ExperienceForm({
  initial,
  onSave,
  onCancel,
  isPending,
}: {
  initial: ExperienceFormData;
  onSave: (data: ExperienceFormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [data, setData] = useState(initial);

  function updateLink(i: number, field: "label" | "url", value: string) {
    setData((prev) => ({
      ...prev,
      links: prev.links.map((l, idx) =>
        idx === i ? { ...l, [field]: value } : l
      ),
    }));
  }

  return (
    <div className="border border-forest/20 bg-forest/3 p-5 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-ink/55">Period *</label>
          <input
            value={data.period}
            onChange={(e) => setData((p) => ({ ...p, period: e.target.value }))}
            className="w-full border border-ink/20 bg-card px-3 py-1.5 text-sm text-forest focus:border-forest focus:outline-none"
            placeholder="2023 — Present"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-ink/55">Title *</label>
          <input
            value={data.title}
            onChange={(e) => setData((p) => ({ ...p, title: e.target.value }))}
            className="w-full border border-ink/20 bg-card px-3 py-1.5 text-sm text-forest focus:border-forest focus:outline-none"
            placeholder="Senior Engineer"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-ink/55">Company *</label>
          <input
            value={data.company}
            onChange={(e) => setData((p) => ({ ...p, company: e.target.value }))}
            className="w-full border border-ink/20 bg-card px-3 py-1.5 text-sm text-forest focus:border-forest focus:outline-none"
            placeholder="Acme Corp"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-ink/55">Company URL</label>
          <input
            type="url"
            value={data.companyUrl}
            onChange={(e) => setData((p) => ({ ...p, companyUrl: e.target.value }))}
            className="w-full border border-ink/20 bg-card px-3 py-1.5 text-sm text-forest focus:border-forest focus:outline-none"
            placeholder="https://acmecorp.com"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-ink/55">Description (HTML)</label>
        <textarea
          value={data.description}
          onChange={(e) => setData((p) => ({ ...p, description: e.target.value }))}
          rows={3}
          className="w-full border border-ink/20 bg-card px-3 py-1.5 text-sm text-forest focus:border-forest focus:outline-none resize-y"
          placeholder="<p>Describe your role...</p>"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-ink/55">Tags</label>
        <TagInput
          value={data.tags}
          onChange={(tags) => setData((p) => ({ ...p, tags }))}
        />
      </div>

      {/* Links */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-ink/55">Links</label>
          <button
            type="button"
            onClick={() =>
              setData((p) => ({
                ...p,
                links: [...p.links, { label: "", url: "" }],
              }))
            }
            className="text-xs text-coral hover:text-coral/80"
          >
            + Add link
          </button>
        </div>
        {data.links.map((link, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={link.label}
              onChange={(e) => updateLink(i, "label", e.target.value)}
              className="w-32 border border-ink/20 bg-card px-2 py-1 text-sm text-forest focus:border-forest focus:outline-none"
              placeholder="Label"
            />
            <input
              type="url"
              value={link.url}
              onChange={(e) => updateLink(i, "url", e.target.value)}
              className="flex-1 border border-ink/20 bg-card px-2 py-1 text-sm text-forest focus:border-forest focus:outline-none"
              placeholder="https://..."
            />
            <button
              type="button"
              onClick={() =>
                setData((p) => ({
                  ...p,
                  links: p.links.filter((_, idx) => idx !== i),
                }))
              }
              className="text-ink/40 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => onSave(data)}
          disabled={!data.period || !data.title || !data.company || isPending}
          className="inline-flex items-center gap-1.5 bg-forest px-4 py-1.5 text-sm font-semibold text-white hover:bg-forest/80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="h-4 w-4" />
          {isPending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 border border-ink/20 px-4 py-1.5 text-sm text-ink/60 hover:text-forest"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function ExperienceManager({
  initialData,
}: {
  initialData: ExperienceWithRelations[];
}) {
  const [experiences, setExperiences] = useState(initialData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleCreate(data: ExperienceFormData) {
    startTransition(async () => {
      const result = await createExperience(data);
      if (result.success) {
        toast.success("Experience added!");
        setShowCreate(false);
        // Refresh data
        window.location.reload();
      } else {
        toast.error("Failed to create experience.");
      }
    });
  }

  function handleUpdate(id: string, data: ExperienceFormData) {
    startTransition(async () => {
      const result = await updateExperience(id, data);
      if (result.success) {
        toast.success("Experience updated!");
        setEditingId(null);
        window.location.reload();
      } else {
        toast.error("Failed to update experience.");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteExperience(id);
      if (result.success) {
        toast.success("Experience deleted.");
        setExperiences((prev) => prev.filter((e) => e.id !== id));
      } else {
        toast.error("Failed to delete.");
      }
    });
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-forest px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-forest/80"
        >
          <Plus className="h-4 w-4" />
          Add Experience
        </button>
      </div>

      {showCreate && (
        <ExperienceForm
          initial={{ ...EMPTY_FORM, sortOrder: experiences.length }}
          onSave={handleCreate}
          onCancel={() => setShowCreate(false)}
          isPending={isPending}
        />
      )}

      {experiences.length === 0 && !showCreate && (
        <div className="border border-ink/12 bg-card p-10 text-center text-ink/55">
          No experience entries yet. Click &ldquo;Add Experience&rdquo; to create one.
        </div>
      )}

      <div className="space-y-3">
        {experiences.map((exp) =>
          editingId === exp.id ? (
            <ExperienceForm
              key={exp.id}
              initial={{
                period: exp.period,
                title: exp.title,
                company: exp.company,
                companyUrl: exp.companyUrl,
                description: exp.description,
                sortOrder: exp.sortOrder,
                tags: exp.tags.map((t) => t.label),
                links: exp.links.map((l) => ({ label: l.label, url: l.url })),
              }}
              onSave={(data) => handleUpdate(exp.id, data)}
              onCancel={() => setEditingId(null)}
              isPending={isPending}
            />
          ) : (
            <div
              key={exp.id}
              className="border border-ink/12 bg-card p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-ink/45">
                    {exp.period}
                  </p>
                  <p className="mt-0.5 font-medium text-forest">
                    {exp.title}
                  </p>
                  <p className="text-sm text-ink/60">{exp.company}</p>
                  {exp.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {exp.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="bg-forest/8 px-2 py-0.5 text-xs text-forest ring-1 ring-inset ring-forest/18"
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => setEditingId(exp.id)}
                    className="p-1.5 text-ink/45 hover:bg-ink/7 hover:text-forest transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <ConfirmDialog
                    trigger={
                      <button
                        className="p-1.5 text-ink/45 hover:bg-red-50 hover:text-red-500 transition-colors"
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    }
                    title="Delete experience?"
                    description={`"${exp.title} at ${exp.company}" will be permanently deleted.`}
                    confirmLabel="Delete"
                    onConfirm={() => handleDelete(exp.id)}
                  />
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
