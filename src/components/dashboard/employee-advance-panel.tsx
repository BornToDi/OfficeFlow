"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordEmployeeAdvance } from "@/lib/actions";
import type { AdvanceSummary, EmployeeAdvance, User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const money = (amount: number) => new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(amount);

export function EmployeeAdvanceCard({ summary, advances }: { summary: AdvanceSummary; advances: EmployeeAdvance[] }) {
  const [open, setOpen] = useState(false);
  const negative = summary.balance < 0;
  return (
    <>
      <Card className="cursor-pointer transition-colors hover:bg-muted/30" onClick={() => setOpen(true)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setOpen(true); }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Advance Balance</CardTitle><span className="text-xs text-muted-foreground">View history</span></CardHeader>
        <CardContent><p className={`text-2xl font-bold ${negative ? "text-red-700" : "text-emerald-700"}`}>BDT {money(summary.balance)}</p><p className="text-xs text-muted-foreground">Click to see advance history</p></CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader><DialogTitle>Advance History</DialogTitle><DialogDescription>Running advance balance and paid bill adjustments.</DialogDescription></DialogHeader>
          <div className={`rounded-lg p-4 ${negative ? "bg-red-50" : "bg-emerald-50"}`}><p className="text-sm text-muted-foreground">Current balance</p><p className={`text-3xl font-bold ${negative ? "text-red-700" : "text-emerald-700"}`}>BDT {money(summary.balance)}</p>{negative ? <p className="mt-1 text-sm font-medium text-red-700">Due from company: BDT {money(Math.abs(summary.balance))}</p> : null}<div className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><p className="text-muted-foreground">Total advance</p><p className="font-semibold">BDT {money(summary.totalGranted)}</p></div><div><p className="text-muted-foreground">Paid bills</p><p className="font-semibold">- BDT {money(summary.usedForPaidBills)}</p></div></div></div>
          {advances.length ? <div className="space-y-2"><p className="text-sm font-medium">Advance entries</p>{advances.slice(0, 10).map((entry) => <div key={entry.id} className="flex justify-between gap-3 rounded-md border p-3 text-sm"><div><p>{new Date(entry.grantedAt).toLocaleDateString("en-GB")}</p><p className="text-xs text-muted-foreground">Added by {entry.recordedByName}{entry.note ? ` · ${entry.note}` : ""}</p></div><p className="font-semibold text-emerald-700">+ BDT {money(entry.amount)}</p></div>)}</div> : <p className="text-sm text-muted-foreground">No advance has been recorded yet.</p>}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AccountsAdvanceDialog({ employee, summary, advances, open, onOpenChange }: { employee: User | null; summary?: AdvanceSummary; advances: EmployeeAdvance[]; open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const balance = summary?.balance || 0;

  const addAdvance = () => {
    if (!employee) return;
    const numericAmount = Number(amount || 0);
    startTransition(async () => {
      const result = await recordEmployeeAdvance(employee.id, numericAmount, note);
      if (result.error) {
        toast({ variant: "destructive", title: "Advance not added", description: result.error });
        return;
      }
      setAmount("");
      setNote("");
      toast({ title: "Advance added", description: `BDT ${money(numericAmount)} recorded for ${employee.name}.` });
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) { setAmount(""); setNote(""); } onOpenChange(nextOpen); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader><DialogTitle>{employee?.name}</DialogTitle><DialogDescription>{employee?.employeeCode || "No employee code"} · Advance account</DialogDescription></DialogHeader>
        <div className={`rounded-lg p-4 ${balance < 0 ? "bg-red-50" : "bg-emerald-50"}`}>
          <p className="text-sm text-muted-foreground">Current balance</p>
          <p className={`text-3xl font-bold ${balance < 0 ? "text-red-700" : "text-emerald-700"}`}>BDT {money(balance)}</p>
          {balance < 0 ? <p className="mt-1 text-sm font-medium text-red-700">Due to employee: BDT {money(Math.abs(balance))}</p> : null}
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><p className="text-muted-foreground">Total advance</p><p className="font-semibold">BDT {money(summary?.totalGranted || 0)}</p></div><div><p className="text-muted-foreground">Paid bills</p><p className="font-semibold">- BDT {money(summary?.usedForPaidBills || 0)}</p></div></div>
        </div>
        <div className="space-y-2"><p className="text-sm font-medium">Add advance</p><Input type="text" inputMode="numeric" placeholder="Amount" value={amount} onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))} /><Input placeholder="Reference or note (optional)" maxLength={250} value={note} onChange={(event) => setNote(event.target.value)} /></div>
        {advances.length ? <div className="space-y-2"><p className="text-sm font-medium">Advance history</p>{advances.slice(0, 10).map((entry) => <div key={entry.id} className="flex justify-between gap-3 rounded-md border p-3 text-sm"><div><p>{new Date(entry.grantedAt).toLocaleDateString("en-GB")}</p><p className="text-xs text-muted-foreground">{entry.recordedByName}{entry.note ? ` · ${entry.note}` : ""}</p></div><p className="font-semibold text-emerald-700">+ BDT {money(entry.amount)}</p></div>)}</div> : null}
        <DialogFooter><Button type="button" disabled={isPending || !Number(amount)} onClick={addAdvance}>{isPending ? "Adding..." : "Add Advance"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
