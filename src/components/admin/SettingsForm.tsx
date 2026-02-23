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
      <div className="border border-[rgba(58,58,56,0.12)] bg-white p-6 space-y-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[rgba(58,58,56,0.5)]">
          Site Settings
        </h2>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[rgba(58,58,56,0.75)]">
            Site Title
          </label>
          <input
            type="text"
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            className="w-full border border-[rgba(58,58,56,0.2)] bg-white px-3 py-2 text-sm text-[#1A3C2B] placeholder:text-[rgba(58,58,56,0.35)] focus:border-[#1A3C2B] focus:outline-none focus:ring-1 focus:ring-[#1A3C2B]"
            placeholder="Near the Singularity"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[rgba(58,58,56,0.75)]">
            Site Description
          </label>
          <textarea
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            rows={2}
            className="w-full border border-[rgba(58,58,56,0.2)] bg-white px-3 py-2 text-sm text-[#1A3C2B] placeholder:text-[rgba(58,58,56,0.35)] focus:border-[#1A3C2B] focus:outline-none focus:ring-1 focus:ring-[#1A3C2B] resize-none"
            placeholder="Frontend developer portfolio and blog"
          />
          <p className="text-xs text-[rgba(58,58,56,0.45)]">Used in meta description and Open Graph tags.</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[rgba(58,58,56,0.75)]">
            GA Tracking ID
          </label>
          <input
            type="text"
            value={gaTrackingId}
            onChange={(e) => setGaTrackingId(e.target.value)}
            className="w-full border border-[rgba(58,58,56,0.2)] bg-white px-3 py-2 text-sm text-[#1A3C2B] placeholder:text-[rgba(58,58,56,0.35)] focus:border-[#1A3C2B] focus:outline-none focus:ring-1 focus:ring-[#1A3C2B]"
            placeholder="G-XXXXXXXXXX"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[rgba(58,58,56,0.75)]">
            Footer Text
          </label>
          <textarea
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            rows={2}
            className="w-full border border-[rgba(58,58,56,0.2)] bg-white px-3 py-2 text-sm text-[#1A3C2B] placeholder:text-[rgba(58,58,56,0.35)] focus:border-[#1A3C2B] focus:outline-none focus:ring-1 focus:ring-[#1A3C2B] resize-none"
            placeholder="Loosely designed in Figma and coded in VS Code…"
          />
          <p className="text-xs text-[rgba(58,58,56,0.45)]">Leave blank to use the default footer text.</p>
        </div>

        <ImageUploader
          label="OG Image"
          value={ogImage}
          onChange={setOgImage}
          folder="og"
        />
        <p className="text-xs text-[rgba(58,58,56,0.45)] -mt-2">
          Recommended size: 1200 × 630 px. Used for social sharing previews.
        </p>

        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSettingsPending}
          className="bg-[#1A3C2B] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1D4531] disabled:opacity-50"
        >
          {isSettingsPending ? "Saving…" : "Save Settings"}
        </button>
      </div>

      {/* Change Password */}
      <div className="border border-[rgba(58,58,56,0.12)] bg-white p-6 space-y-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[rgba(58,58,56,0.5)]">
          Change Password
        </h2>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[rgba(58,58,56,0.75)]">
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full border border-[rgba(58,58,56,0.2)] bg-white px-3 py-2 text-sm text-[#1A3C2B] placeholder:text-[rgba(58,58,56,0.35)] focus:border-[#1A3C2B] focus:outline-none focus:ring-1 focus:ring-[#1A3C2B]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[rgba(58,58,56,0.75)]">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            className="w-full border border-[rgba(58,58,56,0.2)] bg-white px-3 py-2 text-sm text-[#1A3C2B] placeholder:text-[rgba(58,58,56,0.35)] focus:border-[#1A3C2B] focus:outline-none focus:ring-1 focus:ring-[#1A3C2B]"
          />
          <p className="text-xs text-[rgba(58,58,56,0.45)]">Minimum 8 characters.</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[rgba(58,58,56,0.75)]">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            className="w-full border border-[rgba(58,58,56,0.2)] bg-white px-3 py-2 text-sm text-[#1A3C2B] placeholder:text-[rgba(58,58,56,0.35)] focus:border-[#1A3C2B] focus:outline-none focus:ring-1 focus:ring-[#1A3C2B]"
          />
        </div>

        <button
          type="button"
          onClick={handleChangePassword}
          disabled={isPasswordPending || !currentPassword || !newPassword || !confirmPassword}
          className="border border-[rgba(58,58,56,0.2)] bg-white px-4 py-2 text-sm font-semibold text-[rgba(58,58,56,0.7)] transition-colors hover:border-[#1A3C2B] hover:text-[#1A3C2B] disabled:opacity-50"
        >
          {isPasswordPending ? "Updating…" : "Update Password"}
        </button>
      </div>
    </div>
  );
}
