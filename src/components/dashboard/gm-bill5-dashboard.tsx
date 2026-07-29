"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { bulkApproveBill5AsGm } from "@/lib/actions";
import type { Bill, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { departmentRowColor } from "@/lib/department-colors";

const money = new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 });

export function GmBill5Dashboard({ user, bills, users }: { user: User; bills: Bill[]; users: User[] }) {
  const [department, setDepartment] = useState("all");
  const [month, setMonth] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const userMap = useMemo(() => new Map(users.map((item) => [item.id, item])), [users]);
  const bill5 = useMemo(() => bills.filter((bill) => bill.status !== "DRAFT" && bill.items.some((item) => item.transport === "__BILL5__")), [bills]);
  const departments = useMemo(() => [...new Set(bill5.map((bill) => userMap.get(bill.employeeId)?.department || "Unassigned"))].sort(), [bill5, userMap]);
  const months = useMemo(() => [...new Set(bill5.flatMap((bill) => bill.items.map((item) => item.date.slice(0, 7))))].sort().reverse(), [bill5]);
  const filtered = useMemo(() => bill5.filter((bill) => {
    const departmentMatch = department === "all" || (userMap.get(bill.employeeId)?.department || "Unassigned") === department;
    const monthMatch = month === "all" || bill.items.some((item) => item.date.startsWith(month));
    return departmentMatch && monthMatch;
  }), [bill5, department, month, userMap]);
  const eligible = filtered.filter((bill) => bill.status === "SUBMITTED" && bill.supervisorId === user.id);
  const allEligibleSelected = eligible.length > 0 && eligible.every((bill) => selected.has(bill.id));

  const employeeTotals = useMemo(() => aggregate(filtered, (bill) => userMap.get(bill.employeeId)?.name || "Unknown"), [filtered, userMap]);
  const departmentTotals = useMemo(() => aggregate(filtered, (bill) => userMap.get(bill.employeeId)?.department || "Unassigned"), [filtered, userMap]);
  const supervisorTotals = useMemo(() => aggregate(filtered, (bill) => {
    const actor = [...(bill.history || [])].reverse().find((entry) => entry.status === "SUBMITTED" && entry.actorId && entry.actorId !== bill.employeeId);
    return actor?.actorId ? userMap.get(actor.actorId)?.name || "Unknown supervisor" : "Direct / not forwarded";
  }), [filtered, userMap]);

  function approve(ids: string[]) {
    if (!ids.length) return;
    setMessage("");
    startTransition(async () => {
      try {
        const result = await bulkApproveBill5AsGm(ids);
        setSelected(new Set());
        setMessage(`${result.count} Bill-5 approved and sent to Accounts.`);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Bulk approval failed.");
      }
    });
  }

  const total = filtered.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
  return <div className="space-y-6">
    <div><h1 className="text-3xl font-bold">Bill-5 GM Control Center</h1><p className="text-muted-foreground">Review every department, hold exceptions, and send approved bills to Accounts in one action.</p></div>
    <div className="grid gap-4 md:grid-cols-3">
      <Metric title="Bills in view" value={String(filtered.length)} />
      <Metric title="Waiting for your approval" value={String(eligible.length)} />
      <Metric title="Amount in view" value={money.format(total)} />
    </div>
    <div className="flex flex-wrap gap-3 rounded-lg border bg-card p-4">
      <select className="rounded-md border bg-background px-3 py-2" value={month} onChange={(e) => { setMonth(e.target.value); setSelected(new Set()); }}><option value="all">All months</option>{months.map((value) => <option key={value} value={value}>{value}</option>)}</select>
      <select className="rounded-md border bg-background px-3 py-2" value={department} onChange={(e) => { setDepartment(e.target.value); setSelected(new Set()); }}><option value="all">All departments</option>{departments.map((value) => <option key={value} value={value}>{value}</option>)}</select>
      <Button
        variant="outline"
        disabled={!eligible.length}
        onClick={() => setSelected((current) => {
          const next = new Set(current);
          if (allEligibleSelected) eligible.forEach((bill) => next.delete(bill.id));
          else eligible.forEach((bill) => next.add(bill.id));
          return next;
        })}
      >
        {allEligibleSelected ? "Unselect all filtered" : "Select all filtered"}
      </Button>
      <Button disabled={pending || !selected.size} onClick={() => approve([...selected])}>Approve selected ({selected.size}) → Accounts</Button>
      {department !== "all" && <Button disabled={pending || !eligible.length} onClick={() => approve(eligible.map((bill) => bill.id))}>Approve entire department ({eligible.length})</Button>}
    </div>
    {message && <p className="rounded-md border bg-muted p-3 text-sm" role="status">{message}</p>}
    <div className="overflow-x-auto rounded-lg border bg-card"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Keep / approve</th><th className="p-3">Employee</th><th className="p-3">Department</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Bill</th></tr></thead><tbody>{eligible.map((bill) => <tr key={bill.id} className={`border-b ${departmentRowColor(userMap.get(bill.employeeId)?.department)}`}><td className="p-3"><input aria-label={`Select bill ${bill.id}`} type="checkbox" checked={selected.has(bill.id)} onChange={(e) => setSelected((old) => { const next = new Set(old); e.target.checked ? next.add(bill.id) : next.delete(bill.id); return next; })} /></td><td className="p-3">{userMap.get(bill.employeeId)?.name || "Unknown"}</td><td className="p-3">{userMap.get(bill.employeeId)?.department || "Unassigned"}</td><td className="p-3">{money.format(Number(bill.amount))}</td><td className="p-3">Waiting for GM</td><td className="p-3"><Link className="text-primary underline" href={`/bills/${bill.id}`}>Inspect</Link></td></tr>)}{!eligible.length && <tr><td className="p-6 text-center text-muted-foreground" colSpan={6}>No Bill-5 bills are waiting in this filter.</td></tr>}</tbody></table></div>
    <div className="grid gap-4 lg:grid-cols-3"><Breakdown title="By department" rows={departmentTotals} /><Breakdown title="By employee" rows={employeeTotals} /><Breakdown title="By forwarding supervisor" rows={supervisorTotals} /></div>
  </div>;
}

function aggregate(bills: Bill[], label: (bill: Bill) => string) {
  const values = new Map<string, { count: number; amount: number }>();
  bills.forEach((bill) => { const key = label(bill); const old = values.get(key) || { count: 0, amount: 0 }; values.set(key, { count: old.count + 1, amount: old.amount + Number(bill.amount || 0) }); });
  return [...values.entries()].map(([name, value]) => ({ name, ...value })).sort((a, b) => b.amount - a.amount);
}
function Metric({ title, value }: { title: string; value: string }) { return <Card><CardHeader className="pb-2"><CardTitle className="text-sm">{title}</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{value}</CardContent></Card>; }
function Breakdown({ title, rows }: { title: string; rows: { name: string; count: number; amount: number }[] }) { return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent className="space-y-2">{rows.map((row) => <div key={row.name} className="flex items-center justify-between gap-3 border-b pb-2 text-sm"><span>{row.name} <span className="text-muted-foreground">({row.count})</span></span><strong>{money.format(row.amount)}</strong></div>)}{!rows.length && <p className="text-sm text-muted-foreground">No data</p>}</CardContent></Card>; }
