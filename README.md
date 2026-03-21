# Invoice Generator

A free, privacy-first invoice generator that runs entirely in the browser. Fill in your details, add line items, and download a professional PDF invoice -- no signup required and your data never leaves your device.

## Features

- **Multi-currency support** -- USD, EUR, GBP, ARS, BRL, CAD, AUD, JPY, CHF, MXN
- **Tax presets** -- built-in tax presets per currency with custom rate and label options
- **Bank payment details** -- account holder, bank name, SWIFT, IBAN, routing number, and more
- **Crypto payment details** -- network, wallet address, and memo fields
- **PDF generation** -- one-click download of clean, itemized PDF invoices via jsPDF
- **Live preview** -- real-time invoice preview alongside the form
- **Local storage** -- optional IndexedDB persistence for invoice history (consent-based)
- **Invoice history** -- browse, reload, and re-download previously saved invoices
- **Auto-incrementing invoice numbers** -- sequential numbering carried across new invoices
- **Dark mode** -- full light/dark theme support
- **Address labels** -- optional "From" and "Bill To" labels on the PDF
- **Notes field** -- add custom notes or payment instructions

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- [React](https://react.dev) 19
- [TypeScript](https://www.typescriptlang.org) 5
- [Tailwind CSS](https://tailwindcss.com) 4
- [shadcn/ui](https://ui.shadcn.com) components
- [jsPDF](https://github.com/parallax/jsPDF) + jspdf-autotable for PDF generation
- [idb](https://github.com/jakearchibald/idb) (IndexedDB wrapper) for local persistence
- [Sileo](https://www.npmjs.com/package/sileo) for toast notifications

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for production

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## License

This project is licensed under the [GPL-3.0 License](https://www.gnu.org/licenses/gpl-3.0.en.html).
