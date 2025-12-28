// // src/lib/actions.ts
// "use server";

// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
// import { revalidatePath } from "next/cache";

// import {
//   findUserByEmail,
//   findUserById,
//   createUser,
//   createBill,
//   getBillById,
//   updateBillStatus,
//   saveBillDraft,
//   updateBillDraft,
//   submitDraft,
//   updateUserProfile, // ← NEW
// } from "./repo";

// import type { Role, BillStatus } from "./types";

// const SESSION_COOKIE_NAME = "office-flow-session";

// /* ----------------------------- AUTH ----------------------------- */

// export async function login(
//   prevState: { error: string } | undefined,
//   formData: FormData
// ) {
//   const email = (formData.get("email") as string)?.trim().toLowerCase();
//   if (!email) return { error: "Email is required." };

//   const user = await findUserByEmail(email);
//   if (!user) return { error: "Invalid email or password." };

//   const c = await cookies();
//   c.set(SESSION_COOKIE_NAME, user.id, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     maxAge: 60 * 60 * 24 * 7,
//     path: "/",
//   });

//   redirect("/dashboard");
// }

// export async function logout() {
//   const c = await cookies();
//   c.delete(SESSION_COOKIE_NAME);
//   redirect("/");
// }

// export async function register(
//   prevState: { error: string } | undefined,
//   formData: FormData
// ) {
//   const name = (formData.get("name") as string)?.trim();
//   const email = (formData.get("email") as string)?.trim().toLowerCase();
//   const role = formData.get("role") as Role;
//   const supervisorId = (formData.get("supervisorId") as string | undefined) || undefined;

//   if (!name || !email || !role) {
//     return { error: "Name, email and role are required." };
//   }

//   const existing = await findUserByEmail(email);
//   if (existing) return { error: "A user with this email already exists." };

//   let supervisorIdToSet: string | undefined;
//   if (role === "employee") {
//     if (!supervisorId) return { error: "An employee must select a supervisor." };
//     const sup = await findUserById(supervisorId);
//     if (!sup) return { error: "Selected supervisor does not exist." };
//     supervisorIdToSet = sup.id;
//   }

//   const user = await createUser({ name, email, role, supervisorId: supervisorIdToSet });

//   const c = await cookies();
//   c.set(SESSION_COOKIE_NAME, user.id, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     maxAge: 60 * 60 * 24 * 7,
//     path: "/",
//   });

//   redirect("/dashboard");
// }

// export async function getSession() {
//   const c = await cookies();
//   const userId = c.get(SESSION_COOKIE_NAME)?.value;
//   if (!userId) return null;

//   const user = await findUserById(userId);
//   if (!user) return null;

//   return { user };
// }

// /* ---------------------- PROFILE ---------------------- */

// export async function updateProfile(
//   prevState:
//     | { error?: string; success?: boolean }
//     | undefined,
//   formData: FormData
// ) {
//   const session = await getSession();
//   if (!session) return { error: "Unauthorized" };

//   const name = (formData.get("name") as string)?.trim() ?? "";
//   const email = (formData.get("email") as string)?.trim().toLowerCase() ?? "";
//   const designation = ((formData.get("designation") as string) ?? "").trim();
//   const supervisorIdRaw = (formData.get("supervisorId") as string) ?? "";

//   // allow clearing supervisor
//   const supervisorId = supervisorIdRaw === "" ? null : supervisorIdRaw;

//   if (!name) return { error: "Name is required." };
//   if (!email) return { error: "Email is required." };

//   try {
//     await updateUserProfile(session.user.id, {
//       name,
//       email,
//       designation: designation || null,
//       supervisorId,
//     });

//     // ensure dashboards and settings reflect changes
//     revalidatePath("/dashboard");
//     revalidatePath("/settings");

//     return { success: true };
//   } catch (e: any) {
//     return { error: e?.message || "Failed to update profile." };
//   }
// }

