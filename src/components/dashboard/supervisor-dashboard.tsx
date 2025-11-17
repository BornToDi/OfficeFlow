import type { Bill, User } from "@/lib/types";
import { BillsTable } from "../bills/bills-table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface SupervisorDashboardProps {
  user: User;
  bills: Bill[];
  users: User[];
}

export function SupervisorDashboard({ user, bills, users }: SupervisorDashboardProps) {
  const teamMemberIds = users.filter(u => u.supervisorId === user.id).map(e => e.id);

  // Bills submitted by team members that are awaiting this supervisor's approval.
  const pendingApprovalBills = bills.filter(
    bill => teamMemberIds.includes(bill.employeeId) && bill.status === 'SUBMITTED'
  );

  // All bills associated with the supervisor's team, including their own, for summary stats.
  const teamAndOwnBills = bills.filter(
    bill => teamMemberIds.includes(bill.employeeId) || bill.employeeId === user.id
  );

  const pendingCount = pendingApprovalBills.length;
  const approvedCount = teamAndOwnBills.filter(bill => bill.status.startsWith('APPROVED')).length;
  const rejectedCount = teamAndOwnBills.filter(bill => bill.status.startsWith('REJECTED')).length;
  const totalPaidAmount = teamAndOwnBills.filter(b => b.status === 'PAID').reduce((acc, b) => acc + b.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user.name.split(" ")[0]}!</h1>
        <p className="text-muted-foreground">
            Here&apos;s a summary of your team&apos;s conveyance bills.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "BDT" }).format(totalPaidAmount)}</div>
            <p className="text-xs text-muted-foreground">Total reimbursed to your team</p>
          </CardContent>
        </Card>
      </div>

      <BillsTable bills={pendingApprovalBills} users={users} title="Bills Awaiting Your Approval" />
    </div>
  );
}
