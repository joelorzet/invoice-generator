"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Plus, Trash2, Save, Pencil, X } from "lucide-react";
import type { Address } from "@/lib/invoice-types";
import type { SavedAddressProfile, AddressProfileType } from "@/lib/services";
import { getInvoiceService } from "@/lib/services";

function Field({
  label,
  id,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1" />
    </div>
  );
}

function AddressEditForm({
  data,
  onChange,
  prefix,
}: {
  data: Address;
  onChange: (field: string, value: string) => void;
  prefix: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name / Company" id={`${prefix}-name`} value={data.name} onChange={(v) => onChange("name", v)} placeholder="Company name" />
        <Field label="Country" id={`${prefix}-country`} value={data.country} onChange={(v) => onChange("country", v)} placeholder="Country" />
      </div>
      <Field label="Address" id={`${prefix}-address`} value={data.address} onChange={(v) => onChange("address", v)} placeholder="Street address" />
      <div className="grid grid-cols-3 gap-3">
        <Field label="City" id={`${prefix}-city`} value={data.city} onChange={(v) => onChange("city", v)} placeholder="City" />
        <Field label="State / Province" id={`${prefix}-state`} value={data.state} onChange={(v) => onChange("state", v)} placeholder="State" />
        <Field label="ZIP / Postal Code" id={`${prefix}-zip`} value={data.zip || ""} onChange={(v) => onChange("zip", v)} placeholder="ZIP" />
      </div>
      <Field label="VAT Number (optional)" id={`${prefix}-vat`} value={data.vat || ""} onChange={(v) => onChange("vat", v)} placeholder="VAT" />
    </div>
  );
}

interface SavedAddressProfilesProps {
  refreshKey: number;
}

export function SavedAddressProfiles({ refreshKey }: SavedAddressProfilesProps) {
  const svc = useMemo(
    () => (typeof window !== "undefined" ? getInvoiceService() : null),
    []
  );
  const [profiles, setProfiles] = useState<SavedAddressProfile[]>([]);
  const [adding, setAdding] = useState<AddressProfileType | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editData, setEditData] = useState<Address | null>(null);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);

  const refresh = useCallback(async () => {
    if (!svc) return;
    const list = await svc.getAddressProfiles();
    setProfiles(list);
  }, [svc]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!svc) return;
      const list = await svc.getAddressProfiles();
      if (!cancelled) setProfiles(list);
    })();
    return () => { cancelled = true; };
  }, [svc, refreshKey, adding]);

  const handleSave = useCallback(async () => {
    if (!svc || !editData || !editLabel.trim() || !adding) return;
    await svc.saveAddressProfile(editLabel.trim(), adding, editData, editingId);
    setAdding(null);
    setEditData(null);
    setEditLabel("");
    setEditingId(undefined);
    await refresh();
  }, [svc, editData, editLabel, editingId, adding, refresh]);

  const handleDelete = useCallback(async (id: string) => {
    if (!svc) return;
    await svc.deleteAddressProfile(id);
    await refresh();
  }, [svc, refresh]);

  const handleEdit = useCallback((profile: SavedAddressProfile) => {
    setAdding(profile.type);
    setEditLabel(profile.label);
    setEditData(structuredClone(profile.data));
    setEditingId(profile.id);
  }, []);

  const handleCancel = useCallback(() => {
    setAdding(null);
    setEditData(null);
    setEditLabel("");
    setEditingId(undefined);
  }, []);

  const startAdd = useCallback((type: AddressProfileType) => {
    setAdding(type);
    setEditingId(undefined);
    setEditLabel("");
    setEditData({ name: "", address: "", city: "", state: "", country: "", vat: "" });
  }, []);

  const updateData = useCallback((field: string, value: string) => {
    setEditData((prev) => prev ? { ...prev, [field]: value } : prev);
  }, []);

  const fromProfiles = profiles.filter((p) => p.type === "from");
  const clientProfiles = profiles.filter((p) => p.type === "client");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Saved Address Profiles</h3>
        {!adding && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => startAdd("from")} className="cursor-pointer text-xs">
              <Building2 className="size-3.5 mr-1" />
              Add Sender
            </Button>
            <Button variant="outline" size="sm" onClick={() => startAdd("client")} className="cursor-pointer text-xs">
              <Plus className="size-3.5 mr-1" />
              Add Client
            </Button>
          </div>
        )}
      </div>

      {/* Saved profiles list */}
      {fromProfiles.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium">Sender Profiles</p>
          {fromProfiles.map((p) => (
            <ProfileRow key={p.id} profile={p} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {clientProfiles.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium">Client Profiles</p>
          {clientProfiles.map((p) => (
            <ProfileRow key={p.id} profile={p} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Add/Edit form */}
      {adding && editData && (
        <div className="rounded-md border border-border bg-muted/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              {editingId ? "Edit" : "New"} {adding === "from" ? "Sender" : "Client"} Profile
            </h4>
            <Button variant="ghost" size="icon-xs" onClick={handleCancel} className="cursor-pointer">
              <X className="size-3.5" />
            </Button>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Label</Label>
            <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} placeholder="e.g. My Company, Acme Corp" className="mt-1" />
          </div>

          <AddressEditForm data={editData} onChange={updateData} prefix={`edit-${adding}`} />

          <Button size="sm" onClick={handleSave} disabled={!editLabel.trim()} className="cursor-pointer">
            <Save className="size-3.5 mr-1" />
            {editingId ? "Update" : "Save"} Profile
          </Button>
        </div>
      )}

      {profiles.length === 0 && !adding && (
        <p className="text-xs text-muted-foreground">No saved address profiles yet. Add sender or client profiles to quickly prefill addresses on new invoices.</p>
      )}
    </div>
  );
}

function ProfileRow({
  profile,
  onEdit,
  onDelete,
}: {
  profile: SavedAddressProfile;
  onEdit: (p: SavedAddressProfile) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <Building2 className="size-5 text-primary shrink-0" />
        <span className="font-medium truncate">{profile.label}</span>
        {profile.data.country && (
          <span className="text-xs text-muted-foreground">{profile.data.country}</span>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon-xs" onClick={() => onEdit(profile)} className="cursor-pointer text-foreground hover:text-primary" aria-label="Edit">
          <Pencil className="size-3" />
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={() => onDelete(profile.id)} className="cursor-pointer text-foreground hover:text-destructive" aria-label="Delete">
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  );
}
