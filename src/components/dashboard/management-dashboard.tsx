"use client";

import { useMemo } from "react";
import type { Bill, User } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BillsTable } from "../bills/bills-table";
import { ExportButton } from "../export/export-button";
import { PaidBillsAnalytics } from "./paid-bills-analytics";

interface ManagementDashboardProps {
  user: User;
  bills: Bill[];
  users: User[];
}

export function ManagementDashboard({ user, bills, users }: ManagementDashboardProps) {
  const pendingApprovalBills = useMemo(
    () => bills.filter((bill) => bill.status === "APPROVED_BY_ACCOUNTS"),
    [bills]
  );

  const pendingPaymentBills = useMemo(
    () => bills.filter((bill) => bill.status === "APPROVED_BY_MANAGEMENT"),
    [bills]
  );

  const allPaidBills = useMemo(
    () => bills.filter((bill) => bill.status === "PAID"),
    [bills]
  );

  const allBills = bills;

  const countPendingApproval = pendingApprovalBills.length;
  const countPendingPayment = pendingPaymentBills.length;
  const countPaid = allPaidBills.length;
  const countAll = allBills.length;

  const Badge = ({ n }: { n: number }) => (
    <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-semibold">
      {n}
    </span>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Management Final Approval</h1>

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
            title="Bills Awaiting Final Approval"
            action={
              <ExportButton
                bills={pendingApprovalBills}
                users={users}
                fileName="Management_Pending_Approval_Bills"
              />
            }
          />
        </TabsContent>

        <TabsContent value="pending-payment">
          <BillsTable
            bills={pendingPaymentBills}
            users={users}
            title="Bills Approved by Management (Awaiting Payment)"
            action={
              <ExportButton
                bills={pendingPaymentBills}
                users={users}
                fileName="Management_Pending_Payment_Bills"
              />
            }
          />
        </TabsContent>

        <TabsContent value="paid" className="space-y-4">
          <PaidBillsAnalytics
            title="Paid Bills"
            bills={allPaidBills}
            users={users}
            exportFileName="Management_Paid_Bills"
          />
        </TabsContent>

        <TabsContent value="all-bills">
          <BillsTable
            bills={allBills}
            users={users}
            title="Complete Bill History"
            action={<ExportButton bills={allBills} users={users} fileName="Management_All_Bills_History" />}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
