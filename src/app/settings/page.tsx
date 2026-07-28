// src/app/settings/page.tsx
import SettingsForm from "@/components/account/SettingsForm";
import ChangePasswordForm from "@/components/account/ChangePasswordForm";
import { getSession } from "@/lib/actions";
import { listSupervisors } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return <div className="p-6 text-sm text-slate-600">Not signed in.</div>;

  const supervisors = await listSupervisors();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Account settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your personal information and account security.</p>
      </header>

      <div className="space-y-8">
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
        <ChangePasswordForm />
      </div>
    </main>
  );
}
