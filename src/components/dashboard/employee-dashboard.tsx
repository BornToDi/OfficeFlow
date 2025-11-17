import { BillsTable } from "../bills/bills-table";
import type { Bill, User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface EmployeeDashboardProps {
  user: User;
  bills: Bill[];
  users: User[];
}

function getStatusCounts(bills: Bill[]) {
    const counts = {
        pending: 0,
        approved: 0,
        rejected: 0,
        paid: 0,
    };
    bills.forEach(bill => {
        if (bill.status === 'PAID') {
            counts.paid++;
        } else if (bill.status.startsWith('APPROVED')) {
            counts.approved++;
        } else if (bill.status.startsWith('REJECTED')) {
            counts.rejected++;
        } else {
            counts.pending++;
        }
    });
    return counts;
}

export function EmployeeDashboard({ user, bills, users }: EmployeeDashboardProps) {
  const myBills = bills.filter((bill) => bill.employeeId === user.id);
  const counts = getStatusCounts(myBills);
  const recentBills = myBills.slice(0, 5);
  const myPaidAmount = myBills.filter(b => b.status === 'PAID').reduce((acc, b) => acc + b.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hello, {user.name.split(" ")[0]}!</h1>
        <p className="text-muted-foreground">
            Welcome back! Here&apos;s a summary of your conveyance bills.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.88.98 6.7 2.6l-2.7 2.7h8V2"/></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.pending}</div>
            <p className="text-xs text-muted-foreground">Bills awaiting approval</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.approved}</div>
             <p className="text-xs text-muted-foreground">Bills approved for payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.rejected}</div>
            <p className="text-xs text-muted-foreground">Bills that need resubmission</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "BDT" }).format(myPaidAmount)}</div>
            <p className="text-xs text-muted-foreground">Total amount reimbursed</p>
          </CardContent>
        </Card>
      </div>

      <BillsTable bills={recentBills} users={users} title="Recent Bills"/>
    </div>
  );
}
