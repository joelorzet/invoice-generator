import type { InvoiceData } from "../invoice-types";
import type {
  IConsentService,
  StorageConsent,
  IInvoiceStorageService,
  SavedInvoice,
  IPdfService,
  IInvoiceService,
} from "../interfaces";

export class InvoiceService implements IInvoiceService {
  constructor(
    private consent: IConsentService,
    private storage: IInvoiceStorageService,
    private pdf: IPdfService
  ) {}

  getConsent(): StorageConsent {
    return this.consent.get();
  }

  setConsent(consent: "granted" | "denied"): void {
    this.consent.set(consent);
    if (consent === "denied") {
      this.storage.clearAll();
    }
  }

  isStorageEnabled(): boolean {
    return this.consent.isGranted();
  }

  async clearAllData(): Promise<void> {
    this.consent.clear();
    await this.storage.clearAll();
  }

  async getAll(): Promise<SavedInvoice[]> {
    return this.storage.getAll();
  }

  async delete(id: string): Promise<void> {
    return this.storage.delete(id);
  }

  downloadOnly(data: InvoiceData): void {
    this.pdf.download(data);
  }

  async downloadAndSave(
    data: InvoiceData,
    existingId?: string
  ): Promise<SavedInvoice | null> {
    this.pdf.download(data);

    if (this.consent.isGranted()) {
      return this.storage.save(data, existingId);
    }

    return null;
  }
}
