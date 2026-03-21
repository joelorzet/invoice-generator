import type { Address } from "../invoice-types";

export type AddressProfileType = "from" | "client";

export interface SavedAddressProfile {
  id: string;
  label: string;
  type: AddressProfileType;
  created_at: string;
  updated_at: string;
  data: Address;
}

export interface IAddressProfileStorageService {
  save(label: string, type: AddressProfileType, data: Address, existingId?: string): Promise<SavedAddressProfile>;
  getAll(): Promise<SavedAddressProfile[]>;
  getAllByType(type: AddressProfileType): Promise<SavedAddressProfile[]>;
  delete(id: string): Promise<void>;
  clearAll(): Promise<void>;
}
