"use client";

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
import { CreditCard, Wallet, X } from "lucide-react";
import type { PaymentDetail } from "@/lib/invoice-types";

const CURRENCIES = [
  "USD", "EUR", "GBP", "ARS", "BRL", "CAD", "AUD", "JPY", "CHF", "MXN",
];

type BankFieldVisibility = {
  routing_number: boolean;
  account_number: boolean;
  account_type: boolean;
  swift: boolean;
  iban: boolean;
};

const BANK_FIELDS: Record<string, BankFieldVisibility> = {
  USD: { routing_number: true, account_number: true, account_type: true, swift: false, iban: false },
  CAD: { routing_number: true, account_number: true, account_type: true, swift: false, iban: false },
  EUR: { routing_number: false, account_number: false, account_type: false, swift: true, iban: true },
  GBP: { routing_number: false, account_number: false, account_type: false, swift: true, iban: true },
  CHF: { routing_number: false, account_number: false, account_type: false, swift: true, iban: true },
  ARS: { routing_number: false, account_number: true, account_type: false, swift: true, iban: false },
  BRL: { routing_number: false, account_number: true, account_type: false, swift: true, iban: false },
  MXN: { routing_number: false, account_number: true, account_type: false, swift: true, iban: false },
  AUD: { routing_number: false, account_number: true, account_type: false, swift: true, iban: true },
  JPY: { routing_number: false, account_number: true, account_type: false, swift: true, iban: true },
};

const ALL_FIELDS: BankFieldVisibility = {
  routing_number: true, account_number: true, account_type: true, swift: true, iban: true,
};

export function getBankFields(currency: string): BankFieldVisibility {
  return BANK_FIELDS[currency] ?? ALL_FIELDS;
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

export function PaymentCard({
  payment,
  onUpdate,
  onRemove,
}: {
  payment: PaymentDetail;
  onUpdate: (field: string, value: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="relative rounded-md border border-border bg-muted/50 p-4 space-y-3">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onRemove}
        className="absolute top-2 right-2 cursor-pointer text-muted-foreground hover:text-destructive"
        aria-label="Remove payment method"
      >
        <X className="size-3.5" />
      </Button>

      {payment.type === "bank" ? (
        (() => {
          const f = getBankFields(payment.account_currency);
          return (
            <>
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CreditCard className="size-4 text-primary" />
                Bank Transfer
              </h4>
              <div>
                <Label className="text-xs text-muted-foreground">Account Currency</Label>
                <Select
                  value={payment.account_currency}
                  onValueChange={(v) => onUpdate("account_currency", v ?? "USD")}
                >
                  <SelectTrigger className="mt-1 cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c} className="cursor-pointer">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Account Holder" value={payment.account_holder} onChange={(v) => onUpdate("account_holder", v)} />
                <Field label="Bank Name" value={payment.bank_name} onChange={(v) => onUpdate("bank_name", v)} />
                {f.account_number && <Field label="Account Number" value={payment.account_number} onChange={(v) => onUpdate("account_number", v)} />}
                {f.routing_number && <Field label="Routing Number" value={payment.routing_number || ""} onChange={(v) => onUpdate("routing_number", v)} />}
                {f.account_type && <Field label="Account Type" value={payment.account_type || ""} onChange={(v) => onUpdate("account_type", v)} placeholder="e.g. Checking Account" />}
                {f.swift && <Field label="SWIFT Code" value={payment.swift || ""} onChange={(v) => onUpdate("swift", v)} />}
                {f.iban && <Field label="IBAN" value={payment.iban || ""} onChange={(v) => onUpdate("iban", v)} />}
              </div>
              <Field label="Bank Address" value={payment.bank_address || ""} onChange={(v) => onUpdate("bank_address", v)} />
            </>
          );
        })()
      ) : (
        <>
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Wallet className="size-4 text-primary" />
            Cryptocurrency
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Network" value={payment.network} onChange={(v) => onUpdate("network", v)} placeholder="e.g. Ethereum, Stellar, XRP" />
            <Field label="Currency" value={payment.currency} onChange={(v) => onUpdate("currency", v)} placeholder="e.g. USDT, XLM, XRP" />
          </div>
          <Field label="Wallet Address" value={payment.address} onChange={(v) => onUpdate("address", v)} placeholder="0x..." />
          <Field label={`${getMemoLabel(payment.network)} (optional)`} value={payment.memo || ""} onChange={(v) => onUpdate("memo", v)} placeholder="Required for Stellar, XRP, EOS, Cosmos, BNB" />
        </>
      )}
    </div>
  );
}
