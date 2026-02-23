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
    <div className="border border-[rgba(26,60,43,0.2)] bg-[rgba(26,60,43,0.03)] p-5 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[rgba(58,58,56,0.55)]">Period *</label>
          <input
            value={data.period}
            onChange={(e) => setData((p) => ({ ...p, period: e.target.value }))}
            className="w-full border border-[rgba(58,58,56,0.2)] bg-white px-3 py-1.5 text-sm text-[#1A3C2B] focus:border-[#1A3C2B] focus:outline-none"
            placeholder="2023 — Present"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[rgba(58,58,56,0.55)]">Title *</label>
          <input
            value={data.title}
            onChange={(e) => setData((p) => ({ ...p, title: e.target.value }))}
            className="w-full border border-[rgba(58,58,56,0.2)] bg-white px-3 py-1.5 text-sm text-[#1A3C2B] focus:border-[#1A3C2B] focus:outline-none"
            placeholder="Senior Engineer"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[rgba(58,58,56,0.55)]">Company *</label>
          <input
            value={data.company}
            onChange={(e) => setData((p) => ({ ...p, company: e.target.value }))}
            className="w-full border border-[rgba(58,58,56,0.2)] bg-white px-3 py-1.5 text-sm text-[#1A3C2B] focus:border-[#1A3C2B] focus:outline-none"
            placeholder="Acme Corp"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[rgba(58,58,56,0.55)]">Company URL</label>
          <input
            type="url"
            value={data.companyUrl}
            onChange={(e) => setData((p) => ({ ...p, companyUrl: e.target.value }))}
            className="w-full border border-[rgba(58,58,56,0.2)] bg-white px-3 py-1.5 text-sm text-[#1A3C2B] focus:border-[#1A3C2B] focus:outline-none"
            placeholder="https://acmecorp.com"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-[rgba(58,58,56,0.55)]">Description (HTML)</label>
        <textarea
          value={data.description}
          onChange={(e) => setData((p) => ({ ...p, description: e.target.value }))}
          rows={3}
          className="w-full border border-[rgba(58,58,56,0.2)] bg-white px-3 py-1.5 text-sm text-[#1A3C2B] focus:border-[#1A3C2B] focus:outline-none resize-y"
          placeholder="<p>Describe your role...</p>"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-[rgba(58,58,56,0.55)]">Tags</label>
        <TagInput
          value={data.tags}
          onChange={(tags) => setData((p) => ({ ...p, tags }))}
        />
      </div>

      {/* Links */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[rgba(58,58,56,0.55)]">Links</label>
          <button
            type="button"
            onClick={() =>
              setData((p) => ({
                ...p,
                links: [...p.links, { label: "", url: "" }],
              }))
            }
            className="text-xs text-[#FF8C69] hover:text-[#e87d5c]"
          >
            + Add link
          </button>
        </div>
        {data.links.map((link, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={link.label}
              onChange={(e) => updateLink(i, "label", e.target.value)}
              className="w-32 border border-[rgba(58,58,56,0.2)] bg-white px-2 py-1 text-sm text-[#1A3C2B] focus:border-[#1A3C2B] focus:outline-none"
              placeholder="Label"
            />
            <input
              type="url"
              value={link.url}
              onChange={(e) => updateLink(i, "url", e.target.value)}
              className="flex-1 border border-[rgba(58,58,56,0.2)] bg-white px-2 py-1 text-sm text-[#1A3C2B] focus:border-[#1A3C2B] focus:outline-none"
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
              className="text-[rgba(58,58,56,0.4)] hover:text-red-500"
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
          className="inline-flex items-center gap-1.5 bg-[#1A3C2B] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#1D4531] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="h-4 w-4" />
          {isPending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 border border-[rgba(58,58,56,0.2)] px-4 py-1.5 text-sm text-[rgba(58,58,56,0.6)] hover:text-[#1A3C2B]"
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
          className="inline-flex items-center gap-2 bg-[#1A3C2B] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1D4531]"
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
        <div className="border border-[rgba(58,58,56,0.12)] bg-white p-10 text-center text-[rgba(58,58,56,0.55)]">
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
              className="border border-[rgba(58,58,56,0.12)] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[rgba(58,58,56,0.45)]">
                    {exp.period}
                  </p>
                  <p className="mt-0.5 font-medium text-[#1A3C2B]">
                    {exp.title}
                  </p>
                  <p className="text-sm text-[rgba(58,58,56,0.6)]">{exp.company}</p>
                  {exp.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {exp.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="bg-[rgba(26,60,43,0.08)] px-2 py-0.5 text-xs text-[#1A3C2B] ring-1 ring-inset ring-[rgba(26,60,43,0.18)]"
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
                    className="p-1.5 text-[rgba(58,58,56,0.45)] hover:bg-[rgba(58,58,56,0.07)] hover:text-[#1A3C2B] transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <ConfirmDialog
                    trigger={
                      <button
                        className="p-1.5 text-[rgba(58,58,56,0.45)] hover:bg-red-50 hover:text-red-500 transition-colors"
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
