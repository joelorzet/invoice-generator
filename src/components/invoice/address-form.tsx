"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";
import type { Address } from "@/lib/invoice-types";

export function AddressForm({
  title,
  data,
  onChange,
}: {
  title: string;
  data: Address;
  onChange: (field: string, value: string) => void;
}) {
  const id = title.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Building2 className="size-4 text-primary" />
        {title}
      </h3>
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
            <Label htmlFor={`${id}-city`} className="text-xs text-muted-foreground">
              City
            </Label>
            <Input
              id={`${id}-city`}
              placeholder="City"
              value={data.city}
              onChange={(e) => onChange("city", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`${id}-state`} className="text-xs text-muted-foreground">
              State / Province
            </Label>
            <Input
              id={`${id}-state`}
              placeholder="State"
              value={data.state}
              onChange={(e) => onChange("state", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor={`${id}-country`} className="text-xs text-muted-foreground">
              Country
            </Label>
            <Input
              id={`${id}-country`}
              placeholder="Country"
              value={data.country}
              onChange={(e) => onChange("country", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`${id}-vat`} className="text-xs text-muted-foreground">
              VAT Number (optional)
            </Label>
            <Input
              id={`${id}-vat`}
              placeholder="VAT"
              value={data.vat || ""}
              onChange={(e) => onChange("vat", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
