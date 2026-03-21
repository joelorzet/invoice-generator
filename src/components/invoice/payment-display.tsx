"use client";

import { PaymentDetail, BankPayment, CryptoPayment } from "@/lib/invoice-types";

interface PaymentFieldProps {
  label: string;
  value: string | undefined;
}

function PaymentField({ label, value }: PaymentFieldProps) {
  if (!value) return null;
  return (
    <p>
      <span className="font-semibold">{label}: </span>
      {value}
    </p>
  );
}

function BankDetails({ payment }: { payment: BankPayment }) {
  return (
    <>
      <p className="font-semibold text-gray-700">
        Bank Transfer ({payment.account_currency})
      </p>
      <PaymentField label="Beneficiary" value={payment.account_holder} />
      <PaymentField label="Bank" value={payment.bank_name} />
      <PaymentField label="Account" value={payment.account_number} />
      <PaymentField label="Routing" value={payment.routing_number} />
      <PaymentField label="Type" value={payment.account_type} />
      <PaymentField label="SWIFT" value={payment.swift} />
      <PaymentField label="IBAN" value={payment.iban} />
      <PaymentField label="Bank Address" value={payment.bank_address} />
    </>
  );
}

function CryptoDetails({ payment }: { payment: CryptoPayment }) {
  return (
    <>
      <p className="font-semibold text-gray-700">Cryptocurrency</p>
      <PaymentField label="Network" value={payment.network} />
      {payment.address && (
        <p className="break-all">
          <span className="font-semibold">Wallet: </span>
          {payment.address}
        </p>
      )}
      <PaymentField label="Currency" value={payment.currency} />
      <PaymentField label="Memo / Tag" value={payment.memo} />
    </>
  );
}

export function PaymentDetailsDisplay({
  payments,
  accentColor,
  className = "",
}: {
  payments: PaymentDetail[];
  accentColor?: string;
  className?: string;
}) {
  if (payments.length === 0) return null;

  const boxStyle = accentColor
    ? { backgroundColor: `${accentColor}0a`, borderColor: `${accentColor}25` }
    : undefined;

  return (
    <div className={className}>
      <p className="text-[10px] font-semibold text-gray-800 mb-1.5">
        Payment Details:
      </p>
      {payments.map((payment, i) => (
        <div
          key={i}
          className="rounded border px-2.5 py-1.5 mb-1.5 text-[9px] text-gray-600 space-y-px"
          style={boxStyle || { backgroundColor: "#fafafa", borderColor: "#e5e7eb" }}
        >
          {payment.type === "bank" ? (
            <BankDetails payment={payment} />
          ) : (
            <CryptoDetails payment={payment} />
          )}
        </div>
      ))}
    </div>
  );
}
