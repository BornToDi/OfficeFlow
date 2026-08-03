import { getSession } from "@/lib/actions";
import { redirect } from "next/navigation";
import { TeamView } from "@/components/team/team-view";
import { listAllBills, listAllEmployeeAdvances, listAllUsers } from "@/lib/repo"; // DB-backed
import { isGmIdentity } from "@/lib/bill-visibility";
import { toPlainBill, toPlainUser } from "@/lib/serializers";
import { calculateAdvanceSummaries } from "@/lib/advance-balance";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TeamPage() {
  const session = await getSession();
  if (!session) redirect("/");

  // Apply the visibility boundary on the server so client-side filters cannot
  // reveal users from a restricted department.
  const [rawUsers, rawBills, rawAdvances] = await Promise.all([listAllUsers(), listAllBills(), listAllEmployeeAdvances()]);
  const allUsers = rawUsers.map(toPlainUser);
  const currentUser = allUsers.find((user) => user.id === session.user.id) ?? session.user;
  const normalizeDepartment = (value?: string | null) =>
    String(value || "").trim().toLowerCase().replace(/[._-]+/g, " ").replace(/\s+/g, " ");
  const isSoftwareDepartment = (value?: string | null) =>
    /^(software|software dept|software department)$/.test(normalizeDepartment(value));

  let visibleUsers = allUsers;
  if (session.user.role === "employee" || session.user.role === "supervisor") {
    if (isGmIdentity(currentUser)) {
      visibleUsers = allUsers.filter((user) => !isSoftwareDepartment(user.department));
    } else {
      const ownDepartment = normalizeDepartment(currentUser.department);
      visibleUsers = ownDepartment
        ? allUsers.filter((user) => normalizeDepartment(user.department) === ownDepartment)
        : allUsers.filter((user) => user.id === session.user.id);
    }
  }

  const advances = session.user.role === "accounts" ? rawAdvances.map((advance) => ({
    id: advance.id,
    employeeId: advance.employeeId,
    recordedById: advance.recordedById,
    recordedByName: advance.recordedBy.name,
    amount: Number(advance.amount),
    note: advance.note,
    grantedAt: advance.grantedAt.toISOString(),
  })) : [];
  const summaries = session.user.role === "accounts"
    ? calculateAdvanceSummaries(allUsers.map((user) => user.id), rawBills.map(toPlainBill), advances)
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">All Employees</h1>
      <TeamView initialUsers={visibleUsers} allUsers={visibleUsers} currentUserRole={session.user.role} advances={advances} advanceSummaries={summaries} />
    </div>
  );
}
