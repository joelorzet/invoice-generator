import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SileoToaster } from "@/components/sileo-toaster";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const siteUrl = "https://invoice.joelorzet.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Free Invoice Generator | Create Professional PDF Invoices Online",
    template: "%s | Invoice Generator by Joel Orzet",
  },
  description:
    "Generate professional PDF invoices for free. No signup, no fees. Fill in your details, add line items, and download instantly. Your data never leaves your browser. Built by Joel Orzet.",
  keywords: [
    "invoice generator",
    "free invoice generator",
    "PDF invoice",
    "create invoice online",
    "invoice maker",
    "professional invoice",
    "invoice template",
    "free invoice tool",
    "online invoice creator",
    "invoice PDF download",
    "no signup invoice",
    "browser invoice generator",
  ],
  authors: [{ name: "Joel Orzet", url: "https://joelorzet.dev" }],
  creator: "Joel Orzet",
  publisher: "Joel Orzet",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Invoice Generator by Joel Orzet",
    title: "Free Invoice Generator | Create Professional PDF Invoices Online",
    description:
      "Generate professional PDF invoices for free. No signup, no fees. Your data stays private in your browser.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Invoice Generator - Create Professional PDF Invoices for Free",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Invoice Generator | Create Professional PDF Invoices Online",
    description:
      "Generate professional PDF invoices for free. No signup, no fees. Your data stays private in your browser.",
    images: ["/og-image.png"],
    creator: "@joelorzet",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Invoice Generator",
    url: siteUrl,
    description:
      "Free online invoice generator. Create professional PDF invoices instantly without signup.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      name: "Joel Orzet",
      url: "https://joelorzet.dev",
      email: "info@joelorzet.dev",
      jobTitle: "Full Stack Developer & Blockchain Engineer",
      sameAs: [
        "https://linkedin.com/in/joelorzet",
        "https://github.com/joelorzet",
        "https://x.com/joelorzet",
      ],
    },
    aggregateRating: undefined,
  };

  return (
    <html lang="en" className={`${jakarta.variable} h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SileoToaster />
      </body>
    </html>
  );
}
