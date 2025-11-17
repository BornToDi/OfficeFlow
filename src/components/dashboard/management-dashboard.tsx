import type { Bill, User } from "@/lib/types";
import { BillsTable } from "../bills/bills-table";

interface ManagementDashboardProps {
  user: User;
  bills: Bill[];
  users: User[];
}

export function ManagementDashboard({ user, bills, users }: ManagementDashboardProps) {
  const pendingBills = bills.filter(
    (bill) => bill.status === "APPROVED_BY_ACCOUNTS"
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Management Final Approval</h1>
      <BillsTable bills={pendingBills} users={users} title="Bills Awaiting Final Approval" />
    </div>
  );
}
