export interface Address {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  vat?: string;
}

export interface InvoiceMetadata {
  invoice_number: string;
  date: string;
  due_date: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface TaxConfig {
  rate: number;
  description: string;
}

export interface BankPayment {
  type: "bank";
  account_currency: string;
  account_holder: string;
  bank_name: string;
  bank_address?: string;
  account_number: string;
  account_type?: string;
  routing_number?: string;
  swift?: string;
  iban?: string;
}

export interface CryptoPayment {
  type: "crypto";
  network: string;
  address: string;
  currency: string;
  memo?: string;
}

export type PaymentDetail = BankPayment | CryptoPayment;

export interface InvoiceSettings {
  showAddressLabels: boolean;
}

export interface InvoiceData {
  from: Address;
  bill_to: Address;
  invoice_metadata: InvoiceMetadata;
  items: InvoiceItem[];
  tax: TaxConfig;
  currency: string;
  payment_details: PaymentDetail[];
  notes: string;
  settings: InvoiceSettings;
}

export function createDefaultInvoice(): InvoiceData {
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 30);

  return {
    from: {
      name: "",
      address: "",
      city: "",
      state: "",
      country: "",
    },
    bill_to: {
      name: "",
      address: "",
      city: "",
      state: "",
      country: "",
      vat: "",
    },
    invoice_metadata: {
      invoice_number: "INV-001",
      date: today.toISOString().split("T")[0],
      due_date: dueDate.toISOString().split("T")[0],
    },
    items: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
    tax: { rate: 0, description: "Tax (0%)" },
    currency: "USD",
    payment_details: [],
    notes: "",
    settings: {
      showAddressLabels: false,
    },
  };
}

export function calculateSubtotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

export function calculateTax(items: InvoiceItem[], taxRate: number): number {
  return calculateSubtotal(items) * (taxRate / 100);
}

export function calculateTotal(items: InvoiceItem[], taxRate: number): number {
  return calculateSubtotal(items) + calculateTax(items, taxRate);
}

export function formatCurrency(amount: number, currency: string): string {
  return `${currency} $${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export interface AddressLine {
  label: string;
  value: string;
}

export function buildAddressLines(
  addr: Address,
  showLabels: boolean
): AddressLine[] {
  const lines: AddressLine[] = [];
  if (addr.name) lines.push({ label: "Name", value: addr.name });
  if (addr.address) lines.push({ label: "Address", value: addr.address });
  const cityState = [addr.city, addr.state].filter(Boolean).join(", ");
  if (cityState) lines.push({ label: "City", value: cityState });
  if (addr.country) lines.push({ label: "Country", value: addr.country });
  if (addr.vat) lines.push({ label: "VAT", value: addr.vat });
  return showLabels
    ? lines
    : lines.map((l) => ({ label: "", value: l.value }));
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}
