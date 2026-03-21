"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HardDrive, ShieldCheck } from "lucide-react";

interface StorageConsentDialogProps {
  open: boolean;
  onConsent: (granted: boolean) => void;
}

export function StorageConsentDialog({
  open,
  onConsent,
}: StorageConsentDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="sm:max-w-md gap-0 p-0 overflow-hidden">
        {/* Body */}
        <div className="px-6 pt-6 pb-5 space-y-5">
          <DialogHeader className="gap-3">
            <div className="flex items-center gap-4">
              <div className="size-11 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                <HardDrive className="size-5 text-primary" />
              </div>
              <DialogTitle className="text-base font-semibold">
                Save your invoice data locally?
              </DialogTitle>
            </div>

            <DialogDescription className="leading-relaxed pt-1">
              Your invoice details (addresses, payment info, and preferences)
              can be saved to your browser so the form is pre-filled next time
              you visit.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted px-4 py-3.5 text-sm text-muted-foreground leading-relaxed">
            <ShieldCheck className="size-5 shrink-0 mt-0.5 text-primary" />
            <span>
              Stored <strong className="text-foreground">only on this
              device</strong>. Nothing is sent to any server. You can clear
              it at any time.
            </span>
          </div>
        </div>

        {/* Footer — full-width border, no negative margin hacks */}
        <div className="flex justify-end gap-2 border-t border-border bg-muted/50 px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onConsent(false)}
            className="cursor-pointer px-6"
          >
            No thanks
          </Button>
          <Button
            onClick={() => onConsent(true)}
            className="cursor-pointer px-6"
          >
            <HardDrive className="size-4 mr-2" />
            Yes, save locally
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
