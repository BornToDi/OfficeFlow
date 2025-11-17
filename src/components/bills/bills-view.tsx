// src/components/bills/bills-view.tsx
"use client";

import { useMemo, useState } from "react";
import type { Bill, User, BillStatus } from "@/lib/types";
import { BillsTable } from "./bills-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Props = {
  initialBills: Bill[];
  users: User[];
  isSupervisor: boolean;
};

const STATUS_OPTIONS: (BillStatus | "ALL")[] = [
  "ALL",
  "DRAFT",
  "SUBMITTED",
  "APPROVED_BY_SUPERVISOR",
  "APPROVED_BY_ACCOUNTS",
  "APPROVED_BY_MANAGEMENT",
  "REJECTED_BY_SUPERVISOR",
  "REJECTED_BY_ACCOUNTS",
  "REJECTED_BY_MANAGEMENT",
  "PAID",
];

export function BillsView({ initialBills, users, isSupervisor }: Props) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<BillStatus | "ALL">("ALL");
  const [employeeId, setEmployeeId] = useState<string>("ALL");

  const userMap = useMemo(
    () => new Map(users.map((u) => [u.id, u.name])),
    [users]
  );

  const showEmployeeFilter = useMemo(() => {
    if (isSupervisor) return true;
    const uniqueEmployees = new Set(initialBills.map((b) => b.employeeId));
    return uniqueEmployees.size > 1;
  }, [initialBills, isSupervisor]);

  const filtered = useMemo(() => {
    let arr = initialBills;

    if (status !== "ALL") arr = arr.filter((b) => b.status === status);
    if (showEmployeeFilter && employeeId !== "ALL") {
      arr = arr.filter((b) => b.employeeId === employeeId);
    }

    const query = q.trim().toLowerCase();
    if (query) {
      arr = arr.filter((b) => {
        const idHit = b.id.toLowerCase().includes(query);
        const empName = (userMap.get(b.employeeId) || "").toLowerCase();
        const empHit = empName.includes(query);
        const companyHit = `${b.companyName} ${b.companyAddress}`
          .toLowerCase()
          .includes(query);
        const itemsHit = (b.items || []).some((it) =>
          `${it.purpose} ${it.from} ${it.to}`.toLowerCase().includes(query)
        );
        return idHit || empHit || companyHit || itemsHit;
      });
    }

    return arr;
  }, [initialBills, status, employeeId, q, userMap, showEmployeeFilter]);

  const filtersBar = (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search id, employee, company, purpose..."
        className="w-64"
        aria-label="Search bills"
      />

      <Select
        value={status}
        onValueChange={(v) => setStatus(v as BillStatus | "ALL")}
      >
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((s) => (
            <SelectItem key={s} value={s}>
              {s === "ALL" ? "All statuses" : s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showEmployeeFilter && (
        <Select value={employeeId} onValueChange={setEmployeeId}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Employee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All employees</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Button
        variant="outline"
        onClick={() => {
          setQ("");
          setStatus("ALL");
          setEmployeeId("ALL");
        }}
      >
        Clear
      </Button>
    </div>
  );

  return (
    <BillsTable
      bills={filtered}
      users={users}
      title="Bill History"
      action={filtersBar}
    />
  );
}
