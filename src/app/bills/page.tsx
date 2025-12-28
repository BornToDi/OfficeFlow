// src/app/bills/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/actions";
import { getBillsForRolePage } from "@/lib/repo";
import { PaginationControls } from "@/components/pagination-controls";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PlainBillItem = {
  id: string;
  billId: string;
  date: string; // ISO
  from: string;
  to: string;
  transport: string | null;
  purpose: string;
  amount: number;
};

type PlainBill = {
  id: string;
  companyName: string;
  companyAddress: string;
  employeeId: string;
  employee: {
    id: string;
    name: string;
    email: string;
    role: string;
    supervisorId: string | null;
    employeeCode: string | null;
  } | null;
  amount: number;
  amountInWords: string;
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "APPROVED_BY_SUPERVISOR"
    | "APPROVED_BY_ACCOUNTS"
    | "APPROVED_BY_MANAGEMENT"
    | "REJECTED_BY_SUPERVISOR"
    | "REJECTED_BY_ACCOUNTS"
    | "REJECTED_BY_MANAGEMENT"
    | "PAID";
  createdAt: string;
  updatedAt: string;
  items: PlainBillItem[];
};

export default async function BillsPage({
  searchParams,
}: {
  searchParams?: { page?: string; _debugInfo?: string };
}) {
  // await the proxy before reading properties
  const sp = await searchParams;
  const page = Number(sp?.page ?? "1") || 1;

  // ensure session is available before using it
  const session = await getSession();
  if (!session) redirect("/");

  // ← DB-backed pagination (10 per page)
  const { rows, totalPages, page: currentPage } = await getBillsForRolePage(
    { id: session.user.id, role: session.user.role },
    page,
    10
  );

  // Convert Prisma results to plain serializable objects
  const bills: PlainBill[] = rows
    .sort((a, b) => +b.updatedAt - +a.updatedAt) // newest first (Drive-like)
    .map((b) => ({
      id: b.id,
      companyName: b.companyName,
      companyAddress: b.companyAddress,
      employeeId: b.employeeId,
      employee: b.employee
        ? {
            id: b.employee.id,
            name: b.employee.name,
            email: b.employee.email,
            role: String(b.employee.role),
            supervisorId: b.employee.supervisorId ?? null,
            employeeCode: b.employee.employeeCode ?? null,
          }
        : null,
      amount: Number(b.amount),
      amountInWords: b.amountInWords,
      status: b.status as PlainBill["status"],
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      items: (b.items || []).map((it: any) => ({
        id: it.id,
        billId: it.billId,
        date: new Date(it.date).toISOString(),
        from: it.from,
        to: it.to,
        transport: it.transport ?? null,
        purpose: it.purpose,
        amount: Number(it.amount),
      })),
    }));

  // Build a minimal user list (for filters/search by employee)
  const users =
    Array.from(
      new Map(
        bills
          .filter((b) => !!b.employee)
          .map((b) => [b.employee!.id, b.employee!])
      ).values()
    ) || [];

  const isSupervisor = session.user.role === "supervisor";

  // Client component
  const BillsDriveView = (await import("@/components/bills/bills-drive-view")).BillsDriveView;

  return (
    <div className="container mx-auto p-6">
      <BillsDriveView bills={bills} users={users} isSupervisor={isSupervisor} />

      {/* Pager */}
      <PaginationControls
        page={currentPage}
        totalPages={totalPages}
        basePath="/bills"
        searchParams={searchParams}
      />
    </div>
  );
}
