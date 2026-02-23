"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ReactNode } from "react";

interface ConfirmDialogProps {
  trigger: ReactNode;
  title: string;
  description?: string;
  onConfirm: () => void;
  confirmLabel?: string;
  variant?: "destructive" | "default";
}

export function ConfirmDialog({
  trigger,
  title,
  description = "This action cannot be undone.",
  onConfirm,
  confirmLabel = "Confirm",
  variant = "destructive",
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="bg-white border-[rgba(58,58,56,0.15)] text-[#1A3C2B]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#1A3C2B]">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-[rgba(58,58,56,0.6)]">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-[rgba(58,58,56,0.2)] bg-white text-[rgba(58,58,56,0.6)] hover:bg-[rgba(58,58,56,0.06)]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-[#1A3C2B] hover:bg-[#1D4531] text-white"
            }
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