// /* ---------------------- Helpers for bill parsing ---------------------- */

// function parseBillForm(formData: FormData, currentUserRole: "employee" | "supervisor") {
//   const companyName = (formData.get("companyName") as string)?.trim() || "";
//   const companyAddress = (formData.get("companyAddress") as string)?.trim() || "";
//   const amountInWords = (formData.get("amountInWords") as string)?.trim() || "";
//   const totalAmountStr = (formData.get("totalAmount") as string) || "0";
//   const itemsJSON = (formData.get("items") as string) || "[]";
//   const existingBillId = (formData.get("billId") as string) || "";

//   const employeeId =
//     currentUserRole === "employee"
//       ? (formData.get("employeeId") as string)
//       : ((formData.get("employeeId") as string) || "").trim();

//   let items: {
//     date: string; from: string; to: string; transport?: string; purpose: string; amount: number;
//   }[] = [];
//   try {
//     const parsed = JSON.parse(itemsJSON);
//     if (!Array.isArray(parsed)) throw new Error("Items must be an array");
//     items = parsed.map((it: any) => ({
//       date: new Date(String(it.date)).toISOString(),
//       from: String(it.from ?? ""),
//       to: String(it.to ?? ""),
//       transport: it.transport ? String(it.transport) : undefined,
//       purpose: String(it.purpose ?? ""),
//       amount: Number(it.amount ?? 0),
//     }));
//   } catch {
//     throw new Error("Items payload is invalid.");
//   }

//   const totalAmount = Number(totalAmountStr || 0);

//   return {
//     existingBillId,
//     employeeId,
//     companyName,
//     companyAddress,
//     amountInWords,
//     totalAmount,
//     items,
//   };
// }

// /* ----------------------------- BILLS ----------------------------- */

// export async function saveDraft(
//   prevState:
//     | {
//         error?: string;
//         success?: boolean;
//         billId?: string;
//       }
//     | undefined,
//   formData: FormData
// ) {
//   const session = await getSession();
//   if (!session || !["employee", "supervisor"].includes(session.user.role)) {
//     return { error: "Unauthorized" };
//   }

//   try {
//     const {
//       existingBillId,
//       employeeId,
//       companyName,
//       companyAddress,
//       amountInWords,
//       totalAmount,
//       items,
//     } = parseBillForm(formData, session.user.role as any);

//     let billId = existingBillId;

//     if (existingBillId) {
//       await updateBillDraft(existingBillId, {
//         companyName,
//         companyAddress,
//         amount: totalAmount,
//         amountInWords,
//         items,
//         actorId: session.user.id,
//         comment: "Draft updated by user",
//       });
//     } else {
//       const draft = await saveBillDraft({
//         employeeId,
//         companyName,
//         companyAddress,
//         amount: totalAmount,
//         amountInWords,
//         items,
//         actorId: session.user.id,
//         comment:
//           session.user.role === "supervisor" ? "Draft created by supervisor" : "Draft created by employee",
//       });
//       billId = draft.id;
//     }

//     revalidatePath(`/bills/${billId}`);
//     revalidatePath(`/bills/${billId}/edit`);
//     return { success: true, billId };
//   } catch (e) {
//     return { error: (e as Error).message || "Failed to save draft." };
//   }
// }

// export async function submitBill(
//   prevState:
//     | {
//         error?: string;
//         success?: boolean;
//       }
//     | undefined,
//   formData: FormData
// ) {
//   const session = await getSession();
//   if (!session || !["employee", "supervisor"].includes(session.user.role)) {
//     return { error: "Unauthorized" };
//   }

//   try {
//     const {
//       existingBillId,
//       employeeId,
//       companyName,
//       companyAddress,
//       amountInWords,
//       totalAmount,
//       items,
//     } = parseBillForm(formData, session.user.role as any);

