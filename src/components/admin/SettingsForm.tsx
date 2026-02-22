"use client";

import { useState, useTransition } from "react";
import { updateSettings, changePassword } from "@/actions/settings";
import { ImageUploader } from "./ImageUploader";
import toast from "react-hot-toast";
import type { SiteSettings } from "@/generated/prisma/client";

interface SettingsFormProps {
  initialData: SiteSettings | null;
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const [siteTitle, setSiteTitle] = useState(initialData?.siteTitle ?? "");
  const [siteDescription, setSiteDescription] = useState(
    initialData?.siteDescription ?? ""
  );
  const [ogImage, setOgImage] = useState(initialData?.ogImage ?? "");
  const [gaTrackingId, setGaTrackingId] = useState(
    initialData?.gaTrackingId ?? ""
  );
  const [footerText, setFooterText] = useState(initialData?.footerText ?? "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSettingsPending, startSettingsTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();

  function handleSaveSettings() {
    startSettingsTransition(async () => {
      const result = await updateSettings({
        siteTitle,
        siteDescription,
        ogImage,
        gaTrackingId,
        footerText,
      });
      if (result.success) {
        toast.success("Settings saved!");
      } else {
        toast.error("Failed to save settings.");
      }
    });
  }

  function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    startPasswordTransition(async () => {
      const result = await changePassword({ currentPassword, newPassword });
      if (result.success) {
        toast.success("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const err =
          typeof result.error === "string" ? result.error : "Failed to update password.";
        toast.error(err);
      }
    });
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Site Settings */}
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
          Site Settings
        </h2>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Site Title
          </label>
          <input
            type="text"
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="Near the Singularity"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Site Description
          </label>
          <textarea
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
            placeholder="Frontend developer portfolio and blog"
          />
          <p className="text-xs text-slate-500">Used in meta description and Open Graph tags.</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            GA Tracking ID
          </label>
          <input
            type="text"
            value={gaTrackingId}
            onChange={(e) => setGaTrackingId(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="G-XXXXXXXXXX"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Footer Text
          </label>
          <textarea
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
            placeholder="Loosely designed in Figma and coded in VS Code…"
          />
          <p className="text-xs text-slate-500">Leave blank to use the default footer text.</p>
        </div>

        <ImageUploader
          label="OG Image"
          value={ogImage}
          onChange={setOgImage}
          folder="og"
        />
        <p className="text-xs text-slate-500 -mt-2">
          Recommended size: 1200 × 630 px. Used for social sharing previews.
        </p>

        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSettingsPending}
          className="rounded-md bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-teal-400 disabled:opacity-50"
        >
          {isSettingsPending ? "Saving…" : "Save Settings"}
        </button>
      </div>

      {/* Change Password */}
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
          Change Password
        </h2>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
          <p className="text-xs text-slate-500">Minimum 8 characters.</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <button
          type="button"
          onClick={handleChangePassword}
          disabled={isPasswordPending || !currentPassword || !newPassword || !confirmPassword}
          className="rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-600 disabled:opacity-50"
        >
          {isPasswordPending ? "Updating…" : "Update Password"}
        </button>
      </div>
    </div>
  );
}
