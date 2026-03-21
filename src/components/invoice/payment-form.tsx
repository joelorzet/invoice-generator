"use client";

import { useState, useRef, useEffect } from "react";
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
import { CreditCard, Wallet, X, ChevronDown } from "lucide-react";
import type { PaymentDetail, BankPayment, CryptoPayment } from "@/lib/invoice-types";
import type { SavedPaymentMethod } from "@/lib/services";

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

// ── Shared sub-components ──

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

function CurrencySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">Account Currency</Label>
      <Select value={value} onValueChange={(v) => onChange(v ?? "USD")}>
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
  );
}

function SavedMethodSelector({
  methods,
  onSelect,
  renderLabel,
}: {
  methods: SavedPaymentMethod[];
  onSelect: (data: PaymentDetail) => void;
  renderLabel: (m: SavedPaymentMethod) => string;
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

  if (methods.length === 0) return null;

  const selectedMethod = selected ? methods.find((m) => m.id === selected) : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-xs h-8 cursor-pointer transition-colors ${selectedMethod ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
      >
        <span className="flex items-center gap-1.5 truncate">
          {selectedMethod ? (
            <>
              {selectedMethod.type === "bank" ? <CreditCard className="size-3 shrink-0" /> : <Wallet className="size-3 shrink-0" />}
              {renderLabel(selectedMethod)}
            </>
          ) : (
            "Load from saved..."
          )}
        </span>
        <ChevronDown className="size-3.5 shrink-0" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-md overflow-hidden">
          {methods.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onSelect(structuredClone(m.data));
                setSelected(m.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-popover-foreground hover:bg-accent cursor-pointer"
            >
              {m.type === "bank" ? <CreditCard className="size-3" /> : <Wallet className="size-3" />}
              {renderLabel(m)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Bank form ──

function BankForm({
  payment,
  onUpdate,
}: {
  payment: BankPayment;
  onUpdate: (field: string, value: string) => void;
}) {
  const f = getBankFields(payment.account_currency);

  return (
    <>
      <CurrencySelect value={payment.account_currency} onChange={(v) => onUpdate("account_currency", v)} />
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
}

// ── Crypto form ──

function CryptoForm({
  payment,
  onUpdate,
}: {
  payment: CryptoPayment;
  onUpdate: (field: string, value: string) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Network" value={payment.network} onChange={(v) => onUpdate("network", v)} placeholder="e.g. Ethereum, Stellar, XRP" />
        <Field label="Currency" value={payment.currency} onChange={(v) => onUpdate("currency", v)} placeholder="e.g. USDT, XLM, XRP" />
      </div>
      <Field label="Wallet Address" value={payment.address} onChange={(v) => onUpdate("address", v)} placeholder="0x..." />
      <Field label="Token Contract (optional)" value={payment.contract || ""} onChange={(v) => onUpdate("contract", v)} placeholder="e.g. 0xa0b8...9e8 or native" />
      <Field label={`${getMemoLabel(payment.network)} (optional)`} value={payment.memo || ""} onChange={(v) => onUpdate("memo", v)} placeholder="Required for Stellar, XRP, EOS, Cosmos, BNB" />
    </>
  );
}

// ── Main PaymentCard ──

export function PaymentCard({
  payment,
  onUpdate,
  onRemove,
  onPrefill,
  savedMethods,
}: {
  payment: PaymentDetail;
  onUpdate: (field: string, value: string) => void;
  onRemove: () => void;
  onPrefill?: (data: PaymentDetail) => void;
  savedMethods?: SavedPaymentMethod[];
}) {
  const matching = savedMethods?.filter((m) => m.type === payment.type) ?? [];
  const isBank = payment.type === "bank";
  const Icon = isBank ? CreditCard : Wallet;
  const title = isBank ? "Bank Transfer" : "Cryptocurrency";

  return (
    <div className="rounded-md border border-border bg-muted/50 p-4 space-y-3">
      {/* Header row: title + remove */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Icon className="size-4 text-primary" />
          {title}
        </h4>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onRemove}
          className="cursor-pointer text-muted-foreground hover:text-destructive"
          aria-label="Remove payment method"
        >
          <X className="size-3.5" />
        </Button>
      </div>

      {/* Saved method selector */}
      {matching.length > 0 && onPrefill && (
        <SavedMethodSelector
          methods={matching}
          onSelect={onPrefill}
          renderLabel={(m) =>
            m.type === "bank"
              ? `${m.label} (${(m.data as BankPayment).account_currency})`
              : m.label
          }
        />
      )}

      {/* Form fields */}
      {isBank ? (
        <BankForm payment={payment as BankPayment} onUpdate={onUpdate} />
      ) : (
        <CryptoForm payment={payment as CryptoPayment} onUpdate={onUpdate} />
      )}
    </div>
  );
}
