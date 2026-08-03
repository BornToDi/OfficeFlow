import type { AdvanceSummary, Bill, EmployeeAdvance } from "./types";

/**
 * Replays advance grants and bill payments chronologically. A paid bill only
 * is deducted after advance tracking begins. The balance intentionally may
 * become negative: a negative value is money still owed to the employee.
 */
export function calculateAdvanceSummaries(
  employeeIds: string[],
  bills: Bill[],
  advances: EmployeeAdvance[],
): AdvanceSummary[] {
  return employeeIds.map((employeeId) => {
    const events: Array<{ at: number; kind: "grant" | "paid"; amount: number }> = [];
    const employeeAdvances = advances.filter((advance) => advance.employeeId === employeeId);
    const trackingStartedAt = employeeAdvances.length
      ? Math.min(...employeeAdvances.map((advance) => new Date(advance.grantedAt).getTime()))
      : Number.POSITIVE_INFINITY;

    employeeAdvances
      .forEach((advance) => events.push({
        at: new Date(advance.grantedAt).getTime(),
        kind: "grant",
        amount: Number(advance.amount) || 0,
      }));

    bills
      .filter((bill) => bill.employeeId === employeeId && bill.status === "PAID")
      .forEach((bill) => {
        const paidEntry = (bill.history || [])
          .filter((entry) => entry.status === "PAID")
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
        const paidAt = new Date(paidEntry?.timestamp || bill.updatedAt).getTime();
        if (paidAt < trackingStartedAt) return;
        events.push({
          at: paidAt,
          kind: "paid",
          amount: Number(bill.amount) || 0,
        });
      });

    // At an identical timestamp, make newly recorded money available first.
    events.sort((a, b) => a.at - b.at || (a.kind === "grant" ? -1 : 1));

    let totalGranted = 0;
    let usedForPaidBills = 0;
    let balance = 0;
    events.forEach((event) => {
      if (event.kind === "grant") {
        totalGranted += event.amount;
        balance += event.amount;
      } else {
        balance -= event.amount;
        usedForPaidBills += event.amount;
      }
    });

    return { employeeId, totalGranted, usedForPaidBills, balance };
  });
}