//     if (existingBillId) {
//       await updateBillDraft(existingBillId, {
//         companyName,
//         companyAddress,
//         amount: totalAmount,
//         amountInWords,
//         items,
//         actorId: session.user.id,
//         comment: "Finalized draft before submit",
//       });
//       await submitDraft(existingBillId, session.user.id);
//       revalidatePath(`/bills/${existingBillId}`);
//       return { success: true };
//     }

//     const bill = await createBill(
//       {
//         employeeId,
//         companyName,
//         companyAddress,
//         amount: totalAmount,
//         amountInWords,
//         items,
//       },
//       session.user.role
//     );

//     redirect(`/bills/${bill.id}`);
//   } catch (e) {
//     return { error: (e as Error).message || "Failed to submit bill." };
//   }
// }

// export async function handleBillAction(
//   billId: string,
//   action: "approve" | "reject",
//   comment?: string
// ) {
//   const session = await getSession();
//   if (!session) throw new Error("Not authenticated");

//   const bill = await getBillById(billId);
//   if (!bill) throw new Error("Bill not found");

//   const { user } = session;
//   let nextStatus: BillStatus | null = null;

//   switch (user.role) {
//     case "supervisor":
//       if (bill.status === "SUBMITTED") {
//         nextStatus = action === "approve" ? "APPROVED_BY_SUPERVISOR" : "REJECTED_BY_SUPERVISOR";
//       }
//       break;
//     case "accounts":
//       if (bill.status === "APPROVED_BY_SUPERVISOR") {
//         nextStatus = action === "approve" ? "APPROVED_BY_ACCOUNTS" : "REJECTED_BY_ACCOUNTS";
//       } else if (bill.status === "APPROVED_BY_MANAGEMENT") {
//         nextStatus = action === "approve" ? "PAID" : null;
//       }
//       break;
//     case "management":
//       if (bill.status === "APPROVED_BY_ACCOUNTS") {
//         nextStatus = action === "approve" ? "APPROVED_BY_MANAGEMENT" : "REJECTED_BY_MANAGEMENT";
//       }
//       break;
//     case "employee":
//       if (action === "approve" && bill.status === "APPROVED_BY_MANAGEMENT") {
//         nextStatus = "PAID";
//       }
//       break;
//   }

//   if (!nextStatus) throw new Error("Invalid action for your role or bill status.");

//   await updateBillStatus(billId, nextStatus, user.id, comment);
//   revalidatePath(`/bills/${billId}`);
// }

// export async function receiveMoney(billId: string) {
//   const session = await getSession();
//   if (!session || session.user.role !== "employee") {
//     throw new Error("Unauthorized");
//   }
//   await updateBillStatus(billId, "PAID", session.user.id, "Payment confirmed by employee.");
//   revalidatePath(`/bills/${billId}`);
// }
// src/lib/actions.ts
// src/lib/actions.ts
// src/lib/actions.ts
// src/lib/actions.ts
// src/lib/actions.ts
// src/lib/actions.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { promises as fs } from "fs";
import path from "path";
import crypto from "node:crypto";

import {
  findUserByEmail,
  findUserById,
  createUser,
  createBill,
  getBillById,
  updateBillStatus,
  saveBillDraft,
  updateBillDraft,
  submitDraft,
  updateUserProfile,
  assertNoDuplicateTripsForEmployee, 
} from "./repo";

import type { Role, BillStatus } from "./types";
import { prisma } from "./db";

// -------- password hashing via Node crypto.scrypt (no external deps)
import { scrypt as _scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
const scrypt = promisify(_scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `s:${salt}:${derived.toString("hex")}`;
}
async function verifyPassword(password: string, stored: string | null | undefined) {
  if (!stored) return false;
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "s") return false;
  const [, salt, hex] = parts;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const hash = Buffer.from(hex, "hex");
  return hash.length === derived.length && timingSafeEqual(hash, derived);
}

const SESSION_COOKIE_NAME = "office-flow-session";

