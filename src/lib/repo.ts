// src/lib/repo.ts
import { prisma } from "./prisma"; // ensure this file exports your Prisma client
import type { Role, BillStatus } from "./types";

// ---- DUPLICATE TRIP GUARD ----
// "Same bill again" = same employee + same calendar day + same from/to/purpose.

function norm(s?: string | null) {
  return (s ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

function dayBoundsUTC(iso: string) {
  const d = new Date(iso);
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const end   = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1));
  const ymd   = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  return { start, end, ymd };
}

/**
 * Throws an Error if any row duplicates an existing claimed trip for the same employee:
 *  - same calendar day (UTC, consistent with your stored ISO)
 *  - same from/to/purpose (case/space-insensitive)
 *  - excludes the current bill (when editing)
 *
 * Also blocks duplicate rows **inside the same bill** payload.
 */
export async function assertNoDuplicateTripsForEmployee(
  employeeId: string,
  items: {
    date: string;   // ISO
    from?: string;
    to: string;
    purpose?: string;
  }[],
  excludeBillId?: string
) {
  // 1) Intra-bill duplicate rows (same payload)
  const seen = new Set<string>();
  for (const it of items) {
    const d = new Date(it.date);
    const key = `${d.toISOString().slice(0, 10)}|${norm(it.from)}|${norm(it.to)}|${norm(it.purpose)}`;
    if (seen.has(key)) {
      throw new Error(
        `Duplicate row in this bill: ${d.toISOString().slice(0, 10)} — ` +
        `${it.from ? `"${it.from}" → ` : ""}"${it.to}"${it.purpose ? ` (${it.purpose})` : ""}.`
      );
    }
    seen.add(key);
  }

  // 2) Cross-bill duplicates (already claimed earlier)
  // Group by day → one DB fetch per day for speed
  const dayMap = new Map<string, { start: Date; end: Date; rows: typeof items }>();
  for (const it of items) {
    const { start, end, ymd } = dayBoundsUTC(it.date);
    let g = dayMap.get(ymd);
    if (!g) {
      g = { start, end, rows: [] as any };
      dayMap.set(ymd, g);
    }
    g.rows.push(it);
  }

  for (const [ymd, g] of dayMap) {
    const sameDayRows = await prisma.billItem.findMany({
      where: {
        bill: {
          employeeId,
          ...(excludeBillId ? { NOT: { id: excludeBillId } } : {}),
        },
        date: { gte: g.start, lt: g.end },
      },
      include: { bill: { select: { id: true, status: true } } },
    });

    for (const row of g.rows) {
      const toN = norm(row.to);
      const fromN = norm(row.from);
      const purposeN = norm(row.purpose);

      const match = sameDayRows.find(
        (x) => norm(x.to) === toN && norm(x.from) === fromN && norm(x.purpose) === purposeN
      );

      if (match) {
        throw new Error(
          `Duplicate trip detected: ${ymd} — ${row.from ? `"${row.from}" → ` : ""}"${row.to}"` +
          `${row.purpose ? ` (${row.purpose})` : ""}. ` +
          `Already exists in bill ${match.bill.id} [${match.bill.status}].`
        );
      }
    }
  }
}


// src/lib/repo.ts
//import { prisma } from "./prisma"; // adjust import to your prisma helper
// Helper: which statuses are editable (draft or sent-back)
function isEditableStatus(status?: string | null) {
  const S = String(status || "").toUpperCase();
  return (
    S === "DRAFT" ||
    S === "REJECTED_BY_SUPERVISOR" ||
    S === "REJECTED_BY_ACCOUNTS" ||
    S === "REJECTED_BY_MANAGEMENT" ||
    S.includes("RETURN") ||           // e.g. RETURNED, RETURN_REQUESTED
    S.includes("CHANGE")              // e.g. CHANGES_REQUESTED
  );
}



export async function deleteBill(id: string) {
  // Adjust model names if yours differ
  await prisma.billItem.deleteMany({ where: { billId: id } });
  await prisma.billHistory.deleteMany({ where: { billId: id } });
  await prisma.bill.delete({ where: { id } });
}

/* ========== USERS ========== */

export async function findUserByEmail(email: string) {
  if (!email) return null;
  return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
}

export async function findUserById(id: string) {
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}

const normalizeEmployeeCode = (v?: string | null) =>
  v ? v.trim().toUpperCase() : null;

