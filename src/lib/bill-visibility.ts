import type { BillStatus } from "./types";

const EMPLOYEE_AMOUNT_MARKER = "EMPLOYEE_VISIBLE_AMOUNT:";
const SUPERVISOR_DIFF_MARKER = "SUPERVISOR_EDIT_DIFF:";

export interface SupervisorEditChange {
  field: string;
  before: string;
  after: string;
}

export const BILL5_GM_EMAIL = "sales@networld-bd.com";

export function isGmIdentity(user: { email?: string | null; name?: string | null; designation?: string | null }) {
  if (String(user.email || "").trim().toLowerCase() === BILL5_GM_EMAIL) return true;
  const identity = String(user.designation || user.name || "")
    .trim()
    .toLowerCase()
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ");

  return identity === "gm" || identity === "general manager";
}

type ForwardingSupervisor = {
  id: string;
  email?: string | null;
  name?: string | null;
  designation?: string | null;
  department?: string | null;
};

const normalizeForwardingDepartment = (value?: string | null) =>
  String(value || "").trim().toLowerCase();

export function filterForwardingSupervisors<T extends ForwardingSupervisor>(
  supervisors: T[],
  currentSupervisorId: string
) {
  const currentSupervisor = supervisors.find(
    (supervisor) => String(supervisor.id) === String(currentSupervisorId)
  );
  const currentDepartment = normalizeForwardingDepartment(currentSupervisor?.department);

  return supervisors.filter((supervisor) => {
    if (String(supervisor.id) === String(currentSupervisorId)) return false;
    if (isGmIdentity(supervisor)) return true;
    return Boolean(currentDepartment) &&
      normalizeForwardingDepartment(supervisor.department) === currentDepartment;
  });
}

export function employeeAmountMarker(amount: number) {
  return `[${EMPLOYEE_AMOUNT_MARKER}${Number(amount)}]`;
}

export function employeeSubmittedAmount(
  history: Array<{ comment?: string | null }> | null | undefined,
  currentAmount: number
) {
  const snapshots = (history ?? []).flatMap((entry) => {
    const match = entry.comment?.match(/\[EMPLOYEE_VISIBLE_AMOUNT:([-+]?\d+(?:\.\d+)?)\]/);
    if (!match) return [];
    const amount = Number(match[1]);
    return Number.isFinite(amount) ? [amount] : [];
  });

  return snapshots.length ? snapshots[snapshots.length - 1] : Number(currentAmount);
}

export function isAccountsApproved(status: BillStatus | string) {
  return [
    "APPROVED_BY_ACCOUNTS",
    "APPROVED_BY_MANAGEMENT",
    "REJECTED_BY_MANAGEMENT",
    "PAID",
  ].includes(String(status).toUpperCase());
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (Array.isArray(value)) return value.join(", ") || "—";
  return String(value);
}

function displayDate(value: unknown) {
  if (!value) return value;
  const date = new Date(value as string | number | Date);
  return Number.isNaN(date.getTime()) ? value : date.toISOString().slice(0, 10);
}

function addChange(changes: SupervisorEditChange[], field: string, before: unknown, after: unknown) {
  const oldValue = displayValue(before);
  const newValue = displayValue(after);
  if (oldValue !== newValue) changes.push({ field, before: oldValue, after: newValue });
}

export function buildSupervisorEditChanges(existingBill: any, editedBill: any) {
  const changes: SupervisorEditChange[] = [];
  addChange(changes, "Company name", existingBill.companyName, editedBill.companyName);
  addChange(changes, "Company address", existingBill.companyAddress, editedBill.companyAddress);
  addChange(changes, "Total amount", Number(existingBill.amount), Number(editedBill.totalAmount));

  const beforeItems = existingBill.items ?? [];
  const afterItems = editedBill.items ?? [];
  addChange(changes, "Number of rows", beforeItems.length, afterItems.length);

  const purposeLabels: Record<string, string> = {
    parentName: "Name", dateFrom: "Date from", dateTo: "Date to", time: "Time",
    incident: "Incident", purpose: "Purpose", bankName: "Bank name", vehicle: "Vehicle",
    local: "Local conveyance", trip: "Trip", food: "Food", hotel: "Hotel",
    others: "Others", advance: "Advance", remarks: "Remarks",
  };

  for (let index = 0; index < Math.max(beforeItems.length, afterItems.length); index++) {
    const before = beforeItems[index];
    const after = afterItems[index];
    if (!before || !after) {
      addChange(changes, `Row ${index + 1}`, before ? "Present" : "Not present", after ? "Present" : "Removed");
      continue;
    }
    addChange(
      changes,
      `Row ${index + 1} date`,
      displayDate(before.date),
      displayDate(after.date)
    );
    addChange(changes, `Row ${index + 1} from`, before.from, after.from);
    addChange(changes, `Row ${index + 1} to`, before.to, after.to);
    addChange(changes, `Row ${index + 1} transport`, before.transport, after.transport);
    addChange(changes, `Row ${index + 1} amount`, Number(before.amount), Number(after.amount));
    addChange(changes, `Row ${index + 1} attachment`, before.attachmentUrl, after.attachmentUrl);

    try {
      const oldPurpose = JSON.parse(before.purpose || "{}");
      const newPurpose = JSON.parse(after.purpose || "{}");
      const keys = new Set([...Object.keys(oldPurpose), ...Object.keys(newPurpose)]);
      keys.forEach((key) => {
        if (["selectedColumns", "total", "net"].includes(key)) return;
        addChange(
          changes,
          `Row ${index + 1} ${purposeLabels[key] ?? key}`,
          oldPurpose[key],
          newPurpose[key]
        );
      });
    } catch {
      addChange(changes, `Row ${index + 1} purpose`, before.purpose, after.purpose);
    }
  }

  return changes;
}

export function supervisorEditDiffMarker(changes: SupervisorEditChange[]) {
  return changes.length
    ? `[${SUPERVISOR_DIFF_MARKER}${encodeURIComponent(JSON.stringify(changes))}]`
    : "";
}

export function parseSupervisorEditChanges(comment?: string | null): SupervisorEditChange[] {
  const match = comment?.match(/\[SUPERVISOR_EDIT_DIFF:([^\]]+)\]/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1]));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function cleanBillHistoryComment(comment?: string | null) {
  return (comment ?? "")
    .replace(/\s*\[EMPLOYEE_VISIBLE_AMOUNT:[^\]]+\]/g, "")
    .replace(/\s*\[SUPERVISOR_EDIT_DIFF:[^\]]+\]/g, "")
    .trim();
}
