"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  Clock3,
  FileText,
  FilterX,
  Hash,
  Search,
  UserRound,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { departmentAccentClasses, departmentRowColor } from "@/lib/department-colors";
import {
  formatMonthLabel,
  getBillMonthKey,
  normalizeDepartment,
} from "@/lib/bill-analytics";

type PlainUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  supervisorId: string | null;
  employeeCode: string | null;
  department: string | null;
};

type PlainBillItem = {
  id: string;
  billId: string;
  date: string;
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
  createdAt: string;
  updatedAt: string;
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
  { value: "APPROVED_BY_ACCOUNTS", label: "Pending Management" },
  { value: "APPROVED_BY_MANAGEMENT", label: "Pending Payment" },
  { value: "REJECTED_BY_SUPERVISOR", label: "Rejected by Supervisor" },
  { value: "REJECTED_BY_ACCOUNTS", label: "Rejected by Accounts" },
  { value: "REJECTED_BY_MANAGEMENT", label: "Rejected by Management" },
  { value: "PAID", label: "Paid" },
];

const pendingStatuses: Status[] = [
  "SUBMITTED",
  "APPROVED_BY_SUPERVISOR",
  "APPROVED_BY_ACCOUNTS",
  "APPROVED_BY_MANAGEMENT",
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

function StatusPill({ status, compact = false }: { status: Status; compact?: boolean }) {
  const color =
    status === "DRAFT"
      ? "bg-slate-100 text-slate-700"
      : status === "SUBMITTED"
      ? "bg-blue-100 text-blue-700"
      : status === "APPROVED_BY_ACCOUNTS"
      ? "bg-amber-100 text-amber-800"
      : status === "APPROVED_BY_MANAGEMENT"
      ? "bg-cyan-100 text-cyan-800"
      : status.startsWith("APPROVED")
      ? "bg-emerald-100 text-emerald-700"
      : status.startsWith("REJECTED")
      ? "bg-red-100 text-red-700"
      : "bg-emerald-600/10 text-emerald-700";

  const label = status.replaceAll("_", " ").toLowerCase();
  return (
    <span className={`inline-flex items-center justify-center rounded-full font-medium ${compact ? "max-w-[92px] px-1.5 py-0.5 text-center text-[9px] leading-[11px]" : "px-2 py-0.5 text-xs"} ${color}`}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
}

function DepartmentPill({ department }: { department: string }) {
  const accent = departmentAccentClasses(department);
  return (
    <span className={`inline-flex max-w-full items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${accent.badge}`}>
      <span className={`h-2 w-2 shrink-0 rounded-full ${accent.dot}`} />
      <span className="truncate">{department}</span>
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
  const department = normalizeDepartment(bill.employee?.department);

  return (
    <div className="border-t border-slate-200 bg-slate-50/80 p-4 sm:p-6">
      <div className="mb-5 grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase text-slate-500">
            <UserRound className="h-4 w-4" /> Employee
          </div>
          <p className="font-semibold text-slate-900">{ownerName}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase text-slate-500">
            <Building2 className="h-4 w-4" /> Department
          </div>
          <DepartmentPill department={department} />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase text-slate-500">
            <Hash className="h-4 w-4" /> Employee ID
          </div>
          <p className="font-mono font-semibold text-slate-900">{bill.employee?.employeeCode || "-"}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase text-slate-500">
            <FileText className="h-4 w-4" /> Bill reference
          </div>
          <p className="font-mono font-semibold text-slate-900">{bill.id.slice(-4).toUpperCase()}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100/80 text-xs uppercase text-slate-500">
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
              const vehicle = detail.vehicle || (item.transport === "__BILL5__" ? "" : item.transport) || "-";
              return (
                <tr key={item.id || index} className="border-t border-slate-100 transition-colors hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDateISO(item.date)}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{detail.incident || "-"}</td>
                  <td className="max-w-md px-4 py-3 text-slate-700">{detail.purpose || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{vehicle}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-900">
                    {formatBDT(Number(item.amount))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">Amount in words</p>
          <p className="mt-1 text-sm font-medium text-slate-800">{bill.amountInWords}</p>
        </div>
        <Button asChild className="gap-2">
          <Link href={`/bills/${bill.id}`}>
            View full bill <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function BillsDriveView({ bills, users, initialMonth, initialWeek, viewerRole }: Props) {
  const [status, setStatus] = useState<"ALL" | Status>("ALL");
  const [department, setDepartment] = useState("ALL");
  const [employeeId, setEmployeeId] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isManagement = viewerRole === "management";
  const hideCompanyAddress = viewerRole === "employee" || viewerRole === "supervisor";
  const selectedMonthLastDay = useMemo(() => {
    const match = initialMonth.match(/^(\d{4})-(\d{2})$/);
    if (!match) return 31;
    return new Date(Number(match[1]), Number(match[2]), 0).getDate();
  }, [initialMonth]);

  const updatePeriod = (month: string, week?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (month) params.set("month", month);
    else params.delete("month");
    if (month && week) params.set("week", week);
    else params.delete("week");
    router.push(`${pathname}${params.size ? `?${params.toString()}` : ""}`);
  };

  const userById = useMemo(() => {
    const map = new Map<string, PlainUser>();
    users.forEach((user) => map.set(user.id, user));
    bills.forEach((bill) => {
      if (bill.employee) map.set(bill.employee.id, bill.employee);
    });
    return map;
  }, [bills, users]);

  const departments = useMemo(() => {
    return Array.from(
      new Set(bills.map((bill) => normalizeDepartment(bill.employee?.department ?? userById.get(bill.employeeId)?.department)))
    ).sort((left, right) => left.localeCompare(right));
  }, [bills, userById]);

  const employeesForFilter = useMemo(() => {
    const employeeMap = new Map<string, { id: string; name: string; employeeCode: string | null; department: string }>();

    for (const bill of bills) {
      const owner = bill.employee ?? userById.get(bill.employeeId);
      if (!owner) continue;

      const ownerDepartment = normalizeDepartment(owner.department);
      if (department !== "ALL" && ownerDepartment !== department) continue;

      employeeMap.set(owner.id, {
        id: owner.id,
        name: owner.name,
        employeeCode: owner.employeeCode,
        department: ownerDepartment,
      });
    }

    return Array.from(employeeMap.values()).sort((left, right) => {
      const departmentCompare = left.department.localeCompare(right.department);
      if (departmentCompare !== 0) return departmentCompare;
      return left.name.localeCompare(right.name);
    });
  }, [bills, department, userById]);

  const filtered = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();

    return bills.filter((bill) => {
      const owner = bill.employee ?? userById.get(bill.employeeId);
      const billDepartment = normalizeDepartment(owner?.department);

      if (status !== "ALL" && bill.status !== status) return false;
      if (department !== "ALL" && billDepartment !== department) return false;
      if (employeeId !== "ALL" && bill.employeeId !== employeeId) return false;
      if (!needle) return true;

      const haystack = [
        bill.companyName,
        bill.companyAddress,
        owner?.name,
        owner?.employeeCode,
        billDepartment,
        bill.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [bills, department, employeeId, searchTerm, status, userById]);

  const managementSummary = useMemo(() => {
    const byDepartment = new Map<
      string,
      { department: string; count: number; total: number; pending: number; pendingAmount: number; paid: number }
    >();
    const byEmployee = new Map<
      string,
      {
        id: string;
        name: string;
        employeeCode: string | null;
        department: string;
        count: number;
        total: number;
        pending: number;
      }
    >();
    const byMonth = new Map<string, { month: string; count: number; total: number; pending: number }>();
    const byStatus = new Map<Status, { status: Status; count: number; total: number }>();

    for (const bill of filtered) {
      const owner = bill.employee ?? userById.get(bill.employeeId);
      const billDepartment = normalizeDepartment(owner?.department);
      const amount = Number(bill.amount || 0);
      const isPending = pendingStatuses.includes(bill.status);
      const departmentRow =
        byDepartment.get(billDepartment) ??
        { department: billDepartment, count: 0, total: 0, pending: 0, pendingAmount: 0, paid: 0 };
      departmentRow.count += 1;
      departmentRow.total += amount;
      if (isPending) {
        departmentRow.pending += 1;
        departmentRow.pendingAmount += amount;
      }
      if (bill.status === "PAID") departmentRow.paid += 1;
      byDepartment.set(billDepartment, departmentRow);

      const employeeRow =
        byEmployee.get(bill.employeeId) ??
        {
          id: bill.employeeId,
          name: owner?.name ?? "Unknown",
          employeeCode: owner?.employeeCode ?? null,
          department: billDepartment,
          count: 0,
          total: 0,
          pending: 0,
        };
      employeeRow.count += 1;
      employeeRow.total += amount;
      if (isPending) employeeRow.pending += 1;
      byEmployee.set(bill.employeeId, employeeRow);

      const month = getBillMonthKey(bill.createdAt);
      const monthRow = byMonth.get(month) ?? { month, count: 0, total: 0, pending: 0 };
      monthRow.count += 1;
      monthRow.total += amount;
      if (isPending) monthRow.pending += 1;
      byMonth.set(month, monthRow);

      const statusRow = byStatus.get(bill.status) ?? { status: bill.status, count: 0, total: 0 };
      statusRow.count += 1;
      statusRow.total += amount;
      byStatus.set(bill.status, statusRow);
    }

    const departmentRows = Array.from(byDepartment.values()).sort((left, right) => right.total - left.total);
    const employeeRows = Array.from(byEmployee.values()).sort((left, right) => right.total - left.total);
    const monthRows = Array.from(byMonth.values()).sort((left, right) => right.month.localeCompare(left.month));
    const statusRows = Array.from(byStatus.values()).sort((left, right) => right.total - left.total);
    const totalAmount = filtered.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
    const pendingBills = filtered.filter((bill) => pendingStatuses.includes(bill.status));
    const managementPending = filtered.filter((bill) => bill.status === "APPROVED_BY_ACCOUNTS");

    return {
      departmentRows,
      employeeRows,
      monthRows,
      statusRows,
      totalAmount,
      pendingCount: pendingBills.length,
      pendingAmount: pendingBills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0),
      managementPendingCount: managementPending.length,
      managementPendingAmount: managementPending.reduce((sum, bill) => sum + Number(bill.amount || 0), 0),
    };
  }, [filtered, userById]);

  const hasClientFilters = status !== "ALL" || department !== "ALL" || employeeId !== "ALL" || searchTerm.trim();

  const clearClientFilters = () => {
    setStatus("ALL");
    setDepartment("ALL");
    setEmployeeId("ALL");
    setSearchTerm("");
  };

  const selectedEmployee = employeeId === "ALL" ? null : userById.get(employeeId);
  const activeFilters = [
    department !== "ALL" ? { label: "Department", value: department } : null,
    selectedEmployee ? { label: "Employee", value: selectedEmployee.name } : null,
    status !== "ALL" ? { label: "Status", value: statusOptions.find((item) => item.value === status)?.label ?? status } : null,
    searchTerm.trim() ? { label: "Search", value: searchTerm.trim() } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Bills</h1>
          {isManagement && (
            <p className="mt-1 text-sm text-slate-600">
              Department-wise upload, pending, and month-wise submission summary.
            </p>
          )}
        </div>

        <div className="grid gap-2 sm:grid-cols-[180px,150px,190px]">
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
            aria-label="Filter by billing period"
            className="h-9 rounded-md border bg-background px-2 text-sm disabled:opacity-50"
          >
            <option value="">All periods</option>
            <option value="1">Period 1 (1-10)</option>
            <option value="2">Period 2 (11-20)</option>
            <option value="3">Period 3 (21-{selectedMonthLastDay})</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "ALL" | Status)}
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

      {isManagement && (
        <section className="space-y-4">
          <div className="rounded-lg border border-sky-200 bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-4 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[minmax(180px,1fr),minmax(220px,1.2fr),minmax(220px,1.4fr),auto]">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900" htmlFor="management-department">
                  Department
                </label>
                <select
                  id="management-department"
                  value={department}
                  onChange={(event) => {
                    setDepartment(event.target.value);
                    setEmployeeId("ALL");
                  }}
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950"
                >
                  <option value="ALL">All departments</option>
                  {departments.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900" htmlFor="management-employee">
                  Employee
                </label>
                <select
                  id="management-employee"
                  value={employeeId}
                  onChange={(event) => setEmployeeId(event.target.value)}
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950"
                >
                  <option value="ALL">All employees</option>
                  {employeesForFilter.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                      {employee.employeeCode ? ` (${employee.employeeCode})` : ""}
                      {department === "ALL" ? ` - ${employee.department}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900" htmlFor="management-search">
                  Search
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="management-search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Employee, code, company, department"
                    className="h-10 border-slate-300 bg-white pl-9"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 gap-2"
                  onClick={clearClientFilters}
                  disabled={!hasClientFilters}
                >
                  <FilterX className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {activeFilters.length > 0 ? (
                activeFilters.map((item) => (
                  <span
                    key={`${item.label}-${item.value}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200"
                  >
                    <span className="text-slate-500">{item.label}:</span>
                    {item.value}
                  </span>
                ))
              ) : (
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                  Showing all departments and employees
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-sky-200 bg-sky-50/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <FileText className="h-4 w-4 text-sky-700" /> Submitted Bills
              </div>
              <div className="mt-2 text-2xl font-bold text-sky-950">{filtered.length}</div>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
                <WalletCards className="h-4 w-4" /> Total Uploaded
              </div>
              <div className="mt-2 text-2xl font-bold text-emerald-950">{formatBDT(managementSummary.totalAmount)}</div>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-900">
                <Clock3 className="h-4 w-4" /> All Pending
              </div>
              <div className="mt-2 text-2xl font-bold text-amber-950">
                {managementSummary.pendingCount}
                <span className="ml-2 text-base font-semibold">{formatBDT(managementSummary.pendingAmount)}</span>
              </div>
            </div>
            <div className="rounded-lg border border-cyan-200 bg-cyan-50/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-cyan-900">
                <CalendarDays className="h-4 w-4" /> Pending Management
              </div>
              <div className="mt-2 text-2xl font-bold text-cyan-950">
                {managementSummary.managementPendingCount}
                <span className="ml-2 text-base font-semibold">{formatBDT(managementSummary.managementPendingAmount)}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-base font-bold text-slate-950">Department Summary</h2>
                <span className="text-xs font-medium text-slate-500">Upload amount and pending count</span>
              </div>
              <div className="space-y-3">
                {managementSummary.departmentRows.length > 0 ? (
                  managementSummary.departmentRows.map((row) => {
                    const accent = departmentAccentClasses(row.department);
                    const percent = managementSummary.totalAmount
                      ? Math.max(4, Math.round((row.total / managementSummary.totalAmount) * 100))
                      : 0;

                    return (
                      <button
                        key={row.department}
                        type="button"
                        onClick={() => {
                          setDepartment(row.department);
                          setEmployeeId("ALL");
                        }}
                        className={`w-full rounded-lg border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                          department === row.department ? "ring-2 ring-slate-900/20" : ""
                        } ${accent.panel}`}
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <DepartmentPill department={row.department} />
                          <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-800">
                            <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">{row.count} bills</span>
                            <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">{row.pending} pending</span>
                            <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">{row.paid} paid</span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                          <span className="font-bold text-slate-950">{formatBDT(row.total)}</span>
                          <span className="font-medium text-slate-700">Pending {formatBDT(row.pendingAmount)}</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                          <div className={`h-full rounded-full ${accent.bar}`} style={{ width: `${percent}%` }} />
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                    No department data found for the selected filters.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-base font-bold text-slate-950">Employee Summary</h2>
                <span className="text-xs font-medium text-slate-500">Employee-wise submitted bills</span>
              </div>
              <div className="space-y-2">
                {managementSummary.employeeRows.length > 0 ? (
                  managementSummary.employeeRows.map((row) => {
                    const accent = departmentAccentClasses(row.department);

                    return (
                      <button
                        key={row.id}
                        type="button"
                        onClick={() => setEmployeeId(row.id)}
                        className={`w-full rounded-lg border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                          employeeId === row.id ? "ring-2 ring-slate-900/20" : ""
                        } ${accent.panel}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-950">{row.name}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <DepartmentPill department={row.department} />
                              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                                {row.employeeCode || "No code"}
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="font-bold text-slate-950">{formatBDT(row.total)}</p>
                            <p className="text-xs font-medium text-slate-600">
                              {row.count} bills, {row.pending} pending
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                    No employee data found for the selected filters.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-base font-bold text-slate-950">Month Summary</h2>
                <span className="text-xs font-medium text-slate-500">Month-wise submitted bills</span>
              </div>
              <div className="mb-4 grid gap-2 sm:grid-cols-2">
                {managementSummary.statusRows.slice(0, 4).map((row) => (
                  <div key={row.status} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <StatusPill status={row.status} />
                      <span className="text-xs font-bold text-slate-700">{row.count}</span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-600">{formatBDT(row.total)}</p>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                    <tr>
                      <th className="py-2 pr-3">Month</th>
                      <th className="py-2 pr-3 text-right">Bills</th>
                      <th className="py-2 pr-3 text-right">Pending</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managementSummary.monthRows.length > 0 ? (
                      managementSummary.monthRows.map((row) => (
                        <tr key={row.month} className="border-b border-slate-100 last:border-b-0">
                          <td className="py-3 pr-3 font-semibold text-slate-950">{formatMonthLabel(row.month)}</td>
                          <td className="py-3 pr-3 text-right text-slate-700">{row.count}</td>
                          <td className="py-3 pr-3 text-right text-amber-800">{row.pending}</td>
                          <td className="py-3 text-right font-bold text-slate-950">{formatBDT(row.total)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-sm text-slate-500">
                          No month data found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <div className="hidden grid-cols-12 bg-muted/40 px-3 py-2 text-xs font-semibold text-slate-700 sm:grid">
          <div className={isManagement ? "col-span-3" : "col-span-4"}>Name</div>
          <div className={isManagement ? "col-span-2" : "col-span-3"}>Owner</div>
          {isManagement && <div className="col-span-2">Department</div>}
          <div className="col-span-1">Code</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Updated</div>
          <div className="col-span-1 text-right">Total</div>
        </div>

        <ul>
          {filtered.map((bill) => {
            const isOpen = openId === bill.id;
            const owner = bill.employee ?? userById.get(bill.employeeId);
            const ownerName = owner?.name ?? "-";
            const ownerDepartment = normalizeDepartment(owner?.department);

            return (
              <li key={bill.id} className="border-t">
                <button
                  onClick={() => setOpenId(isOpen ? null : bill.id)}
                  className={`w-full px-3 py-3 text-left text-sm transition-colors sm:grid sm:grid-cols-12 sm:items-center sm:py-2 ${departmentRowColor(ownerDepartment)}`}
                >
                  <div className="min-w-0 sm:hidden">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-950">{bill.companyName}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-600">
                          {ownerName} · <span className="font-mono">{owner?.employeeCode ?? "No code"}</span>
                        </p>
                      </div>
                      <StatusPill status={bill.status} compact />
                    </div>
                    <div className="mt-2 flex items-end justify-between gap-3 border-t border-slate-200/70 pt-2">
                      <div className="min-w-0 text-xs text-slate-600">
                        {isManagement && <DepartmentPill department={ownerDepartment} />}
                        <p className={isManagement ? "mt-1" : ""}>Updated {formatDateISO(bill.updatedAt)}</p>
                      </div>
                      <p className="shrink-0 font-bold text-slate-950">{formatBDT(bill.amount)}</p>
                    </div>
                  </div>

                  <div className="hidden contents sm:contents">
                    <div className={isManagement ? "col-span-3 truncate" : "col-span-4 truncate"}>
                      <span className="font-medium">{bill.companyName}</span>
                      {!hideCompanyAddress && <span className="text-muted-foreground"> - {bill.companyAddress}</span>}
                    </div>
                    <div className={isManagement ? "col-span-2 truncate" : "col-span-3 truncate"}>{ownerName}</div>
                    {isManagement && (
                      <div className="col-span-2 min-w-0 pr-2">
                        <DepartmentPill department={ownerDepartment} />
                      </div>
                    )}
                    <div className="col-span-1 truncate">
                      <span className="font-mono text-xs">{owner?.employeeCode ?? "-"}</span>
                    </div>
                    <div className="col-span-2">
                      <StatusPill status={bill.status} />
                    </div>
                    <div className="col-span-1 text-xs text-slate-700">{formatDateISO(bill.updatedAt)}</div>
                    <div className="col-span-1 text-right font-semibold">{formatBDT(bill.amount)}</div>
                  </div>
                </button>

                {isOpen && <ExpandedBillDetails bill={bill} ownerName={ownerName} />}
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
