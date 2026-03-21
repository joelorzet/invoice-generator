import type { InvoiceData } from "../invoice-types";
import { calculateTotal } from "../invoice-types";
import type { IConsentService } from "../interfaces";
import type { SavedInvoice, IInvoiceStorageService } from "../interfaces";
import { getDB, INVOICES_STORE as STORE_NAME } from "./db";

export class InvoiceStorageService implements IInvoiceStorageService {
  constructor(private consent: IConsentService) {}

  private generateId(): string {
    return `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  async save(data: InvoiceData, existingId?: string): Promise<SavedInvoice> {
    if (!this.consent.isGranted()) {
      throw new Error("Storage consent not granted");
    }

    const db = await getDB();
    const now = new Date().toISOString();
    const total = calculateTotal(data.items, data.tax.rate);

    const record: SavedInvoice = {
      id: existingId || this.generateId(),
      invoice_number: data.invoice_metadata.invoice_number || "Draft",
      client_name: data.bill_to.name || "No client",
      total,
      currency: data.currency,
      date: data.invoice_metadata.date,
      created_at: existingId
        ? ((await db.get(STORE_NAME, existingId))?.created_at ?? now)
        : now,
      updated_at: now,
      data,
    };

    await db.put(STORE_NAME, record);
    return record;
  }

  async getAll(): Promise<SavedInvoice[]> {
    if (!this.consent.isGranted()) return [];
    try {
      const db = await getDB();
      const all = await db.getAll(STORE_NAME);
      return all.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch {
      return [];
    }
  }

  async getById(id: string): Promise<SavedInvoice | undefined> {
    if (!this.consent.isGranted()) return undefined;
    const db = await getDB();
    return db.get(STORE_NAME, id);
  }

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
  }

  async clearAll(): Promise<void> {
    try {
      const db = await getDB();
      await db.clear(STORE_NAME);
    } catch {
      // DB might not exist yet
    }
  }
}
