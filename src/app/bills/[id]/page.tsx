// src/app/bills/[id]/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/actions";
import { getBillById, deleteBill, listSupervisors, updateBillStatus } from "@/lib/repo";
import type { BillStatus } from "@/lib/types";

import { BillForm } from "@/components/bills/bill-form";
import type { BillViewData } from "@/components/bills/bill-form";
import { RequestReceiptButton } from "@/components/bills/RequestReceiptButton";
import { ConfirmReceiveButton } from "@/components/bills/ConfirmReceiveButton";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ------------------------ module-scope helpers ------------------------ */

function nextStatusForRole(roleNow: string, current: string): BillStatus {
  if (roleNow === "supervisor" && current === "SUBMITTED") return "APPROVED_BY_SUPERVISOR";
  if (roleNow === "accounts" && current === "APPROVED_BY_SUPERVISOR") return "APPROVED_BY_ACCOUNTS";
  if (roleNow === "management" && current === "APPROVED_BY_ACCOUNTS") return "APPROVED_BY_MANAGEMENT";
  return current as BillStatus;
}

function rejectedStatusForRole(roleNow: string): BillStatus {
  if (roleNow === "accounts") return "REJECTED_BY_ACCOUNTS";
  if (roleNow === "management") return "REJECTED_BY_MANAGEMENT";
  return "REJECTED_BY_SUPERVISOR";
}

/* -------------------------------------------------------------------- */

export default async function BillDetail({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { edit?: string; _debugInfo?: string };
}) {
  const session = await getSession();
  if (!session) return <div className="p-6 text-sm">Not signed in.</div>;

  const { id } = params;
  const wantsEdit = (searchParams?.edit ?? "") === "1";

  const dbBill = await getBillById(id);
  if (!dbBill) return <div className="p-6 text-sm">Bill not found.</div>;

  const viewData: BillViewData = {
    id: dbBill.id,
    companyName: dbBill.companyName,
    companyAddress: dbBill.companyAddress,
    employeeId: dbBill.employeeId,
    employeeName: dbBill.employee?.name || "",
    employeeDesignation: dbBill.employee?.designation ?? "",
    employeeCode: dbBill.employee?.employeeCode ?? "",
    amount: Number(dbBill.amount),
    amountInWords: dbBill.amountInWords,
    status: dbBill.status,
    items: dbBill.items.map((it) => ({
      id: it.id,
      date: new Date(it.date).toISOString(),
      from: it.from,
      to: it.to,
      transport: it.transport ?? "",
      purpose: it.purpose,
      amount: Number(it.amount),
      attachmentUrl: it.attachmentUrl ?? null,
    })),
  };

  const role = String(session.user.role);
  const S = (dbBill.status || "").toUpperCase();
  const isDraft = S === "DRAFT";
  const isRejected =
    S === "REJECTED_BY_SUPERVISOR" ||
    S === "REJECTED_BY_ACCOUNTS" ||
    S === "REJECTED_BY_MANAGEMENT";
  const isOwner = session.user.id === dbBill.employeeId;
  const isDirectSupervisor =
    !!dbBill.employee?.supervisorId && dbBill.employee.supervisorId === session.user.id;

  // allow edit for DRAFT OR REJECTED when owner or direct supervisor
  const canEdit = (isDraft || isRejected) && (isOwner || isDirectSupervisor);
  const showEdit = wantsEdit && canEdit;

  const simpleUser = showEdit
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        designation: session.user.designation ?? null,
        supervisorId: session.user.supervisorId ?? null,
      }
    : undefined;

  // current target supervisor for SUBMITTED bills
  const currentSupervisorId = dbBill.supervisorId ?? dbBill.employee?.supervisorId ?? null;
  const approverIdNeeded: string | null =
  (dbBill as any).supervisorId ?? dbBill.employee?.supervisorId ?? null;

  // const canThisSupervisorApprove =
  //   role === "supervisor" && dbBill.status === "SUBMITTED" && currentSupervisorId === session.user.id;
  const canThisSupervisorApprove =
  role === "supervisor" &&
  dbBill.status === "SUBMITTED" &&
  session.user.id === approverIdNeeded;

  // supervisors for forwarding dropdown
  const supervisors = await listSupervisors();

  const hasPaymentRequest = dbBill.history.some((h) =>
    (h.comment ?? "").toLowerCase().includes("payment requested from employee")
  );

  /* -------------------------- server actions -------------------------- */

