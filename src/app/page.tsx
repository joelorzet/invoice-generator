import { InvoiceForm } from "@/components/invoice-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { FileText, Zap, Shield, DollarSign, ArrowRight } from "lucide-react";

const features = [
  {
    icon: DollarSign,
    title: "100% Free",
    description:
      "No hidden fees, no premium tiers. Generate unlimited invoices at zero cost.",
  },
  {
    icon: Shield,
    title: "No Signup Required",
    description:
      "Start creating invoices instantly. Your data stays in your browser.",
  },
  {
    icon: Zap,
    title: "Instant PDF",
    description:
      "Generate professional PDF invoices in one click, ready to send.",
  },
  {
    icon: FileText,
    title: "Professional Format",
    description:
      "Clean, business-ready invoices with itemized billing and payment details.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <a
            href="https://joelorzet.dev"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText className="size-5 text-primary" />
            <span className="font-bold text-foreground text-lg">
              Joel<span className="text-primary">Orzet</span>
            </span>
          </a>

          <div className="flex items-center gap-2">
            <a
              href="https://joelorzet.dev"
              className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-3 py-1.5"
              target="_blank"
            rel="noopener noreferrer"
            >
              Portfolio
            </a>
            <ThemeToggle />
            <a
              href="#generator"
              className="text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 px-4 py-2 rounded-md transition-all duration-200 cursor-pointer"
            >
              Create Invoice
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-6">
            <Zap className="size-3" />
            Free forever. No signup.
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-tight max-w-3xl mx-auto">
            Create professional invoices in{" "}
            <span className="text-primary">seconds</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Fill in your details, add line items, and download a polished PDF
            invoice. Everything runs in your browser, and your data never
            leaves your device.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#generator"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:opacity-90 font-semibold px-8 py-3.5 rounded-md text-base transition-all duration-200 cursor-pointer"
            >
              <FileText className="size-5" />
              Start Generating
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 font-semibold px-8 py-3.5 rounded-md text-base border border-border transition-all duration-200 cursor-pointer"
            >
              Learn More
            </a>
          </div>
        </div>
        {/* Decorative gradient blobs */}
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Everything you need, nothing you don&apos;t
            </h2>
            <div className="w-20 h-1 mx-auto bg-primary mt-4 rounded-full" />
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              A simple, powerful invoice generator with no strings attached.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-xl border border-border bg-card backdrop-blur-sm shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
              >
                <div className="size-10 rounded-md bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors duration-300">
                  <feature.icon className="size-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Generator */}
      <section id="generator" className="py-16 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Generate Your Invoice
            </h2>
            <div className="w-20 h-1 mx-auto bg-primary mt-4 rounded-full" />
            <p className="mt-4 text-muted-foreground">
              Fill in the details below and download your invoice as PDF.
            </p>
          </div>
          <InvoiceForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <span className="font-semibold text-foreground">
                Invoice Generator
              </span>
              <span className="text-muted-foreground text-sm">
                by{" "}
                <a
                  href="https://joelorzet.dev"
                  className="text-primary hover:underline cursor-pointer"
                  target="_blank"
            rel="noopener noreferrer"
                >
                  Joel Orzet
                </a>
              </span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Your data stays in your browser. We never store or transmit your
              information.
            </p>
            <a
              href="https://joelorzet.dev"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline cursor-pointer"
              target="_blank"
            rel="noopener noreferrer"
            >
              joelorzet.dev
              <ArrowRight className="size-3" />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
