import { getSession } from "@/lib/actions";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BillForm } from "@/components/bills/bill-form";
import { listSupervisors } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewBillPage() {
  const session = await getSession();
  if (!session || !["employee", "supervisor"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const user = session.user;
  let supervisors: Awaited<ReturnType<typeof listSupervisors>> = [];
  if (user.role === "supervisor") {
    try {
      supervisors = await listSupervisors();
    } catch (error) {
      console.error("Failed to load supervisors for new bill page:", error);
      supervisors = [];
    }
  }

  return (
    <div className="container mx-auto w-full">
      <Card>
        <CardHeader>
          <CardTitle>Create New Conveyance Bill</CardTitle>
          <CardDescription>Fill out the details for your bill. You can add multiple items.</CardDescription>
        </CardHeader>
        <CardContent>
          <BillForm user={user} supervisors={supervisors} />
        </CardContent>
      </Card>
    </div>
  );
}
