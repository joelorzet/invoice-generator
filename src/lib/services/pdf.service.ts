import type { InvoiceData } from "../invoice-types";
import type { IPdfService } from "../interfaces";
import { generateInvoicePDF } from "../generate-pdf";

export class PdfService implements IPdfService {
  generate(data: InvoiceData): Blob {
    const doc = generateInvoicePDF(data);
    return doc.output("blob");
  }

  download(data: InvoiceData, filename?: string): void {
    const name =
      filename ||
      `invoice-${data.invoice_metadata.invoice_number || "draft"}.pdf`;
    const doc = generateInvoicePDF(data);
    doc.save(name);
  }
}
