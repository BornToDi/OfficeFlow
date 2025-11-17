import { getSession } from "@/lib/actions";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BillForm } from "@/components/bills/bill-form";
import { listDirectReports } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewBillPage() {
  const session = await getSession();
  if (!session || !["employee", "supervisor"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const user = session.user;
  const employees = user.role === "supervisor" ? await listDirectReports(user.id) : [];

  return (
    <div className="container mx-auto w-full">
      <Card>
        <CardHeader>
          <CardTitle>Create New Conveyance Bill</CardTitle>
          <CardDescription>Fill out the details for your bill. You can add multiple items.</CardDescription>
        </CardHeader>
        <CardContent>
          <BillForm user={user} employees={employees} />
        </CardContent>
      </Card>
    </div>
  );
}
