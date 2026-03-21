import type { PaymentDetail } from "../invoice-types";

export interface SavedPaymentMethod {
  id: string;
  label: string;
  type: "bank" | "crypto";
  created_at: string;
  updated_at: string;
  data: PaymentDetail;
}

export interface IPaymentMethodStorageService {
  save(label: string, data: PaymentDetail, existingId?: string): Promise<SavedPaymentMethod>;
  getAll(): Promise<SavedPaymentMethod[]>;
  delete(id: string): Promise<void>;
  clearAll(): Promise<void>;
}
