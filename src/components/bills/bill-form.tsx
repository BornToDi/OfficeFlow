// src/components/bills/bill-form.tsx
"use client";

import { useActionState, useTransition } from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, PlusCircle, Trash2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { submitBill, saveDraft } from "@/lib/actions";
import { cn, numberToWords } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

import type { User, BillStatus } from "@/lib/types";

/* ---------- Public types (view mode) ---------- */
export type BillViewItem = {
  id: string;
  date: string;           // ISO
  from: string;
  to: string;
  transport?: string|null;// "", "__BILL2__", "__BILL3__", "__BILL4__"
  purpose: string;        // plain text (Bill-1) OR JSON (Bill-2/3/4)
  amount: number;
  attachmentUrl?: string | null;
};
export type BillViewData = {
  id: string;
  companyName: string;
  companyAddress: string;
  employeeId: string;
  employeeName: string;
  employeeDesignation?: string | null;
  employeeCode?: string | null;
  amount: number;
  amountInWords: string;
  status: BillStatus;
  items: BillViewItem[];
};

type BillFormat = "BILL1"|"BILL2"|"BILL3"|"BILL4";

/* ---------- Row shapes ---------- */
type RowB1 = {
  date: Date;
  from: string;
  to: string;
  transport?: string;
  purpose: string;
  amount?: number; // start blank
};
type RowB2 = {
  name: string;
  dateFrom: Date;
  dateTo: Date;
  purpose: string;
  local?: number;
  trip?: number;
  others?: number;
  advance?: number;
  remarks?: string;
};
type RowB3 = {
  name: string;
  dateFrom: Date;
  dateTo: Date;
  purpose: string;
  food?: number;
  hotel?: number;
  others?: number;
  advance?: number;
  remarks?: string;
};
/* NEW: Bill-4 rows */
type RowB4 = {
  date: Date;
  time: string;        // e.g. "10:00 AM"
  incident: string;    // free text
  purpose: string;     // e.g. "ABBL Laptop A/C call"
  meal?: string;       // e.g. "Breakfast", "Lunch", "Breakfast + Lunch + Dinner"
  food?: number;
  hotel?: number;
  others?: number;
  advance?: number;
  remarks?: string;
};

/* ---------- Schema ---------- */
const billFormSchema = z.object({
  billId: z.string().optional(),
  companyName: z.string().min(1, "Required"),
  companyAddress: z.string().min(1, "Required"),
  employeeName: z.string().min(1, "Required"),
  employeeDesignation: z.string().optional(), // visible but not submitted
  items: z.array(z.any()).min(1, "Add at least one row"),
});
type BillFormValues = z.infer<typeof billFormSchema>;

/* ---------- Helpers ---------- */
const safeDate = (v?: string|Date|null) => {
  const d = v instanceof Date ? v : v ? new Date(v) : new Date();
  return isNaN(d.getTime()) ? new Date() : d;
};
const detectFormat = (items?: BillViewItem[]): BillFormat => {
  if (!items?.length) return "BILL1";
  const t = items[0]?.transport ?? "";
  if (t === "__BILL2__") return "BILL2";
  if (t === "__BILL3__") return "BILL3";
  if (t === "__BILL4__") return "BILL4";
  return "BILL1";
};

/* Bill-2 payload (local/trip/others/advance) */
const encB2 = (r: RowB2) => {
  const total = (Number(r.local)||0)+(Number(r.trip)||0)+(Number(r.others)||0);
  const net = total - (Number(r.advance)||0);
  return JSON.stringify({
    name: r.name||"", purpose: r.purpose||"",
    local: Number(r.local||0), trip: Number(r.trip||0), others: Number(r.others||0),
    advance: Number(r.advance||0), total, net, remarks: r.remarks||""
  });
};
const decB2 = (s: string) => {
  try {
    const o = JSON.parse(s||"{}");
    const local = Number(o.local||0), trip = Number(o.trip||0), others = Number(o.others||0), advance = Number(o.advance||0);
    const total = Number.isFinite(o.total) ? Number(o.total) : local+trip+others;
    const net = Number.isFinite(o.net) ? Number(o.net) : total-advance;
    return { name:String(o.name||""), purpose:String(o.purpose||""), local, trip, others, advance, total, net, remarks:String(o.remarks||"") };
  } catch {
    return { name:"", purpose:s, local:0, trip:0, others:0, advance:0, total:0, net:0, remarks:"" };
  }
};

/* Bill-3 payload (food/hotel/others/advance) */
const encB3 = (r: RowB3) => {
  const total = (Number(r.food)||0)+(Number(r.hotel)||0)+(Number(r.others)||0);
  const net = total - (Number(r.advance)||0);
  return JSON.stringify({
    name: r.name||"", purpose: r.purpose||"",
    food: Number(r.food||0), hotel: Number(r.hotel||0), others: Number(r.others||0),
    advance: Number(r.advance||0), total, net, remarks: r.remarks||""
  });
};
const decB3 = (s: string) => {
  try {
    const o = JSON.parse(s||"{}");
    const food = Number(o.food||0), hotel = Number(o.hotel)||0, others = Number(o.others)||0, advance = Number(o.advance)||0;
    const total = Number.isFinite(o.total) ? Number(o.total) : food+hotel+others;
    const net = Number.isFinite(o.net) ? Number(o.net) : total-advance;
    return { name:String(o.name||""), purpose:String(o.purpose||""), food, hotel, others, advance, total, net, remarks:String(o.remarks||"") };
  } catch {
    return { name:"", purpose:s, food:0, hotel:0, others:0, advance:0, total:0, net:0, remarks:"" };
  }
};

/* Bill-4 payload (date/time/incident/purpose + food/hotel/others/advance/remarks) */
const encB4 = (r: RowB4) => {
  const total = (Number(r.food)||0)+(Number(r.hotel)||0)+(Number(r.others)||0);
  const net = total - (Number(r.advance)||0);
  return JSON.stringify({
    time: r.time || "",
    incident: r.incident || "",
    purpose: r.purpose || "",
    meal: r.meal || "",
    food: Number(r.food || 0),
    hotel: Number(r.hotel || 0),
    others: Number(r.others || 0),
    advance: Number(r.advance || 0),
    total,
    net,
    remarks: r.remarks || ""
  });
};
const decB4 = (s: string) => {
  try {
    const o = JSON.parse(s || "{}");
    const food    = Number(o.food || 0);
    const hotel   = Number(o.hotel) || 0;
    const others  = Number(o.others) || 0;
    const advance = Number(o.advance) || 0;
    const total   = Number.isFinite(o.total) ? Number(o.total) : food + hotel + others;
    const net     = Number.isFinite(o.net) ? Number(o.net) : total - advance;

    return {
      time: String(o.time || ""),
      incident: String(o.incident || ""),
      purpose: String(o.purpose || ""),
      meal: String(o.meal || ""),
      food,
      hotel,
      others,
      advance,
      total,
      net,
      remarks: String(o.remarks || "")
    };
  } catch {
    return {
      time: "",
      incident: "",
      purpose: s,
      meal: "",
      food: 0,
      hotel: 0,
      others: 0,
      advance: 0,
      total: 0,
      net: 0,
      remarks: ""
    };
  }
};

/* --- small helpers --- */
const isEmpty = (v: any) =>
  v === undefined || v === null || (typeof v === "string" && v.trim() === "");
const asNum = (v: any) => (v === "" || v === null || v === undefined ? NaN : Number(v));