export async function createUser(input: {
  name: string;
  email: string;
  role: Role;
  supervisorId?: string;
  designation?: string | null;
  employeeCode?: string | null;
  passwordHash?: string | null;
}) {
  const data: any = {
    name: input.name,
    email: input.email.toLowerCase(),
    role: input.role,
    designation: input.designation ?? null,
    passwordHash: input.passwordHash ?? null,
  };

  const code = input.employeeCode ? input.employeeCode.trim().toUpperCase() : null;
  if (code) {
    const dup = await prisma.user.findFirst({
      where: { employeeCode: code },
      select: { id: true },
    });
    if (dup) throw new Error("Employee Code already in use");
    data.employeeCode = code;
  } else {
    data.employeeCode = null;
  }

  if (input.passwordHash) {
    data.passwordHash = input.passwordHash;
  }

  if (input.supervisorId) {
    const sup = await prisma.user.findUnique({ where: { id: input.supervisorId } });
    if (sup) data.supervisorId = sup.id;
  }

  return prisma.user.create({ data });
}

export async function updateUserProfile(
  userId: string,
  input: {
    name?: string;
    email?: string;
    designation?: string | null;
    supervisorId?: string | null;
    employeeCode?: string | null;
  }
) {
  // Ensure email uniqueness (other than the same user)
  if (input.email) {
    const existing = await prisma.user.findFirst({
      where: { email: input.email.toLowerCase(), NOT: { id: userId } },
      select: { id: true },
    });
    if (existing) {
      throw new Error("A user with this email already exists.");
    }
  }

  const data: any = {};
  if (typeof input.name !== "undefined") data.name = input.name.trim();
  if (typeof input.email !== "undefined") data.email = input.email.toLowerCase();
  if (typeof input.designation !== "undefined") {
    data.designation = input.designation ? input.designation.trim() : null;
  }
  if (typeof input.supervisorId !== "undefined") {
    if (input.supervisorId) {
      const sup = await prisma.user.findUnique({ where: { id: input.supervisorId } });
      if (!sup) throw new Error("Selected supervisor does not exist.");
      data.supervisorId = sup.id;
    } else {
      data.supervisorId = null;
    }
  }
  if (typeof input.employeeCode !== "undefined") {
    const code = normalizeEmployeeCode(input.employeeCode);
    if (code) {
      const dup = await prisma.user.findFirst({
        where: { employeeCode: code, NOT: { id: userId } },
        select: { id: true },
      });
      if (dup) throw new Error("Employee Code already in use");
      data.employeeCode = code;
    } else {
      data.employeeCode = null;
    }
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      designation: true,
      supervisorId: true,
    },
  });
}

export async function listSupervisors() {
  // return minimal supervisor list for dropdown
  const sup = await prisma.user.findMany({
    where: { role: "supervisor" }, // use enum value matching your schema (lowercase)
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, designation: true }
  });
  return sup;
}

export async function listDirectReports(supervisorId: string) {
  return prisma.user.findMany({
    where: { supervisorId },
    select: { id: true, name: true, employeeCode: true },
    orderBy: { name: "asc" },
  });
}

/* ========== BILLS (final submit path) ========== */

/**
 * submitContext:
 *  - submittedByRole / submittedById: who clicked "Submit"
 *  - autoApprove:
 *      true  => bill starts at APPROVED_BY_SUPERVISOR and goes straight to Accounts
 *      false => bill starts at SUBMITTED and waits for that submitter's supervisor
 */
export async function createBill(
  input: {
    employeeId: string;
    companyName: string;
    companyAddress: string;
    amount: number;
    amountInWords: string;
    items: {
      date: string;
      from: string;
      to: string;
      transport?: string;
      purpose: string;
      amount: number;
      attachmentUrl?: string;
    }[];
  },
  submitContext?: { submittedByRole?: Role; submittedById?: string; autoApprove?: boolean } | Role
) {
  const emp = await prisma.user.findUnique({ where: { id: input.employeeId } });
  if (!emp) throw new Error("Invalid employee");

  // Support both legacy (string) and new (object) second param
  let submittedByRole: Role | undefined;
  let submittedById: string | undefined;
  let autoApprove = false;

  if (typeof submitContext === "string") {
    submittedByRole = submitContext as Role;
  } else if (submitContext) {
    submittedByRole = submitContext.submittedByRole;
    submittedById = submitContext.submittedById;
    autoApprove = !!submitContext.autoApprove;
  }

  // Initial status
  const initialStatus: BillStatus =
    submittedByRole === "supervisor" && autoApprove ? "APPROVED_BY_SUPERVISOR" : "SUBMITTED";

  const historyCreates: { status: BillStatus; comment: string; actorId?: string | null }[] = [];

  if (submittedByRole === "supervisor") {
    historyCreates.push({
      status: "SUBMITTED",
      comment: "Submitted by supervisor on behalf of employee",
      actorId: submittedById ?? null,
    });
    if (initialStatus === "APPROVED_BY_SUPERVISOR") {
      historyCreates.push({
        status: "APPROVED_BY_SUPERVISOR",
        comment: "Auto-approved by supervisor submit",
        actorId: submittedById ?? null,
      });
    }
  } else {
    historyCreates.push({
      status: "SUBMITTED",
      comment: "Submitted by employee",
      actorId: submittedById ?? null,
    });
  }

  return prisma.bill.create({
    data: {
      employeeId: input.employeeId,
      companyName: input.companyName,
      companyAddress: input.companyAddress,
      amount: input.amount,
      amountInWords: input.amountInWords,
      status: initialStatus,
      items: {
        create: input.items.map((it) => ({
          date: new Date(it.date),
          from: it.from,
          to: it.to,
          transport: it.transport ?? null,
          purpose: it.purpose,
          amount: it.amount ?? 0,
          attachmentUrl: it.attachmentUrl ?? null,
        })),
      },
      history: { create: historyCreates },
    },
    include: { items: true, history: true },
  });
}