/** Resolve a supervisor-typed identifier to a real User.id.
 *  Accepts: exact User.id OR employeeCode (case-insensitive).
 */
async function resolveEmployeeIdentifier(input: string | null | undefined): Promise<string | null> {
  const raw = (input ?? "").trim();
  if (!raw) return null;

  // Try by exact DB id first
  const byId = await findUserById(raw);
  if (byId) return byId.id;

  // Try by employeeCode (case-insensitive)
  const byCode = await prisma.user.findFirst({
    where: { employeeCode: raw.toUpperCase() },
    select: { id: true },
  });
  if (byCode) return byCode.id;

  return null;
}

/** Should a supervisor's submit auto-approve (APPROVED_BY_SUPERVISOR)? */
async function shouldAutoApproveOnSubmit(currentSupervisorId: string, employeeId: string) {
  const submitter = await findUserById(currentSupervisorId);
  const employee = await findUserById(employeeId);
  if (!submitter || !employee) return false;

  // Supervisor creating a bill for themself:
  if (submitter.id === employee.id) {
    // Auto-approve only if they are top-level (no upline)
    return !submitter.supervisorId;
  }

  // Supervisor creating for someone else:
  // Auto-approve only if they are the direct supervisor of the employee
  return employee.supervisorId === submitter.id;
}

/* ----------------------------- AUTH ----------------------------- */

export async function login(
  prevState: { error?: string } | undefined,
  formData: FormData
) {
  const email = (formData.get("email") as string)?.trim().toLowerCase() || "";
  const password = (formData.get("password") as string) || "";

  if (!email) return { error: "Email is required." };
  if (!password) return { error: "Password is required." };

  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, (user as any).passwordHash))) {
    return { error: "Invalid email or password." };
  }

  const c = await cookies();
  c.set(SESSION_COOKIE_NAME, user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/dashboard");
}

export async function logout() {
  const c = await cookies();
  c.delete(SESSION_COOKIE_NAME);
  redirect("/");
}

export async function register(
  prevState: { error?: string } | undefined,
  formData: FormData
) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const role = formData.get("role") as Role;
  const supervisorId = (formData.get("supervisorId") as string | undefined) || undefined;

  const designation = ((formData.get("designation") as string) ?? "").trim();
  const employeeCodeRaw = ((formData.get("employeeCode") as string) ?? "").trim();
  const employeeCode = employeeCodeRaw ? employeeCodeRaw.toUpperCase() : "";

  const password = (formData.get("password") as string) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string) ?? "";

  if (!name || !email || !role) return { error: "Name, email and role are required." };
  if (role === "employee" || role === "supervisor") {
    if (!designation) return { error: "Designation is required." };
    if (!employeeCode) return { error: "Employee Code is required." };
  }
  if (password.length < 4) return { error: "Password must be at least 4 characters." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };

  const existing = await findUserByEmail(email);
  if (existing) return { error: "A user with this email already exists." };

  let supervisorIdToSet: string | undefined;
  if (role === "employee") {
    if (!supervisorId) return { error: "An employee must select a supervisor." };
    const sup = await findUserById(supervisorId);
    if (!sup) return { error: "Selected supervisor does not exist." };
    supervisorIdToSet = sup.id;
  }

  const isNextRedirect = (e: any) =>
    e && typeof e === "object" && typeof e.digest === "string" && e.digest.startsWith("NEXT_REDIRECT");

  try {
    const passwordHash = await hashPassword(password);

    const user = await createUser({
      name,
      email,
      role,
      supervisorId: supervisorIdToSet,
      designation: designation || null,
      employeeCode: employeeCode || null,
      passwordHash,
    });

    const c = await cookies();
    c.set(SESSION_COOKIE_NAME, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  } catch (e: any) {
    if (isNextRedirect(e)) throw e;
    const msg = (e?.message || "").toLowerCase();
    if (msg.includes("unique") && msg.includes("employeecode")) {
      return { error: "Employee Code already exists. Please choose a different one." };
    }
    return { error: e?.message || "Registration failed." };
  }

  redirect("/dashboard");
}

