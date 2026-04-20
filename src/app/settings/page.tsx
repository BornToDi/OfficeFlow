// src/app/settings/page.tsx
import SettingsForm from "@/components/account/SettingsForm";
import ChangePasswordForm from "@/components/account/ChangePasswordForm";
import { getSession } from "@/lib/actions";
import { listSupervisors } from "@/lib/repo";
import { User, Lock } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return <div className="p-6 text-sm">Not signed in.</div>;

  const supervisors = await listSupervisors();

  return (
    <div className="space-y-8 px-6 py-8 max-w-4xl">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Account Settings</h1>
        <p className="mt-2 text-lg text-slate-600">Manage your profile and security preferences</p>
      </div>

      <div className="grid gap-8">
        {/* Profile Settings Section */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <SettingsForm
              user={{
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                designation: (session.user as any).designation ?? null,
                department: (session.user as any).department ?? null,
                supervisorId: session.user.supervisorId ?? null,
              }}
              role={session.user.role}
              supervisors={supervisors}
            />
          </div>
        </div>

        {/* Change Password Section */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
            <Lock className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