export async function getBillById(id: string) {
  return prisma.bill.findUnique({
    where: { id },
    include: {
      employee: { select: { id: true, name: true, email: true, designation: true, employeeCode: true, supervisorId: true } },
      items: true,
      history: {
        include: {
          actor: { select: { id: true, name: true, email: true, role: true, supervisorId: true } },
        },
        orderBy: { timestamp: "asc" },
      },
    },
  });
}

const VALID_BILL_STATUS = [
  "DRAFT",
  "SUBMITTED",
  "APPROVED_BY_SUPERVISOR",
  "APPROVED_BY_ACCOUNTS",
  "APPROVED_BY_MANAGEMENT",
  "REJECTED_BY_SUPERVISOR",
  "REJECTED_BY_ACCOUNTS",
  "REJECTED_BY_MANAGEMENT",
  "PAID",
] as const;

const ROLE_TO_STATUS: Record<string, string> = {
  supervisor: "APPROVED_BY_SUPERVISOR",
  accounts: "APPROVED_BY_ACCOUNTS",
  management: "APPROVED_BY_MANAGEMENT",
};

export async function updateBillStatus(
  billId: string,
  newStatus?: string | undefined,
  actorId?: string,
  comment?: string,
  nextSupervisorId?: string
) {
  const bill = await prisma.bill.findUnique({ where: { id: billId } });
  if (!bill) throw new Error("Bill not found");

  // Forwarding path — assign supervisor and keep bill in SUBMITTED state
  if (nextSupervisorId) {
    const target = await prisma.user.findUnique({ where: { id: nextSupervisorId } });
    if (!target || String(target.role).toLowerCase() !== "supervisor") {
      throw new Error("Selected user is not a supervisor");
    }

    const statusToSet = "SUBMITTED";
    const updated = await prisma.bill.update({
      where: { id: billId },
      data: {
        supervisorId: nextSupervisorId,
        status: statusToSet as any,
      },
    });

    await prisma.billHistory.create({
      data: {
        billId,
        actorId: actorId ?? null,
        status: statusToSet as any,
        comment: comment ?? `Forwarded to ${target.name ?? nextSupervisorId}`,
      },
    });

    return updated;
  }

  // If caller supplied a role string by mistake, map it to a BillStatus
  let statusToApply: string | undefined = newStatus;
  if (statusToApply && !VALID_BILL_STATUS.includes(statusToApply as any)) {
    const lower = String(statusToApply).toLowerCase();
    if (ROLE_TO_STATUS[lower]) {
      statusToApply = ROLE_TO_STATUS[lower];
    } else {
      throw new Error(
        `Invalid BillStatus provided to updateBillStatus: ${String(newStatus)}. Expected one of: ${VALID_BILL_STATUS.join(
          ", "
        )}`
      );
    }
  }

  if (!statusToApply) {
    throw new Error("No valid status provided to updateBillStatus.");
  }

  const updated = await prisma.bill.update({
    where: { id: billId },
    data: { status: statusToApply as any },
  });

  await prisma.billHistory.create({
    data: {
      billId,
      actorId: actorId ?? null,
      status: statusToApply as any,
      comment: comment ?? "",
    },
  });

  return updated;
}


export async function listAllUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      supervisorId: true,
      designation: true,
      employeeCode: true,
    },
  });
}

export async function listAllBills() {
  return prisma.bill.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          supervisorId: true,
          designation: true,
          employeeCode: true,
        },
      },
      items: true,
      history: true,
    },
  });
}

/* ========== DRAFTS ========== */

