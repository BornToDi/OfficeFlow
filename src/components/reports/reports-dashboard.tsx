import type { Bill, User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPieChart } from "./status-pie-chart";
import { MonthlyBillsChart } from "./monthly-bills-chart";

interface ReportsDashboardProps {
  bills: Bill[];
  users: User[];
}

export function ReportsDashboard({ bills, users }: ReportsDashboardProps) {
  const totalBills = bills.length;
  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const pendingBills = bills.filter(bill => bill.status !== 'PAID' && !bill.status.startsWith('REJECTED')).length;
  const paidBills = bills.filter(bill => bill.status === 'PAID').length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBills}</div>
            <p className="text-xs text-muted-foreground">Total bills submitted all time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "BDT" }).format(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">Total value of all bills</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.88.98 6.7 2.6l-2.7 2.7h8V2"></path></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBills}</div>
            <p className="text-xs text-muted-foreground">Bills currently in approval flow</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Bills</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidBills}</div>
            <p className="text-xs text-muted-foreground">Bills that have been paid</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
         <Card>
            <CardHeader>
                <CardTitle>Bills by Status</CardTitle>
            </CardHeader>
            <CardContent>
                <StatusPieChart bills={bills} />
            </CardContent>
         </Card>
         <Card>
            <CardHeader>
                <CardTitle>Monthly Submissions</CardTitle>
            </CardHeader>
            <CardContent>
                <MonthlyBillsChart bills={bills} />
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
