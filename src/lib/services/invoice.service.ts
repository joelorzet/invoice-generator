import type { InvoiceData, PaymentDetail, Address } from "../invoice-types";
import type {
  IConsentService,
  StorageConsent,
  IInvoiceStorageService,
  SavedInvoice,
  IPaymentMethodStorageService,
  SavedPaymentMethod,
  IAddressProfileStorageService,
  SavedAddressProfile,
  AddressProfileType,
  IPdfService,
  IInvoiceService,
} from "../interfaces";

export class InvoiceService implements IInvoiceService {
  constructor(
    private consent: IConsentService,
    private storage: IInvoiceStorageService,
    private paymentMethods: IPaymentMethodStorageService,
    private addressProfiles: IAddressProfileStorageService,
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
    await this.paymentMethods.clearAll();
    await this.addressProfiles.clearAll();
  }

  async getAll(): Promise<SavedInvoice[]> {
    return this.storage.getAll();
  }

  async delete(id: string): Promise<void> {
    return this.storage.delete(id);
  }

  // Payment Methods
  async savePaymentMethod(label: string, data: PaymentDetail, existingId?: string): Promise<SavedPaymentMethod> {
    return this.paymentMethods.save(label, data, existingId);
  }

  async getAllPaymentMethods(): Promise<SavedPaymentMethod[]> {
    return this.paymentMethods.getAll();
  }

  async deletePaymentMethod(id: string): Promise<void> {
    return this.paymentMethods.delete(id);
  }

  // Address Profiles
  async saveAddressProfile(label: string, type: AddressProfileType, data: Address, existingId?: string): Promise<SavedAddressProfile> {
    return this.addressProfiles.save(label, type, data, existingId);
  }

  async getAddressProfiles(type?: AddressProfileType): Promise<SavedAddressProfile[]> {
    if (type) return this.addressProfiles.getAllByType(type);
    return this.addressProfiles.getAll();
  }

  async deleteAddressProfile(id: string): Promise<void> {
    return this.addressProfiles.delete(id);
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