export async function saveBillDraft(input: {
  employeeId: string;
  companyName: string;
  companyAddress: string;
  amount: number;
  amountInWords: string;
  items: {
    date: string;
    from: string;
    to: string;
    transport?: string;
    purpose: string;
    amount: number;
    attachmentUrl?: string;
  }[];
  comment?: string;
  actorId?: string | null;
}) {
  return prisma.bill.create({
    data: {
      employeeId: input.employeeId,
      companyName: input.companyName,
      companyAddress: input.companyAddress,
      amount: input.amount ?? 0,
      amountInWords: input.amountInWords ?? "",
      status: "DRAFT",
      items: {
        create: input.items.map((it) => ({
          date: new Date(it.date),
          from: it.from,
          to: it.to,
          transport: it.transport ?? null,
          purpose: it.purpose,
          amount: it.amount ?? 0,
          attachmentUrl: it.attachmentUrl ?? null,
        })),
      },
      history: {
        create: {
          status: "DRAFT",
          actorId: input.actorId ?? null,
          comment: input.comment ?? "Draft saved",
        },
      },
    },
    include: { items: true, history: true },
  });
}

/**
 * Safely updates a DRAFT bill.
 * - If `items` is **omitted** or **empty**, existing line-items are preserved.
 * - If `items` is a **non-empty array**, all existing items are replaced by the provided list.
 */
// src/lib/repo.ts
export async function updateBillDraft(
  billId: string,
  input: {
    companyName: string;
    companyAddress: string;
    amount: number;
    amountInWords: string;
    items?: {
      date: string;
      from: string;
      to: string;
      transport?: string;
      purpose: string;
      amount: number;
      attachmentUrl?: string | null;
    }[];                       // ← OPTIONAL
    comment?: string;
    actorId?: string | null;
  }
) {

const existing = await prisma.bill.findUnique({
  where: { id: billId },
  select: { status: true },
});
if (!existing) throw new Error("Bill not found");
if (!isEditableStatus(existing.status)) {
  throw new Error("Only DRAFT or rejected/returned bills can be edited");
}

  // if (!existing) throw new Error("Draft not found");
  // if (existing.status !== "DRAFT") throw new Error("Only DRAFT bills can be edited");

  return prisma.$transaction(async (tx) => {
    // update header fields
    await tx.bill.update({
      where: { id: billId },
      data: {
        companyName: input.companyName,
        companyAddress: input.companyAddress,
        amount: input.amount ?? 0,
        amountInWords: input.amountInWords ?? "",
      },
    });

    // only touch items when caller actually sent items
    if (typeof input.items !== "undefined") {
      await tx.billItem.deleteMany({ where: { billId } });
      if (input.items.length) {
        await Promise.all(
          input.items.map((it) =>
            tx.billItem.create({
              data: {
                billId,
                date: new Date(it.date),
                from: it.from,
                to: it.to,
                transport: it.transport ?? null,
                purpose: it.purpose,
                amount: it.amount ?? 0,
                attachmentUrl: it.attachmentUrl ?? null,
              },
            })
          )
        );
      }
    }

    await tx.billHistory.create({
      data: {
        billId,
        status: "DRAFT",
        actorId: input.actorId ?? null,
        comment: input.comment ?? "Draft updated",
      },
    });

    return tx.bill.findUnique({
      where: { id: billId },
      include: { items: true, history: true },
    });
  });
}


export async function submitDraft(
  billId: string,
  actorId?: string,
  comment?: string
) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.bill.findUnique({
      where: { id: billId },
      select: { status: true },
    });
    if (!current) throw new Error("Bill not found");

    if (!isEditableStatus(current.status)) {
      throw new Error("Only DRAFT or rejected/returned bills can be submitted");
    }

    const updated = await tx.bill.update({
      where: { id: billId },
      data: { status: "SUBMITTED" },
    });

    await tx.billHistory.create({
      data: {
        billId,
        status: "SUBMITTED",
        actorId: actorId ?? null,
        comment: comment ?? "Submitted (resubmission)",
      },
    });

    return updated;
  });
}

export async function listDraftsForEmployee(employeeId: string) {
  return prisma.bill.findMany({
    where: { employeeId, status: "DRAFT" },
    orderBy: { updatedAt: "desc" },
    include: { items: true },
  });
}

/* ========== ROLE-SCOPED FETCH ========== */

