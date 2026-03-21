"use client";

import type { AddressLine } from "@/lib/invoice-types";

export function AddressBlock({
  title,
  lines,
}: {
  title: string;
  lines: AddressLine[];
}) {
  return (
    <div className="text-[10px] text-gray-500 space-y-px">
      <p className="font-semibold text-gray-800 mb-0.5">{title}:</p>
      {lines.length === 0 ? (
        <p className="text-gray-400 italic">No details yet</p>
      ) : (
        lines.map((line, i) =>
          line.label ? (
            <p key={i}>
              <span className="text-gray-400">{line.label}: </span>
              <span className={i === 0 ? "font-bold text-gray-800" : "text-gray-600"}>{line.value}</span>
            </p>
          ) : (
            <p key={i} className={i === 0 ? "font-bold text-gray-800" : "text-gray-600"}>
              {line.value}
            </p>
          )
        )
      )}
    </div>
  );
}
