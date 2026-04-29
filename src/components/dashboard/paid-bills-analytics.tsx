"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BillsTable } from "../bills/bills-table";
import { ExportButton } from "../export/export-button";
import type { Bill, User } from "@/lib/types";
import {
  filterBillsByAnalytics,
  formatMonthLabel,
  getAvailableBillMonths,
  normalizeDepartment,
  summarizeBillsByDepartmentAndMonth,
} from "@/lib/bill-analytics";

const accentPalette = [
  "bg-white border-slate-200",
  "bg-slate-50 border-slate-200",
  "bg-white border-slate-200",
  "bg-slate-50 border-slate-200",
  "bg-white border-slate-200",
];

interface PaidBillsAnalyticsProps {
  title: string;
  bills: Bill[];
  users: User[];
  exportFileName: string;
}

export function PaidBillsAnalytics({
  title,
  bills,
  users,
  exportFileName,
}: PaidBillsAnalyticsProps) {
  const [paidSearchTerm, setPaidSearchTerm] = useState("");
  const [paidDepartmentFilter, setPaidDepartmentFilter] = useState("all");
  const [paidMonthFilter, setPaidMonthFilter] = useState("all");
  const [paidFromDate, setPaidFromDate] = useState("");
  const [paidToDate, setPaidToDate] = useState("");

  const availableDepartments = useMemo(() => {
    const departmentByUserId = new Map(
      users.map((user) => [user.id, normalizeDepartment(user.department)])
    );
    const departments = new Set(
      bills.map((bill) => departmentByUserId.get(bill.employeeId) ?? "Unassigned")
    );
    return Array.from(departments).sort((left, right) => left.localeCompare(right));
  }, [bills, users]);

  const availableMonths = useMemo(() => getAvailableBillMonths(bills), [bills]);

  const filteredBills = useMemo(
    () =>
      filterBillsByAnalytics(bills, users, {
        department: paidDepartmentFilter,
        month: paidMonthFilter,
        fromDate: paidFromDate,
        toDate: paidToDate,
        searchTerm: paidSearchTerm,
      }),
    [bills, users, paidDepartmentFilter, paidMonthFilter, paidFromDate, paidToDate, paidSearchTerm]
  );

  const summaryRows = useMemo(
    () => summarizeBillsByDepartmentAndMonth(filteredBills, users),
    [filteredBills, users]
  );

  const totalAmount = useMemo(
    () => filteredBills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0),
    [filteredBills]
  );

  const hasActiveFilters =
    paidSearchTerm ||
    paidDepartmentFilter !== "all" ||
    paidMonthFilter !== "all" ||
    paidFromDate ||
    paidToDate;

  const clearFilters = () => {
    setPaidSearchTerm("");
    setPaidDepartmentFilter("all");
    setPaidMonthFilter("all");
    setPaidFromDate("");
    setPaidToDate("");
  };

  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "BDT",
  });

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
          <p className="max-w-2xl text-sm text-slate-700">
            Filter by department, month, or calendar range to see how much each department took in any period.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-600">Bills</div>
            <div className="mt-1 text-2xl font-bold text-slate-950">{filteredBills.length}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-600">Total Amount</div>
            <div className="mt-1 text-2xl font-bold text-slate-950">{currency.format(totalAmount)}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-600">Department-Month Rows</div>
            <div className="mt-1 text-2xl font-bold text-slate-950">{summaryRows.length}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-950" htmlFor="paid-department-filter">
              Department
            </label>
            <select
              id="paid-department-filter"
              value={paidDepartmentFilter}
              onChange={(event) => setPaidDepartmentFilter(event.target.value)}
              className="h-10 w-full rounded-md border border-slate-400 bg-white px-3 text-sm font-medium text-slate-950 transition-colors focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <option value="all">All Departments</option>
              {availableDepartments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-950" htmlFor="paid-month-filter">
              Month
            </label>
            <select
              id="paid-month-filter"
              value={paidMonthFilter}
              onChange={(event) => setPaidMonthFilter(event.target.value)}
              className="h-10 w-full rounded-md border border-slate-400 bg-white px-3 text-sm font-medium text-slate-950 transition-colors focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <option value="all">All Months</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {formatMonthLabel(month)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-950" htmlFor="paid-from-date">
              From Date
            </label>
            <Input
              id="paid-from-date"
              type="date"
              value={paidFromDate}
              onChange={(event) => setPaidFromDate(event.target.value)}
              className="h-10 border-slate-400 bg-white text-slate-950 placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-950" htmlFor="paid-to-date">
              To Date
            </label>
            <Input
              id="paid-to-date"
              type="date"
              value={paidToDate}
              onChange={(event) => setPaidToDate(event.target.value)}
              className="h-10 border-slate-400 bg-white text-slate-950 placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2 lg:col-span-1">
            <label className="text-sm font-semibold text-slate-950" htmlFor="paid-search">
              Search
            </label>
            <Input
              id="paid-search"
              placeholder="Employee, department, or company"
              value={paidSearchTerm}
              onChange={(event) => setPaidSearchTerm(event.target.value)}
              className="h-10 border-slate-400 bg-white text-slate-950 placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium text-slate-800">
            Calendar filtering uses the bill creation date.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" onClick={clearFilters} disabled={!hasActiveFilters}>
              Clear filters
            </Button>
            <ExportButton bills={filteredBills} users={users} fileName={exportFileName} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                Department Analytics
              </p>
              <h3 className="mt-1 text-lg font-bold text-slate-950">Department spend by month</h3>
              <p className="mt-1 max-w-2xl text-sm font-medium text-slate-700">
                Each row shows how much a department collected in a given month.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
              <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">Department</span>
              <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">Month</span>
              <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">Amount</span>
            </div>
          </div>
        </div>

        {summaryRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-sm">
              <thead className="text-left text-slate-950">
                <tr className="border-b border-slate-300 bg-slate-50">
                  <th className="py-3 pr-4 font-bold">Department</th>
                  <th className="py-3 pr-4 font-bold">Month</th>
                  <th className="py-3 pr-4 font-bold">Bills</th>
                  <th className="py-3 pr-4 font-bold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {summaryRows.map((row, index) => {
                  const rowAccent = accentPalette[index % accentPalette.length];
                  return (
                    <tr
                      key={`${row.department}-${row.month}`}
                      className={`border-b border-slate-200 bg-gradient-to-r ${rowAccent} last:border-b-0`}
                    >
                      <td className="py-3 pr-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 font-bold text-slate-950 shadow-sm ring-1 ring-inset ring-slate-300">
                          <span className="h-2.5 w-2.5 rounded-full bg-slate-950" />
                          {row.department}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-900 ring-1 ring-slate-300">
                          {formatMonthLabel(row.month)}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex min-w-16 items-center justify-center rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-900 ring-1 ring-slate-300">
                          {row.count}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-900 ring-1 ring-slate-300">
                          {currency.format(row.total)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm font-medium text-slate-900">
            No department spend data matches the current filters.
          </div>
        )}
      </div>

      <BillsTable bills={filteredBills} users={users} title="" showDepartment />
    </section>
  );
}