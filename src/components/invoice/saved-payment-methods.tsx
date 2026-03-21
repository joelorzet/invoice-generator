"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Wallet, Plus, Trash2, Save, Pencil, X } from "lucide-react";
import type { PaymentDetail, BankPayment, CryptoPayment } from "@/lib/invoice-types";
import type { SavedPaymentMethod } from "@/lib/services";
import { getInvoiceService } from "@/lib/services";
import { getBankFields } from "@/components/invoice/payment-form";

const CURRENCIES = [
  "USD", "EUR", "GBP", "ARS", "BRL", "CAD", "AUD", "JPY", "CHF", "MXN",
];

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1"
      />
    </div>
  );
}

function getMemoLabel(network: string): string {
  const n = network.toLowerCase().trim();
  if (n.includes("xrp") || n.includes("ripple")) return "Destination Tag";
  if (n.includes("ton")) return "Comment";
  if (n.includes("nem") || n.includes("xem")) return "Message";
  if (
    n.includes("stellar") || n.includes("xlm") ||
    n.includes("eos") ||
    n.includes("cosmos") || n.includes("atom") ||
    n.includes("bnb") || n.includes("binance") ||
    n.includes("hedera") || n.includes("hbar")
  ) return "Memo";
  return "Memo / Tag";
}

interface SavedPaymentMethodsProps {
  refreshKey: number;
  onUse: (payment: PaymentDetail) => void;
}

