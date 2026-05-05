// Minimal serializers to convert Prisma results into plain JSON-friendly objects

function toISO(d: any) {
  if (!d) return d;
  try {
    return typeof d.toISOString === "function" ? d.toISOString() : String(d);
  } catch {
    return String(d);
  }
}

export function toPlainUser(user: any) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return {
    ...rest,
    // normalize dates
    createdAt: toISO(rest.createdAt),
    updatedAt: toISO(rest.updatedAt),
  };
}

export function toPlainBill(bill: any) {
  if (!bill) return null;
  return {
    ...bill,
    // Prisma Decimal -> string
    amount: bill?.amount?.toString ? bill.amount.toString() : bill.amount,
    createdAt: toISO(bill.createdAt),
    updatedAt: toISO(bill.updatedAt),
    // normalize nested arrays/objects if present
    items: Array.isArray(bill.items)
      ? bill.items.map((it: any) => ({
          ...it,
          date: toISO(it.date),
          amount: it?.amount && typeof it.amount === "object" && typeof it.amount.toNumber === "function" ? Number(it.amount.toNumber()) : Number(it.amount ?? 0),
        }))
      : bill.items,
    history: Array.isArray(bill.history)
      ? bill.history.map((h: any) => ({
          ...h,
          timestamp: toISO(h.timestamp),
        }))
      : bill.history,
    employee: bill.employee ? toPlainUser(bill.employee) : bill.employee,
    supervisor: bill.supervisor ? toPlainUser(bill.supervisor) : bill.supervisor,
  };
}

export function toPlainSupervisorChangeRequest(request: any) {
  if (!request) return null;
  return {
    ...request,
    createdAt: toISO(request.createdAt),
    updatedAt: toISO(request.updatedAt),
    approvedAt: toISO(request.approvedAt),
    employee: request.employee ? toPlainUser(request.employee) : request.employee,
    currentSupervisor: request.currentSupervisor ? toPlainUser(request.currentSupervisor) : request.currentSupervisor,
    newSupervisor: request.newSupervisor ? toPlainUser(request.newSupervisor) : request.newSupervisor,
    approvedBy: request.approvedBy ? toPlainUser(request.approvedBy) : request.approvedBy,
  };
}