export async function getBillsForRole(user: { id: string; role: Role }) {
  switch (user.role) {
    case "employee":
      return prisma.bill.findMany({
        where: { employeeId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              supervisorId: true,
              designation: true,
              employeeCode: true,
            },
          },
          items: true,
          history: true,
        },
      });

    case "supervisor":
      return prisma.bill.findMany({
        where: {
          OR: [
            { employee: { supervisorId: user.id } }, // my reports
            { employeeId: user.id },                 // my own bills
          ],
        },
        orderBy: { createdAt: "desc" },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              supervisorId: true,
              designation: true,
              employeeCode: true,
            },
          },
          items: true,
          history: true,
        },
      });

    case "accounts":
    case "management":
    default:
      return prisma.bill.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              supervisorId: true,
              designation: true,
              employeeCode: true,
            },
          },
          items: true,
          history: true,
        },
      });
  }
}
import type { Role } from "./types";

/** Sidebar badge: pending items count for the current user/role */
export async function pendingCountForUser(user: { id: string; role: Role }) {
  switch (user.role) {
    case "supervisor":
      return prisma.bill.count({
        where: {
          status: "SUBMITTED",
          OR: [
            { supervisorId: user.id },                           // explicitly forwarded to me
            { supervisorId: null, employee: { supervisorId: user.id } }, // default route: my direct reports
          ],
        },
      });

    case "accounts":
      return prisma.bill.count({
        where: {
          status: {
            in:
              [
                "APPROVED_BY_SUPERVISOR",
                "APPROVED_BY_MANAGEMENT",
              ] as BillStatus[],
          },
        },
      });

    case "management":
      return prisma.bill.count({
        where: { status: "APPROVED_BY_ACCOUNTS" },
      });

    case "employee":
      return prisma.bill.count({
        where: {
          employeeId: user.id,
          status: {
            in:
              [
                "SUBMITTED",
                "APPROVED_BY_SUPERVISOR",
                "APPROVED_BY_ACCOUNTS",
                "APPROVED_BY_MANAGEMENT",
              ] as BillStatus[],
          },
        },
      });

    default:
      return 0;
  }
}

/* Optional compatibility alias (safe to include) */
export const countPendingForSupervisor = pendingCountForUser;


// --- PAGINATION HELPERS ---
export type PageResult<T> = { total: number; page: number; pageSize: number; totalPages: number; rows: T[] };

function roleWhere(user: { id: string; role: Role }) {
  if (user.role === "employee") return { employeeId: user.id };
  if (user.role === "supervisor") {
    return {
      OR: [{ employee: { supervisorId: user.id } }, { employeeId: user.id }],
    };
  }
  // accounts/management -> all
  return {};
}

// src/lib/repo.ts
//export type PageResult<T> = { total: number; page: number; pageSize: number; totalPages: number; rows: T[] };

export async function getBillsForRolePage(
  user: { id: string; role: Role },
  page = 1,
  pageSize = 10
): Promise<PageResult<any>> {
  const safePage = Math.max(1, Number(page || 1));
  const take = Math.max(1, Number(pageSize || 10));
  const skip = (safePage - 1) * take;

  let where: any = {};
  if (user.role === "employee") {
    where = { employeeId: user.id };
  } else if (user.role === "supervisor") {
    // Show all bills relevant to this supervisor: team’s bills, forwarded to me, and my own
    where = {
      OR: [
        { employee: { supervisorId: user.id } }, // my team (default supervisor route)
        { supervisorId: user.id },               // explicitly forwarded to me
        { employeeId: user.id },                 // my own bills
      ],
    };
  } else if (user.role === "accounts") {
    where = { status: { in: ["APPROVED_BY_SUPERVISOR", "APPROVED_BY_MANAGEMENT"] } };
  } else if (user.role === "management") {
    where = { status: "APPROVED_BY_ACCOUNTS" };
  }

  const [total, rows] = await prisma.$transaction([
    prisma.bill.count({ where }),
    prisma.bill.findMany({
      where,
      orderBy: { updatedAt: "desc" }, // newest first
      skip,
      take,
      include: {
        employee: {
          select: {
            id: true, name: true, email: true, role: true,
            supervisorId: true, designation: true, employeeCode: true,
          },
        },
        items: true,
        history: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / take));
  return { total, page: safePage, pageSize: take, totalPages, rows };
}

/* ========== ROLE-SCOPED PENDING COUNTS ========== */

export async function getPendingCountForUser(userId: string, role: Role) {
  if (role === "supervisor") {
    // bills assigned to this supervisor and awaiting their action
    return prisma.bill.count({
      where: { supervisorId: userId, status: "SUBMITTED" },
    });
  }
  if (role === "accounts") {
    // bills ready for accounts review
    return prisma.bill.count({
      where: { status: "APPROVED_BY_SUPERVISOR" },
    });
  }
  // employees / others: no left-side notifications by default
  return 0;
}


