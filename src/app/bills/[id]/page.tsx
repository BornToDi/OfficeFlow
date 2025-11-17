// src/app/bills/[id]/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getSession, handleBillAction } from "@/lib/actions";
import { getBillById, deleteBill } from "@/lib/repo";

import { BillForm } from "@/components/bills/bill-form";
import type { BillViewData } from "@/components/bills/bill-form";
import { RequestReceiptButton } from "@/components/bills/RequestReceiptButton";
import { ConfirmReceiveButton } from "@/components/bills/ConfirmReceiveButton";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BillDetail({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { edit?: string };
}) {
  const { id } = params;
  const wantsEdit = (searchParams?.edit ?? "") === "1";

  const session = await getSession();
  if (!session) return <div className="p-6 text-sm">Not signed in.</div>;

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

  const role = session.user.role;

  const S = (dbBill.status || "").toUpperCase();
  const isDraft = S === "DRAFT";
  const isRejected =
    S === "REJECTED_BY_SUPERVISOR" ||
    S === "REJECTED_BY_ACCOUNTS" ||
    S === "REJECTED_BY_MANAGEMENT";
  const isOwner = session.user.id === dbBill.employeeId;
  const isDirectSupervisor =
    !!dbBill.employee?.supervisorId &&
    dbBill.employee.supervisorId === session.user.id;

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

  // ---- APPROVE/REJECT server actions ----
  async function approveAction() {
    "use server";
    await handleBillAction(dbBill.id, "approve");
    revalidatePath(`/bills/${dbBill.id}`);
  }
  async function rejectAction(formData: FormData) {
    "use server";
    const comment = (formData.get("comment") as string) || "Rejected";
    await handleBillAction(dbBill.id, "reject", comment);
    revalidatePath(`/bills/${dbBill.id}`);
  }

  // ---- DELETE server action (only for DRAFT + permitted) ----
  async function deleteAction() {
    "use server";
    const sessionNow = await getSession();
    if (!sessionNow) throw new Error("Not signed in.");

    const current = await getBillById(id);
    if (!current) throw new Error("Bill not found.");

    const draft = (current.status || "").toUpperCase() === "DRAFT";
    const owner = sessionNow.user.id === current.employeeId;
    const directSupervisor =
      !!current.employee?.supervisorId &&
      current.employee.supervisorId === sessionNow.user.id;

    if (!(draft && (owner || directSupervisor))) {
      throw new Error("You are not allowed to delete this bill.");
    }

    await deleteBill(current.id);
    revalidatePath("/dashboard");
    redirect("/dashboard");
  }

  const hasPaymentRequest = dbBill.history.some((h) =>
    (h.comment ?? "").toLowerCase().includes("payment requested from employee")
  );

  const lastSubmitted = dbBill.history
    .filter((h) => h.status === "SUBMITTED")
    .slice(-1)[0];

  const approverIdNeeded: string | null =
    lastSubmitted?.actor?.role === "supervisor"
      ? lastSubmitted.actor.supervisorId ?? lastSubmitted.actor.id ?? null
      : dbBill.employee?.supervisorId ?? null;

  const canThisSupervisorApprove =
    role === "supervisor" &&
    dbBill.status === "SUBMITTED" &&
    session.user.id === approverIdNeeded;

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

          {dbBill.status === "SUBMITTED" && approverIdNeeded && (
            <p className="mt-1 text-xs text-muted-foreground">
              Awaiting approval from supervisor ID:{" "}
              <span className="font-mono">{approverIdNeeded}</span>
            </p>
          )}
        </div>

        {/* Edit toggle for DRAFT or REJECTED. Delete stays DRAFT-only */}
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
          {canThisSupervisorApprove && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <form action={approveAction}>
                <button className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:opacity-90">
                  Approve
                </button>
              </form>
              <form action={rejectAction} className="flex items-center gap-2">
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

          {role === "accounts" && dbBill.status === "APPROVED_BY_SUPERVISOR" && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <form action={approveAction}>
                <button className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:opacity-90">
                  Approve (send to Management)
                </button>
              </form>
              <form action={rejectAction} className="flex items-center gap-2">
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

          {role === "management" && dbBill.status === "APPROVED_BY_ACCOUNTS" && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <form action={approveAction}>
                <button className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:opacity-90">
                  Approve (send to Accounts for payment)
                </button>
              </form>
              <form action={rejectAction} className="flex items-center gap-2">
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

          {role === "employee" &&
            dbBill.status === "APPROVED_BY_MANAGEMENT" &&
            hasPaymentRequest && <ConfirmReceiveButton billId={dbBill.id} />}
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
                {h.comment && (
                  <div className="text-muted-foreground">{h.comment}</div>
                )}
                <div className="text-xs text-muted-foreground">
                  {new Date(h.timestamp).toLocaleString()}
                  {h.actor && (
                    <>
                      {" "}
                      • by <span className="font-medium">{h.actor.name}</span>{" "}
                      ({h.actor.email})
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