export async function getSession() {
  const c = await cookies();
  const userId = c.get(SESSION_COOKIE_NAME)?.value;
  if (!userId) return null;

  const user = await findUserById(userId);
  if (!user) return null;

  return { user };
}

/* ---------------------- PROFILE ---------------------- */

export async function updateProfile(
  prevState:
    | { error?: string; success?: boolean }
    | undefined,
  formData: FormData
) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const name = (formData.get("name") as string)?.trim() ?? "";
  const email = (formData.get("email") as string)?.trim().toLowerCase() ?? "";
  const designation = ((formData.get("designation") as string) ?? "").trim();
  const supervisorIdRaw = (formData.get("supervisorId") as string) ?? "";
  const supervisorId = supervisorIdRaw === "" ? null : supervisorIdRaw;

  if (!name) return { error: "Name is required." };
  if (!email) return { error: "Email is required." };

  try {
    await updateUserProfile(session.user.id, {
      name,
      email,
      designation: designation || null,
      supervisorId,
    });

    revalidatePath("/dashboard");
    revalidatePath("/settings");

    return { success: true };
  } catch (e: any) {
    return { error: e?.message || "Failed to update profile." };
  }
}

/* ---------------------- Helpers for bill parsing ---------------------- */

async function parseBillForm(formData: FormData, currentUserRole: "employee" | "supervisor") {
  const companyName = (formData.get("companyName") as string)?.trim() || "";
  const companyAddress = (formData.get("companyAddress") as string)?.trim() || "";
  const amountInWords = (formData.get("amountInWords") as string)?.trim() || "";
  const totalAmountStr = (formData.get("totalAmount") as string) || "0";
  const itemsJSON = (formData.get("items") as string) || "[]";
  const existingBillId = (formData.get("billId") as string) || "";
  const formatType = (formData.get("formatType") as string) || "BILL1";

  // accept either name (old forms still OK)
  const employeeIdOrCode =
    ((formData.get("employeeIdOrCode") as string) ||
      (formData.get("employeeId") as string) || "").trim();

  // for employees, employeeId comes from session; for supervisors we may receive an id/code
  const employeeId =
    currentUserRole === "employee"
      ? (formData.get("employeeId") as string)
      : ((formData.get("employeeId") as string) || "").trim();

  // parse items
  let items: any[] = [];
  try {
    const parsed = JSON.parse(itemsJSON);
    if (!Array.isArray(parsed)) throw new Error("Items must be an array");
    items = parsed.map((it: any) => ({
      date: new Date(String(it.date)).toISOString(),
      from: String(it.from ?? ""),
      to: String(it.to ?? ""),
      transport: it.transport ? String(it.transport) : undefined,
      purpose: String(it.purpose ?? ""),
      amount: Number(it.amount ?? 0),
      attachmentUrl: null, // default
    }));
  } catch {
    throw new Error("Items payload is invalid.");
  }

  // pick up per-row files only for BILL2 / BILL3 / BILL4
  if (formatType === "BILL2" || formatType === "BILL3" || formatType === "BILL4") {
    for (let i = 0; i < items.length; i++) {
      const maybe = formData.get(`attachment_${i}`);
      const looksLikeFile = !!maybe && typeof (maybe as any).arrayBuffer === "function";
      if (looksLikeFile) {
        try {
          const url = await saveUpload(maybe as unknown as File);
          (items[i] as any).attachmentUrl = url;
        } catch {}
      }
    }
  }

  const totalAmount = Number(totalAmountStr || 0);

  return {
    existingBillId,
    employeeIdOrCode,
    employeeId, // ← important: this is what we’ll resolve for supervisors
    companyName,
    companyAddress,
    amountInWords,
    totalAmount,
    items,
  };
}

/* ----------------------------- BILLS ----------------------------- */

