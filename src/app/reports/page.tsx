// src/app/reports/page.tsx
import { getSession } from "@/lib/actions";
import { redirect } from "next/navigation";

import {
  getBillsForReports,
  summarizeByStatus,
  summarizeByMonth,
} from "@/lib/reports";

import { ReportsDashboard } from "@/components/reports/reports-dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect("/");

  // DB-backed bills scoped to the viewer’s role
  const bills = await getBillsForReports(session.user);

  // Map: { STATUS: { count, total } }
  const statusMap = summarizeByStatus(
    bills.map((b) => ({ status: b.status, amount: Number(b.amount) }))
  );

  const totalCount = bills.length;
  const totalAmount = bills.reduce((s, b) => s + Number(b.amount || 0), 0);

  // Buckets for “ratio” view
  const paidCount = statusMap.PAID?.count ?? 0;
  const rejectedCount =
    (statusMap.REJECTED_BY_SUPERVISOR?.count ?? 0) +
    (statusMap.REJECTED_BY_ACCOUNTS?.count ?? 0) +
    (statusMap.REJECTED_BY_MANAGEMENT?.count ?? 0);
  const inProgressCount = Math.max(totalCount - paidCount - rejectedCount, 0);

  const pct = (n: number) =>
    totalCount ? Math.round((n / totalCount) * 1000) / 10 : 0;

  const funnel = [
    { label: "In Progress", count: inProgressCount, pct: pct(inProgressCount) },
    { label: "Paid", count: paidCount, pct: pct(paidCount) },
    { label: "Rejected", count: rejectedCount, pct: pct(rejectedCount) },
  ];

  // last 6 months mini-trend
  const trend = summarizeByMonth(
    bills.map((b) => ({ createdAt: b.createdAt, amount: Number(b.amount) })),
    6
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>
      <ReportsDashboard
        totals={{ count: totalCount, amount: totalAmount }}
        statusMap={statusMap}
        funnel={funnel}
        trend={trend}
      />
    </div>
  );
}