/* ---------- Component ---------- */
type Props =
  | { mode?: "create"|"edit"; user: User; bill?: BillViewData }
  | { mode: "view"; bill: BillViewData; user?: User };

function SubmitButton({ isPending, children, disabled }: { isPending:boolean; children:React.ReactNode; disabled?:boolean }) {
  return (
    <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isPending || disabled}>
      {isPending ? "Working..." : children}
    </Button>
  );
}

export function BillForm(props: Props) {
  const mode = props.mode ?? "create";
  const isView = mode === "view";
  const router = useRouter();

  const [submitState, submitAction] = useActionState(submitBill, undefined);
  const [draftState,  draftAction]  = useActionState(saveDraft, undefined);
  const [isPending, startTransition] = useTransition();

  const initialFormat = props.bill ? detectFormat(props.bill.items) : "BILL1";
  const [formatType, setFormatType] = useState<BillFormat>(initialFormat);

  // Employee Code to display + submit (from existing bill or current user)
  const effectiveEmployeeCode =
    (props.bill?.employeeCode ??
      (("user" in props ? (props.user as any)?.employeeCode : "") || "")
    )?.toString()?.toUpperCase?.() ?? "";

  /* ---------- Defaults ---------- */
  const defaults: Partial<BillFormValues> = useMemo(() => {
    if (!props.bill) {
      return {
        companyName: "Networld Bangladesh Limited",
        companyAddress: "57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka",
        employeeName: "user" in props ? props.user.name : "",
        employeeDesignation: "user" in props ? props.user.designation ?? "" : "",
        items:
          formatType === "BILL1"
            ? [{ date: new Date(), from: "", to: "", transport: "", purpose: "", amount: undefined as any }]
            : formatType === "BILL2"
            ? [{ name:"", dateFrom:new Date(), dateTo:new Date(), purpose:"", local:undefined as any, trip:undefined as any, others:undefined as any, advance:undefined as any, remarks:"" }]
            : formatType === "BILL3"
            ? [{ name:"", dateFrom:new Date(), dateTo:new Date(), purpose:"", food:undefined as any, hotel:undefined as any, others:undefined as any, advance:undefined as any, remarks:"" }]
            : [{date: new Date(),time: "",incident: "", purpose: "",meal: "",food: undefined as any,hotel: undefined as any,others: undefined as any,advance: undefined as any,remarks: ""}],
      };
    }

    // Existing bill
    const b = props.bill;
    if (initialFormat === "BILL1") {
      return {
        billId: b.id, companyName:b.companyName, companyAddress:b.companyAddress,
        employeeName:b.employeeName, employeeDesignation:b.employeeDesignation ?? "",
        items: b.items.map<RowB1>((it) => ({
          date: safeDate(it.date), from: it.from, to: it.to, transport: it.transport ?? "", purpose: it.purpose, amount: Number(it.amount||0)
        })),
      };
    }
    if (initialFormat === "BILL2") {
      return {
        billId: b.id, companyName:b.companyName, companyAddress:b.companyAddress,
        employeeName:b.employeeName, employeeDesignation:b.employeeDesignation ?? "",
        items: b.items.map<RowB2>((it) => {
          const p = decB2(it.purpose);
          return { name:p.name, dateFrom:safeDate(it.date), dateTo: it.to ? safeDate(it.to) : safeDate(it.date), purpose:p.purpose, local:p.local, trip:p.trip, others:p.others, advance:p.advance, remarks:p.remarks };
        }),
      };
    }
    if (initialFormat === "BILL3") {
      return {
        billId: b.id, companyName:b.companyName, companyAddress:b.companyAddress,
        employeeName:b.employeeName, employeeDesignation:b.employeeDesignation ?? "",
        items: b.items.map<RowB3>((it) => {
          const p = decB3(it.purpose);
          return { name:p.name, dateFrom:safeDate(it.date), dateTo: it.to ? safeDate(it.to) : safeDate(it.date), purpose:p.purpose, food:p.food, hotel:p.hotel, others:p.others, advance:p.advance, remarks:p.remarks };
        }),
      };
    }
    // BILL4
    return {
      billId: b.id, companyName:b.companyName, companyAddress:b.companyAddress,
      employeeName:b.employeeName, employeeDesignation:b.employeeDesignation ?? "",
      items: b.items.map<RowB4>((it) => {
        const p = decB4(it.purpose);
        return {
          date: safeDate(it.date),
          time: p.time,
          incident: p.incident,
          purpose: p.purpose,
          meal: p.meal,
          food: p.food,
          hotel: p.hotel,
          others: p.others,
          advance: p.advance,
          remarks: p.remarks
        };
      }),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useForm<BillFormValues>({ resolver: zodResolver(billFormSchema), defaultValues: defaults, mode: "onChange" });
  const { control, handleSubmit, reset } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  // Files for BILL2/BILL3/BILL4 rows (one file per row)
  const [rowFiles, setRowFiles] = useState<(File | null)[]>(
    Array.isArray(defaults.items) ? Array(defaults.items.length).fill(null) : []
  );

  // Watch rows for live totals
  const watchedItems = useWatch({ control, name: "items" });

  // totals for header/footer
  const totals = useMemo(() => {
    if (formatType === "BILL1") {
      const rows = (watchedItems as RowB1[]) || [];
      const total = rows.reduce((s, r) => s + (Number(r?.amount)||0), 0);
      return { total, words: numberToWords(total) + " Only" };
    }
    if (formatType === "BILL2") {
      const rows = (watchedItems as RowB2[]) || [];
      const total = rows.reduce((acc, r) => {
        const sum = (Number(r?.local)||0)+(Number(r?.trip)||0)+(Number(r?.others)||0);
        return acc + (sum - (Number(r?.advance)||0));
      }, 0);
      return { total, words: numberToWords(total) + " Only" };
    }
    if (formatType === "BILL3") {
      const rows = (watchedItems as RowB3[]) || [];
      const total = rows.reduce((acc, r) => {
        const sum = (Number(r?.food)||0)+(Number(r?.hotel)||0)+(Number(r?.others)||0);
        return acc + (sum - (Number(r?.advance)||0));
      }, 0);
      return { total, words: numberToWords(total) + " Only" };
    }
    // BILL4
    const rows = (watchedItems as RowB4[]) || [];
    const total = rows.reduce((acc, r) => {
      const sum = (Number(r?.food)||0)+(Number(r?.hotel)||0)+(Number(r?.others)||0);
      return acc + (sum - (Number(r?.advance)||0));
    }, 0);
    return { total, words: numberToWords(total) + " Only" };
  }, [watchedItems, formatType]);

  // keep rowFiles in sync with format and number of fields
  useEffect(() => {
    if (isView) return;
    if (formatType === "BILL1") {
      setRowFiles([]);
      return;
    }
    const len = fields.length;
    setRowFiles((prev) => {
      const next = prev.slice(0, len);
      while (next.length < len) next.push(null);
      return next;
    });
  }, [formatType, fields.length, isView]);

  // switching format resets to one blank row
  useEffect(() => {
    if (isView) return;
    const cur = form.getValues();
    if (formatType === "BILL1") {
      reset({ ...cur, items: [{ date:new Date(), from:"", to:"", transport:"", purpose:"", amount: undefined as any }] });
      setRowFiles([]);
    } else if (formatType === "BILL2") {
      reset({ ...cur, items: [{ name:"", dateFrom:new Date(), dateTo:new Date(), purpose:"", local:undefined as any, trip:undefined as any, others:undefined as any, advance:undefined as any, remarks:"" }] });
      setRowFiles([null]);
    } else if (formatType === "BILL3") {
      reset({ ...cur, items: [{ name:"", dateFrom:new Date(), dateTo:new Date(), purpose:"", food:undefined as any, hotel:undefined as any, others:undefined as any, advance:undefined as any, remarks:"" }] });
      setRowFiles([null]);
    } else {
      reset({ ...cur, items: [{ date:new Date(), time:"", incident:"", purpose:"",  meal: "",  food:undefined as any, hotel:undefined as any, others:undefined as any, advance:undefined as any, remarks:"" }] });
      setRowFiles([null]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatType]);

  /* ---------- require-all validation (top + rows) ---------- */
  const validateAll = (): boolean => {
    let ok = true;
    const setError = form.setError;
    const top = form.getValues();
    const items: any[] = form.getValues("items") ?? [];

    // Top-level required
    if (isEmpty(top.companyName))   { setError("companyName" as any, { type: "manual", message: "Required" }); ok = false; }
    if (isEmpty(top.companyAddress)){ setError("companyAddress" as any, { type: "manual", message: "Required" }); ok = false; }
    if (isEmpty(top.employeeName))  { setError("employeeName" as any, { type: "manual", message: "Required" }); ok = false; }

    // Ensure we have a code to submit
    if (!effectiveEmployeeCode) {
      if (typeof window !== "undefined") window.alert("Employee Code is missing on this form.");
      ok = false;
    }

    // Rows per format
    items.forEach((r, i) => {
      if (formatType === "BILL1") {
        if (!r.date)                     { setError(`items.${i}.date` as any, { type: "manual", message: "Pick a date" }); ok = false; }
        if (isEmpty(r.from))             { setError(`items.${i}.from` as any, { type: "manual", message: "Required" }); ok = false; }
        if (isEmpty(r.to))               { setError(`items.${i}.to` as any, { type: "manual", message: "Required" }); ok = false; }
        if (isEmpty(r.transport))        { setError(`items.${i}.transport` as any, { type: "manual", message: "Required" }); ok = false; }
        if (isEmpty(r.purpose))          { setError(`items.${i}.purpose` as any, { type: "manual", message: "Required" }); ok = false; }
        if (!(asNum(r.amount) > 0))      { setError(`items.${i}.amount` as any, { type: "manual", message: "Must be > 0" }); ok = false; }
      } else if (formatType === "BILL2") {
        const local = asNum(r.local), trip = asNum(r.trip), others = asNum(r.others), advance = asNum(r.advance);
        const total = (Number(local)||0) + (Number(trip)||0) + (Number(others)||0);
        if (isEmpty(r.name))             { setError(`items.${i}.name` as any, { type: "manual", message: "Required" }); ok = false; }
        if (!r.dateFrom)                 { setError(`items.${i}.dateFrom` as any, { type: "manual", message: "Pick a date" }); ok = false; }
        if (!r.dateTo)                   { setError(`items.${i}.dateTo` as any, { type: "manual", message: "Pick a date" }); ok = false; }
        if (isEmpty(r.purpose))          { setError(`items.${i}.purpose` as any, { type: "manual", message: "Required" }); ok = false; }
        if (!(total > 0))                { setError(`items.${i}.local` as any,  { type: "manual", message: "Enter at least one amount" }); ok = false; }
        if (Number.isFinite(advance) && advance > total) {
          setError(`items.${i}.advance` as any, { type: "manual", message: "Advance cannot exceed total" }); ok = false;
        }
      } else if (formatType === "BILL3") {
        const food = asNum(r.food), hotel = asNum(r.hotel), others = asNum(r.others), advance = asNum(r.advance);
        const total = (Number(food)||0) + (Number(hotel)||0) + (Number(others)||0);
        if (isEmpty(r.name))             { setError(`items.${i}.name` as any, { type: "manual", message: "Required" }); ok = false; }
        if (!r.dateFrom)                 { setError(`items.${i}.dateFrom` as any, { type: "manual", message: "Pick a date" }); ok = false; }
        if (!r.dateTo)                   { setError(`items.${i}.dateTo` as any, { type: "manual", message: "Pick a date" }); ok = false; }
        if (isEmpty(r.purpose))          { setError(`items.${i}.purpose` as any, { type: "manual", message: "Required" }); ok = false; }
        if (!(total > 0))                { setError(`items.${i}.food` as any,   { type: "manual", message: "Enter at least one amount" }); ok = false; }
        if (Number.isFinite(advance) && advance > total) {
          setError(`items.${i}.advance` as any, { type: "manual", message: "Advance cannot exceed total" }); ok = false;
        }
      } else if (formatType === "BILL4") {
        const food = asNum(r.food), hotel = asNum(r.hotel), others = asNum(r.others), advance = asNum(r.advance);
        const total = (Number(food)||0) + (Number(hotel)||0) + (Number(others)||0);
        if (!r.date)                     { setError(`items.${i}.date` as any, { type: "manual", message: "Pick a date" }); ok = false; }
        if (isEmpty(r.time))             { setError(`items.${i}.time` as any, { type: "manual", message: "Required" }); ok = false; }
        if (isEmpty(r.incident))         { setError(`items.${i}.incident` as any, { type: "manual", message: "Required" }); ok = false; }
        if (isEmpty(r.purpose))          { setError(`items.${i}.purpose` as any, { type: "manual", message: "Required" }); ok = false; }
        if (isEmpty(r.meal))             { setError(`items.${i}.meal` as any, { type: "manual", message: "Required" }); ok = false; }
        if (!(total > 0))                { setError(`items.${i}.food` as any, { type: "manual", message: "Enter at least one amount" }); ok = false; }
        if (Number.isFinite(advance) && advance > total) {
          setError(`items.${i}.advance` as any, { type: "manual", message: "Advance cannot exceed total" }); ok = false;
        }
      }
    });

    return ok;
  };

  /* ---------- after successful submit ---------- */
  useEffect(() => {
    if (submitState && !(submitState as any)?.error) {
      if (typeof window !== "undefined") {
        window.alert("Submitted bill successfully");
      }
      const t = setTimeout(() => {
        router.replace("/dashboard");
      }, 300);
      return () => clearTimeout(t);
    }
  }, [submitState, router]);

  /* ---------- submit payload ---------- */
  const toServerFD = (data: BillFormValues) => {
    const fd = new FormData();
    if (data.billId) fd.append("billId", data.billId);
    fd.append("companyName", data.companyName);
    fd.append("companyAddress", data.companyAddress);
    fd.append("employeeName", data.employeeName);

    // identifier auto-supplied (Employee Code)
    fd.append("employeeIdOrCode", effectiveEmployeeCode);

    fd.append("formatType", formatType);

    if (formatType === "BILL1") {
      const rows = (data.items as RowB1[]).map((r) => ({
        date: safeDate(r.date).toISOString(),
        from: r.from ?? "", to: r.to ?? "",
        transport: r.transport ?? "", purpose: r.purpose ?? "",
        amount: Number(r.amount || 0),
      }));
      fd.append("items", JSON.stringify(rows));
    } else if (formatType === "BILL2") {
      const rows = (data.items as RowB2[]).map((r) => {
        const packed = encB2(r);
        const sum = (Number(r.local)||0)+(Number(r.trip)||0)+(Number(r.others)||0);
        const net = sum - (Number(r.advance)||0);
        return {
          date: safeDate(r.dateFrom).toISOString(),
          from: r.dateFrom ? format(safeDate(r.dateFrom), "PPP") : "",
          to: r.dateTo ? format(safeDate(r.dateTo), "PPP") : "",
          transport: "__BILL2__",
          purpose: packed,
          amount: Number(net || 0),
        };
      });
      fd.append("items", JSON.stringify(rows));

      // attachments
      for (let i = 0; i < rowFiles.length; i++) {
        const f = rowFiles[i];
        if (f) fd.append(`attachment_${i}`, f);
      }
    } else if (formatType === "BILL3") {
      const rows = (data.items as RowB3[]).map((r) => {
        const packed = encB3(r);
        const sum = (Number(r.food)||0)+(Number(r.hotel)||0)+(Number(r.others)||0);
        const net = sum - (Number(r.advance)||0);
        return {
          date: safeDate(r.dateFrom).toISOString(),
          from: r.dateFrom ? format(safeDate(r.dateFrom), "PPP") : "",
          to: r.dateTo ? format(safeDate(r.dateTo), "PPP") : "",
          transport: "__BILL3__",
          purpose: packed,
          amount: Number(net || 0),
        };
      });
      fd.append("items", JSON.stringify(rows));

      for (let i = 0; i < rowFiles.length; i++) {
        const f = rowFiles[i];
        if (f) fd.append(`attachment_${i}`, f);
      }
    } else {
      // BILL4
      const rows = (data.items as RowB4[]).map((r) => {
        const packed = encB4(r);
        const sum = (Number(r.food)||0)+(Number(r.hotel)||0)+(Number(r.others)||0);
        const net = sum - (Number(r.advance)||0);
        return {
          date: safeDate(r.date).toISOString(),
          from: r.time || "",   // store time in "from" for symmetry; also inside purpose JSON
          to: r.incident || "", // incident mirrored here; real data in JSON
          transport: "__BILL4__",
          purpose: packed,
          amount: Number(net || 0),
        };
      });
      fd.append("items", JSON.stringify(rows));

      for (let i = 0; i < rowFiles.length; i++) {
        const f = rowFiles[i];
        if (f) fd.append(`attachment_${i}`, f);
      }
    }

    fd.append("totalAmount", String(totals.total));
    fd.append("amountInWords", totals.words);
    fd.delete("employeeDesignation");
    return fd;
  };

  const onSubmitFinal = (d: BillFormValues) => {
    if (!validateAll()) return;
    startTransition(() => submitAction(toServerFD(d)));
  };
  const onSaveDraft  = (d: BillFormValues) => {
    if (!validateAll()) return;
    startTransition(() => draftAction(toServerFD(d)));
  };

  // helpers for files with append/remove
  const appendWithFileB2 = (row: RowB2) => { append(row as any); setRowFiles((p)=>[...p, null]); };
  const appendWithFileB3 = (row: RowB3) => { append(row as any); setRowFiles((p)=>[...p, null]); };
  const appendWithFileB4 = (row: RowB4) => { append(row as any); setRowFiles((p)=>[...p, null]); };
  const removeWithFile = (i: number) => { remove(i); setRowFiles((prev) => prev.filter((_, idx) => idx !== i)); };
  const setRowFileAt = (i: number, f: File | null) => setRowFiles((prev) => { const next=[...prev]; next[i]=f; return next; });

  /* ---------- view mode ---------- */
  if (isView) {
    const b = (props as any).bill as BillViewData;
    const viewer: User | undefined = "user" in props ? (props as any).user : undefined;
    const fallbackDesignation =
      viewer && viewer.id === b.employeeId ? (viewer.designation ?? undefined) : undefined;

    const fmt = detectFormat(b.items);
    if (fmt === "BILL1") return <ViewBill1 b={b} fallbackDesignation={fallbackDesignation} />;
    if (fmt === "BILL2") return <ViewBill2 b={b} fallbackDesignation={fallbackDesignation} />;
    if (fmt === "BILL3") return <ViewBill3 b={b} fallbackDesignation={fallbackDesignation} />;
    return <ViewBill4 b={b} fallbackDesignation={fallbackDesignation} />;
  }

  /* ---------- edit/create ---------- */
  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmitFinal)}
        className="w-full max-w-none mx-auto space-y-6 rounded-xl border bg-white p-6 md:p-8 shadow-sm"
      >
        {/* Hidden bill id if editing */}
        <FormField control={control} name="billId" render={({ field }) => <input type="hidden" {...field} />} />

        {/* Hidden: actions.ts expects employeeIdOrCode; filled automatically from current user or bill */}
        <input type="hidden" name="employeeIdOrCode" value={effectiveEmployeeCode} />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField control={control} name="companyName" render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl><Input {...field} required /></FormControl>
              <FormMessage/>
            </FormItem>
          )}/>
          <FormField control={control} name="companyAddress" render={({ field }) => (
            <FormItem>
              <FormLabel>Company Address</FormLabel>
              <FormControl><Input {...field} required /></FormControl>
              <FormMessage/>
            </FormItem>
          )}/>
          <FormField control={control} name="employeeName" render={({ field }) => (
            <FormItem>
              <FormLabel>Employee Name</FormLabel>
              <FormControl><Input {...field} required /></FormControl>
              <FormMessage/>
            </FormItem>
          )}/>

          {/* READ-ONLY Employee Code */}
          <div>
            <p className="text-sm font-medium">Employee Code</p>
            <p className="mt-2 font-mono">{effectiveEmployeeCode || "-"}</p>
          </div>

          <FormField control={control} name="employeeDesignation" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Designation</FormLabel>
              <FormControl>
                <Input {...field} placeholder="(optional for display; not submitted)" />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}/>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <label className="text-sm font-medium">Bill Format</label>
          <select
            className="w-full md:w-[360px] rounded-md border bg-background px-3 py-2 text-sm"
            value={formatType}
            onChange={(e)=> setFormatType(e.target.value as BillFormat)}
          >
            <option value="BILL1">Bill-1 (standard)</option>
            <option value="BILL2">Bill-2 (Local/Trip/Others/Advance)</option>
            <option value="BILL3">Bill-3 (Food/Hotel/Others/Advance)</option>
            <option value="BILL4">Bill-4 (Date/Time/Incident + Food/Hotel/Others/Advance)</option>
          </select>
        </div>

        {formatType === "BILL1" && (
          <EditorBill1 control={control} fields={fields} append={append} remove={remove} />
        )}
        {formatType === "BILL2" && (
          <EditorBill2
            control={control}
            fields={fields}
            append={appendWithFileB2}
            remove={removeWithFile}
            onPickFile={setRowFileAt}
            files={rowFiles}
          />
        )}
        {formatType === "BILL3" && (
          <EditorBill3
            control={control}
            fields={fields}
            append={appendWithFileB3}
            remove={removeWithFile}
            onPickFile={setRowFileAt}
            files={rowFiles}
          />
        )}
        {formatType === "BILL4" && (
          <EditorBill4
            control={control}
            fields={fields}
            append={appendWithFileB4}
            remove={removeWithFile}
            onPickFile={setRowFileAt}
            files={rowFiles}
          />
        )}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-medium">Amount in Words:</p>
            <p className="text-muted-foreground">{totals.words}</p>
          </div>
          <div className="w-full max-w-xs space-y-2">
            <div className="flex items-center justify-between text-xl font-bold">
              <span>Total</span>
              <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "BDT" }).format(totals.total)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {(submitState as any)?.error || (draftState as any)?.error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{(submitState as any)?.error || (draftState as any)?.error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="secondary" onClick={handleSubmit(onSaveDraft)} disabled={isPending}>
            Save Draft
          </Button>
          <SubmitButton isPending={isPending}>Submit Bill</SubmitButton>
        </div>
      </form>
    </FormProvider>
  );
}

