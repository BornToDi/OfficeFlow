"use client";

import { useState, useMemo } from "react";
import type { Bill, User } from "@/lib/types";
import { BillsTable } from "../bills/bills-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportButton } from "../export/export-button";
import { Input } from "@/components/ui/input";

/**
 * IMPORTANT: `bills` and `users` must be plain/serializable (no Prisma Decimal/Date objects).
 * If you fetch with Prisma on the server, convert: Decimal -> number, Date -> ISO string.
 * (Use the toPlainBill/toPlainUser serializer we added earlier.)
 */

interface AccountsDashboardProps {
  user: User;
  bills: Bill[];
  users: User[];
}

export function AccountsDashboard({ user, bills, users }: AccountsDashboardProps) {
  // Build a map for quick employee name lookup
  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u.name])), [users]);

  // Buckets
  const pendingApprovalBills = useMemo(
    () => bills.filter((b) => b.status === "APPROVED_BY_SUPERVISOR"),
    [bills]
  );

  const pendingPaymentBills = useMemo(
    () => bills.filter((b) => b.status === "APPROVED_BY_MANAGEMENT"),
    [bills]
  );

  const allPaidBills = useMemo(
    () => bills.filter((b) => b.status === "PAID"),
    [bills]
  );

  const allBills = bills;

  // Counts for notification pills
  const countPendingApproval = pendingApprovalBills.length;
  const countPendingPayment = pendingPaymentBills.length;
  const countPaid = allPaidBills.length;
  const countAll = allBills.length;

  // Get unique departments only for paid bills
  const uniqueDepartments = useMemo(() => {
    const paidEmployeeIds = new Set(allPaidBills.map((b) => b.employeeId));
    const depts = new Set(
      users
        .filter((u) => paidEmployeeIds.has(u.id))
        .map((u) => u.department)
        .filter((d): d is string => Boolean(d))
    );
    return Array.from(depts).sort();
  }, [allPaidBills, users]);

  // Paid tab search and department filter
  const [paidSearchTerm, setPaidSearchTerm] = useState("");
  const [paidDepartmentFilter, setPaidDepartmentFilter] = useState("all");
  
  const filteredPaidBills = useMemo(() => {
    let filtered = allPaidBills;
    
    // Department filter
    if (paidDepartmentFilter !== "all") {
      filtered = filtered.filter((bill) => {
        const employee = users.find(u => u.id === bill.employeeId);
        return employee?.department === paidDepartmentFilter;
      });
    }
    
    // Search filter
    if (!paidSearchTerm) return filtered;
    const q = paidSearchTerm.toLowerCase();
    return filtered.filter((bill) => {
      const employeeName = userMap.get(bill.employeeId) || "";
      return employeeName.toLowerCase().includes(q);
    });
  }, [allPaidBills, paidSearchTerm, paidDepartmentFilter, userMap, users]);

  // Little badge renderer
  const Badge = ({ n }: { n: number }) => (
    <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-semibold">
      {n}
    </span>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Accounts Department</h1>

      <Tabs defaultValue="pending-approval">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="pending-approval">
            Pending Approval <Badge n={countPendingApproval} />
          </TabsTrigger>
          <TabsTrigger value="pending-payment">
            Pending Payment <Badge n={countPendingPayment} />
          </TabsTrigger>
          <TabsTrigger value="paid">
            Paid <Badge n={countPaid} />
          </TabsTrigger>
          <TabsTrigger value="all-bills">
            All Bills History <Badge n={countAll} />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending-approval">
          <BillsTable
            bills={pendingApprovalBills}
            users={users}
            title="Bills Awaiting Your Approval"
            action={
              <ExportButton
                bills={pendingApprovalBills}
                users={users}
                fileName="Pending_Approval_Bills"
              />
            }
          />
        </TabsContent>

        <TabsContent value="pending-payment">
          <BillsTable
            bills={pendingPaymentBills}
            users={users}
            title="Bills Approved for Payment"
            action={
              <ExportButton
                bills={pendingPaymentBills}
                users={users}
                fileName="Pending_Payment_Bills"
              />
            }
          />
        </TabsContent>

        <TabsContent value="paid" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold">Paid Bills</h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                value={paidDepartmentFilter}
                onChange={(e) => setPaidDepartmentFilter(e.target.value)}
                className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <option value="all">All Departments</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Search by employee name..."
                value={paidSearchTerm}
                onChange={(e) => setPaidSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <ExportButton bills={filteredPaidBills} users={users} fileName="Paid_Bills" />
            </div>
          </div>

          <BillsTable bills={filteredPaidBills} users={users} title="" showDepartment />
        </TabsContent>

        <TabsContent value="all-bills">
          <BillsTable
            bills={allBills}
            users={users}
            title="Complete Bill History"
            action={<ExportButton bills={allBills} users={users} fileName="All_Bills_History" />}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
