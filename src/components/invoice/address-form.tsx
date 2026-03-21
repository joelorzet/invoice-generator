"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ChevronDown } from "lucide-react";
import type { Address } from "@/lib/invoice-types";
import type { SavedAddressProfile } from "@/lib/services";

function SavedAddressSelector({
  profiles,
  onSelect,
}: {
  profiles: SavedAddressProfile[];
  onSelect: (data: Address) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (profiles.length === 0) return null;

  const selectedProfile = selected ? profiles.find((p) => p.id === selected) : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-xs h-8 cursor-pointer transition-colors ${selectedProfile ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
      >
        <span className="flex items-center gap-1.5 truncate">
          {selectedProfile ? (
            <>
              <Building2 className="size-3 shrink-0" />
              {selectedProfile.label}
            </>
          ) : (
            "Load from saved..."
          )}
        </span>
        <ChevronDown className="size-3.5 shrink-0" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-md overflow-hidden">
          {profiles.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onSelect(structuredClone(p.data));
                setSelected(p.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-popover-foreground hover:bg-accent cursor-pointer"
            >
              <Building2 className="size-3" />
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AddressForm({
  title,
  data,
  onChange,
  onLoadSaved,
  savedProfiles,
}: {
  title: string;
  data: Address;
  onChange: (field: string, value: string) => void;
  onLoadSaved?: (data: Address) => void;
  savedProfiles?: SavedAddressProfile[];
}) {
  const id = title.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Building2 className="size-5 text-primary" />
        {title}
      </h3>
      {savedProfiles && savedProfiles.length > 0 && onLoadSaved && (
        <SavedAddressSelector profiles={savedProfiles} onSelect={onLoadSaved} />
      )}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <Label htmlFor={`${id}-name`} className="text-xs text-muted-foreground">
            Name / Company
          </Label>
          <Input
            id={`${id}-name`}
            placeholder="Company name"
            value={data.name}
            onChange={(e) => onChange("name", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`${id}-address`} className="text-xs text-muted-foreground">
            Address
          </Label>
          <Input
            id={`${id}-address`}
            placeholder="Street address"
            value={data.address}
            onChange={(e) => onChange("address", e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor={`${id}-city`} className="text-xs text-muted-foreground">City</Label>
            <Input id={`${id}-city`} placeholder="City" value={data.city} onChange={(e) => onChange("city", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor={`${id}-state`} className="text-xs text-muted-foreground">State</Label>
            <Input id={`${id}-state`} placeholder="State" value={data.state} onChange={(e) => onChange("state", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor={`${id}-zip`} className="text-xs text-muted-foreground">ZIP Code</Label>
            <Input id={`${id}-zip`} placeholder="ZIP" value={data.zip || ""} onChange={(e) => onChange("zip", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor={`${id}-country`} className="text-xs text-muted-foreground">Country</Label>
            <Input id={`${id}-country`} placeholder="Country" value={data.country} onChange={(e) => onChange("country", e.target.value)} className="mt-1" />
          </div>
        </div>
        <div>
          <Label htmlFor={`${id}-vat`} className="text-xs text-muted-foreground">VAT (optional)</Label>
          <Input id={`${id}-vat`} placeholder="VAT" value={data.vat || ""} onChange={(e) => onChange("vat", e.target.value)} className="mt-1" />
        </div>
      </div>
    </div>
  );
}
