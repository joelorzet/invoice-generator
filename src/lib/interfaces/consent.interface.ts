export type StorageConsent = "granted" | "denied" | null;

export interface IConsentService {
  get(): StorageConsent;
  set(consent: "granted" | "denied"): void;
  clear(): void;
  isGranted(): boolean;
}
