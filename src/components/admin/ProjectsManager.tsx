"use client";

import { useState, useTransition } from "react";
import {
  createProject,
  updateProject,
  deleteProject,
  toggleProjectFeatured,
  toggleProjectArchived,
} from "@/actions/projects";
import { TagInput } from "./TagInput";
import { ImageUploader } from "./ImageUploader";
import { ConfirmDialog } from "./ConfirmDialog";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, Star, Archive, X as XIcon, Check } from "lucide-react";
import type { ProjectWithTags } from "@/types";

type ProjectFormData = {
  title: string;
  description: string;
  url: string;
  githubUrl: string;
  imageUrl: string;
  stats: string;
  featured: boolean;
  archived: boolean;
  sortOrder: number;
  tags: string[];
};

const EMPTY_FORM: ProjectFormData = {
  title: "",
  description: "",
  url: "",
  githubUrl: "",
  imageUrl: "",
  stats: "",
  featured: false,
  archived: false,
  sortOrder: 0,
  tags: [],
};

function ProjectForm({
  initial,
  onSave,
  onCancel,
  isPending,
}: {
  initial: ProjectFormData;
  onSave: (data: ProjectFormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [data, setData] = useState(initial);

  return (
    <div className="rounded-lg border border-teal-500/30 bg-slate-800/50 p-5 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400">Title *</label>
          <input
            value={data.title}
            onChange={(e) => setData((p) => ({ ...p, title: e.target.value }))}
            className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-teal-500 focus:outline-none"
            placeholder="Project name"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400">Stats</label>
          <input
            value={data.stats}
            onChange={(e) => setData((p) => ({ ...p, stats: e.target.value }))}
            className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-teal-500 focus:outline-none"
            placeholder="4.2k monthly users"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400">Live URL</label>
          <input
            type="url"
            value={data.url}
            onChange={(e) => setData((p) => ({ ...p, url: e.target.value }))}
            className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-teal-500 focus:outline-none"
            placeholder="https://..."
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400">GitHub URL</label>
          <input
            type="url"
            value={data.githubUrl}
            onChange={(e) => setData((p) => ({ ...p, githubUrl: e.target.value }))}
            className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-teal-500 focus:outline-none"
            placeholder="https://github.com/..."
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-400">Description *</label>
        <textarea
          value={data.description}
          onChange={(e) => setData((p) => ({ ...p, description: e.target.value }))}
          rows={3}
          className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-teal-500 focus:outline-none resize-y"
          placeholder="Describe the project..."
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-400">Tags</label>
        <TagInput value={data.tags} onChange={(tags) => setData((p) => ({ ...p, tags }))} />
      </div>

      <ImageUploader
        label="Screenshot"
        value={data.imageUrl}
        onChange={(url) => setData((p) => ({ ...p, imageUrl: url }))}
        folder="projects"
      />

      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={data.featured}
            onChange={(e) => setData((p) => ({ ...p, featured: e.target.checked }))}
            className="rounded border-slate-600 bg-slate-800 text-teal-500"
          />
          <span className="text-sm text-slate-300">Featured</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={data.archived}
            onChange={(e) => setData((p) => ({ ...p, archived: e.target.checked }))}
            className="rounded border-slate-600 bg-slate-800 text-teal-500"
          />
          <span className="text-sm text-slate-300">Archived</span>
        </label>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => onSave(data)}
          disabled={!data.title || !data.description || isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-teal-500 px-4 py-1.5 text-sm font-semibold text-slate-900 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="h-4 w-4" />
          {isPending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-4 py-1.5 text-sm text-slate-400 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function ProjectsManager({ initialData }: { initialData: ProjectWithTags[] }) {
  const [projects, setProjects] = useState(initialData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleCreate(data: ProjectFormData) {
    startTransition(async () => {
      const result = await createProject(data);
      if (result.success) {
        toast.success("Project created!");
        setShowCreate(false);
        window.location.reload();
      } else {
        toast.error("Failed to create project.");
      }
    });
  }

  function handleUpdate(id: string, data: ProjectFormData) {
    startTransition(async () => {
      const result = await updateProject(id, data);
      if (result.success) {
        toast.success("Project updated!");
        setEditingId(null);
        window.location.reload();
      } else {
        toast.error("Failed to update project.");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteProject(id);
      if (result.success) {
        toast.success("Project deleted.");
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } else {
        toast.error("Failed to delete.");
      }
    });
  }

  function handleToggleFeatured(id: string, featured: boolean) {
    startTransition(async () => {
      await toggleProjectFeatured(id, !featured);
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, featured: !featured } : p))
      );
    });
  }

  function handleToggleArchived(id: string, archived: boolean) {
    startTransition(async () => {
      await toggleProjectArchived(id, !archived);
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, archived: !archived } : p))
      );
    });
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-md bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-teal-400"
        >
          <Plus className="h-4 w-4" />
          Add Project
        </button>
      </div>

      {showCreate && (
        <ProjectForm
          initial={{ ...EMPTY_FORM, sortOrder: projects.length }}
          onSave={handleCreate}
          onCancel={() => setShowCreate(false)}
          isPending={isPending}
        />
      )}

      {projects.length === 0 && !showCreate && (
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
          No projects yet.
        </div>
      )}

      <div className="space-y-3">
        {projects.map((project) =>
          editingId === project.id ? (
            <ProjectForm
              key={project.id}
              initial={{
                title: project.title,
                description: project.description,
                url: project.url,
                githubUrl: project.githubUrl,
                imageUrl: project.imageUrl,
                stats: project.stats,
                featured: project.featured,
                archived: project.archived,
                sortOrder: project.sortOrder,
                tags: project.tags.map((t) => t.label),
              }}
              onSave={(data) => handleUpdate(project.id, data)}
              onCancel={() => setEditingId(null)}
              isPending={isPending}
            />
          ) : (
            <div
              key={project.id}
              className="rounded-lg border border-slate-800 bg-slate-900 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white truncate">{project.title}</p>
                    {project.featured && (
                      <span className="shrink-0 rounded-full bg-yellow-400/10 px-2 py-0.5 text-xs text-yellow-400">
                        Featured
                      </span>
                    )}
                    {project.archived && (
                      <span className="shrink-0 rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400">
                        Archived
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-400 line-clamp-1">
                    {project.description}
                  </p>
                  {project.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {project.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded-full bg-teal-400/10 px-2 py-0.5 text-xs text-teal-300 ring-1 ring-inset ring-teal-400/20"
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => handleToggleFeatured(project.id, project.featured)}
                    title={project.featured ? "Unfeature" : "Feature"}
                    className={`rounded p-1.5 transition-colors ${
                      project.featured
                        ? "text-yellow-400 hover:bg-yellow-400/10"
                        : "text-slate-500 hover:bg-slate-700 hover:text-slate-300"
                    }`}
                    disabled={isPending}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggleArchived(project.id, project.archived)}
                    title={project.archived ? "Unarchive" : "Archive"}
                    className={`rounded p-1.5 transition-colors ${
                      project.archived
                        ? "text-slate-300 bg-slate-700"
                        : "text-slate-500 hover:bg-slate-700 hover:text-slate-300"
                    }`}
                    disabled={isPending}
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(project.id)}
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <ConfirmDialog
                    trigger={
                      <button className="rounded p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    }
                    title="Delete project?"
                    description={`"${project.title}" will be permanently deleted.`}
                    confirmLabel="Delete"
                    onConfirm={() => handleDelete(project.id)}
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
