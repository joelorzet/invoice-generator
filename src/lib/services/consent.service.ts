import type { IConsentService, StorageConsent } from "../interfaces";

const CONSENT_KEY = "invoice-storage-consent";

export class ConsentService implements IConsentService {

  constructor(private storage: Storage) { }

  get(): StorageConsent {
    const val = this.storage.getItem(CONSENT_KEY);
    if (val === "granted" || val === "denied") return val;
    return null;
  }

  set(consent: "granted" | "denied"): void {
    this.storage.setItem(CONSENT_KEY, consent);
  }

  clear(): void {
    this.storage.removeItem(CONSENT_KEY);
  }

  isGranted(): boolean {
    return this.get() === "granted";
  }
}
