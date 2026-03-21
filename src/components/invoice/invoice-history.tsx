"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  getInvoiceService,
  type SavedInvoice,
} from "@/lib/services";
import { formatCurrency, formatDate } from "@/lib/invoice-types";
import {
  Trash2,
  Plus,
  History,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";

const PAGE_SIZE_OPTIONS = [5, 10, 15];

interface InvoiceHistoryProps {
  onLoad: (invoice: SavedInvoice) => void;
  onDownload: (invoice: SavedInvoice) => void;
  onNew: () => void;
  refreshKey: number;
}

export function InvoiceHistory({
  onLoad,
  onDownload,
  onNew,
  refreshKey,
}: InvoiceHistoryProps) {
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<SavedInvoice | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const service = useRef<ReturnType<typeof getInvoiceService> | null>(null);

  if (!service.current && typeof window !== "undefined") {
    service.current = getInvoiceService();
  }

  const refresh = useCallback(async () => {
    if (!service.current) return;
    const list = await service.current.getAll();
    setInvoices(list);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget || !service.current) return;
    await service.current.delete(deleteTarget.id);
    setDeleteTarget(null);
    refresh();
  }, [deleteTarget, refresh]);

  const totalPages = Math.ceil(invoices.length / pageSize);
  const paged = useMemo(
    () => invoices.slice(page * pageSize, (page + 1) * pageSize),
    [invoices, page, pageSize]
  );

  // Reset to first page when page size changes or list shrinks
  useEffect(() => {
    if (page >= totalPages && totalPages > 0) setPage(totalPages - 1);
  }, [page, totalPages]);

  if (invoices.length === 0) return null;

  const start = page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, invoices.length);

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <History className="size-4 text-primary" />
            Previous Invoices
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onNew}
            className="cursor-pointer"
          >
            <Plus className="size-4 mr-1" />
            New Invoice
          </Button>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60 text-muted-foreground text-xs">
                <th className="text-left font-medium px-4 py-2.5">
                  Invoice #
                </th>
                <th className="text-left font-medium px-4 py-2.5">Client</th>
                <th className="text-left font-medium px-4 py-2.5 hidden sm:table-cell">
                  Date
                </th>
                <th className="text-right font-medium px-4 py-2.5">Amount</th>
                <th className="w-20 px-2 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {paged.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-t border-border bg-card hover:bg-muted/40 transition-colors cursor-pointer group"
                  onClick={() => onLoad(inv)}
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {inv.invoice_number}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {inv.client_name || "No client"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {formatDate(inv.date)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">
                    {formatCurrency(inv.total, inv.currency)}
                  </td>
                  <td className="px-2 py-3 text-center">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload(inv);
                        }}
                        className="cursor-pointer text-muted-foreground hover:text-primary"
                        aria-label={`Download invoice ${inv.invoice_number}`}
                      >
                        <Download className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(inv);
                        }}
                        className="cursor-pointer text-muted-foreground hover:text-destructive"
                        aria-label={`Delete invoice ${inv.invoice_number}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Rows</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v) || 5);
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-7 w-16 text-xs cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem
                      key={n}
                      value={String(n)}
                      className="text-xs cursor-pointer"
                    >
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>
                {start}&ndash;{end} of {invoices.length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-sm gap-0 p-0 overflow-hidden"
        >
          <div className="p-6 pb-5 space-y-4">
            <DialogHeader className="gap-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="size-5 text-destructive" />
                </div>
                <DialogTitle className="text-base font-semibold">
                  Delete Invoice
                </DialogTitle>
              </div>
              <DialogDescription>
                Are you sure you want to delete invoice{" "}
                <strong>{deleteTarget?.invoice_number}</strong>? This cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex justify-end gap-2 border-t border-border bg-muted/50 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="cursor-pointer px-5"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="cursor-pointer px-5"
            >
              <Trash2 className="size-4 mr-1.5" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
