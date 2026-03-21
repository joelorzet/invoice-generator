"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  icon: LucideIcon;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  icon: Icon,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  variant = "destructive",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent showCloseButton={false} className="sm:max-w-md gap-0 p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-5 space-y-4">
          <DialogHeader className="gap-3">
            <div className="flex items-center gap-4">
              <div className={`size-11 rounded-lg flex items-center justify-center shrink-0 ${variant === "destructive" ? "bg-destructive/15" : "bg-primary/15"}`}>
                <Icon className={`size-5 ${variant === "destructive" ? "text-destructive" : "text-primary"}`} />
              </div>
              <DialogTitle className="text-base font-semibold">
                {title}
              </DialogTitle>
            </div>
            <DialogDescription className="leading-relaxed pt-1">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="flex justify-end gap-2 border-t border-border bg-muted/50 px-6 py-4">
          <Button variant="outline" onClick={onCancel} className="cursor-pointer px-6">
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            className={`cursor-pointer px-6 ${
              variant === "destructive"
                ? "bg-destructive text-white hover:bg-destructive/90"
                : ""
            }`}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
