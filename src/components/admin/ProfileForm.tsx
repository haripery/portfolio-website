"use client";

import { useState, useTransition } from "react";
import { updateProfile, updateSocials } from "@/actions/profile";
import { ImageUploader } from "./ImageUploader";
import toast from "react-hot-toast";
import { Plus, X } from "lucide-react";
import type { ProfileWithSocials } from "@/types";

const PLATFORM_OPTIONS = [
  "github",
  "linkedin",
  "twitter",
  "email",
  "codepen",
  "instagram",
  "youtube",
  "other",
];

export function ProfileForm({
  initialData,
}: {
  initialData: ProfileWithSocials | null;
}) {
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(initialData?.name ?? "");
  const [role, setRole] = useState(initialData?.role ?? "");
  const [tagline, setTagline] = useState(initialData?.tagline ?? "");
  const [bio, setBio] = useState(initialData?.bio ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [photoUrl, setPhotoUrl] = useState(initialData?.photoUrl ?? "");
  const [resumeUrl, setResumeUrl] = useState(initialData?.resumeUrl ?? "");
  const [socials, setSocials] = useState(
    initialData?.socials ?? []
  );

  function addSocial() {
    setSocials((prev) => [
      ...prev,
      { id: `temp-${Date.now()}`, platform: "github", url: "", label: "", sortOrder: prev.length, profileId: "main" },
    ]);
  }

  function removeSocial(id: string) {
    setSocials((prev) => prev.filter((s) => s.id !== id));
  }

  function updateSocialField(
    id: string,
    field: "platform" | "url" | "label",
    value: string
  ) {
    setSocials((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      const [profileResult, socialsResult] = await Promise.all([
        updateProfile({ name, role, tagline, bio, email, photoUrl, resumeUrl }),
        updateSocials(
          socials
            .filter((s) => s.url)
            .map((s, i) => ({
              platform: s.platform,
              url: s.url,
              label: s.label || s.platform,
              sortOrder: i,
            }))
        ),
      ]);

      if (profileResult.success && socialsResult.success) {
        toast.success("Profile updated!");
      } else {
        toast.error("Failed to save. Check all fields.");
        console.error(profileResult, socialsResult);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Basic info */}
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
          Basic Info
        </h2>

        <ImageUploader
          label="Profile Photo"
          value={photoUrl}
          onChange={setPhotoUrl}
          folder="profile"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="Your Name"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              Role / Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="Software Engineer"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Tagline
          </label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="Short tagline shown on the homepage"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="hello@nearthesingularity.com"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Bio{" "}
            <span className="text-xs font-normal text-slate-500">
              (HTML supported)
            </span>
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={6}
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-y"
            placeholder="<p>Write your bio here. HTML is supported.</p>"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Resume URL
          </label>
          <input
            type="url"
            value={resumeUrl}
            onChange={(e) => setResumeUrl(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Social links */}
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            Social Links
          </h2>
          <button
            type="button"
            onClick={addSocial}
            className="inline-flex items-center gap-1.5 text-sm text-teal-400 hover:text-teal-300"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        {socials.length === 0 && (
          <p className="text-sm text-slate-500">
            No social links yet. Click &ldquo;Add&rdquo; to add one.
          </p>
        )}

        <div className="space-y-3">
          {socials.map((social) => (
            <div key={social.id} className="flex items-center gap-2">
              <select
                value={social.platform}
                onChange={(e) =>
                  updateSocialField(social.id, "platform", e.target.value)
                }
                className="rounded-md border border-slate-700 bg-slate-800 px-2 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
              >
                {PLATFORM_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={social.url}
                onChange={(e) =>
                  updateSocialField(social.id, "url", e.target.value)
                }
                className="flex-1 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none"
                placeholder="https://..."
              />
              <input
                type="text"
                value={social.label}
                onChange={(e) =>
                  updateSocialField(social.id, "label", e.target.value)
                }
                className="w-28 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none"
                placeholder="Label"
              />
              <button
                type="button"
                onClick={() => removeSocial(social.id)}
                className="text-slate-500 hover:text-red-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-teal-500 px-6 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
