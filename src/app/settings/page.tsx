// src/app/settings/page.tsx
import SettingsForm from "@/components/account/SettingsForm";
import { getSession } from "@/lib/actions";
import { listSupervisors } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return <div className="p-6 text-sm">Not signed in.</div>;

  const supervisors = await listSupervisors();

  return (
    <div className="p-6">
      <SettingsForm
        user={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          supervisorId: session.user.supervisorId ?? null,
        }}
        role={session.user.role}
        supervisors={supervisors}
      />
    </div>
  );
}