/* ---------- View helpers ---------- */
function HeaderInfo({ b, fallbackDesignation }: { b: BillViewData; fallbackDesignation?: string }) {
  const designation =
    (b.employeeDesignation && b.employeeDesignation.trim() !== "")
      ? b.employeeDesignation
      : (fallbackDesignation ?? "-");

  return (
    <div className="mb-4 grid gap-4 md:grid-cols-2">
      <div><p className="text-xs text-muted-foreground">Company Name</p><p className="font-medium">{b.companyName}</p></div>
      <div><p className="text-xs text-muted-foreground">Company Address</p><p className="font-medium">{b.companyAddress}</p></div>
      <div><p className="text-xs text-muted-foreground">Employee Name</p><p className="font-medium">{b.employeeName}</p></div>
      <div><p className="text-xs text-muted-foreground">Employee Code</p><p className="font-medium">{b.employeeCode ?? "-"}</p></div>
      <div className="md:col-span-2"><p className="text-xs text-muted-foreground">Designation</p><p className="font-medium">{designation}</p></div>
    </div>
  );
}

function FooterTotal({ total }: { total:number }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="font-medium">Amount in Words:</p>
        <p className="text-muted-foreground">{numberToWords(total)} Only</p>
      </div>
      <div className="w-full max-w-xs">
        <div className="flex items-center justify-between text-xl font-bold">
          <span>Total</span>
          <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "BDT" }).format(total)}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- View variants (1..4) ---------- */
