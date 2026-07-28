"use client";

import { useRef, useState } from "react";

type Supervisor = { id: string; name: string; email?: string | null };

export function Bill5ApprovalForm({ action, supervisors, gmSupervisor, isBill5, isCurrentUserGm }: {
  action: (formData: FormData) => void | Promise<void>;
  supervisors: Supervisor[];
  gmSupervisor?: Supervisor;
  isBill5: boolean;
  isCurrentUserGm: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [nextSupervisorId, setNextSupervisorId] = useState(isBill5 && gmSupervisor && !isCurrentUserGm ? gmSupervisor.id : "");
  const [showWarning, setShowWarning] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const needsConfirmation = isBill5 && !isCurrentUserGm && !nextSupervisorId;

  return (
    <>
      <form ref={formRef} action={action} className="flex flex-wrap items-center gap-2" onSubmit={(event) => {
        if (needsConfirmation && confirmation.trim().toLowerCase() !== "sure") {
          event.preventDefault();
          setShowWarning(true);
        }
      }}>
        <label className="text-sm font-medium">Forward to:</label>
        <select name="nextSupervisorId" value={nextSupervisorId} onChange={(event) => { setNextSupervisorId(event.target.value); setConfirmation(""); }} className="rounded-md border bg-white px-3 py-2 text-sm">
          <option value="">Send directly to Accounts</option>
          {isBill5 && gmSupervisor && !isCurrentUserGm ? (
            <option value={gmSupervisor.id}>GM — {gmSupervisor.name}</option>
          ) : supervisors.map((supervisor) => (
            <option key={supervisor.id} value={supervisor.id}>{supervisor.name}{supervisor.email ? ` (${supervisor.email})` : ""}</option>
          ))}
        </select>
        <input type="hidden" name="gmBypassConfirmation" value={confirmation} />
        <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700" type="submit" name="action" value="approve">
          {nextSupervisorId ? "Forward for approval" : "Approve to Accounts"}
        </button>
      </form>

      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="gm-warning-title">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 id="gm-warning-title" className="text-lg font-semibold text-slate-900">GM approval warning</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Are you sure you want to submit this bill to Accounts without GM approval?</p>
            <p className="mt-4 text-sm font-medium text-slate-800">Type <span className="font-mono font-bold">sure</span> to continue.</p>
            <input autoFocus value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder='Type "sure"' className="mt-2 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => { setShowWarning(false); setConfirmation(""); }} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-slate-50">Cancel</button>
              <button type="button" disabled={confirmation.trim().toLowerCase() !== "sure"} onClick={() => { setShowWarning(false); requestAnimationFrame(() => formRef.current?.requestSubmit()); }} className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40">Submit without GM</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
