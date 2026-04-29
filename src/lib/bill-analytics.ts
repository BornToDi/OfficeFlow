import type { Bill, User } from "./types";

export type BillAnalyticsFilters = {
  department: string;
  month: string;
  fromDate: string;
  toDate: string;
  searchTerm: string;
};

export type DepartmentMonthSummaryRow = {
  department: string;
  month: string;
  count: number;
  total: number;
};

export function normalizeDepartment(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "Unassigned";
}

export function getBillMonthKey(dateValue: string) {
  return new Date(dateValue).toISOString().slice(0, 7);
}

export function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-");
  const monthIndex = Number(month) - 1;

  if (!year || Number.isNaN(monthIndex)) {
    return monthKey;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    year: "numeric",
  }).format(new Date(Number(year), monthIndex, 1));
}

export function getAvailableBillMonths(bills: Bill[]) {
  return Array.from(new Set(bills.map((bill) => getBillMonthKey(bill.createdAt))))
    .sort((left, right) => right.localeCompare(left));
}

export function filterBillsByAnalytics(
  bills: Bill[],
  users: User[],
  filters: BillAnalyticsFilters
) {
  const departmentByUserId = new Map(
    users.map((user) => [user.id, normalizeDepartment(user.department)])
  );
  const searchTerm = filters.searchTerm.trim().toLowerCase();

  return bills.filter((bill) => {
    const department = departmentByUserId.get(bill.employeeId) ?? "Unassigned";
    const billMonth = getBillMonthKey(bill.createdAt);
    const billDay = new Date(bill.createdAt).toISOString().slice(0, 10);

    if (filters.department !== "all" && department !== filters.department) {
      return false;
    }

    if (filters.month !== "all" && billMonth !== filters.month) {
      return false;
    }

    if (filters.fromDate && billDay < filters.fromDate) {
      return false;
    }

    if (filters.toDate && billDay > filters.toDate) {
      return false;
    }

    if (!searchTerm) {
      return true;
    }

    const employeeName = users.find((user) => user.id === bill.employeeId)?.name ?? "";
    const haystack = `${employeeName} ${bill.companyName} ${department}`.toLowerCase();
    return haystack.includes(searchTerm);
  });
}

export function summarizeBillsByDepartmentAndMonth(
  bills: Bill[],
  users: User[]
): DepartmentMonthSummaryRow[] {
  const departmentByUserId = new Map(
    users.map((user) => [user.id, normalizeDepartment(user.department)])
  );
  const rows = new Map<string, DepartmentMonthSummaryRow>();

  for (const bill of bills) {
    const department = departmentByUserId.get(bill.employeeId) ?? "Unassigned";
    const month = getBillMonthKey(bill.createdAt);
    const key = `${department}::${month}`;
    const existing = rows.get(key);

    if (existing) {
      existing.count += 1;
      existing.total += Number(bill.amount || 0);
      continue;
    }

    rows.set(key, {
      department,
      month,
      count: 1,
      total: Number(bill.amount || 0),
    });
  }

  return Array.from(rows.values()).sort((left, right) => {
    const monthCompare = right.month.localeCompare(left.month);
    if (monthCompare !== 0) {
      return monthCompare;
    }

    return left.department.localeCompare(right.department);
  });
}