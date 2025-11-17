// src/lib/serializers.ts
export function toPlainUser(u: any) {
  if (!u) return u;
  return {
    ...u,
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : null,
    updatedAt: u.updatedAt ? new Date(u.updatedAt).toISOString() : null,
  };
}

export function toPlainBill(b: any) {
  if (!b) return b;
  return {
    ...b,
    amount: Number(b.amount),
    createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : null,
    updatedAt: b.updatedAt ? new Date(b.updatedAt).toISOString() : null,
    employee: b.employee ? toPlainUser(b.employee) : null,
    items: Array.isArray(b.items)
      ? b.items.map((it: any) => ({
          ...it,
          amount: Number(it.amount),
          date: it.date ? new Date(it.date).toISOString() : null,
        }))
      : [],
    history: Array.isArray(b.history)
      ? b.history.map((h: any) => ({
          ...h,
          timestamp: h.timestamp ? new Date(h.timestamp).toISOString() : null,
          actor: h.actor ? toPlainUser(h.actor) : null,
        }))
      : [],
  };
}
