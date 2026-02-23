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
      <AlertDialogContent className="bg-card border-ink/15 text-forest">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-forest">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-ink/60">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-ink/20 bg-card text-ink/60 hover:bg-ink/6">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-forest hover:bg-forest/80 text-white"
            }
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