export async function saveDraft(
  prevState:
    | {
        error?: string;
        success?: boolean;
        billId?: string;
      }
    | undefined,
  formData: FormData
) {
  const session = await getSession();
  if (!session || !["employee", "supervisor"].includes(session.user.role)) {
    return { error: "Unauthorized" };
  }

  try {
    const parsed = await parseBillForm(formData, session.user.role as any);

    const employeeIdToUse =
      session.user.role === "employee"
        ? session.user.id
        : await resolveEmployeeIdentifier(parsed.employeeIdOrCode);

    if (!employeeIdToUse) {
      return { error: "Invalid employee. Enter a valid User ID or Employee Code." };
    }

   // Only check when caller sent items (new drafts or item edits)
if (!parsed.existingBillId) {
  if (parsed.items?.length) {
    await assertNoDuplicateTripsForEmployee(employeeIdToUse, parsed.items);
  }
} else if (parsed.items && parsed.items.length) {
  await assertNoDuplicateTripsForEmployee(employeeIdToUse, parsed.items, parsed.existingBillId);
}

    let billId = parsed.existingBillId;

    if (parsed.existingBillId) {
   // inside saveDraft (when parsed.existingBillId is true)
    await updateBillDraft(parsed.existingBillId, {
      companyName: parsed.companyName,
      companyAddress: parsed.companyAddress,
      amount: parsed.totalAmount,
      amountInWords: parsed.amountInWords,
      // send items ONLY if there are rows; otherwise omit to preserve DB rows
      items: parsed.items && parsed.items.length ? parsed.items : undefined,
      actorId: session.user.id,
      comment: "Draft updated by user",
    });

    } else {
      const draft = await saveBillDraft({
        employeeId: employeeIdToUse,
        companyName: parsed.companyName,
        companyAddress: parsed.companyAddress,
        amount: parsed.totalAmount,
        amountInWords: parsed.amountInWords,
        items: parsed.items,
        actorId: session.user.id,
        comment:
          session.user.role === "supervisor"
            ? "Draft created by supervisor"
            : "Draft created by employee",
      });
      billId = draft.id;
    }

    revalidatePath(`/bills/${billId}`);
    revalidatePath(`/bills/${billId}/edit`);
    revalidatePath(`/dashboard`);
    return { success: true, billId };
  } catch (e) {
    return { error: (e as Error).message || "Failed to save draft." };
  }
}

// src/lib/actions.ts
export async function submitBill(
  prevState: { error?: string; success?: boolean; billId?: string } | undefined,
  formData: FormData
) {
  const session = await getSession();
  if (!session || !["employee", "supervisor"].includes(session.user.role)) {
    return { error: "Unauthorized" };
  }

  try {
    const parsed = await parseBillForm(formData, session.user.role as any);

    const employeeIdToUse =
      session.user.role === "employee"
        ? session.user.id
        : await resolveEmployeeIdentifier(parsed.employeeIdOrCode);

    if (!employeeIdToUse) {
      return { error: "Invalid employee. Enter a valid User ID or Employee Code." };
    }

if (parsed.existingBillId) {

  // Validate against other bills (exclude itself)
  if (parsed.items?.length) {
    await assertNoDuplicateTripsForEmployee(employeeIdToUse, parsed.items, parsed.existingBillId);
  }

  // Always update the draft with current payload (won't wipe files unless provided)
  await updateBillDraft(parsed.existingBillId, {
    companyName: parsed.companyName,
    companyAddress: parsed.companyAddress,
    amountInWords: parsed.amountInWords,
    amount: parsed.totalAmount,
    items: parsed.items, // server keeps attachments already stored
    actorId: session.user.id,
    comment: "Finalized draft before submit",
  });

  await submitDraft(parsed.existingBillId, session.user.id);

  // If a supervisor submits, auto-approve to Accounts
  if (session.user.role === "supervisor") {
    await updateBillStatus(
      parsed.existingBillId,
      "APPROVED_BY_SUPERVISOR",
      session.user.id,
      "Auto-approved by supervisor submit"
    );
  }

  revalidatePath(`/bills/${parsed.existingBillId}`);
  revalidatePath(`/dashboard`);
  return { success: true, billId: parsed.existingBillId };
}

// NEW bill path
if (parsed.items?.length) {
  await assertNoDuplicateTripsForEmployee(employeeIdToUse, parsed.items);
}

    // brand-new bill
    const bill = await createBill(
      {
        employeeId: employeeIdToUse,
        companyName: parsed.companyName,
        companyAddress: parsed.companyAddress,
        amount: parsed.totalAmount,
        amountInWords: parsed.amountInWords,
        items: parsed.items,
      },
      session.user.role
    );

    revalidatePath(`/bills/${bill.id}`);
    revalidatePath(`/dashboard`);
    return { success: true, billId: bill.id };
  } catch (e) {
    return { error: (e as Error).message || "Failed to submit bill." };
  }
}



