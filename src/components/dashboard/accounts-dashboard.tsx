"use client";

import { useMemo, useState } from "react";
import type { Bill, User } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BillsTable } from "../bills/bills-table";
import { ExportButton } from "../export/export-button";
import { PaidBillsAnalytics } from "./paid-bills-analytics";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * IMPORTANT: `bills` and `users` must be plain/serializable (no Prisma Decimal/Date objects).
 * If you fetch with Prisma on the server, convert: Decimal -> number, Date -> ISO string.
 * (Use the toPlainBill/toPlainUser serializer we added earlier.)
 */

interface AccountsDashboardProps {
  user: User;
  bills: Bill[];
  users: User[];
  heading?: string;
}

export function AccountsDashboard({ user, bills, users, heading = "Accounts Department" }: AccountsDashboardProps) {
  const [allBillsQuery, setAllBillsQuery] = useState("");

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

  const filteredAllBills = useMemo(() => {
    const query = allBillsQuery.trim().toLowerCase();
    if (!query) return allBills;

    return allBills.filter((bill) => {
      const employeeName = (users.find((user) => user.id === bill.employeeId)?.name || "").toLowerCase();
      const itemHit = (bill.items || []).some((item) =>
        `${item.incident ?? ""} ${item.purpose} ${item.from} ${item.to}`.toLowerCase().includes(query)
      );

      return (
        bill.id.toLowerCase().includes(query) ||
        bill.companyName.toLowerCase().includes(query) ||
        bill.companyAddress.toLowerCase().includes(query) ||
        employeeName.includes(query) ||
        itemHit
      );
    });
  }, [allBills, allBillsQuery, users]);

  // Counts for notification pills
  const countPendingApproval = pendingApprovalBills.length;
  const countPendingPayment = pendingPaymentBills.length;
  const countPaid = allPaidBills.length;
  const countAll = allBills.length;

  // Little badge renderer
  const Badge = ({ n }: { n: number }) => (
    <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-semibold">
      {n}
    </span>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{heading}</h1>

      <Tabs defaultValue="pending-approval">
        <TabsList className="flex h-auto flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-md shadow-slate-900/5">
          <TabsTrigger
            value="pending-approval"
            className="border border-transparent bg-white text-slate-900 data-[state=active]:border-primary data-[state=active]:bg-slate-100 data-[state=active]:text-slate-950"
          >
            Pending Approval <Badge n={countPendingApproval} />
          </TabsTrigger>
          <TabsTrigger
            value="pending-payment"
            className="border border-transparent bg-white text-slate-900 data-[state=active]:border-primary data-[state=active]:bg-slate-100 data-[state=active]:text-slate-950"
          >
            Pending Payment <Badge n={countPendingPayment} />
          </TabsTrigger>
          <TabsTrigger
            value="paid"
            className="border border-transparent bg-white text-slate-900 data-[state=active]:border-primary data-[state=active]:bg-slate-100 data-[state=active]:text-slate-950"
          >
            Paid <Badge n={countPaid} />
          </TabsTrigger>
          <TabsTrigger
            value="all-bills"
            className="border border-transparent bg-white text-slate-900 data-[state=active]:border-primary data-[state=active]:bg-slate-100 data-[state=active]:text-slate-950"
          >
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
          <PaidBillsAnalytics
            title="Paid Bills"
            bills={allPaidBills}
            users={users}
            exportFileName="Paid_Bills"
            userRole={user.role}
          />
        </TabsContent>

        <TabsContent value="all-bills">
          <BillsTable
            bills={filteredAllBills}
            users={users}
            title="Complete Bill History"
            action={
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={allBillsQuery}
                  onChange={(e) => setAllBillsQuery(e.target.value)}
                  placeholder="Search incident number..."
                  aria-label="Search all bills history"
                  className="w-64"
                />
                <Button
                  variant="outline"
                  onClick={() => setAllBillsQuery("")}
                  disabled={!allBillsQuery}
                >
                  Clear
                </Button>
                <ExportButton bills={filteredAllBills} users={users} fileName="All_Bills_History" />
              </div>
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
