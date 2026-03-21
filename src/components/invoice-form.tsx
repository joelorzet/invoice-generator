"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { sileo } from "sileo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InvoiceData,
  InvoiceItem,
  PaymentDetail,
  BankPayment,
  CryptoPayment,
  createDefaultInvoice,
} from "@/lib/invoice-types";
import { getPresetsForCurrency } from "@/lib/tax-presets";
import {
  getInvoiceService,
  type SavedInvoice,
} from "@/lib/services";
import { InvoicePreview } from "@/components/invoice-preview";
import { AddressForm } from "@/components/invoice/address-form";
import { PaymentCard } from "@/components/invoice/payment-form";
import { StorageConsentDialog } from "@/components/invoice/storage-consent-dialog";
import { InvoiceHistory } from "@/components/invoice/invoice-history";
import {
  Plus,
  Trash2,
  Download,
  FileText,
  CreditCard,
  Wallet,
  Tag,
  HardDrive,
  Trash,
} from "lucide-react";

const CURRENCIES = [
  "USD", "EUR", "GBP", "ARS", "BRL", "CAD", "AUD", "JPY", "CHF", "MXN",
];

export function InvoiceForm() {
  const [invoice, setInvoice] = useState<InvoiceData>(createDefaultInvoice);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [consentDialogOpen, setConsentDialogOpen] = useState(false);
  const [storageEnabled, setStorageEnabled] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [taxPreset, setTaxPreset] = useState("custom");
  const pendingDownload = useRef(false);
  const serviceRef = useRef<ReturnType<typeof getInvoiceService> | null>(null);

  if (!serviceRef.current && typeof window !== "undefined") {
    serviceRef.current = getInvoiceService();
  }

  const svc = serviceRef.current;

  // Check consent on mount
  useEffect(() => {
    if (svc?.isStorageEnabled()) {
      setStorageEnabled(true);
    }
  }, []);

  const updateField = useCallback(
    <K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) => {
      setInvoice((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const updateNested = useCallback(
    (section: "from" | "bill_to", field: string, value: string) => {
      setInvoice((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: value },
      }));
    },
    []
  );

  const updateMetadata = useCallback((field: string, value: string) => {
    setInvoice((prev) => ({
      ...prev,
      invoice_metadata: { ...prev.invoice_metadata, [field]: value },
    }));
  }, []);

  const updateItem = useCallback(
    (index: number, field: keyof InvoiceItem, value: string | number) => {
      setInvoice((prev) => {
        const items = [...prev.items];
        const item = { ...items[index] };

        if (field === "description") {
          item.description = value as string;
        } else {
          const numVal = Number(value) || 0;
          if (field === "quantity") {
            item.quantity = numVal;
            item.amount = numVal * item.rate;
          } else if (field === "rate") {
            item.rate = numVal;
            item.amount = item.quantity * numVal;
          }
        }

        items[index] = item;
        return { ...prev, items };
      });
    },
    []
  );

  const addItem = useCallback(() => {
    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, rate: 0, amount: 0 }],
    }));
  }, []);

  const removeItem = useCallback((index: number) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }, []);

  const addPayment = useCallback((type: "bank" | "crypto") => {
    const payment: PaymentDetail =
      type === "bank"
        ? {
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
          } as BankPayment
        : { type: "crypto", network: "", address: "", currency: "USDT" } as CryptoPayment;

    setInvoice((prev) => ({
      ...prev,
      payment_details: [...prev.payment_details, payment],
    }));
  }, []);

  const updatePayment = useCallback(
    (index: number, field: string, value: string) => {
      setInvoice((prev) => {
        const payments = [...prev.payment_details];
        payments[index] = { ...payments[index], [field]: value } as PaymentDetail;
        return { ...prev, payment_details: payments };
      });
    },
    []
  );

  const removePayment = useCallback((index: number) => {
    setInvoice((prev) => ({
      ...prev,
      payment_details: prev.payment_details.filter((_, i) => i !== index),
    }));
  }, []);

  // Generate PDF + save to IndexedDB (update if editing, create if new)
  const doDownload = useCallback(
    (data: InvoiceData, existingId?: string) => {
      const work = new Promise<void>(async (resolve, reject) => {
        try {
          await new Promise((r) => setTimeout(r, 400));

          const saved = await svc?.downloadAndSave(data, existingId);

          if (saved && !existingId) setEditingId(saved.id);
          if (saved) setHistoryRefresh((n) => n + 1);

          resolve();
        } catch (err) {
          reject(err);
        }
      });

      sileo.promise(work, {
        loading: { title: "Generating Invoice", description: "Building your PDF..." },
        success: { title: "Invoice Ready", description: "Your PDF has been downloaded." },
        error: { title: "Generation Failed", description: "Something went wrong." },
      });
    },
    []
  );

  const handleDownload = useCallback(() => {
    const consent = svc?.getConsent();

    if (consent === null) {
      pendingDownload.current = true;
      setConsentDialogOpen(true);
    } else {
      doDownload(invoice, editingId);
    }
  }, [invoice, editingId, doDownload]);

  const handleConsent = useCallback(
    (granted: boolean) => {
      svc?.setConsent(granted ? "granted" : "denied");
      setStorageEnabled(granted);
      setConsentDialogOpen(false);

      if (pendingDownload.current) {
        pendingDownload.current = false;
        doDownload(invoice, editingId);
      }
    },
    [invoice, editingId, doDownload]
  );

  const handleLoadInvoice = useCallback((saved: SavedInvoice) => {
    const data = saved.data;
    // Ensure settings field exists (backward compat)
    if (!data.settings) {
      data.settings = { showAddressLabels: false };
    }
    setInvoice(data);
    setEditingId(saved.id);
    sileo.success({
      title: "Invoice Loaded",
      description: `Loaded ${saved.invoice_number}`,
    });
  }, []);

  const handleNewInvoice = useCallback(() => {
    setEditingId(undefined);
    const next = createDefaultInvoice();
    const current = invoice.invoice_metadata.invoice_number;

    // Pure numeric: "5" → "6"
    if (/^\d+$/.test(current)) {
      next.invoice_metadata.invoice_number = String(Number(current) + 1);
    }
    // Prefix + number: "INV-001" → "INV-002", "INV003" → "INV004"
    else {
      const match = current.match(/^(.+?)(\d+)$/);
      if (match) {
        const [, prefix, numStr] = match;
        const nextNum = String(Number(numStr) + 1).padStart(numStr.length, "0");
        next.invoice_metadata.invoice_number = prefix + nextNum;
      }
    }

    // Keep the same From, payment details, currency, tax, and settings
    next.from = invoice.from;
    next.payment_details = invoice.payment_details;
    next.currency = invoice.currency;
    next.tax = invoice.tax;
    next.settings = invoice.settings;

    setInvoice(next);
  }, [invoice]);

  const handleClearData = useCallback(() => {
    svc?.clearAllData();
    setStorageEnabled(false);
    setHistoryRefresh((n) => n + 1);
    sileo.success({ title: "Data Cleared", description: "All saved invoices and preferences have been removed." });
  }, []);

  const handleDownloadFromHistory = useCallback(
    (saved: SavedInvoice) => {
      const data = saved.data;
      if (!data.settings) data.settings = { showAddressLabels: false };
      doDownload(data, saved.id);
    },
    [doDownload]
  );

  const handleEnableStorage = useCallback(() => {
    pendingDownload.current = false;
    setConsentDialogOpen(true);
  }, []);

  return (
    <>
      <StorageConsentDialog open={consentDialogOpen} onConsent={handleConsent} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* LEFT: Form */}
        <div className="space-y-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="inv-number" className="text-xs text-muted-foreground">Invoice Number</Label>
                  <Input id="inv-number" value={invoice.invoice_metadata.invoice_number} onChange={(e) => updateMetadata("invoice_number", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="inv-date" className="text-xs text-muted-foreground">Date</Label>
                  <Input id="inv-date" type="date" value={invoice.invoice_metadata.date} onChange={(e) => updateMetadata("date", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="inv-due" className="text-xs text-muted-foreground">Due Date</Label>
                  <Input id="inv-due" type="date" value={invoice.invoice_metadata.due_date} onChange={(e) => updateMetadata("due_date", e.target.value)} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="currency" className="text-xs text-muted-foreground">Currency</Label>
                  <Select
                    value={invoice.currency}
                    onValueChange={(v) => {
                      const cur = v ?? invoice.currency;
                      updateField("currency", cur);
                      // Auto-select the first non-"No tax" preset, or "No tax" if only one
                      const presets = getPresetsForCurrency(cur);
                      const first = presets.length > 1 ? presets[1] : presets[0];
                      setTaxPreset(first.label);
                      updateField("tax", { rate: first.rate, description: first.description });
                    }}
                  >
                    <SelectTrigger id="currency" className="mt-1 w-full cursor-pointer"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (<SelectItem key={c} value={c} className="cursor-pointer">{c}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tax-preset" className="text-xs text-muted-foreground">Tax Preset</Label>
                  <Select
                    value={taxPreset}
                    onValueChange={(v) => {
                      const key = v ?? "custom";
                      setTaxPreset(key);
                      if (key !== "custom") {
                        const presets = getPresetsForCurrency(invoice.currency);
                        const match = presets.find((p) => p.label === key);
                        if (match) {
                          updateField("tax", { rate: match.rate, description: match.description });
                        }
                      }
                    }}
                  >
                    <SelectTrigger id="tax-preset" className="mt-1 w-full cursor-pointer"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom" className="cursor-pointer">Custom</SelectItem>
                      {getPresetsForCurrency(invoice.currency).map((p) => (
                        <SelectItem key={p.label} value={p.label} className="cursor-pointer">{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="tax-rate" className="text-xs text-muted-foreground">Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={invoice.tax.rate}
                    onChange={(e) => {
                      const rate = Number(e.target.value) || 0;
                      setTaxPreset("custom");
                      updateField("tax", { rate, description: `Tax (${rate}%)` });
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="tax-label" className="text-xs text-muted-foreground">Tax Label</Label>
                  <Input
                    id="tax-label"
                    value={invoice.tax.description}
                    onChange={(e) => {
                      setTaxPreset("custom");
                      updateField("tax", { ...invoice.tax, description: e.target.value });
                    }}
                    placeholder="e.g. VAT (20%)"
                    className="mt-1"
                  />
                </div>
              </div>
              {/* Settings row */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground select-none">
                  <input
                    type="checkbox"
                    checked={invoice.settings.showAddressLabels}
                    onChange={(e) =>
                      updateField("settings", {
                        ...invoice.settings,
                        showAddressLabels: e.target.checked,
                      })
                    }
                    className="rounded border-border accent-primary cursor-pointer"
                  />
                  <Tag className="size-3.5" />
                  Show address labels
                </label>
                {storageEnabled && (
                  <button
                    onClick={handleClearData}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  >
                    <Trash className="size-3" />
                    Clear saved data
                  </button>
                )}
                {!storageEnabled && svc?.getConsent() === "denied" && (
                  <button
                    onClick={handleEnableStorage}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    <HardDrive className="size-3" />
                    Enable local storage
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AddressForm title="From" data={invoice.from} onChange={(f, v) => updateNested("from", f, v)} />
                <AddressForm title="Bill To" data={invoice.bill_to} onChange={(f, v) => updateNested("bill_to", f, v)} />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Line Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-[1fr_80px_100px_100px_36px] gap-2 text-xs font-medium text-muted-foreground px-1">
                <span>Description</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Rate</span>
                <span className="text-right">Amount</span>
                <span />
              </div>

              {invoice.items.map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_100px_100px_36px] gap-2 items-center">
                  <Input placeholder="Service description" value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} />
                  <Input type="number" min={0} value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} className="text-right" />
                  <Input type="number" min={0} step={0.01} value={item.rate} onChange={(e) => updateItem(i, "rate", e.target.value)} className="text-right" />
                  <Input type="number" value={item.amount} readOnly className="text-right bg-muted" tabIndex={-1} />
                  <Button variant="ghost" size="icon" onClick={() => removeItem(i)} disabled={invoice.items.length === 1} className="cursor-pointer text-muted-foreground hover:text-destructive" aria-label="Remove item">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}

              <Button variant="outline" size="sm" onClick={addItem} className="cursor-pointer mt-2">
                <Plus className="size-4 mr-1" />
                Add Item
              </Button>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoice.payment_details.map((payment, i) => (
                <PaymentCard
                  key={i}
                  payment={payment}
                  onUpdate={(field, value) => updatePayment(i, field, value)}
                  onRemove={() => removePayment(i)}
                />
              ))}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => addPayment("bank")} className="cursor-pointer">
                  <CreditCard className="size-4 mr-1" />
                  Add Bank
                </Button>
                <Button variant="outline" size="sm" onClick={() => addPayment("crypto")} className="cursor-pointer">
                  <Wallet className="size-4 mr-1" />
                  Add Crypto
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Additional notes or payment instructions..."
                value={invoice.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Download (mobile) */}
          <div className="xl:hidden">
            <Button size="lg" onClick={handleDownload} className="w-full cursor-pointer bg-primary hover:opacity-90 text-primary-foreground font-semibold h-12 text-base">
              <Download className="size-5 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* RIGHT: Preview + Download */}
        <div className="hidden xl:block">
          <div className="sticky top-20 space-y-4">
            <Button size="lg" onClick={handleDownload} className="w-full cursor-pointer bg-primary hover:opacity-90 text-primary-foreground font-semibold h-12 text-base">
              <Download className="size-5 mr-2" />
              Download PDF
            </Button>
            <Separator />
            <InvoicePreview data={invoice} />
          </div>
        </div>
      </div>

      {/* Invoice History (full width, below the form) */}
      {storageEnabled && (
        <div className="mt-10">
          <InvoiceHistory
            onLoad={handleLoadInvoice}
            onDownload={handleDownloadFromHistory}
            onNew={handleNewInvoice}
            refreshKey={historyRefresh}
          />
        </div>
      )}
    </>
  );
}
