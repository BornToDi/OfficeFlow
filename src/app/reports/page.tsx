import { getSession } from "@/lib/actions";
import { getBills, getUsers } from "@/lib/data";
import { redirect } from "next/navigation";
import { ReportsDashboard } from "@/components/reports/reports-dashboard";

export default async function ReportsPage() {
    const session = await getSession();
    if (!session) {
        redirect('/');
    }
    
    const bills = await getBills();
    const users = await getUsers();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Reports</h1>
            <ReportsDashboard bills={bills} users={users} />
        </div>
    );
}
