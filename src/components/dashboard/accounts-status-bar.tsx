"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type PlainBill = {
  id: string;
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "APPROVED_BY_SUPERVISOR"
    | "APPROVED_BY_ACCOUNTS"
    | "APPROVED_BY_MANAGEMENT"
    | "REJECTED_BY_SUPERVISOR"
    | "REJECTED_BY_ACCOUNTS"
    | "REJECTED_BY_MANAGEMENT"
    | "PAID";
};

export type AccountsFilter =
  | "all"
  | "pendingReview"      // APPROVED_BY_SUPERVISOR (accounts must review)
  | "waitingPayment"     // APPROVED_BY_MANAGEMENT (accounts must pay)
  | "paid"               // PAID
  | "rejected";          // REJECTED_BY_ACCOUNTS

export function AccountsStatusBar({
  bills,
  active,
  onChange,
  className,
}: {
  bills: PlainBill[];
  active: AccountsFilter;
  onChange: (f: AccountsFilter) => void;
  className?: string;
}) {
  const pendingReview = bills.filter(b => b.status === "APPROVED_BY_SUPERVISOR").length;
  const waitingPayment = bills.filter(b => b.status === "APPROVED_BY_MANAGEMENT").length;
  const paid = bills.filter(b => b.status === "PAID").length;
  const rejected = bills.filter(b => b.status === "REJECTED_BY_ACCOUNTS").length;

  const items: Array<{
    key: AccountsFilter;
    label: string;
    count?: number;
    tone?: "neutral" | "info" | "success" | "danger";
  }> = [
    { key: "all",            label: "All",               tone: "neutral" },
    { key: "pendingReview",  label: "Pending review",    count: pendingReview,  tone: "info" },
    { key: "waitingPayment", label: "Waiting payment",   count: waitingPayment, tone: "info" },
    { key: "paid",           label: "Paid",              count: paid,           tone: "success" },
    { key: "rejected",       label: "Rejected",          count: rejected,       tone: "danger" },
  ];

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onChange(it.key)}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
            active === it.key ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
          )}
        >
          <span>{it.label}</span>
          {typeof it.count === "number" && (
            <span
              className={cn(
                "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                it.tone === "success" && "bg-emerald-100 text-emerald-700",
                it.tone === "danger" && "bg-red-100 text-red-700",
                it.tone === "info" && "bg-blue-100 text-blue-700",
                it.tone === "neutral" && "bg-muted text-foreground"
              )}
            >
              {it.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
