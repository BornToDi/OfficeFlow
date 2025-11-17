// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/actions";
import { listAllBills, listAllUsers } from "@/lib/repo";
import { toPlainBill, toPlainUser } from "@/lib/serializers";

import { EmployeeDashboard } from "@/components/dashboard/employee-dashboard";
import { SupervisorDashboard } from "@/components/dashboard/supervisor-dashboard";
import { AccountsDashboard } from "@/components/dashboard/accounts-dashboard";
import { ManagementDashboard } from "@/components/dashboard/management-dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");

  // Fetch from DB
  const [rawBills, rawUsers] = await Promise.all([listAllBills(), listAllUsers()]);

  // 🔧 Convert Prisma types -> plain JSON-friendly objects
  const bills = rawBills.map(toPlainBill);
  const users = rawUsers.map(toPlainUser);
  const user = toPlainUser(session.user);

  switch (user.role) {
    case "employee":
      return (
        <div className="container mx-auto">
          <EmployeeDashboard user={user} bills={bills} users={users} />
        </div>
      );
    case "supervisor":
      return (
        <div className="container mx-auto">
          <SupervisorDashboard user={user} bills={bills} users={users} />
        </div>
      );
    case "accounts":
      return (
        <div className="container mx-auto">
          <AccountsDashboard user={user} bills={bills} users={users} />
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
