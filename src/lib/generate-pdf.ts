import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  InvoiceData,
  buildAddressLines,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  formatCurrency,
  formatDate,
  getInvoiceTheme,
} from "./invoice-types";

export function generateInvoicePDF(data: InvoiceData): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  const rightEdge = pageWidth - margin;
  const showLabels = data.settings.showAddressLabels;

  // Colors from theme
  const theme = getInvoiceTheme(data.settings);
  const dark = theme.text;
  const muted = theme.muted;
  const headerBg = theme.headerBg;

  // Create a very light tint of the primary color (mix with white at ~8%)
  function lightTint(hex: string, amount = 0.08): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const tr = Math.round(r + (255 - r) * (1 - amount));
    const tg = Math.round(g + (255 - g) * (1 - amount));
    const tb = Math.round(b + (255 - b) * (1 - amount));
    return `#${tr.toString(16).padStart(2, "0")}${tg.toString(16).padStart(2, "0")}${tb.toString(16).padStart(2, "0")}`;
  }
  const accentBg = lightTint(theme.primary);
  const accentBorder = lightTint(theme.primary, 0.2);

  // Helper: check if we need a new page
  function ensureSpace(needed: number, currentY: number): number {
    if (currentY + needed > pageHeight - margin) {
      doc.addPage();
      return margin + 20;
    }
    return currentY;
  }

  // Helper: draw address lines (with or without labels)
  function drawAddress(
    lines: Array<{ label: string; value: string }>,
    x: number,
    startY: number
  ): number {
    let ay = startY;
    doc.setFontSize(9);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isName = i === 0;
      if (line.label) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(muted);
        const labelText = line.label + ": ";
        doc.text(labelText, x, ay);
        const labelW = doc.getTextWidth(labelText);
        doc.setFont("helvetica", isName ? "bold" : "normal");
        doc.setTextColor(dark);
        doc.text(line.value, x + labelW, ay);
      } else {
        doc.setFont("helvetica", isName ? "bold" : "normal");
        doc.setTextColor(isName ? dark : muted);
        doc.text(line.value, x, ay);
      }
      ay += 13;
    }
    return ay;
  }

  let y = margin;

  // ── Logo + INVOICE title ──
  if (data.logo) {
    try {
      const logoHeight = 50;
      const img = new Image();
      img.src = data.logo;
      const aspect = img.width / img.height || 1;
      const logoWidth = logoHeight * aspect;
      doc.addImage(data.logo, "PNG", margin, y, logoWidth, logoHeight);
    } catch {
      // Skip logo if it fails to load
    }
  }

  y += 32;
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(theme.primary);
  doc.text("INVOICE", rightEdge, y, { align: "right" });

  if (data.logo) y += 24;

  // ── From + Bill To (left) | Metadata (right) ──
  y += 32;
  const sectionStartY = y;

  // From
  const colWidth = Math.floor(contentWidth / 3);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(dark);
  doc.text("From:", margin, y);
  const fromLines = buildAddressLines(data.from, showLabels);
  const leftY = drawAddress(fromLines, margin, y + 14);

  // Bill To
  const billX = margin + colWidth;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(dark);
  doc.text("Bill To:", billX, sectionStartY);
  const billLines = buildAddressLines(data.bill_to, showLabels);
  const billEndY = drawAddress(billLines, billX, sectionStartY + 14);

  // Metadata (right)
  const metaLabelX = margin + colWidth * 2;
  let metaY = sectionStartY;
  doc.setFontSize(9);
  doc.setTextColor(dark);

  if (data.invoice_metadata.invoice_number) {
    doc.setFont("helvetica", "bold");
    doc.text("Invoice #:", metaLabelX, metaY);
    doc.setFont("helvetica", "normal");
    doc.text(data.invoice_metadata.invoice_number, rightEdge, metaY, {
      align: "right",
    });
    metaY += 16;
  }
  if (data.invoice_metadata.date) {
    doc.setFont("helvetica", "bold");
    doc.text("Date:", metaLabelX, metaY);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(data.invoice_metadata.date), rightEdge, metaY, {
      align: "right",
    });
    metaY += 16;
  }
  if (data.invoice_metadata.due_date) {
    doc.setFont("helvetica", "bold");
    doc.text("Due Date:", metaLabelX, metaY);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(data.invoice_metadata.due_date), rightEdge, metaY, {
      align: "right",
    });
    metaY += 16;
  }

  y = Math.max(leftY, billEndY, metaY) + 14;

  // ── Balance Due ──
  y = ensureSpace(40, y);
  const total = calculateTotal(data.items, data.tax.rate);
  const balanceText = formatCurrency(total, data.currency);
  const boxW = 210;
  const boxX = rightEdge - boxW;

  doc.setFillColor("#f5f5f5");
  doc.setDrawColor("#e0e0e0");
  doc.roundedRect(boxX, y - 2, boxW, 24, 3, 3, "FD");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(dark);
  doc.text("Balance Due:", boxX + 8, y + 14);
  doc.text(balanceText, boxX + boxW - 8, y + 14, { align: "right" });

  // ── Items Table ──
  y += 40;
  y = ensureSpace(60, y);

  const tableItems = data.items
    .filter((item) => item.description || item.rate > 0)
    .map((item) => [
      item.description || "",
      String(item.quantity),
      formatCurrency(item.rate, data.currency),
      formatCurrency(item.amount, data.currency),
    ]);

  if (tableItems.length === 0) {
    tableItems.push([
      "",
      "0",
      formatCurrency(0, data.currency),
      formatCurrency(0, data.currency),
    ]);
  }

  autoTable(doc, {
    startY: y,
    head: [["Item", "Quantity", "Rate", "Amount"]],
    body: tableItems,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: headerBg,
      textColor: theme.headerText,
      fontStyle: "bold",
      fontSize: 10,
      cellPadding: 8,
    },
    bodyStyles: {
      textColor: dark,
      fontSize: 9,
      cellPadding: 8,
    },
    columnStyles: {
      0: { halign: "left", cellWidth: contentWidth * 0.5 },
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
    theme: "plain",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 16;

  // ── Totals ──
  y = ensureSpace(60, y);
  const subtotal = calculateSubtotal(data.items);
  const tax = calculateTax(data.items, data.tax.rate);
  const totalsX = rightEdge - 200;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(dark);
  doc.text("Subtotal:", totalsX, y);
  doc.setFont("helvetica", "normal");
  doc.text(formatCurrency(subtotal, data.currency), rightEdge, y, {
    align: "right",
  });
  y += 16;

  doc.setFont("helvetica", "bold");
  doc.text(data.tax.description || `Tax (${data.tax.rate}%):`, totalsX, y);
  doc.setFont("helvetica", "normal");
  doc.text(formatCurrency(tax, data.currency), rightEdge, y, {
    align: "right",
  });
  y += 4;

  doc.setDrawColor(dark);
  doc.setLineWidth(0.8);
  doc.line(totalsX, y, rightEdge, y);
  y += 14;

  doc.setFont("helvetica", "bold");
  doc.text("Total:", totalsX, y);
  doc.text(formatCurrency(total, data.currency), rightEdge, y, {
    align: "right",
  });

  // ── Payment Details ──
  y += 32;
  if (data.payment_details.length > 0) {
    y = ensureSpace(40, y);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(dark);
    doc.text("Payment Details:", margin, y);
    y += 20;

    for (const payment of data.payment_details) {
      const lines: Array<{ label: string; value: string }> = [];

      if (payment.type === "bank") {
        lines.push({
          label: `Bank Transfer (${payment.account_currency})`,
          value: "",
        });
        if (payment.account_holder)
          lines.push({ label: "Beneficiary", value: payment.account_holder });
        if (payment.bank_name)
          lines.push({ label: "Bank", value: payment.bank_name });
        if (payment.account_number)
          lines.push({ label: "Account", value: payment.account_number });
        if (payment.routing_number)
          lines.push({ label: "Routing", value: payment.routing_number });
        if (payment.account_type)
          lines.push({ label: "Type", value: payment.account_type });
        if (payment.swift)
          lines.push({ label: "SWIFT", value: payment.swift });
        if (payment.iban)
          lines.push({ label: "IBAN", value: payment.iban });
        if (payment.bank_address)
          lines.push({ label: "Bank Address", value: payment.bank_address });
      } else {
        lines.push({ label: "Cryptocurrency", value: "" });
        if (payment.network)
          lines.push({ label: "Network", value: payment.network });
        if (payment.address)
          lines.push({ label: "Wallet", value: payment.address });
        if (payment.currency)
          lines.push({ label: "Currency", value: payment.currency });
        if (payment.memo)
          lines.push({ label: "Memo / Tag", value: payment.memo });
      }

      const boxPadding = 10;
      const lineSpacing = 14;
      const boxHeight = lines.length * lineSpacing + boxPadding * 2;
      y = ensureSpace(boxHeight + 10, y);
      const boxStartY = y;

      doc.setFillColor(accentBg);
      doc.setDrawColor(accentBorder);
      doc.roundedRect(margin, boxStartY, contentWidth, boxHeight, 3, 3, "FD");

      doc.setFontSize(9);
      doc.setTextColor(dark);

      let tempY = boxStartY + boxPadding + 10;
      for (const line of lines) {
        if (line.value) {
          doc.setFont("helvetica", "bold");
          const labelText = line.label + ": ";
          doc.text(labelText, margin + 10, tempY);
          const labelW = doc.getTextWidth(labelText);
          doc.setFont("helvetica", "normal");
          doc.text(line.value, margin + 10 + labelW, tempY);
        } else {
          doc.setFont("helvetica", "bold");
          doc.text(line.label + ":", margin + 10, tempY);
        }
        tempY += lineSpacing;
      }

      y = boxStartY + boxHeight + 10;
    }
  }

  // ── Notes ──
  if (data.notes) {
    y += 12;
    y = ensureSpace(40, y);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(dark);
    doc.text("Notes:", margin, y);
    y += 16;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(muted);
    const noteLines = doc.splitTextToSize(data.notes, contentWidth);
    doc.text(noteLines, margin, y);
  }

  return doc;
}