// src/app/bills/[id]/page.tsx (inside component)
async function approveOrForward(formData: FormData) {
  "use server";
  const sessionNow = await getSession();
  if (!sessionNow) throw new Error("Not signed in.");

  const action = String(formData.get("action") || "approve");
  const nextSupervisorId = (formData.get("nextSupervisorId") as string) || "";

  if (action === "approve") {
    if (nextSupervisorId) {
      // forward to another supervisor
      await updateBillStatus(dbBill.id, undefined, sessionNow.user.id, "Forwarded", nextSupervisorId);
    } else {
      // normal approve to next stage
      const next = nextStatusForRole(dbBill.status, sessionNow.user.role); // your existing helper
      await updateBillStatus(dbBill.id, next, sessionNow.user.id, "Approved");
    }
  } else if (action === "reject") {
    const reason = (formData.get("comment") as string) || "Rejected";
    await updateBillStatus(dbBill.id, rejectStatusForRole(sessionNow.user.role), sessionNow.user.id, reason);
  }

  revalidatePath(`/bills/${dbBill.id}`);
}


  async function rejectAction(formData: FormData) {
    "use server";
    const sessionNow = await getSession();
    if (!sessionNow) throw new Error("Not signed in.");

    const billId = String(formData.get("billId") || "");
    const comment = ((formData.get("comment") as string) || "Rejected").trim();
    const r = rejectedStatusForRole(String(sessionNow.user.role));

    await updateBillStatus(billId, r, sessionNow.user.id, comment);
    revalidatePath(`/bills/${billId}`);
  }

  async function deleteAction() {
    "use server";
    const sessionNow = await getSession();
    if (!sessionNow) throw new Error("Not signed in.");

    const current = await getBillById(id);
    if (!current) throw new Error("Bill not found.");

    const draft = (current.status || "").toUpperCase() === "DRAFT";
    const owner = sessionNow.user.id === current.employeeId;
    const directSupervisor =
      !!current.employee?.supervisorId && current.employee.supervisorId === sessionNow.user.id;

    if (!(draft && (owner || directSupervisor))) {
      throw new Error("You are not allowed to delete this bill.");
    }

    await deleteBill(current.id);
    revalidatePath("/dashboard");
    redirect("/dashboard");
  }

  /* ------------------------------ render ------------------------------ */
  
  
  const targetSupervisor = supervisors.find((s: any) => s.id === currentSupervisorId) || null;

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{viewData.companyName}</h1>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              Status: <span className="font-medium">{viewData.status}</span>
            </span>

            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              Employee: <span className="font-medium">{viewData.employeeName || "—"}</span>
            </span>
            <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 font-mono text-xs">
              {viewData.employeeCode || "NO-CODE"}
            </span>
          </div>

          {dbBill.status === "SUBMITTED" && (
            <p className="mt-1 text-xs text-muted-foreground">
              Awaiting approval from{" "}
              <span className="font-medium">
                {targetSupervisor?.name
                  ? `Supervisor: ${targetSupervisor.name}`
                  : currentSupervisorId
                  ? `Supervisor ID: ${currentSupervisorId}`
                  : "Supervisor"}
              </span>
              .
            </p>
          )}
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            {!showEdit ? (
              <Button asChild>
                <Link href={`/bills/${dbBill.id}?edit=1`}>Edit</Link>
              </Button>
            ) : (
              <Button variant="secondary" asChild>
                <Link href={`/bills/${dbBill.id}`}>Cancel Edit</Link>
              </Button>
            )}

            {isDraft && (
              <form action={deleteAction}>
                <Button variant="destructive" type="submit">
                  Delete
                </Button>
              </form>
            )}
          </div>
        )}
      </header>

      {showEdit ? (
        <BillForm mode="edit" user={simpleUser!} bill={viewData} />
      ) : (
        <BillForm mode="view" bill={viewData} user={session.user as any} />
      )}

      {!showEdit && (
        <section className="space-y-3">
          {/* SUPERVISOR STAGE: approve or forward, or reject */}
          {canThisSupervisorApprove && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <form action={approveOrForward} className="flex items-center gap-2">
  <label className="text-sm">Forward to:</label>
  <select name="nextSupervisorId" className="rounded border px-2 py-1">
    <option value="">Default — send to Accounts</option>
    {supervisors.map((s) => (
      <option key={s.id} value={s.id}>
        {s.name}{s.email ? ` (${s.email})` : ""}
      </option>
    ))}
  </select>
  <button type="submit" name="action" value="approve" className="btn-approve">
    Approve
  </button>
</form>

<form action={approveOrForward} className="mt-2 flex items-center gap-2">
  <input name="comment" placeholder="Reason" className="rounded border px-2 py-1 text-sm" required />
  <button type="submit" name="action" value="reject" className="btn-reject">
    Reject
  </button>
</form>


              <form action={rejectAction} className="flex items-center gap-2">
                <input type="hidden" name="billId" value={dbBill.id} />
                <input
                  name="comment"
                  placeholder="Reason"
                  className="rounded border px-2 py-1 text-sm"
                  required
                />
                <button className="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:opacity-90">
                  Reject
                </button>
              </form>
            </div>
          )}

          {/* ACCOUNTS STAGE */}
          {role === "accounts" && dbBill.status === "APPROVED_BY_SUPERVISOR" && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <form action={approveOrForward}>
                <input type="hidden" name="billId" value={dbBill.id} />
                <button className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:opacity-90">
                  Approve (send to Management)
                </button>
              </form>
              <form action={rejectAction} className="flex items-center gap-2">
                <input type="hidden" name="billId" value={dbBill.id} />
                <input
                  name="comment"
                  placeholder="Reason"
                  className="rounded border px-2 py-1 text-sm"
                  required
                />
                <button className="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:opacity-90">
                  Reject
                </button>
              </form>
            </div>
          )}

          {/* MANAGEMENT STAGE */}
          {role === "management" && dbBill.status === "APPROVED_BY_ACCOUNTS" && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <form action={approveOrForward}>
                <input type="hidden" name="billId" value={dbBill.id} />
                <button className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:opacity-90">
                  Approve (send to Accounts for payment)
                </button>
              </form>
              <form action={rejectAction} className="flex items-center gap-2">
                <input type="hidden" name="billId" value={dbBill.id} />
                <input
                  name="comment"
                  placeholder="Reason"
                  className="rounded border px-2 py-1 text-sm"
                  required
                />
                <button className="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:opacity-90">
                  Reject
                </button>
              </form>
            </div>
          )}

          {/* ACCOUNTS: payment request */}
          {role === "accounts" && dbBill.status === "APPROVED_BY_MANAGEMENT" && (
            <div>
              <RequestReceiptButton billId={dbBill.id} />
              {hasPaymentRequest && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Payment request already sent — waiting for employee confirmation.
                </p>
              )}
            </div>
          )}

          {/* EMPLOYEE: confirm receive */}
          {role === "employee" && dbBill.status === "APPROVED_BY_MANAGEMENT" && hasPaymentRequest && (
            <ConfirmReceiveButton billId={dbBill.id} />
          )}
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold">History</h2>
        <ol className="relative border-s pl-6">
          {dbBill.history.map((h) => (
            <li key={h.id} className="mb-4 ms-4">
              <span className="absolute -start-1.5 mt-1 h-3 w-3 rounded-full bg-primary" />
              <div className="text-sm">
                <div className="font-medium">{h.status}</div>
                {h.comment && <div className="text-muted-foreground">{h.comment}</div>}
                <div className="text-xs text-muted-foreground">
                  {new Date(h.timestamp).toLocaleString()}
                  {h.actor && (
                    <>
                      {" "}
                      • by <span className="font-medium">{h.actor.name}</span> ({h.actor.email})
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
