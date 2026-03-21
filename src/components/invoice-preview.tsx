"use client";

import {
  InvoiceData,
  buildAddressLines,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  formatCurrency,
  formatDate,
} from "@/lib/invoice-types";
import { AddressBlock } from "@/components/invoice/address-block";
import { PaymentDetailsDisplay } from "@/components/invoice/payment-display";

export function InvoicePreview({ data }: { data: InvoiceData }) {
  const subtotal = calculateSubtotal(data.items);
  const tax = calculateTax(data.items, data.tax.rate);
  const total = calculateTotal(data.items, data.tax.rate);
  const showLabels = data.settings.showAddressLabels;
  const hasItems = data.items.some((item) => item.description || item.rate > 0);

  const fromLines = buildAddressLines(data.from, showLabels);
  const billLines = buildAddressLines(data.bill_to, showLabels);

  return (
    <div className="bg-white rounded-md shadow-sm p-6 text-gray-700 font-sans overflow-y-auto">
      {/* Logo + INVOICE title */}
      <div className="flex justify-between items-start mb-4">
        {data.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.logo} alt="Logo" className="h-10 w-auto object-contain" />
        ) : (
          <div />
        )}
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
          INVOICE
        </h2>
      </div>

      {/* From + Bill To (left) | Metadata (right) */}
      <div className="flex justify-between items-start mb-5 gap-4">
        <div className="flex gap-6 flex-1 min-w-0">
          <AddressBlock title="From" lines={fromLines} />
          <AddressBlock title="Bill To" lines={billLines} />
        </div>

        <div className="text-right text-[10px] text-gray-500 space-y-0.5 shrink-0">
          {data.invoice_metadata.invoice_number && (
            <div className="flex justify-end gap-1.5">
              <span className="font-semibold text-gray-700">Invoice #:</span>
              <span>{data.invoice_metadata.invoice_number}</span>
            </div>
          )}
          {data.invoice_metadata.date && (
            <div className="flex justify-end gap-1.5">
              <span className="font-semibold text-gray-700">Date:</span>
              <span>{formatDate(data.invoice_metadata.date)}</span>
            </div>
          )}
          {data.invoice_metadata.due_date && (
            <div className="flex justify-end gap-1.5">
              <span className="font-semibold text-gray-700">Due:</span>
              <span>{formatDate(data.invoice_metadata.due_date)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Balance Due */}
      <div className="flex justify-end mb-4">
        <div className="bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-[10px]">
          <span className="font-semibold text-gray-700">Balance Due: </span>
          <span className="font-bold text-gray-900">
            {formatCurrency(total, data.currency)}
          </span>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-[10px] mb-4">
        <thead>
          <tr className="bg-gray-700 text-white">
            <th className="text-left py-1.5 px-2 font-semibold">Item</th>
            <th className="text-right py-1.5 px-2 font-semibold">Qty</th>
            <th className="text-right py-1.5 px-2 font-semibold">Rate</th>
            <th className="text-right py-1.5 px-2 font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {hasItems ? (
            data.items
              .filter((item) => item.description || item.rate > 0)
              .map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-1.5 px-2 text-gray-600">
                    {item.description || "Untitled"}
                  </td>
                  <td className="py-1.5 px-2 text-right text-gray-600">
                    {item.quantity}
                  </td>
                  <td className="py-1.5 px-2 text-right text-gray-600">
                    {formatCurrency(item.rate, data.currency)}
                  </td>
                  <td className="py-1.5 px-2 text-right text-gray-600">
                    {formatCurrency(item.amount, data.currency)}
                  </td>
                </tr>
              ))
          ) : (
            <tr className="border-b border-gray-100">
              <td className="py-1.5 px-2 text-gray-400 italic" colSpan={4}>
                Add line items to see them here
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-4">
        <div className="w-44 space-y-0.5 text-[10px]">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Subtotal:</span>
            <span>{formatCurrency(subtotal, data.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">
              {data.tax.description}:
            </span>
            <span>{formatCurrency(tax, data.currency)}</span>
          </div>
          <div className="border-t border-gray-800 pt-0.5 flex justify-between font-bold text-gray-900">
            <span>Total:</span>
            <span>{formatCurrency(total, data.currency)}</span>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <PaymentDetailsDisplay payments={data.payment_details} className="mb-3" />

      {/* Notes */}
      {data.notes && (
        <div className="text-[9px] text-gray-500">
          <p className="font-semibold text-gray-700 mb-0.5">Notes:</p>
          <p className="whitespace-pre-wrap">{data.notes}</p>
        </div>
      )}
    </div>
  );
}
