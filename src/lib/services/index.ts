export type {
  StorageConsent,
  IConsentService,
  SavedInvoice,
  IInvoiceStorageService,
  SavedPaymentMethod,
  IPaymentMethodStorageService,
  SavedAddressProfile,
  AddressProfileType,
  IAddressProfileStorageService,
  IPdfService,
  IInvoiceService,
} from "../interfaces";

export { ConsentService } from "./consent.service";
export { InvoiceStorageService } from "./invoice-storage.service";
export { PaymentMethodStorageService } from "./payment-method-storage.service";
export { AddressProfileStorageService } from "./address-profile-storage.service";
export { PdfService } from "./pdf.service";
export { InvoiceService } from "./invoice.service";

import { ConsentService } from "./consent.service";
import { InvoiceStorageService } from "./invoice-storage.service";
import { PaymentMethodStorageService } from "./payment-method-storage.service";
import { AddressProfileStorageService } from "./address-profile-storage.service";
import { PdfService } from "./pdf.service";
import { InvoiceService } from "./invoice.service";

export function createInvoiceService(): InvoiceService {
  const consent = new ConsentService(localStorage);
  const storage = new InvoiceStorageService(consent);
  const paymentMethods = new PaymentMethodStorageService(consent);
  const addressProfiles = new AddressProfileStorageService(consent);
  const pdf = new PdfService();
  return new InvoiceService(consent, storage, paymentMethods, addressProfiles, pdf);
}

let _client: InvoiceService | null = null;

export function getInvoiceService(): InvoiceService {
  if (typeof window === "undefined") {
    throw new Error("getInvoiceService must be called on the client");
  }
  if (!_client) {
    _client = createInvoiceService();
  }
  return _client;
}