function ViewBill1({ b, fallbackDesignation }: { b: BillViewData; fallbackDesignation?: string }) {
  const total = b.items.reduce((s, it) => s + Number(it.amount||0), 0);
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <HeaderInfo b={b} fallbackDesignation={fallbackDesignation} />
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">No.</TableHead>
              <TableHead className="w-[150px]">Date</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Transport</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {b.items.map((it, i) => (
              <TableRow key={it.id ?? i}>
                <TableCell className="p-1 pt-3 font-medium">{i+1}</TableCell>
                <TableCell className="p-1">{format(safeDate(it.date), "PPP")}</TableCell>
                <TableCell className="p-1">{it.from}</TableCell>
                <TableCell className="p-1">{it.to}</TableCell>
                <TableCell className="p-1">{it.transport || "-"}</TableCell>
                <TableCell className="p-1">{it.purpose}</TableCell>
                <TableCell className="p-1 text-right">{Number(it.amount).toFixed(2)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold bg-muted/30">
              <TableCell colSpan={6} className="text-right">Total Tk</TableCell>
              <TableCell className="text-right">{total.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <Separator className="my-4" />
      <FooterTotal total={total} />
    </div>
  );
}

function ViewBill2({ b, fallbackDesignation }: { b: BillViewData; fallbackDesignation?: string }) {
  const rows = b.items.map((it)=>({ ...decB2(it.purpose), dateFrom:safeDate(it.date), dateTo: it.to ? safeDate(it.to) : safeDate(it.date) }));
  const total = rows.reduce((acc,r)=> acc + ((Number(r.local)||0)+(Number(r.trip)||0)+(Number(r.others)||0) - (Number(r.advance)||0)), 0);
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <HeaderInfo b={b} fallbackDesignation={fallbackDesignation} />
      <div className="rounded-lg border overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead className="min-w-[180px]">Name</TableHead>
              <TableHead>Date From</TableHead>
              <TableHead>Date To</TableHead>
              <TableHead className="min-w-[220px]">Purpose</TableHead>
              <TableHead className="text-right">Local Conv.</TableHead>
              <TableHead className="text-right">Trip Conv.</TableHead>
              <TableHead className="text-right">Others</TableHead>
              <TableHead className="text-right">Advance</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Net Payable</TableHead>
              <TableHead className="min-w-[180px]">Remarks</TableHead>
              <TableHead className="min-w-[160px]">Attachment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r,i)=>{
              const sum = (Number(r.local)||0)+(Number(r.trip)||0)+(Number(r.others)||0);
              const net = sum - (Number(r.advance)||0);
              const url = b.items[i]?.attachmentUrl || null;
              return (
                <TableRow key={i}>
                  <TableCell className="p-1 pt-3 font-medium">{i+1}</TableCell>
                  <TableCell className="p-1 min-w-[180px]">{r.name||"-"}</TableCell>
                  <TableCell className="p-1">{format(r.dateFrom, "PPP")}</TableCell>
                  <TableCell className="p-1">{format(r.dateTo, "PPP")}</TableCell>
                  <TableCell className="p-1 min-w-[220px]">{r.purpose}</TableCell>
                  <TableCell className="p-1 text-right">{Number(r.local).toFixed(2)}</TableCell>
                  <TableCell className="p-1 text-right">{Number(r.trip).toFixed(2)}</TableCell>
                  <TableCell className="p-1 text-right">{Number(r.others).toFixed(2)}</TableCell>
                  <TableCell className="p-1 text-right">{Number(r.advance).toFixed(2)}</TableCell>
                  <TableCell className="p-1 text-right">{sum.toFixed(2)}</TableCell>
                  <TableCell className="p-1 text-right">{net.toFixed(2)}</TableCell>
                  <TableCell className="p-1 min-w-[180px]">{r.remarks||"-"}</TableCell>
                  <TableCell className="p-1 min-w-[160px]">
                    {url ? <a href={url} target="_blank" className="text-primary underline">View</a> : "-"}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow className="font-semibold bg-muted/30">
              <TableCell colSpan={12} className="text-right">Total Tk</TableCell>
              <TableCell className="text-right">{total.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <Separator className="my-4" />
      <FooterTotal total={total} />
    </div>
  );
}

function ViewBill3({ b, fallbackDesignation }: { b: BillViewData; fallbackDesignation?: string }) {
  const rows = b.items.map((it)=>({ ...decB3(it.purpose), dateFrom:safeDate(it.date), dateTo: it.to ? safeDate(it.to) : safeDate(it.date) }));
  const total = rows.reduce((acc,r)=> acc + ((Number(r.food)||0)+(Number(r.hotel)||0)+(Number(r.others)||0) - (Number(r.advance)||0)), 0);
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <HeaderInfo b={b} fallbackDesignation={fallbackDesignation} />
      <div className="rounded-lg border overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead className="min-w-[180px]">Name</TableHead>
              <TableHead>Date From</TableHead>
              <TableHead>Date To</TableHead>
              <TableHead className="min-w-[220px]">Purpose</TableHead>
              <TableHead className="text-right">Food</TableHead>
              <TableHead className="text-right">Hotel</TableHead>
              <TableHead className="text-right">Others</TableHead>
              <TableHead className="text-right">Advance</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Net Payable</TableHead>
              <TableHead className="min-w-[180px]">Remarks</TableHead>
              <TableHead className="min-w-[160px]">Attachment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r,i)=>{
              const sum = (Number(r.food)||0)+(Number(r.hotel)||0)+(Number(r.others)||0);
              const net = sum - (Number(r.advance)||0);
              const url = b.items[i]?.attachmentUrl || null;
              return (
                <TableRow key={i}>
                  <TableCell className="p-1 pt-3 font-medium">{i+1}</TableCell>
                  <TableCell className="p-1 min-w-[180px]">{r.name||"-"}</TableCell>
                  <TableCell className="p-1">{format(r.dateFrom, "PPP")}</TableCell>
                  <TableCell className="p-1">{format(r.dateTo, "PPP")}</TableCell>
                  <TableCell className="p-1 min-w-[220px]">{r.purpose}</TableCell>
                  <TableCell className="p-1 text-right">{Number(r.food).toFixed(2)}</TableCell>
                  <TableCell className="p-1 text-right">{Number(r.hotel).toFixed(2)}</TableCell>
                  <TableCell className="p-1 text-right">{Number(r.others).toFixed(2)}</TableCell>
                  <TableCell className="p-1 text-right">{Number(r.advance).toFixed(2)}</TableCell>
                  <TableCell className="p-1 text-right">{sum.toFixed(2)}</TableCell>
                  <TableCell className="p-1 text-right">{net.toFixed(2)}</TableCell>
                  <TableCell className="p-1 min-w-[180px]">{r.remarks||"-"}</TableCell>
                  <TableCell className="p-1 min-w-[160px]">
                    {url ? <a href={url} target="_blank" className="text-primary underline">View</a> : "-"}
                  </TableCell>
                </TableRow>
              );
            })}

            <TableRow className="font-semibold bg-muted/30">
              <TableCell colSpan={13} className="text-right">Total Tk</TableCell>
              <TableCell className="text-right">{total.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <Separator className="my-4" />
      <FooterTotal total={total} />
    </div>
  );
}

/* NEW: View for Bill-4 */
function ViewBill4({ b, fallbackDesignation }: { b: BillViewData; fallbackDesignation?: string }) {
  const rows = b.items.map((it)=>({
    ...decB4(it.purpose),
    date: safeDate(it.date),
  }));

  // grand total (sum - advance) like before
  const total = rows.reduce(
    (acc,r)=>
      acc +
      (
        (Number(r.food)||0) +
        (Number(r.hotel)||0) +
        (Number(r.others)||0) -
        (Number(r.advance)||0)
      ),
    0
  );

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <HeaderInfo b={b} fallbackDesignation={fallbackDesignation} />

      <div className="rounded-lg border overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SL</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="min-w-[140px]">Time</TableHead>
              <TableHead className="min-w-[220px]">Incident</TableHead>
              <TableHead className="min-w-[240px]">Purpose</TableHead>
              <TableHead className="min-w-[200px]">
                Meal (Breakfast / Lunch / Dinner)
              </TableHead>
              <TableHead className="text-right">Food</TableHead>
              <TableHead className="text-right">Hotel</TableHead>
              <TableHead className="text-right">Others</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Advanced</TableHead>
              <TableHead className="min-w-[200px]">Remarks</TableHead>
              <TableHead className="min-w-[160px]">Attachment</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((r,i)=>{
              const sum =
                (Number(r.food)||0) +
                (Number(r.hotel)||0) +
                (Number(r.others)||0);
              const url = b.items[i]?.attachmentUrl || null;

              return (
                <TableRow key={i}>
                  <TableCell className="p-1 pt-3 font-medium">{i+1}</TableCell>
                  <TableCell className="p-1">{format(r.date, "PPP")}</TableCell>
                  <TableCell className="p-1">{r.time || "-"}</TableCell>
                  <TableCell className="p-1 min-w-[220px]">{r.incident || "-"}</TableCell>
                  <TableCell className="p-1 min-w-[240px]">{r.purpose}</TableCell>
                  <TableCell className="p-1 min-w-[200px]">
                    {r.meal || "-"}
                  </TableCell>
                  <TableCell className="p-1 text-right">{Number(r.food||0).toFixed(2)}</TableCell>
                  <TableCell className="p-1 text-right">{Number(r.hotel||0).toFixed(2)}</TableCell>
                  <TableCell className="p-1 text-right">{Number(r.others||0).toFixed(2)}</TableCell>
                  <TableCell className="p-1 text-right">{sum.toFixed(2)}</TableCell>
                  <TableCell className="p-1 text-right">{Number(r.advance||0).toFixed(2)}</TableCell>
                  <TableCell className="p-1 min-w-[200px]">{r.remarks||"-"}</TableCell>
                  <TableCell className="p-1 min-w-[160px]">
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        className="text-primary underline"
                      >
                        View
                      </a>
                    ) : "-"}
                  </TableCell>
                </TableRow>
              );
            })}

            <TableRow className="font-semibold bg-muted/30">
              {/* 13 visible columns above; span label vs value */}
              <TableCell colSpan={11} className="text-right">Total Tk</TableCell>
              <TableCell className="text-right" colSpan={2}>
                {total.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Separator className="my-4" />
      <FooterTotal total={total} />
    </div>
  );
}


