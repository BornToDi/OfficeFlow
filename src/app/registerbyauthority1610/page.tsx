import { Logo } from "@/components/logo";
import { RegistrationForm } from "@/components/auth/registration-form";
import { listSupervisors } from "@/lib/repo";

export const dynamic = "force-dynamic"; // always fetch fresh from DB
export const revalidate = 0;

export default async function RegisterPage() {
  const supervisors = await listSupervisors(); // ← from DB

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <RegistrationForm supervisors={supervisors} />

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/" className="font-medium text-primary underline-offset-4 hover:underline">
            Login
          </a>
        </p>

        {supervisors.length === 0 && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            No supervisors found yet. Create a supervisor account first, then register employees.
          </p>
        )}
      </div>
    </div>
  );
}
