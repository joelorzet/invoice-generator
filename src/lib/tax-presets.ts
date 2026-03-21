export interface TaxPreset {
  label: string;
  rate: number;
  description: string;
}

const TAX_PRESETS: Record<string, TaxPreset[]> = {
  USD: [
    { label: "No tax", rate: 0, description: "Tax (0%)" },
  ],
  EUR: [
    { label: "No tax", rate: 0, description: "Tax (0%)" },
    { label: "Germany - VAT 19%", rate: 19, description: "VAT (19%)" },
    { label: "France - VAT 20%", rate: 20, description: "VAT (20%)" },
    { label: "Spain - IVA 21%", rate: 21, description: "IVA (21%)" },
    { label: "Italy - IVA 22%", rate: 22, description: "IVA (22%)" },
    { label: "Netherlands - VAT 21%", rate: 21, description: "VAT (21%)" },
    { label: "Belgium - VAT 21%", rate: 21, description: "VAT (21%)" },
    { label: "Ireland - VAT 23%", rate: 23, description: "VAT (23%)" },
    { label: "Portugal - IVA 23%", rate: 23, description: "IVA (23%)" },
  ],
  GBP: [
    { label: "No tax", rate: 0, description: "Tax (0%)" },
    { label: "UK - VAT 20%", rate: 20, description: "VAT (20%)" },
    { label: "UK - Reduced VAT 5%", rate: 5, description: "VAT (5%)" },
  ],
  ARS: [
    { label: "No tax", rate: 0, description: "Tax (0%)" },
    { label: "IVA 21%", rate: 21, description: "IVA (21%)" },
    { label: "IVA Reduced 10.5%", rate: 10.5, description: "IVA (10.5%)" },
    { label: "IVA Increased 27%", rate: 27, description: "IVA (27%)" },
  ],
  BRL: [
    { label: "No tax", rate: 0, description: "Tax (0%)" },
    { label: "ICMS 18% (SP)", rate: 18, description: "ICMS (18%)" },
    { label: "ICMS 20% (RJ)", rate: 20, description: "ICMS (20%)" },
    { label: "ISS 5%", rate: 5, description: "ISS (5%)" },
    { label: "IPI 10%", rate: 10, description: "IPI (10%)" },
  ],
  CAD: [
    { label: "No tax", rate: 0, description: "Tax (0%)" },
    { label: "GST 5%", rate: 5, description: "GST (5%)" },
    { label: "HST 13% (Ontario)", rate: 13, description: "HST (13%)" },
    { label: "HST 15% (Atlantic)", rate: 15, description: "HST (15%)" },
  ],
  AUD: [
    { label: "No tax", rate: 0, description: "Tax (0%)" },
    { label: "GST 10%", rate: 10, description: "GST (10%)" },
  ],
  JPY: [
    { label: "No tax", rate: 0, description: "Tax (0%)" },
    { label: "Consumption Tax 10%", rate: 10, description: "Consumption Tax (10%)" },
    { label: "Reduced 8%", rate: 8, description: "Consumption Tax (8%)" },
  ],
  CHF: [
    { label: "No tax", rate: 0, description: "Tax (0%)" },
    { label: "VAT 8.1%", rate: 8.1, description: "VAT (8.1%)" },
    { label: "Reduced VAT 2.6%", rate: 2.6, description: "VAT (2.6%)" },
  ],
  MXN: [
    { label: "No tax", rate: 0, description: "Tax (0%)" },
    { label: "IVA 16%", rate: 16, description: "IVA (16%)" },
  ],
};

export function getPresetsForCurrency(currency: string): TaxPreset[] {
  return TAX_PRESETS[currency] ?? [{ label: "No tax", rate: 0, description: "Tax (0%)" }];
}
