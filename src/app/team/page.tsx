import { getSession } from "@/lib/actions";
import { getUsers } from "@/lib/data";
import { redirect } from "next/navigation";
import type { User } from "@/lib/types";
import { TeamView } from "@/components/team/team-view";

export default async function TeamPage() {
    const session = await getSession();
    if (!session) {
        redirect('/');
    }
    
    const user = session.user as User;
    const allUsers = await getUsers();

    let usersToShow = allUsers;
    let title = "All Team Members";

    if (user.role === 'supervisor') {
        usersToShow = allUsers.filter(u => u.supervisorId === user.id || u.id === user.id);
        title = "My Team";
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">{title}</h1>
            <TeamView initialUsers={usersToShow} allUsers={allUsers} />
        </div>
    );
}
