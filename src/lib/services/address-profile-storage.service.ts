import type { Address } from "../invoice-types";
import type { IConsentService } from "../interfaces";
import type { SavedAddressProfile, AddressProfileType, IAddressProfileStorageService } from "../interfaces";
import { getDB, ADDRESS_PROFILES_STORE as STORE } from "./db";

export class AddressProfileStorageService implements IAddressProfileStorageService {
  constructor(private consent: IConsentService) {}

  private generateId(): string {
    return `addr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  async save(label: string, type: AddressProfileType, data: Address, existingId?: string): Promise<SavedAddressProfile> {
    if (!this.consent.isGranted()) {
      throw new Error("Storage consent not granted");
    }

    const db = await getDB();
    const now = new Date().toISOString();

    const record: SavedAddressProfile = {
      id: existingId || this.generateId(),
      label,
      type,
      created_at: existingId
        ? ((await db.get(STORE, existingId))?.created_at ?? now)
        : now,
      updated_at: now,
      data,
    };

    await db.put(STORE, record);
    return record;
  }

  async getAll(): Promise<SavedAddressProfile[]> {
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

  async getAllByType(type: AddressProfileType): Promise<SavedAddressProfile[]> {
    const all = await this.getAll();
    return all.filter((p) => p.type === type);
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