/* ---------- Editors ---------- */
function EditorBill1({
  control, fields, append, remove,
}: { control:any; fields:any[]; append:(r:RowB1)=>void; remove:(i:number)=>void }) {
  const rows = useWatch({ control, name:"items" }) as RowB1[];
  const sum = (rows||[]).reduce((s,r)=> s + (Number(r?.amount)||0), 0);

  return (
    <>
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">No.</TableHead>
              <TableHead className="w-[150px]">Date</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Transport</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((f,i)=>(
              <TableRow key={f?.id ?? i}>
                <TableCell className="p-1 pt-3 font-medium">{i+1}</TableCell>
                <TableCell className="p-1">
                  <FormField control={control} name={`items.${i}.date`} render={({ field })=>(
                    <FormItem>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button type="button" variant="outline" className={cn("w-full justify-start pl-3 text-left", !field.value && "text-muted-foreground")}>
                              {field.value ? format(new Date(field.value), "PPP") : "Pick a date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value ? new Date(field.value) : new Date()} onSelect={field.onChange} disabled={(d)=> d>new Date() || d<new Date("1900-01-01")} />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}/>
                </TableCell>
                {(["from","to","transport","purpose"] as const).map((k)=>(
                  <TableCell className="p-1" key={k}>
                    <FormField control={control} name={`items.${i}.${k}`} render={({ field })=>(
                      <FormItem>
                        <FormControl><Input {...field} placeholder={k} required /></FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}/>
                  </TableCell>
                ))}
                <TableCell className="p-1">
                  <FormField control={control} name={`items.${i}.amount`} render={({ field })=>(
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          className="no-spinner text-right"
                          required
                          value={field.value ?? ""}
                          onChange={(e)=> field.onChange(e.target.value==="" ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}/>
                </TableCell>
                <TableCell className="p-1 pt-3 text-right">
                  {fields.length>1 && (
                    <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={()=>remove(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold bg-muted/30">
              <TableCell colSpan={6} className="text-right">Total Tk</TableCell>
              <TableCell className="text-right">{sum.toFixed(2)}</TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Button type="button" variant="outline" onClick={()=> append({ date:new Date(), from:"", to:"", transport:"", purpose:"", amount: undefined as any })}>
        <PlusCircle className="mr-2 h-4 w-4" /> Add Item
      </Button>
    </>
  );
}

function EditorBill2({
  control, fields, append, remove, onPickFile, files,
}: {
  control:any; fields:any[]; append:(r:RowB2)=>void; remove:(i:number)=>void;
  onPickFile:(i:number,f:File|null)=>void; files:(File|null)[];
}) {
  const rows = useWatch({ control, name:"items" }) as RowB2[];
  const sum = (rows||[]).reduce((acc,r)=> acc + ((Number(r.local)||0)+(Number(r.trip)||0)+(Number(r.others)||0) - (Number(r.advance)||0)), 0);

  return (
    <>
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead className="min-w-[180px]">Name</TableHead>
              <TableHead>Date From</TableHead>
              <TableHead>Date To</TableHead>
              <TableHead className="min-w-[220px]">Purpose</TableHead>
              <TableHead className="text-right">Local Conv.</TableHead>
              <TableHead className="text-right">Trip Conv.</TableHead>
              <TableHead className="text-right">Others</TableHead>
              <TableHead className="text-right">Advance</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Net Payable</TableHead>
              <TableHead className="min-w-[180px]">Remarks</TableHead>
              <TableHead className="min-w-[160px]">Attachment</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((f,i)=>(
              <TableRow key={f?.id ?? i}>
                <TableCell className="p-1 pt-3 font-medium">{i+1}</TableCell>
                <TableCell className="p-1 min-w-[180px]">
                  <FormField control={control} name={`items.${i}.name`} render={({ field })=>(
                    <FormItem><FormControl><Input placeholder="Name" {...field} required className="w-[220px]" /></FormControl><FormMessage/></FormItem>
                  )}/>
                </TableCell>
                {(["dateFrom","dateTo"] as const).map((k)=>(
                  <TableCell className="p-1" key={k}>
                    <FormField control={control} name={`items.${i}.${k}`} render={({ field })=>(
                      <FormItem>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button type="button" variant="outline" className={cn("w-full justify-start pl-3 text-left", !field.value && "text-muted-foreground")}>
                                {field.value ? format(new Date(field.value), "PPP") : "Pick a date"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value ? new Date(field.value) : new Date()} onSelect={field.onChange} disabled={(d)=> d<new Date("1900-01-01")} />
                          </PopoverContent>
                        </Popover>
                        <FormMessage/>
                      </FormItem>
                    )}/>
                  </TableCell>
                ))}
                <TableCell className="p-1 min-w-[220px]">
                  <FormField control={control} name={`items.${i}.purpose`} render={({ field })=>(
                    <FormItem><FormControl><Input placeholder="Purpose" {...field} required className="w-[280px]" /></FormControl><FormMessage/></FormItem>
                  )}/>
                </TableCell>
                {(["local","trip","others","advance"] as const).map((k)=>(
                  <TableCell className="p-1" key={k}>
                    <FormField control={control} name={`items.${i}.${k}`} render={({ field })=>(
                      <FormItem><FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          className="no-spinner text-right w-[130px]"
                          required
                          value={field.value ?? ""}
                          onChange={(e)=> field.onChange(e.target.value==="" ? undefined : Number(e.target.value))}
                        />
                      </FormControl><FormMessage/></FormItem>
                    )}/>
                  </TableCell>
                ))}
                {/* Row Total */}
                <TableCell className="p-1 text-right">
                  {(() => {
                    const r = (rows||[])[i];
                    const s = (Number(r?.local)||0)+(Number(r?.trip)||0)+(Number(r?.others)||0);
                    return s.toFixed(2);
                  })()}
                </TableCell>
                {/* Net */}
                <TableCell className="p-1 text-right">
                  {(() => {
                    const r = (rows||[])[i];
                    const s = (Number(r?.local)||0)+(Number(r?.trip)||0)+(Number(r?.others)||0);
                    const n = s - (Number(r?.advance)||0);
                    return n.toFixed(2);
                  })()}
                </TableCell>
                <TableCell className="p-1 min-w-[180px]">
                  <FormField control={control} name={`items.${i}.remarks`} render={({ field })=>(
                    <FormItem><FormControl><Input placeholder="Remarks" {...field} className="w-[220px]" /></FormControl><FormMessage/></FormItem>
                  )}/>
                </TableCell>

                {/* Attachment (file) */}
                <TableCell className="p-1 min-w-[160px]">
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => onPickFile(i, e.currentTarget.files?.[0] ?? null)} />
                  {files?.[i] ? (
                    <div className="text-xs text-muted-foreground mt-1 truncate max-w-[180px]">
                      {files[i]?.name}
                    </div>
                  ) : null}
                </TableCell>

                <TableCell className="p-1 pt-3 text-right">
                  {fields.length>1 && (
                    <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={()=>remove(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold bg-muted/30">
              <TableCell colSpan={13} className="text-right">Total Tk</TableCell>
              <TableCell className="text-right">{sum.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={()=> append({ name:"", dateFrom:new Date(), dateTo:new Date(), purpose:"", local:undefined as any, trip:undefined as any, others:undefined as any, advance:undefined as any, remarks:"" })}
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Add Row
      </Button>
    </>
  );
}

function EditorBill3({
  control, fields, append, remove, onPickFile, files,
}: {
  control:any; fields:any[]; append:(r:RowB3)=>void; remove:(i:number)=>void;
  onPickFile:(i:number,f:File|null)=>void; files:(File|null)[];
}) {
  const rows = useWatch({ control, name:"items" }) as RowB3[];
  const sum = (rows||[]).reduce((acc,r)=> acc + ((Number(r.food)||0)+(Number(r.hotel)||0)+(Number(r.others)||0) - (Number(r.advance)||0)), 0);

  return (
    <>
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead className="min-w-[180px]">Name</TableHead>
              <TableHead>Date From</TableHead>
              <TableHead>Date To</TableHead>
              <TableHead className="min-w-[220px]">Purpose</TableHead>
              <TableHead className="text-right">Food</TableHead>
              <TableHead className="text-right">Hotel</TableHead>
              <TableHead className="text-right">Others</TableHead>
              <TableHead className="text-right">Advance</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Net Payable</TableHead>
              <TableHead className="min-w-[180px]">Remarks</TableHead>
              <TableHead className="min-w-[160px]">Attachment</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((f,i)=>(
              <TableRow key={f?.id ?? i}>
                <TableCell className="p-1 pt-3 font-medium">{i+1}</TableCell>
                <TableCell className="p-1 min-w-[180px]">
                  <FormField control={control} name={`items.${i}.name`} render={({ field })=>(
                    <FormItem><FormControl><Input placeholder="Name" {...field} required className="w-[220px]" /></FormControl><FormMessage/></FormItem>
                  )}/>
                </TableCell>
                {(["dateFrom","dateTo"] as const).map((k)=>(
                  <TableCell className="p-1" key={k}>
                    <FormField control={control} name={`items.${i}.${k}`} render={({ field })=>(
                      <FormItem>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button type="button" variant="outline" className={cn("w-full justify-start pl-3 text-left", !field.value && "text-muted-foreground")}>
                                {field.value ? format(new Date(field.value), "PPP") : "Pick a date"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value ? new Date(field.value) : new Date()} onSelect={field.onChange} disabled={(d)=> d<new Date("1900-01-01")} />
                          </PopoverContent>
                        </Popover>
                        <FormMessage/>
                      </FormItem>
                    )}/>
                  </TableCell>
                ))}
                <TableCell className="p-1 min-w-[220px]">
                  <FormField control={control} name={`items.${i}.purpose`} render={({ field })=>(
                    <FormItem><FormControl><Input placeholder="Purpose" {...field} required className="w-[280px]" /></FormControl><FormMessage/></FormItem>
                  )}/>
                </TableCell>

                {(["food","hotel","others","advance"] as const).map((k)=>(
                  <TableCell className="p-1" key={k}>
                    <FormField control={control} name={`items.${i}.${k}`} render={({ field })=>(
                      <FormItem><FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          className="no-spinner text-right w-[130px]"
                          required
                          value={field.value ?? ""}
                          onChange={(e)=> field.onChange(e.target.value==="" ? undefined : Number(e.target.value))}
                        />
                      </FormControl><FormMessage/></FormItem>
                    )}/>
                  </TableCell>
                ))}

                <TableCell className="p-1 text-right">
                  {(() => {
                    const r = (rows||[])[i];
                    const s = (Number(r?.food)||0)+(Number(r?.hotel)||0)+(Number(r?.others)||0);
                    return s.toFixed(2);
                  })()}
                </TableCell>
                <TableCell className="p-1 text-right">
                  {(() => {
                    const r = (rows||[])[i];
                    const s = (Number(r?.food)||0)+(Number(r?.hotel)||0)+(Number(r?.others)||0);
                    const n = s - (Number(r?.advance)||0);
                    return n.toFixed(2);
                  })()}
                </TableCell>

                <TableCell className="p-1 min-w-[180px]">
                  <FormField control={control} name={`items.${i}.remarks`} render={({ field })=>(
                    <FormItem><FormControl><Input placeholder="Remarks" {...field} className="w-[220px]" /></FormControl><FormMessage/></FormItem>
                  )}/>
                </TableCell>

                <TableCell className="p-1 min-w-[160px]">
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => onPickFile(i, e.currentTarget.files?.[0] ?? null)} />
                  {files?.[i] ? (
                    <div className="text-xs text-muted-foreground mt-1 truncate max-w-[180px]">
                      {files[i]?.name}
                    </div>
                  ) : null}
                </TableCell>

                <TableCell className="p-1 pt-3 text-right">
                  {fields.length>1 && (
                    <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={()=>remove(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}

            <TableRow className="font-semibold bg-muted/30">
              <TableCell colSpan={13} className="text-right">Total Tk</TableCell>
              <TableCell className="text-right">{sum.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={()=> append({ name:"", dateFrom:new Date(), dateTo:new Date(), purpose:"", food:undefined as any, hotel:undefined as any, others:undefined as any, advance:undefined as any, remarks:"" })}
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Add Row
      </Button>
    </>
  );
}

/* NEW: Editor for Bill-4 */
function EditorBill4({
  control, fields, append, remove, onPickFile, files,
}: {
  control:any; fields:any[]; append:(r:RowB4)=>void; remove:(i:number)=>void;
  onPickFile:(i:number,f:File|null)=>void; files:(File|null)[];
}) {
  const rows = useWatch({ control, name:"items" }) as RowB4[];
  const sum = (rows||[]).reduce(
    (acc,r)=> acc + (
      (Number(r.food)||0) +
      (Number(r.hotel)||0) +
      (Number(r.others)||0) -
      (Number(r.advance)||0)
    ),
    0
  );

  return (
    <>
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SL</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="min-w-[140px]">Time</TableHead>
              <TableHead className="min-w-[220px]">Incident</TableHead>
              <TableHead className="min-w-[240px]">Purpose</TableHead>
              <TableHead className="min-w-[200px]">
                Meal (Breakfast / Lunch / Dinner)
              </TableHead>
              <TableHead className="text-right">Food</TableHead>
              <TableHead className="text-right">Hotel</TableHead>
              <TableHead className="text-right">Others</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Advanced</TableHead>
              <TableHead className="min-w-[200px]">Remarks</TableHead>
              <TableHead className="min-w-[160px]">Attachment</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((f,i)=>(
              <TableRow key={f?.id ?? i}>
                <TableCell className="p-1 pt-3 font-medium">{i+1}</TableCell>

                {/* Date */}
                <TableCell className="p-1">
                  <FormField control={control} name={`items.${i}.date`} render={({ field })=>(
                    <FormItem>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full justify-start pl-3 text-left",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? format(new Date(field.value), "PPP")
                                : "Pick a date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : new Date()}
                            onSelect={field.onChange}
                            disabled={(d)=> d < new Date("1900-01-01")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage/>
                    </FormItem>
                  )}/>
                </TableCell>

                {/* Time */}
                <TableCell className="p-1 min-w-[140px]">
                  <FormField control={control} name={`items.${i}.time`} render={({ field })=>(
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="e.g. 10:00 AM"
                          {...field}
                          required
                          className="w-[160px]"
                        />
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}/>
                </TableCell>

                {/* Incident */}
                <TableCell className="p-1 min-w-[220px]">
                  <FormField control={control} name={`items.${i}.incident`} render={({ field })=>(
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Incident"
                          {...field}
                          required
                          className="w-[260px]"
                        />
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}/>
                </TableCell>

                {/* Purpose */}
                <TableCell className="p-1 min-w-[240px]">
                  <FormField control={control} name={`items.${i}.purpose`} render={({ field })=>(
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Purpose (e.g. ABBL Branch A/C call)"
                          {...field}
                          required
                          className="w-[300px]"
                        />
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}/>
                </TableCell>

                {/* Meal */}
                <TableCell className="p-1 min-w-[200px]">
                  <FormField control={control} name={`items.${i}.meal`} render={({ field })=>(
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Breakfast, Lunch, Dinner"
                          {...field}
                          required
                          className="w-[220px]"
                        />
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}/>
                </TableCell>

                {/* Amounts */}
                {(["food","hotel","others"] as const).map((k)=>(
                  <TableCell className="p-1" key={k}>
                    <FormField control={control} name={`items.${i}.${k}`} render={({ field })=>(
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            className="no-spinner text-right w-[120px]"
                            required
                            value={field.value ?? ""}
                            onChange={(e)=>
                              field.onChange(
                                e.target.value === "" ? undefined : Number(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}/>
                  </TableCell>
                ))}

                {/* Row Total (computed) */}
                <TableCell className="p-1 text-right">
                  {(() => {
                    const r = (rows||[])[i];
                    const s =
                      (Number(r?.food)||0) +
                      (Number(r?.hotel)||0) +
                      (Number(r?.others)||0);
                    return s.toFixed(2);
                  })()}
                </TableCell>

                {/* Advanced */}
                <TableCell className="p-1">
                  <FormField control={control} name={`items.${i}.advance`} render={({ field })=>(
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          className="no-spinner text-right w-[120px]"
                          required
                          value={field.value ?? ""}
                          onChange={(e)=>
                            field.onChange(
                              e.target.value === "" ? undefined : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}/>
                </TableCell>

                {/* Remarks */}
                <TableCell className="p-1 min-w-[200px]">
                  <FormField control={control} name={`items.${i}.remarks`} render={({ field })=>(
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Remarks"
                          {...field}
                          className="w-[260px]"
                        />
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}/>
                </TableCell>

                {/* Attachment */}
                <TableCell className="p-1 min-w-[160px]">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => onPickFile(i, e.currentTarget.files?.[0] ?? null)}
                  />
                  {files?.[i] ? (
                    <div className="text-xs text-muted-foreground mt-1 truncate max-w-[180px]">
                      {files[i]?.name}
                    </div>
                  ) : null}
                </TableCell>

                <TableCell className="p-1 pt-3 text-right">
                  {fields.length>1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={()=>remove(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {/* grand total row inside table */}
            <TableRow className="font-semibold bg-muted/30">
              <TableCell colSpan={12} className="text-right">Total Tk</TableCell>
              <TableCell className="text-right" colSpan={2}>
                {sum.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={()=> append({
          date: new Date(),
          time: "",
          incident: "",
          purpose: "",
          meal: "",
          food: undefined as any,
          hotel: undefined as any,
          others: undefined as any,
          advance: undefined as any,
          remarks: ""
        })}
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Add Row
      </Button>
    </>
  );
}
