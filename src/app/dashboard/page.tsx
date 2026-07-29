// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/actions";
import {
  getPendingSupervisorChangeRequests,
  listAllBills,
  listAllUsers,
} from "@/lib/repo";
import { toPlainBill, toPlainUser } from "@/lib/serializers";

import { EmployeeDashboard } from "@/components/dashboard/employee-dashboard";
import { SupervisorDashboard } from "@/components/dashboard/supervisor-dashboard";
import { AccountsDashboard } from "@/components/dashboard/accounts-dashboard";
import { ManagementDashboard } from "@/components/dashboard/management-dashboard";
import type { SupervisorChangeRequest } from "@/components/supervisor/PendingSupervisorChangeRequests";
import { employeeSubmittedAmount, isAccountsApproved } from "@/lib/bill-visibility";
import { isGmIdentity } from "@/lib/bill-visibility";
import { GmBill5Dashboard } from "@/components/dashboard/gm-bill5-dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");

  // Fetch from DB
  const [rawBills, rawUsers, rawSupervisorChangeRequests] = await Promise.all([
    listAllBills(),
    listAllUsers(),
    session.user.role === "supervisor"
      ? getPendingSupervisorChangeRequests(session.user.id)
      : Promise.resolve([]),
  ]);

  // 🔧 Convert Prisma types -> plain JSON-friendly objects
  const plainBills = rawBills.map(toPlainBill);
  const users = rawUsers.map(toPlainUser);
  const user = toPlainUser(session.user);
  const bills =
    user.role === "employee"
      ? plainBills.map((bill) =>
          isAccountsApproved(bill.status)
            ? bill
            : {
                ...bill,
                amount: employeeSubmittedAmount(bill.history, Number(bill.amount)),
              }
        )
      : plainBills;
  const supervisorChangeRequests: SupervisorChangeRequest[] = rawSupervisorChangeRequests
    .filter((request): request is NonNullable<typeof request> => request !== null)
    .filter((request) => request.employee !== null && request.newSupervisor !== null)
    .map((request) => ({
      id: request.id,
      employee: request.employee!,
      currentSupervisor: request.currentSupervisor,
      newSupervisor: request.newSupervisor!,
      status: request.status,
      createdAt: new Date(request.createdAt).toISOString(),
    }));

  switch (user.role) {
    case "employee":
      return (
        <div className="container mx-auto">
          <EmployeeDashboard user={user} bills={bills} users={users} />
        </div>
      );
    case "supervisor":
      if (isGmIdentity(user)) {
        return <div className="container mx-auto"><GmBill5Dashboard user={user} bills={bills} users={users} /></div>;
      }
      return (
        <div className="container mx-auto">
          <SupervisorDashboard
            user={user}
            bills={bills}
            users={users}
            supervisorChangeRequests={supervisorChangeRequests}
          />
        </div>
      );
    case "accounts":
      return (
        <div className="container mx-auto">
          <AccountsDashboard user={user} bills={bills} users={users} />
        </div>
      );
    case "followup":
      return (
        <div className="container mx-auto">
          <AccountsDashboard user={user} bills={bills} users={users} heading="Follow-up User" />
        </div>
      );
    case "management":
      return (
        <div className="container mx-auto">
          <ManagementDashboard user={user} bills={bills} users={users} />
        </div>
      );
    default:
      return <div className="container mx-auto">Invalid role</div>;
  }
}
