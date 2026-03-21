export interface Address {
  name: string;
  address: string;
  city: string;
  state: string;
  zip?: string;
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

export interface InvoiceTheme {
  primary: string;
  text: string;
  muted: string;
  headerBg: string;
  headerText: string;
}

export const INVOICE_THEMES: Record<string, InvoiceTheme> = {
  classic: {
    primary: "#1e293b",
    text: "#1e293b",
    muted: "#475569",
    headerBg: "#4a4a4a",
    headerText: "#ffffff",
  },
  ocean: {
    primary: "#0369a1",
    text: "#0c4a6e",
    muted: "#64748b",
    headerBg: "#0284c7",
    headerText: "#ffffff",
  },
  forest: {
    primary: "#166534",
    text: "#14532d",
    muted: "#4b5563",
    headerBg: "#16a34a",
    headerText: "#ffffff",
  },
  plum: {
    primary: "#7e22ce",
    text: "#581c87",
    muted: "#6b7280",
    headerBg: "#9333ea",
    headerText: "#ffffff",
  },
  ember: {
    primary: "#c2410c",
    text: "#7c2d12",
    muted: "#57534e",
    headerBg: "#ea580c",
    headerText: "#ffffff",
  },
  minimal: {
    primary: "#374151",
    text: "#374151",
    muted: "#9ca3af",
    headerBg: "#f3f4f6",
    headerText: "#374151",
  },
};

export function getInvoiceTheme(settings: InvoiceSettings): InvoiceTheme {
  if (settings.themeName === "custom" && settings.customTheme) {
    return settings.customTheme;
  }
  return INVOICE_THEMES[settings.themeName || "classic"] || INVOICE_THEMES.classic;
}

export interface InvoiceSettings {
  showAddressLabels: boolean;
  themeName?: string;
  customTheme?: InvoiceTheme;
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
  logo?: string;
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
  const { name, address, city, state, zip, country, vat } = addr;
  const lines: AddressLine[] = [];
  if (name) lines.push({ label: "Name", value: name });
  if (address) lines.push({ label: "Address", value: address });
  const cityStateZip = [city, state, zip].filter(Boolean).join(", ");
  if (cityStateZip) lines.push({ label: "City", value: cityStateZip });
  if (country) lines.push({ label: "Country", value: country });
  if (vat) lines.push({ label: "VAT", value: vat });
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