export function SavedPaymentMethods({ refreshKey, onUse }: SavedPaymentMethodsProps) {
  const svc = useMemo(
    () => (typeof window !== "undefined" ? getInvoiceService() : null),
    []
  );
  const [methods, setMethods] = useState<SavedPaymentMethod[]>([]);
  const [adding, setAdding] = useState<"bank" | "crypto" | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editData, setEditData] = useState<PaymentDetail | null>(null);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!svc) return;
      const list = await svc.getAllPaymentMethods();
      if (!cancelled) setMethods(list);
    })();
    return () => { cancelled = true; };
  }, [svc, refreshKey, adding]);

  const handleSave = useCallback(async () => {
    if (!svc || !editData || !editLabel.trim()) return;
    await svc.savePaymentMethod(editLabel.trim(), editData, editingId);
    setAdding(null);
    setEditData(null);
    setEditLabel("");
    setEditingId(undefined);
    const list = await svc.getAllPaymentMethods();
    setMethods(list);
  }, [svc, editData, editLabel, editingId]);

  const handleDelete = useCallback(async (id: string) => {
    if (!svc) return;
    await svc.deletePaymentMethod(id);
    const list = await svc.getAllPaymentMethods();
    setMethods(list);
  }, [svc]);

  const handleEdit = useCallback((method: SavedPaymentMethod) => {
    setAdding(method.type);
    setEditLabel(method.label);
    setEditData(structuredClone(method.data));
    setEditingId(method.id);
  }, []);

  const handleCancel = useCallback(() => {
    setAdding(null);
    setEditData(null);
    setEditLabel("");
    setEditingId(undefined);
  }, []);

  const startAdd = useCallback((type: "bank" | "crypto") => {
    setAdding(type);
    setEditingId(undefined);
    setEditLabel("");
    if (type === "bank") {
      setEditData({
        type: "bank",
        account_currency: "USD",
        account_holder: "",
        bank_name: "",
        account_number: "",
        routing_number: "",
        account_type: "",
        bank_address: "",
        swift: "",
        iban: "",
      } as BankPayment);
    } else {
      setEditData({
        type: "crypto",
        network: "",
        address: "",
        currency: "USDT",
      } as CryptoPayment);
    }
  }, []);

  const updateData = useCallback((field: string, value: string) => {
    setEditData((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: value } as PaymentDetail;

      if (field === "account_currency" && updated.type === "bank") {
        const visible = getBankFields(value);
        const bank = updated as BankPayment;
        if (!visible.routing_number) bank.routing_number = "";
        if (!visible.account_number) bank.account_number = "";
        if (!visible.account_type) bank.account_type = "";
        if (!visible.swift) bank.swift = "";
        if (!visible.iban) bank.iban = "";
      }

      return updated;
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Saved Payment Methods</h3>
        {!adding && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => startAdd("bank")} className="cursor-pointer text-xs">
              <CreditCard className="size-3.5 mr-1" />
              Add Bank
            </Button>
            <Button variant="outline" size="sm" onClick={() => startAdd("crypto")} className="cursor-pointer text-xs">
              <Wallet className="size-3.5 mr-1" />
              Add Crypto
            </Button>
          </div>
        )}
      </div>

      {/* Saved methods list */}
      {methods.length > 0 && (
        <div className="space-y-2">
          {methods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                {method.type === "bank" ? (
                  <CreditCard className="size-5 text-primary shrink-0" />
                ) : (
                  <Wallet className="size-5 text-primary shrink-0" />
                )}
                <span className="font-medium truncate">{method.label}</span>
                <span className="text-xs text-muted-foreground">
                  {method.type === "bank"
                    ? (method.data as BankPayment).account_currency
                    : (method.data as CryptoPayment).network}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUse(structuredClone(method.data))}
                  className="cursor-pointer text-xs h-7"
                >
                  <Plus className="size-3 mr-1" />
                  Use
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleEdit(method)}
                  className="cursor-pointer text-muted-foreground hover:text-primary"
                  aria-label="Edit"
                >
                  <Pencil className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleDelete(method.id)}
                  className="cursor-pointer text-muted-foreground hover:text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit form */}
      {adding && editData && (
        <div className="rounded-md border border-border bg-muted/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              {adding === "bank" ? (
                <><CreditCard className="size-5 text-primary" /> {editingId ? "Edit" : "New"} Bank Account</>
              ) : (
                <><Wallet className="size-5 text-primary" /> {editingId ? "Edit" : "New"} Crypto Wallet</>
              )}
            </h4>
            <Button variant="ghost" size="icon-xs" onClick={handleCancel} className="cursor-pointer">
              <X className="size-3.5" />
            </Button>
          </div>

          <Field label="Label" value={editLabel} onChange={setEditLabel} placeholder="e.g. Main USD Account, ETH Wallet" />

          {editData.type === "bank" ? (
            (() => {
              const bank = editData as BankPayment;
              const f = getBankFields(bank.account_currency);
              return (
                <>
                  <div>
                    <Label className="text-xs text-muted-foreground">Account Currency</Label>
                    <Select value={bank.account_currency} onValueChange={(v) => updateData("account_currency", v ?? "USD")}>
                      <SelectTrigger className="mt-1 cursor-pointer"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((c) => (<SelectItem key={c} value={c} className="cursor-pointer">{c}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Account Holder" value={bank.account_holder} onChange={(v) => updateData("account_holder", v)} />
                    <Field label="Bank Name" value={bank.bank_name} onChange={(v) => updateData("bank_name", v)} />
                    {f.account_number && <Field label="Account Number" value={bank.account_number} onChange={(v) => updateData("account_number", v)} />}
                    {f.routing_number && <Field label="Routing Number" value={bank.routing_number || ""} onChange={(v) => updateData("routing_number", v)} />}
                    {f.account_type && <Field label="Account Type" value={bank.account_type || ""} onChange={(v) => updateData("account_type", v)} placeholder="e.g. Checking Account" />}
                    {f.swift && <Field label="SWIFT Code" value={bank.swift || ""} onChange={(v) => updateData("swift", v)} />}
                    {f.iban && <Field label="IBAN" value={bank.iban || ""} onChange={(v) => updateData("iban", v)} />}
                  </div>
                  <Field label="Bank Address" value={bank.bank_address || ""} onChange={(v) => updateData("bank_address", v)} />
                </>
              );
            })()
          ) : (
            (() => {
              const crypto = editData as CryptoPayment;
              return (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Network" value={crypto.network} onChange={(v) => updateData("network", v)} placeholder="e.g. Ethereum, Stellar, XRP" />
                    <Field label="Currency" value={crypto.currency} onChange={(v) => updateData("currency", v)} placeholder="e.g. USDT, XLM, XRP" />
                  </div>
                  <Field label="Wallet Address" value={crypto.address} onChange={(v) => updateData("address", v)} placeholder="0x..." />
                  <Field label="Token Contract (optional)" value={crypto.contract || ""} onChange={(v) => updateData("contract", v)} placeholder="e.g. 0xa0b8...9e8 or native" />
                  <Field label={`${getMemoLabel(crypto.network)} (optional)`} value={crypto.memo || ""} onChange={(v) => updateData("memo", v)} />
                </>
              );
            })()
          )}

          <Button size="sm" onClick={handleSave} disabled={!editLabel.trim()} className="cursor-pointer">
            <Save className="size-3.5 mr-1" />
            {editingId ? "Update" : "Save"} Payment Method
          </Button>
        </div>
      )}

      {methods.length === 0 && !adding && (
        <p className="text-xs text-muted-foreground">No saved payment methods yet. Add one to quickly prefill payment details on new invoices.</p>
      )}
    </div>
  );
}