export async function handleBillAction(
  billId: string,
  action: "approve" | "reject",
  comment?: string
) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const bill = await getBillById(billId);
  if (!bill) throw new Error("Bill not found");

  const { user } = session;
  let nextStatus: BillStatus | null = null;

  // Helper: last SUBMITTED history event (who submitted)
  const lastSubmitted = [...(bill.history ?? [])]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .find((h) => h.status === "SUBMITTED");

  // Enforce the supervisor-approval rule
  if (user.role === "supervisor") {
    if (bill.status !== "SUBMITTED") {
      throw new Error("Supervisors can only act on SUBMITTED bills.");
    }

    // Case A: submitted by employee → only employee's direct supervisor can approve/reject
    if (!lastSubmitted?.actor || lastSubmitted.actor.role === "employee") {
      const employeeSupervisorId = bill.employee?.supervisorId ?? null;
      const allowed = !!employeeSupervisorId && employeeSupervisorId === user.id;
      if (!allowed) {
        throw new Error("You are not the approving supervisor for this bill.");
      }
      nextStatus = action === "approve" ? "APPROVED_BY_SUPERVISOR" : "REJECTED_BY_SUPERVISOR";
    }
    // Case B: submitted by a supervisor → only THAT supervisor's supervisor can approve/reject
    else if (lastSubmitted.actor.role === "supervisor") {
      const submitterSupervisorId = lastSubmitted.actor.supervisorId ?? null;
      const allowed = !!submitterSupervisorId && submitterSupervisorId === user.id;
      if (!allowed) {
        throw new Error("You are not the approving supervisor for this bill.");
      }
      nextStatus = action === "approve" ? "APPROVED_BY_SUPERVISOR" : "REJECTED_BY_SUPERVISOR";
    }
  } else if (user.role === "accounts") {
    if (bill.status === "APPROVED_BY_SUPERVISOR") {
      nextStatus = action === "approve" ? "APPROVED_BY_ACCOUNTS" : "REJECTED_BY_ACCOUNTS";
    } else if (bill.status === "APPROVED_BY_MANAGEMENT") {
      nextStatus = action === "approve" ? "PAID" : null;
    }
  } else if (user.role === "management") {
    if (bill.status === "APPROVED_BY_ACCOUNTS") {
      nextStatus = action === "approve" ? "APPROVED_BY_MANAGEMENT" : "REJECTED_BY_MANAGEMENT";
    }
  } else if (user.role === "employee") {
    if (action === "approve" && bill.status === "APPROVED_BY_MANAGEMENT") {
      nextStatus = "PAID";
    }
  }

  if (!nextStatus) throw new Error("Invalid action for your role or bill status.");

  await updateBillStatus(billId, nextStatus, user.id, comment);
  revalidatePath(`/bills/${billId}`);
}

