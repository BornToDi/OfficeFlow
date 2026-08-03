"use client";

import { useMemo } from "react";
import type { AdvanceSummary, Bill, EmployeeAdvance, User } from "@/lib/types";
import { BillsTable } from "../bills/bills-table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import PendingSupervisorChangeRequests, {
  type SupervisorChangeRequest,
} from "../supervisor/PendingSupervisorChangeRequests";
import { EmployeeAdvanceCard } from "./employee-advance-panel";

interface SupervisorDashboardProps {
  user: User;
  bills: Bill[];
  users: User[];
  supervisorChangeRequests: SupervisorChangeRequest[];
  advances: EmployeeAdvance[];
  advanceSummary?: AdvanceSummary;
}

function latestBillActivityTime(bill: Bill) {
  return Math.max(
    new Date(bill.updatedAt).getTime() || 0,
    ...(bill.history ?? []).map((entry) => new Date(entry.timestamp).getTime() || 0)
  );
}

export function SupervisorDashboard({
  user,
  bills,
  users,
  supervisorChangeRequests,
  advances,
  advanceSummary,
}: SupervisorDashboardProps) {
  const teamMembers = users.filter((u) => String(u.supervisorId) === String(user.id));
  const teamMemberIds = teamMembers
    .map((e) => String(e.id));

  // Bills awaiting supervisor approval.
  // - If a bill has an explicit `supervisorId` (forwarded), it should appear only for that supervisor.
  // - Otherwise, it appears for the employee's direct supervisor (i.e. members of this team) or the supervisor themselves.
  const pendingApprovalBills = bills.filter((bill) => {
    if (bill.status !== "SUBMITTED") return false;
    if (bill.supervisorId) {
      return String(bill.supervisorId) === String(user.id);
    }
    // unassigned -> falls to the employee's supervisor (team) or the employee themself if applicable
    return teamMemberIds.includes(String(bill.employeeId)) || String(bill.employeeId) === String(user.id);
  });

  // All bills associated with the supervisor's team, including their own, for summary stats.
  const teamAndOwnBills = bills.filter((bill) => {
    const isOwnBill = String(bill.employeeId) === String(user.id);
    const approvedByCurrentSupervisor = (bill.history ?? []).some(
      (entry) =>
        entry.status === "APPROVED_BY_SUPERVISOR" &&
        String(entry.actorId) === String(user.id)
    );
    if (bill.status === "DRAFT" && !isOwnBill) return false;
    return bill.status !== "SUBMITTED" && (
      teamMemberIds.includes(String(bill.employeeId)) ||
      isOwnBill ||
      String(bill.supervisorId) === String(user.id) ||
      approvedByCurrentSupervisor
    );
  });
  const recentOwnBills = useMemo(() => {
    return bills
      .filter((bill) => String(bill.employeeId) === String(user.id))
      .sort(
      (left, right) => latestBillActivityTime(right) - latestBillActivityTime(left)
      )
      .slice(0, 10);
  }, [bills, user.id]);

  const pendingCount = pendingApprovalBills.length;
  const approvedCount = teamAndOwnBills.filter(bill => bill.status.startsWith('APPROVED')).length;
  const rejectedCount = teamAndOwnBills.filter(bill => bill.status.startsWith('REJECTED')).length;
  const totalPaidAmount = teamAndOwnBills
    .filter((b) => b.status === "PAID")
    .reduce((acc, b) => acc + Number(b.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user.name.split(" ")[0]}!</h1>
        <p className="text-muted-foreground">
            Here&apos;s a summary of your team&apos;s conveyance bills.
        </p>
      </div>

      <PendingSupervisorChangeRequests requests={supervisorChangeRequests} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.88.98 6.7 2.6l-2.7 2.7h8V2"/></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Bills from your team awaiting approval</p>
          </CardContent>
        </Card>
        <EmployeeAdvanceCard summary={advanceSummary ?? { employeeId: user.id, totalGranted: 0, usedForPaidBills: 0, balance: 0 }} advances={advances} />
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Approved</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
             <p className="text-xs text-muted-foreground">Bills from your team approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Rejected</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">Bills from your team rejected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Total Paid</CardTitle>
            <span className="text-base font-semibold text-muted-foreground" aria-hidden="true">&#2547;</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold"><span aria-label="BDT">&#2547;</span>{new Intl.NumberFormat("en-BD", { maximumFractionDigits: 2 }).format(totalPaidAmount)}</div>
            <p className="text-xs text-muted-foreground">Total reimbursed to your team</p>
          </CardContent>
        </Card>
      </div>

      <BillsTable bills={pendingApprovalBills} users={users} title="Bills Awaiting Your Approval" />

      <BillsTable
        bills={recentOwnBills}
        users={users}
        title="My Recent Bills"
      />
    </div>
  );
}
