"use client";

import { useState } from "react";

type Supervisor = { id: string; name: string; email?: string | null };

export function Bill5ApprovalForm({ action, supervisors, gmSupervisor, isBill5, isCurrentUserGm }: {
  action: (formData: FormData) => void | Promise<void>;
  supervisors: Supervisor[];
  gmSupervisor?: Supervisor;
  isBill5: boolean;
  isCurrentUserGm: boolean;
}) {
  const [nextSupervisorId, setNextSupervisorId] = useState("");

  if (isBill5 && isCurrentUserGm) {
    return (
      <form action={action}>
        <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700" type="submit" name="action" value="approve">
          Approve and send to Accounts
        </button>
      </form>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <label className="text-sm font-medium">Forward to:</label>
      <select name="nextSupervisorId" value={nextSupervisorId} onChange={(event) => setNextSupervisorId(event.target.value)} className="rounded-md border bg-white px-3 py-2 text-sm">
        <option value="">GM automatically{gmSupervisor ? ` (${gmSupervisor.email || gmSupervisor.name})` : ""}</option>
        {supervisors.filter((supervisor) => supervisor.id !== gmSupervisor?.id).map((supervisor) => (
          <option key={supervisor.id} value={supervisor.id}>{supervisor.name}{supervisor.email ? ` (${supervisor.email})` : ""}</option>
        ))}
      </select>
      <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700" type="submit" name="action" value="approve">
        {nextSupervisorId ? "Forward to selected supervisor" : "Forward to GM"}
      </button>
    </form>
  );
}
