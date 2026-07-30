// src/components/bills/bills-drive-view.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, FileText, Hash, UserRound } from "lucide-react";

type PlainUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  supervisorId: string | null;
  employeeCode: string | null; // ⬅️ added
};

type PlainBillItem = {
  id: string;
  billId: string;
  date: string; // ISO
  from: string;
  to: string;
  transport: string | null;
  purpose: string;
  amount: number;
};

type Status =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED_BY_SUPERVISOR"
  | "APPROVED_BY_ACCOUNTS"
  | "APPROVED_BY_MANAGEMENT"
  | "REJECTED_BY_SUPERVISOR"
  | "REJECTED_BY_ACCOUNTS"
  | "REJECTED_BY_MANAGEMENT"
  | "PAID";

type PlainBill = {
  id: string;
  companyName: string;
  companyAddress: string;
  employeeId: string;
  employee: PlainUser | null;
  amount: number;
  amountInWords: string;
  status: Status;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  items: PlainBillItem[];
};

interface Props {
  bills: PlainBill[];
  users: PlainUser[];
  initialMonth: string;
  initialWeek?: number;
  viewerRole: string;
}

const statusOptions: Array<{ value: "ALL" | Status; label: string }> = [
  { value: "ALL", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "APPROVED_BY_SUPERVISOR", label: "Approved by Supervisor" },
  { value: "APPROVED_BY_ACCOUNTS", label: "Approved by Accounts" },
  { value: "APPROVED_BY_MANAGEMENT", label: "Approved by Management" },
  { value: "REJECTED_BY_SUPERVISOR", label: "Rejected by Supervisor" },
  { value: "REJECTED_BY_ACCOUNTS", label: "Rejected by Accounts" },
  { value: "REJECTED_BY_MANAGEMENT", label: "Rejected by Management" },
  { value: "PAID", label: "Paid" },
];

function formatBDT(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "BDT" }).format(n);
}

