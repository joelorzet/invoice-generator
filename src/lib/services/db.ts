import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "invoice-generator";
const DB_VERSION = 3;

export const INVOICES_STORE = "invoices";
export const PAYMENT_METHODS_STORE = "payment_methods";
export const ADDRESS_PROFILES_STORE = "address_profiles";

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(INVOICES_STORE)) {
          const store = db.createObjectStore(INVOICES_STORE, { keyPath: "id" });
          store.createIndex("by_date", "created_at");
          store.createIndex("by_number", "invoice_number");
        }
        if (!db.objectStoreNames.contains(PAYMENT_METHODS_STORE)) {
          const store = db.createObjectStore(PAYMENT_METHODS_STORE, { keyPath: "id" });
          store.createIndex("by_type", "type");
        }
        if (!db.objectStoreNames.contains(ADDRESS_PROFILES_STORE)) {
          const store = db.createObjectStore(ADDRESS_PROFILES_STORE, { keyPath: "id" });
          store.createIndex("by_type", "type");
        }
      },
    });
  }
  return dbPromise;
}
