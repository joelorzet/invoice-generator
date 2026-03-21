import type { InvoiceData } from "../invoice-types";

export interface IPdfService {
  generate(data: InvoiceData): Blob;
  download(data: InvoiceData, filename?: string): void;
}
