import { getSession } from "@/lib/actions";
import { redirect } from "next/navigation";
import { TeamView } from "@/components/team/team-view";
import { listAllUsers } from "@/lib/repo"; // DB-backed

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TeamPage() {
  const session = await getSession();
  if (!session) redirect("/");

  // Fetch everyone from the DB
  const allUsers = await listAllUsers();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">All Team Members</h1>
      <TeamView initialUsers={allUsers} allUsers={allUsers} />
    </div>
  );
}
