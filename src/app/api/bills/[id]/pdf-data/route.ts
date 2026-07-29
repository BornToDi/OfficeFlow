import { NextResponse } from "next/server";
import { getSession } from "@/lib/actions";
import { getBillById } from "@/lib/repo";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> | { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await Promise.resolve(context.params);
  const bill = await getBillById(id);
  if (!bill) return NextResponse.json({ error: "Bill not found" }, { status: 404 });
  if (bill.employeeId !== session.user.id) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  return NextResponse.json({
    id: bill.id,
    companyName: bill.companyName,
    companyAddress: bill.companyAddress,
    amount: Number(bill.amount),
    amountInWords: bill.amountInWords,
    status: bill.status,
    employee: bill.employee
      ? { name: bill.employee.name, employeeCode: bill.employee.employeeCode, designation: bill.employee.designation }
      : null,
    items: bill.items.map((item) => ({
      date: item.date.toISOString(),
      from: item.from,
      to: item.to,
      transport: item.transport,
      purpose: item.purpose,
      amount: Number(item.amount),
    })),
  });
}
