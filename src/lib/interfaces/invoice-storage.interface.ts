import type { InvoiceData } from "../invoice-types";

export interface SavedInvoice {
  id: string;
  invoice_number: string;
  client_name: string;
  total: number;
  currency: string;
  date: string;
  created_at: string;
  updated_at: string;
  data: InvoiceData;
}

export interface IInvoiceStorageService {
  save(data: InvoiceData, existingId?: string): Promise<SavedInvoice>;
  getAll(): Promise<SavedInvoice[]>;
  getById(id: string): Promise<SavedInvoice | undefined>;
  delete(id: string): Promise<void>;
  clearAll(): Promise<void>;
}
