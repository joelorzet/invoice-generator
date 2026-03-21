import type { PaymentDetail } from "../invoice-types";
import type { IConsentService } from "../interfaces";
import type { SavedPaymentMethod, IPaymentMethodStorageService } from "../interfaces";
import { getDB, PAYMENT_METHODS_STORE as STORE } from "./db";

export class PaymentMethodStorageService implements IPaymentMethodStorageService {
  constructor(private consent: IConsentService) {}

  private generateId(): string {
    return `pm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  async save(label: string, data: PaymentDetail, existingId?: string): Promise<SavedPaymentMethod> {
    if (!this.consent.isGranted()) {
      throw new Error("Storage consent not granted");
    }

    const db = await getDB();
    const now = new Date().toISOString();

    const record: SavedPaymentMethod = {
      id: existingId || this.generateId(),
      label,
      type: data.type,
      created_at: existingId
        ? ((await db.get(STORE, existingId))?.created_at ?? now)
        : now,
      updated_at: now,
      data,
    };

    await db.put(STORE, record);
    return record;
  }

  async getAll(): Promise<SavedPaymentMethod[]> {
    if (!this.consent.isGranted()) return [];
    try {
      const db = await getDB();
      const all = await db.getAll(STORE);
      return all.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch {
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORE, id);
  }

  async clearAll(): Promise<void> {
    try {
      const db = await getDB();
      await db.clear(STORE);
    } catch {
      // DB might not exist yet
    }
  }
}
