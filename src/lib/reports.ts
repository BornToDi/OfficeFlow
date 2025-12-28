// src/lib/reports.ts
import { prisma } from "./db";
import type { Role } from "./types";

export async function getBillsForReports(user: { id: string; role: Role }) {
  const where =
    user.role === "employee"
      ? { employeeId: user.id }
      : user.role === "supervisor"
      ? { OR: [{ employee: { supervisorId: user.id } }, { employeeId: user.id }] }
      : {}; // accounts & management see all

  const bills = await prisma.bill.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      employeeId: true,
      status: true,
      amount: true,
      createdAt: true,
      updatedAt: true,
      employee: {
        select: { id: true, name: true, employeeCode: true, supervisorId: true },
      },
    },
  });

  return bills.map((b) => ({ ...b, amount: Number(b.amount) }));
}

export function summarizeByStatus(
  bills: { status: string; amount: number }[]
) {
  const map: Record<string, { count: number; total: number }> = {};
  for (const b of bills) {
    const s = (b.status || "").toUpperCase();
    if (!map[s]) map[s] = { count: 0, total: 0 };
    map[s].count += 1;
    map[s].total += Number(b.amount || 0);
  }
  return map;
}

export function summarizeByMonth(
  bills: { createdAt: Date; amount: number }[],
  monthsBack = 6
) {
  const out: { ym: string; total: number; count: number }[] = [];
  const now = new Date();
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const ym = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    out.push({ ym, total: 0, count: 0 });
  }
  const idx = new Map(out.map((r, i) => [r.ym, i]));
  for (const b of bills) {
    const d = new Date(b.createdAt);
    const ym = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const i = idx.get(ym);
    if (i != null) {
      out[i].count += 1;
      out[i].total += Number(b.amount || 0);
    }
  }
  return out;
}
