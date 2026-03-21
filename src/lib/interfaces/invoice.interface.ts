import type { InvoiceData } from "../invoice-types";
import type { StorageConsent } from "./consent.interface";
import type { SavedInvoice } from "./invoice-storage.interface";

export interface IInvoiceService {
  getConsent(): StorageConsent;
  setConsent(consent: "granted" | "denied"): void;
  clearAllData(): Promise<void>;
  isStorageEnabled(): boolean;
  getAll(): Promise<SavedInvoice[]>;
  delete(id: string): Promise<void>;
  downloadAndSave(data: InvoiceData, existingId?: string): Promise<SavedInvoice | null>;
  downloadOnly(data: InvoiceData): void;
}
