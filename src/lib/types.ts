// src/lib/types.ts

export type Role = "employee" | "supervisor" | "accounts" | "management";

export type BillStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED_BY_SUPERVISOR"
  | "APPROVED_BY_ACCOUNTS"
  | "APPROVED_BY_MANAGEMENT"
  | "REJECTED_BY_SUPERVISOR"
  | "REJECTED_BY_ACCOUNTS"
  | "REJECTED_BY_MANAGEMENT"
  | "PAID";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  supervisorId?: string | null;
  designation?: string | null;

  /** The human-visible ID you typed during registration (e.g., EMP-001). */
  employeeCode?: string | null; // 👈 add this so Bill form can auto-show it
}

export interface BillItem {
  id: string;
  date: string;                 // ISO
  from: string;
  to: string;
  transport?: string | null;    // optional in DB/UI
  purpose: string;
  amount: number;

  /** Per-row file (PDF/image) shown in Bill-2/Bill-3 view/edit */
  attachmentUrl?: string | null; // 👈 supports your new uploads
}

export interface Bill {
  id: string;
  companyName: string;
  companyAddress: string;
  employeeId: string;           // internal user.id (not employeeCode)
  amount: number;               // total amount
  amountInWords: string;
  items: BillItem[];
  status: BillStatus;
  createdAt: string;
  updatedAt: string;
  history: {
    status: BillStatus;
    timestamp: string;
    actorId: string | null;
    comment?: string | null;
  }[];
}