function formatDateISO(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function StatusPill({ status }: { status: Status }) {
  const color =
    status === "DRAFT"
      ? "bg-slate-100 text-slate-700"
      : status === "SUBMITTED"
      ? "bg-blue-100 text-blue-700"
      : status.startsWith("APPROVED")
      ? "bg-emerald-100 text-emerald-700"
      : status.startsWith("REJECTED")
      ? "bg-red-100 text-red-700"
      : "bg-emerald-600/10 text-emerald-700";

  const label = status.replaceAll("_", " ").toLowerCase();
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
}

function decodeItemPurpose(value: string) {
  try {
    const parsed = JSON.parse(value || "{}");
    return {
      incident: String(parsed.incident || ""),
      purpose: String(parsed.purpose || ""),
      vehicle: String(parsed.vehicle || ""),
    };
  } catch {
    return { incident: "", purpose: value || "", vehicle: "" };
  }
}

function ExpandedBillDetails({ bill, ownerName }: { bill: PlainBill; ownerName: string }) {
  return (
    <div className="border-t border-violet-100 bg-slate-50/80 p-4 sm:p-6">
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            <UserRound className="h-4 w-4" /> Employee
          </div>
          <p className="font-semibold text-slate-900">{ownerName}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            <Hash className="h-4 w-4" /> Employee ID
          </div>
          <p className="font-mono font-semibold text-slate-900">{bill.employee?.employeeCode || "—"}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            <FileText className="h-4 w-4" /> Bill reference
          </div>
          <p className="font-mono font-semibold text-slate-900">{bill.id.slice(-4).toUpperCase()}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100/80 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Incident</th>
              <th className="px-4 py-3 text-left">Purpose</th>
              <th className="px-4 py-3 text-left">Vehicle</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, index) => {
              const detail = decodeItemPurpose(item.purpose);
              const vehicle = detail.vehicle || (item.transport === "__BILL5__" ? "" : item.transport) || "—";
              return (
                <tr key={item.id || index} className="border-t border-slate-100 transition-colors hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDateISO(item.date)}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{detail.incident || "—"}</td>
                  <td className="max-w-md px-4 py-3 text-slate-700">{detail.purpose || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{vehicle}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-900">{formatBDT(Number(item.amount))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Amount in words</p>
          <p className="mt-1 text-sm font-medium text-slate-800">{bill.amountInWords}</p>
        </div>
        <Button asChild className="gap-2">
          <Link href={`/bills/${bill.id}`}>View full bill <ArrowUpRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}

export function BillsDriveView({ bills, users, initialMonth, initialWeek, viewerRole }: Props) {
  const [status, setStatus] = useState<"ALL" | Status>("ALL");
  const [openId, setOpenId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hideCompanyAddress = viewerRole === "employee" || viewerRole === "supervisor";

  const updatePeriod = (month: string, week?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (month) params.set("month", month);
    else params.delete("month");
    if (month && week) params.set("week", week);
    else params.delete("week");
    router.push(`${pathname}${params.size ? `?${params.toString()}` : ""}`);
  };

  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    users.forEach((u) => m.set(u.id, u.name));
    return m;
  }, [users]);

  const filtered = useMemo(() => {
    return bills.filter((b) => {
      if (status !== "ALL" && b.status !== status) return false;
      return true;
    });
  }, [bills, status]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Bills</h1>

        <div className="grid gap-2 sm:grid-cols-[180px,150px,auto]">
          <input
            type="month"
            value={initialMonth}
            onChange={(e) => updatePeriod(e.target.value)}
            aria-label="Filter by month"
            className="h-9 rounded-md border bg-background px-2 text-sm"
          />
          <select
            value={initialWeek ?? ""}
            disabled={!initialMonth}
            onChange={(e) => updatePeriod(initialMonth, e.target.value)}
            aria-label="Filter by week of month"
            className="h-9 rounded-md border bg-background px-2 text-sm disabled:opacity-50"
          >
            <option value="">All weeks</option>
            <option value="1">Week 1 (1–7)</option>
            <option value="2">Week 2 (8–14)</option>
            <option value="3">Week 3 (15–21)</option>
            <option value="4">Week 4 (22–28)</option>
            <option value="5">Week 5 (29–end)</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="h-9 rounded-md border bg-background px-2 text-sm"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Header row */}
      <div className="rounded-lg border overflow-hidden">
        <div className="grid grid-cols-12 bg-muted/40 px-3 py-2 text-xs font-semibold">
          <div className="col-span-4">Name</div>
          <div className="col-span-3">Owner</div>
          <div className="col-span-1">Employee Code</div> {/* ⬅️ changed */}
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Last updated</div>
          <div className="col-span-1 text-right">Total</div>
        </div>

        {/* Rows */}
        <ul>
          {filtered.map((b) => {
            const isOpen = openId === b.id;
            return (
              <li key={b.id} className="border-t">
                <button
                  onClick={() => setOpenId(isOpen ? null : b.id)}
                  className="grid grid-cols-12 w-full items-center px-3 py-2 text-sm text-left hover:bg-muted/30"
                >
                  <div className="col-span-4 truncate">
                    <span className="font-medium">{b.companyName}</span>
                    {!hideCompanyAddress && (
                      <span className="text-muted-foreground"> — {b.companyAddress}</span>
                    )}
                  </div>
                  <div className="col-span-3 truncate">
                    {b.employee?.name ?? nameById.get(b.employeeId) ?? "—"}
                  </div>
                  <div className="col-span-1 truncate">
                    <span className="font-mono text-xs">
                      {b.employee?.employeeCode ?? "—"} {/* ⬅️ show code */}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <StatusPill status={b.status} />
                  </div>
                  <div className="col-span-1">{formatDateISO(b.updatedAt)}</div>
                  <div className="col-span-1 text-right">{formatBDT(b.amount)}</div>
                </button>

                {isOpen && (
                  <ExpandedBillDetails
                    bill={b}
                    ownerName={b.employee?.name ?? nameById.get(b.employeeId) ?? "—"}
                  />
                )}

                {false && isOpen && (
                  <div className="bg-white px-4 py-4">
                    <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Employee</p>
                        <p className="font-medium">
                          {b.employee?.name ?? nameById.get(b.employeeId) ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Employee Code</p>
                        <p className="font-mono text-xs">{b.employee?.employeeCode ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Bill ID</p>
                        <p className="font-mono text-xs">{b.id}</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded border">
                      <table className="min-w-full text-sm">
                        <thead className="bg-muted/40">
                          <tr>
                            <th className="px-3 py-2 text-left">Date</th>
                            <th className="px-3 py-2 text-left">From</th>
                            <th className="px-3 py-2 text-left">To</th>
                            <th className="px-3 py-2 text-left">Transport</th>
                            <th className="px-3 py-2 text-left">Purpose</th>
                            <th className="px-3 py-2 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {b.items.map((it, i) => (
                            <tr key={it.id ?? i} className="border-t">
                              <td className="px-3 py-2">{formatDateISO(it.date)}</td>
                              <td className="px-3 py-2">{it.from}</td>
                              <td className="px-3 py-2">{it.to}</td>
                              <td className="px-3 py-2">{it.transport || "—"}</td>
                              <td className="px-3 py-2">{it.purpose}</td>
                              <td className="px-3 py-2 text-right">{formatBDT(Number(it.amount))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm">
                        <p className="font-medium">Amount in words</p>
                        <p className="text-muted-foreground">{b.amountInWords}</p>
                      </div>
                      <Link href={`/bills/${b.id}`}>
                        <Button className="bg-black text-white hover:opacity-90">Open</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </li>
            );
          })}

          {filtered.length === 0 && (
            <li className="py-10 text-center text-sm text-muted-foreground">No bills found.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
