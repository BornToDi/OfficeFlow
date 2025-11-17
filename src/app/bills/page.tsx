// src/app/bills/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/actions";
import { getBillsForRole } from "@/lib/repo";

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
  amount: number; // plain number
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
  createdAt: string; // ISO
  updatedAt: string; // ISO
  items: PlainBillItem[];
};

export default async function BillsPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const rawBills = await getBillsForRole({
    id: session.user.id,
    role: session.user.role,
  });

  // Convert Prisma results to plain serializable objects
  const bills: PlainBill[] = rawBills
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
          }
        : null,
      amount: Number(b.amount),
      amountInWords: b.amountInWords,
      status: b.status as PlainBill["status"],
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      items: (b.items || []).map((it) => ({
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

  // Import the client component (keeps this file purely server)
  const BillsDriveView = (await import("@/components/bills/bills-drive-view"))
    .BillsDriveView;

  return (
    <div className="container mx-auto p-6">
      <BillsDriveView bills={bills} users={users} isSupervisor={isSupervisor} />
    </div>
  );
}