/** Employee confirms they received the money → marks bill as PAID */
export async function receiveMoney(billId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "employee") {
    throw new Error("Unauthorized");
  }
  await updateBillStatus(billId, "PAID", session.user.id, "Payment confirmed by employee.");
  revalidatePath(`/bills/${billId}`);
}

/* ---------------------- Payment request/confirm flow ---------------------- */

export async function requestEmployeeReceipt(billId: string) {
  "use server";
  const session = await getSession();
  if (!session || session.user.role !== "accounts") throw new Error("Unauthorized");

  const bill = await getBillById(billId);
  if (!bill) throw new Error("Bill not found");
  if (bill.status !== "APPROVED_BY_MANAGEMENT") {
    throw new Error("Payment request is only valid after management approval.");
  }

  // Log a history entry without changing status
  await prisma.billHistory.create({
    data: {
      billId,
      status: bill.status as BillStatus,
      actorId: session.user.id,
      comment: "Payment requested from employee",
    },
  });

  revalidatePath(`/bills/${billId}`);
}

/* ---- Tiny wrappers so client components can import stable names ---- */

export async function requestReceiptAction(billId: string) {
  "use server";
  await requestEmployeeReceipt(billId);
}

export async function confirmReceiptAction(billId: string) {
  "use server";
  await receiveMoney(billId);
}

// IMPORTANT: Do not use the global `File` type in Node. Accept a Blob-like object.
async function saveUpload(
  file: Blob & { name?: string; type?: string; size: number }
): Promise<string> {
  // guardrails (5 MB, images/PDF only)
  const MAX = 5 * 1024 * 1024;
  if (file.size > MAX) throw new Error("File too large (max 5MB).");
  const type = file.type || "";
  if (!/(pdf|image)/i.test(type)) throw new Error("Only images or PDF allowed.");

  const buf = Buffer.from(await file.arrayBuffer());
  const extGuess =
    type.includes("pdf") ? ".pdf" :
    type.includes("png") ? ".png" :
    type.includes("jpeg") ? ".jpg" :
    type.includes("jpg") ? ".jpg" :
    type.includes("webp") ? ".webp" :
    "";

  const name = `${Date.now()}_${crypto.randomBytes(6).toString("hex")}${extGuess}`;

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  const fullPath = path.join(uploadsDir, name);
  await fs.writeFile(fullPath, buf);

  // public URL served by Next from /public
  return `/uploads/${name}`;
}

// NEW ACTION: approveAction
export async function approveAction(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const billId = String(formData.get("billId") ?? "");
  const action = String(formData.get("action") ?? "approve"); // "approve" or "reject"
  const comment = String(formData.get("comment") ?? "");
  const rawNext = formData.get("nextSupervisorId");
  const nextSupervisorId = rawNext ? String(rawNext).trim() : "";

  if (!billId) throw new Error("Missing billId");

  if (action === "approve") {
    if (nextSupervisorId) {
      // Forward: set assigned supervisor and keep status in supervisor workflow
      await updateBillStatus(
        billId,
        undefined, // repo will force SUBMITTED for forwarding
        session.user.id,
        comment || `Forwarded to ${nextSupervisorId}`,
        nextSupervisorId
      );

      revalidatePath(`/bills/${billId}`);
      revalidatePath("/dashboard");
      return redirect(`/bills/${billId}`);
    }

    // Final supervisor approval -> use explicit BillStatus
    await updateBillStatus(
      billId,
      "APPROVED_BY_SUPERVISOR" as any,
      session.user.id,
      comment || "Approved by supervisor"
    );
  } else if (action === "reject") {
    await updateBillStatus(
      billId,
      "REJECTED_BY_SUPERVISOR" as any,
      session.user.id,
      comment || "Rejected by supervisor"
    );
  } else {
    throw new Error("Unknown action");
  }

  revalidatePath(`/bills/${billId}`);
  revalidatePath("/dashboard");
  return redirect(`/bills/${billId}`);
}
