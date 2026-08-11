// src/components/bills/bill-form.tsx
"use client";

import { useActionState, useTransition } from "react";
import { useEffect, useMemo, useRef, useState, Fragment } from "react";
import { useForm, useFieldArray, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, isValid, parse } from "date-fns";
import { Calendar as CalendarIcon, PlusCircle, Trash2, AlertCircle, Paperclip } from "lucide-react";
import { useRouter } from "next/navigation";
import { downloadBillPdf } from "@/lib/download-bill-pdf";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

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
  employeeDepartment?: string | null;
  employeeCode?: string | null;
  amount: number;
  amountInWords: string;
  status: BillStatus;
  items: BillViewItem[];
  incidentWarnings?: Record<string, string>;
};

type BillFormat = "BILL1"|"BILL2"|"BILL3"|"BILL4"|"BILL5";

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
  from: string;
  to: string;
  dateFrom: Date;
  dateTo: Date;
  purpose: string;
  bankName?: string;
  selectedColumns?: Bill2OptionalColumn[];
  local?: number;
  trip?: number;
  food?: number;
  hotel?: number;
  others?: number;
  advance?: number;
  remarks?: string;
};
type RowB3 = {
  from: string;
  to: string;
  dateFrom: Date;
  dateTo: Date;
  purpose: string;
  bankName?: string;
  showBankName?: boolean;
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
  vehicle?: string;    // e.g. "Car", "Bike", "Rickshaw"
  food?: number;
  hotel?: number;
  others?: number;
  advance?: number;
  remarks?: string;
};

/* Row shape for combined Bill-5 (merge of Bill-2, Bill-3, Bill-4) */
type RowB5Child = {
  incident: string;
  purpose: string;
  bankName?: string;
  time?: string;
  dateFrom?: string | Date;
  dateTo?: string | Date;
  vehicle?: string;
  local?: number;
  trip?: number;
  food?: number;
  hotel?: number;
  others?: number;
  advance?: number;
  remarks?: string;
};

type RowB5 = {
  name: string;
  dateFrom: Date;
  dateTo: Date;
  children: RowB5Child[];
};
type Bill2OptionalColumn = "bankName" | "trip" | "food" | "hotel" | "others" | "advance";
const BILL2_OPTIONAL_COLUMNS: Array<{ key: Bill2OptionalColumn; label: string }> = [
  { key: "bankName", label: "Bank Name" },
  { key: "trip", label: "Trip Conveyance" },
  { key: "food", label: "Food" },
  { key: "hotel", label: "Hotel" },
  { key: "others", label: "Others" },
  { key: "advance", label: "Advance" },
];

type Bill5OptionalColumn = "bankName" | "trip" | "food" | "hotel" | "others" | "advance";
const BILL5_OPTIONAL_COLUMNS: Array<{ key: Bill5OptionalColumn; label: string }> = [
  { key: "bankName", label: "Bank Name" },
  { key: "trip", label: "Trip Conveyance" },
  { key: "food", label: "Food" },
  { key: "hotel", label: "Hotel" },
  { key: "others", label: "Others" },
  { key: "advance", label: "Advance" },
];
const BILL5_BANKS = [
  "AB Bank PLC",
  "Citizen Bank PLC",
  "Community Bank Bangladesh PLC",
  "Mercantile Bank PLC",
  "IFIC Bank PLC",
  "Eastern Bank PLC",
  "Meghna Bank PLC",
  "Uttara Bank PLC",
  "Al-Arafah Islami Bank PLC",
  "First Security Islami Bank PLC",
  "ICB Islamic Bank PLC",
  "Islami Bank Bangladesh PLC",
  "Social Islami Bank PLC",
  "Union Bank PLC",
  "Bank Al-Falah PLC",
  "Bangladesh Krishi Bank",
  "Sonali Bank PLC",
  "International Finance Investment and Commerce Bank PLC",
] as const;
const BILL5_FIELD_CLASS = "h-9 rounded-md border-slate-300 bg-white shadow-sm transition-colors hover:border-slate-400 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15";
const BILL5_LINE_CARD_CLASSES = [
  "border-blue-200 bg-blue-50/70",
  "border-emerald-200 bg-emerald-50/70",
  "border-amber-200 bg-amber-50/70",
  "border-violet-200 bg-violet-50/70",
] as const;

/* ---------- Schema ---------- */
const billFormSchema = z.object({
  billId: z.string().optional(),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  employeeName: z.string().optional(),
  employeeDesignation: z.string().optional(), // visible but not submitted
  supervisorId: z.string().optional(),
  items: z.array(z.any()).min(1, "Add at least one row"),
});
type BillFormValues = z.infer<typeof billFormSchema>;

function calculateBillTotals(formatType: BillFormat, items: BillFormValues["items"] | undefined) {
  const rows = (items || []) as any[];
  let total = 0;
  if (formatType === "BILL1") total = rows.reduce((sum, row) => sum + (Number(row?.amount) || 0), 0);
  else if (formatType === "BILL5") total = rows.reduce((sum, parent) => sum + (parent?.children || []).reduce(
    (childSum: number, row: RowB5Child) => childSum + (Number(row.local) || 0) + (Number(row.trip) || 0) +
      (Number(row.food) || 0) + (Number(row.hotel) || 0) + (Number(row.others) || 0) - (Number(row.advance) || 0), 0), 0);
  else if (formatType === "BILL2") total = rows.reduce((sum, row) => sum + (Number(row.local) || 0) +
    (Number(row.trip) || 0) + (Number(row.food) || 0) + (Number(row.hotel) || 0) +
    (Number(row.others) || 0) - (Number(row.advance) || 0), 0);
  else total = rows.reduce((sum, row) => sum + (Number(row.food) || 0) + (Number(row.hotel) || 0) +
    (Number(row.others) || 0) - (Number(row.advance) || 0), 0);
  return { total, words: numberToWords(total) + " Only" };
}

function LiveBillTotal({ control, formatType }: { control: any; formatType: BillFormat }) {
  const items = useWatch({ control, name: "items" });
  const totals = calculateBillTotals(formatType, items);
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <p className="text-muted-foreground">{totals.words}</p>
      <div className="mt-2 flex items-center justify-between font-semibold">
        <span>Total</span>
        <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "BDT" }).format(totals.total)}</span>
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */
const safeDate = (v?: string|Date|null) => {
  if (v instanceof Date) return isValid(v) ? v : new Date();
  if (!v) return new Date();

  const nativeDate = new Date(v);
  if (isValid(nativeDate)) return nativeDate;

  // Older Bill 2/3/5 rows stored Date To using date-fns' PPP display
  // format (for example "August 1st, 2026"), which `new Date` cannot
  // reliably parse. Keep those existing rows readable during migration.
  const displayDate = parse(v, "PPP", new Date());
  return isValid(displayDate) ? displayDate : new Date();
};
const detectFormat = (items?: BillViewItem[]): BillFormat => {
  if (!items?.length) return "BILL1";
  const t = items[0]?.transport ?? "";
  if (t === "__BILL2__") return "BILL2";
  if (t === "__BILL3__") return "BILL3";
  // if (t === "__BILL4__") return "BILL4";
  if (t === "__BILL5__") return "BILL5";
  return "BILL1";
};

/* Bill-2 payload (local/trip/others/advance) */
const encB2 = (r: RowB2) => {
  const total = (Number(r.local)||0)+(Number(r.trip)||0)+(Number(r.food)||0)+(Number(r.hotel)||0)+(Number(r.others)||0);
  const net = total - (Number(r.advance)||0);
  return JSON.stringify({
    from: r.from||"", to: r.to||"", purpose: r.purpose||"", bankName: r.bankName||"", selectedColumns: r.selectedColumns||[],
    local: Number(r.local||0), trip: Number(r.trip||0), food: Number(r.food||0), hotel: Number(r.hotel||0), others: Number(r.others||0),
    advance: Number(r.advance||0), total, net, remarks: r.remarks||""
  });
};
const decB2 = (s: string) => {
  try {
    const o = JSON.parse(s||"{}");
    const local = Number(o.local||0), trip = Number(o.trip||0), food = Number(o.food||0), hotel = Number(o.hotel||0), others = Number(o.others||0), advance = Number(o.advance||0);
    const total = Number.isFinite(o.total) ? Number(o.total) : local+trip+food+hotel+others;
    const net = Number.isFinite(o.net) ? Number(o.net) : total-advance;
    const selectedColumns = Array.isArray(o.selectedColumns)
      ? o.selectedColumns.filter((key: unknown) => BILL2_OPTIONAL_COLUMNS.some((column) => column.key === key)) as Bill2OptionalColumn[]
      : undefined;
    return { from:String(o.from ?? o.name ?? ""), to:String(o.to||""), purpose:String(o.purpose||""), bankName:String(o.bankName||""), selectedColumns, local, trip, food, hotel, others, advance, total, net, remarks:String(o.remarks||"") };
  } catch {
    return { from:"", to:"", purpose:s, bankName:"", selectedColumns:undefined, local:0, trip:0, food:0, hotel:0, others:0, advance:0, total:0, net:0, remarks:"" };
  }
};

/* Bill-3 payload (food/hotel/others/advance) */
const encB3 = (r: RowB3) => {
  const total = (Number(r.food)||0)+(Number(r.hotel)||0)+(Number(r.others)||0);
  const net = total - (Number(r.advance)||0);
  return JSON.stringify({
    from: r.from||"", to: r.to||"", purpose: r.purpose||"", bankName: r.bankName||"", showBankName: !!r.showBankName,
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
    return { from:String(o.from ?? o.name ?? ""), to:String(o.to ?? ""), purpose:String(o.purpose||""), bankName:String(o.bankName||""), showBankName:!!o.showBankName, food, hotel, others, advance, total, net, remarks:String(o.remarks||"") };
  } catch {
    return { from:"", to:"", purpose:s, bankName:"", showBankName:false, food:0, hotel:0, others:0, advance:0, total:0, net:0, remarks:"" };
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
    vehicle: r.vehicle || "",
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
      vehicle: String(o.vehicle || ""),
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
      vehicle: "",
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

/* Bill-5 payload: pack a child row together with its parent metadata */
const encB5Child = (parent: RowB5, child: RowB5Child, selectedColumns: Bill5OptionalColumn[]) => {
  const local = Number(child.local||0);
  const trip = Number(child.trip||0);
  const food = Number(child.food||0);
  const hotel = Number(child.hotel||0);
  const others = Number(child.others||0);
  const advance = Number(child.advance||0);
  const total = local + trip + food + hotel + others;
  const net = total - advance;
  return JSON.stringify({
    parentName: parent.name||"",
    time: child.time || "",
    dateFrom: child.dateFrom ? (child.dateFrom instanceof Date ? child.dateFrom.toISOString() : String(child.dateFrom)) : "",
    dateTo: child.dateTo ? (child.dateTo instanceof Date ? child.dateTo.toISOString() : String(child.dateTo)) : "",
    incident: child.incident||"",
    purpose: child.purpose||"",
    bankName: child.bankName||"",
    vehicle: child.vehicle||"",
    selectedColumns,
    local, trip, food, hotel, others, advance, total, net, remarks: child.remarks||""
  });
};

  const decB5Child = (s: string) => {
  try {
    const o = JSON.parse(s||"{}");
    return {
      parentName: String(o.parentName||""),
      time: String(o.time||""),
      dateFrom: String(o.dateFrom || ""),
      dateTo: String(o.dateTo || ""),
      incident: String(o.incident||""),
      purpose: String(o.purpose||""),
      bankName: String(o.bankName||""),
      vehicle: String(o.vehicle||""),
      selectedColumns: Array.isArray(o.selectedColumns) ? o.selectedColumns.filter((key: unknown) => BILL5_OPTIONAL_COLUMNS.some((column) => column.key === key)) as Bill5OptionalColumn[] : undefined,
      local: Number(o.local||0), trip: Number(o.trip||0), food: Number(o.food||0), hotel: Number(o.hotel||0), others: Number(o.others||0), advance: Number(o.advance||0), total: Number(o.total||0), net: Number(o.net||0), remarks: String(o.remarks||""),
      attachmentUrl: undefined as (string | null | undefined)
    };
  } catch {
    return { parentName: "", time: "", dateFrom: "", dateTo: "", incident: "", purpose: s, bankName: "", vehicle: "", selectedColumns: undefined, local:0, trip:0, food:0, hotel:0, others:0, advance:0, total:0, net:0, remarks: "", attachmentUrl: undefined };
  }
};

/* --- small helpers --- */
const isEmpty = (v: any) =>
  v === undefined || v === null || (typeof v === "string" && v.trim() === "");
const asNum = (v: any) => (v === "" || v === null || v === undefined ? NaN : Number(v));

/* ---------- Component ---------- */
type Props =
  | { mode?: "create"|"edit"; user: User; bill?: BillViewData; supervisors?: { id: string; name: string; email?: string }[] }
  | { mode: "view"; bill: BillViewData; user?: User };

function SubmitButton({ isPending, children, disabled }: { isPending:boolean; children:React.ReactNode; disabled?:boolean }) {
  return (
    <Button type="submit" className="min-w-[140px] w-auto bg-accent hover:bg-accent/90 px-4" disabled={isPending || disabled}>
      {isPending ? "Working..." : children}
    </Button>
  );
}

function AttachmentPreview({ url }: { url: string }) {
  const isPdf = /\.pdf(?:$|[?#])/i.test(url);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="link" className="h-auto p-6 text-primary underline">
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="grid h-[85vh] w-[95vw] max-w-5xl grid-rows-[auto_minmax(0,1fr)_auto] gap-3 p-4">
        <DialogHeader>
          <DialogTitle>Attachment Preview</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 overflow-auto rounded-md border bg-slate-100">
          {isPdf ? (
            <iframe src={url} title="Bill attachment PDF" className="h-full min-h-[65vh] w-full bg-white" />
          ) : (
            <div className="flex min-h-full items-center justify-center p-3">
              <img src={url} alt="Bill attachment" className="max-h-[68vh] max-w-full object-contain" />
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button asChild type="button" variant="outline" size="sm">
            <a href={url} target="_blank" rel="noopener noreferrer">Open in new tab</a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BankColumnToggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3 shadow-sm">
      <label className={cn("inline-flex cursor-pointer select-none items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium", checked ? "border-primary/40 bg-primary/5 text-primary" : "border-slate-300 bg-white")}>
        <Checkbox checked={checked} onCheckedChange={(value) => onChange(value === true)} className="h-5 w-5 rounded-full border-slate-400" />
        Bank Name
      </label>
      <span className="ml-3 text-xs text-muted-foreground">Tick to add, untick to remove</span>
    </div>
  );
}

function Bill5ChildNet({ control, parentIndex, childIndex }: { control: any; parentIndex: number; childIndex: number }) {
  const value = useWatch({
    control,
    name: `items.${parentIndex}.children.${childIndex}` as any,
  }) as RowB5Child | undefined;
  const total = (Number(value?.local) || 0) + (Number(value?.trip) || 0) +
    (Number(value?.food) || 0) + (Number(value?.hotel) || 0) +
    (Number(value?.others) || 0) - (Number(value?.advance) || 0);
  return <>{total.toFixed(2)}</>;
}

function AutoCloseDatePicker({ field, className, disableFuture = false, compact = false }: { field: any; className?: string; disableFuture?: boolean; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button type="button" variant="outline" className={cn("w-[190px] justify-start pl-3 text-left", className, !field.value && "text-muted-foreground")}>
            {field.value ? format(new Date(field.value), compact ? "dd MMM yy" : "PPP") : "Pick a date"}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={field.value ? new Date(field.value) : undefined}
          onSelect={(date) => {
            if (!date) return;
            field.onChange(date);
            setOpen(false);
          }}
          disabled={(date) => date < new Date("1900-01-01") || (disableFuture && date > new Date())}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function Bill5ChildTable({
  control,
  parentIndex,
  files,
  onPickFile,
  selectedColumns,
  hideEmptyColumns = false,
}: {
  control: any;
  parentIndex: number;
  files: (File | null)[][];
  onPickFile: (parentIndex: number, childIndex: number, file: File | null) => void;
  selectedColumns: Bill5OptionalColumn[];
  hideEmptyColumns?: boolean;
}) {
  const { fields: childFields, append: appendChild, remove: removeChild } = useFieldArray({ control, name: `items.${parentIndex}.children` as any });
  const parentChildren = useWatch({
    control,
    name: `items.${parentIndex}.children` as any,
  }) as RowB5Child[] | undefined;
  const visibleSelectedColumns = hideEmptyColumns ? selectedColumns.filter((column) =>
    (parentChildren || []).some((child) =>
      column === "bankName"
        ? String(child?.bankName || "").trim().length > 0
        : Number(child?.[column] || 0) !== 0
    )
  ) : selectedColumns;
  const showLocalColumn = !hideEmptyColumns ||
    (parentChildren || []).some((child) => Number(child?.local || 0) !== 0);

  return (
    <div className="min-w-0 w-full max-w-full [&_th]:h-9 [&_th]:px-2 [&_td]:px-1 [&_td]:py-1">
      <div className={cn("w-full max-w-full rounded-md border border-slate-200 bg-white max-md:overflow-visible max-md:border-0 max-md:p-0", hideEmptyColumns ? "p-1.5 [&_input]:h-8 [&_[role=combobox]]:h-8" : "overflow-x-auto")}>
        <Table className={cn("max-md:block max-md:w-full max-md:[&>tbody]:block max-md:[&>tbody]:space-y-2", hideEmptyColumns && "block w-full [&>tbody]:block [&>tbody]:space-y-2")}>
          <TableHeader className={cn("bg-slate-50/90 max-md:sr-only", hideEmptyColumns && "sr-only")}>
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="min-w-[150px]">Incident</TableHead>
              {visibleSelectedColumns.includes("bankName") ? <TableHead>Bank Name</TableHead> : null}
              <TableHead>Purpose</TableHead>
              <TableHead className="min-w-[120px]">From</TableHead>
              <TableHead className="min-w-[120px]">To</TableHead>
              <TableHead className="min-w-[90px]">Time</TableHead>
              <TableHead>Vehicle</TableHead>
              {showLocalColumn ? <TableHead className="text-right">Local con</TableHead> : null}
              {BILL5_OPTIONAL_COLUMNS.filter((column) => column.key !== "bankName" && visibleSelectedColumns.includes(column.key)).map((column) => (
                <TableHead key={column.key} className="text-right">{column.label}</TableHead>
              ))}
              {!hideEmptyColumns ? <TableHead className="text-right">Total Amount</TableHead> : null}
              <TableHead>Remarks</TableHead>
              <TableHead>Attachment</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {childFields.map((cf, ci) => (
              <TableRow key={cf.id} className={cn("border-slate-200 hover:bg-slate-50/40 max-md:grid max-md:grid-cols-3 max-md:gap-0.5 max-md:rounded max-md:!border max-md:p-0.5 max-md:shadow-sm max-md:[&_input]:!h-7 max-md:[&_input]:px-1.5 max-md:[&_input]:text-[11px] max-md:[&_button]:!h-7 max-md:[&_button]:px-1.5 max-md:[&_button]:text-[11px] max-md:[&>td]:block max-md:[&>td]:min-w-0 max-md:[&>td]:p-0", hideEmptyColumns && "grid grid-cols-2 gap-1.5 rounded-md !border p-1.5 lg:grid-cols-4 [&>td]:block [&>td]:min-w-0 [&>td]:p-0", BILL5_LINE_CARD_CLASSES[ci % BILL5_LINE_CARD_CLASSES.length])}>
                <TableCell>
                  <FormField control={control} name={`items.${parentIndex}.children.${ci}.incident`} render={({ field }) => (
                    <FormItem><FormControl><Input {...field} autoComplete="off" placeholder="Incident (optional)" className={cn(hideEmptyColumns ? "w-full" : "w-[150px]", "max-md:w-full", BILL5_FIELD_CLASS)} /></FormControl><FormMessage/></FormItem>
                  )} />
                </TableCell>
                {visibleSelectedColumns.includes("bankName") ? (
                  <TableCell>
                    <FormField control={control} name={`items.${parentIndex}.children.${ci}.bankName`} render={({ field }) => (
                      <FormItem>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className={cn(hideEmptyColumns ? "w-full" : "w-[250px]", "max-md:w-full", BILL5_FIELD_CLASS)}>
                              <SelectValue placeholder="Select bank" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BILL5_BANKS.map((bank) => (
                              <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage/>
                      </FormItem>
                    )} />
                  </TableCell>
                ) : null}
                <TableCell className="max-md:col-span-3">
                  <FormField control={control} name={`items.${parentIndex}.children.${ci}.purpose`} render={({ field }) => (
                    <FormItem><FormControl><Input {...field} autoComplete="off" placeholder="Purpose" className={cn(hideEmptyColumns ? "w-full" : "w-[220px]", "max-md:w-full", BILL5_FIELD_CLASS)} /></FormControl><FormMessage/></FormItem>
                  )} />
                </TableCell>
                <TableCell>
                  <FormField control={control} name={`items.${parentIndex}.children.${ci}.dateFrom`} render={({ field }) => (
                    <FormItem><FormControl><Input {...field} autoComplete="off" placeholder="From" className={cn(hideEmptyColumns ? "w-full" : "w-[140px]", "max-md:w-full", BILL5_FIELD_CLASS)} /></FormControl><FormMessage/></FormItem>
                  )} />
                </TableCell>
                <TableCell>
                  <FormField control={control} name={`items.${parentIndex}.children.${ci}.dateTo`} render={({ field }) => (
                    <FormItem><FormControl><Input {...field} autoComplete="off" placeholder="To" className={cn(hideEmptyColumns ? "w-full" : "w-[140px]", "max-md:w-full", BILL5_FIELD_CLASS)} /></FormControl><FormMessage/></FormItem>
                  )} />
                </TableCell>
                <TableCell className="align-top">
                  <FormField control={control} name={`items.${parentIndex}.children.${ci}.time`} render={({ field }) => (
                    <FormItem><FormControl><Input placeholder="Time (10:00 AM)" {...field} autoComplete="off" className={cn(hideEmptyColumns ? "w-full" : "w-[110px]", "max-md:w-full", BILL5_FIELD_CLASS)} /></FormControl><FormMessage/></FormItem>
                  )} />
                </TableCell>
                <TableCell>
                  <FormField control={control} name={`items.${parentIndex}.children.${ci}.vehicle`} render={({ field }) => (
                    <FormItem>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className={cn(hideEmptyColumns ? "w-full" : "w-[120px]", "max-md:w-full", BILL5_FIELD_CLASS)}>
                            <SelectValue placeholder="Vehicle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Rickshaw">Rickshaw</SelectItem>
                          <SelectItem value="Bus">Bus</SelectItem>
                          <SelectItem value="CNG">CNG</SelectItem>
                          <SelectItem value="L. CNG">L. CNG</SelectItem>
                          <SelectItem value="Boat">Boat</SelectItem>
                          <SelectItem value="Auto Rickshaw">Auto Rickshaw</SelectItem>
                          <SelectItem value="Launch">Launch</SelectItem>
                          <SelectItem value="Metro Rail">Metro Rail</SelectItem>
                          <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                          <SelectItem value="Speed Boat">Speed Boat</SelectItem>
                          <SelectItem value="Train">Train</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage/>
                    </FormItem>
                  )} />
                </TableCell>
                {(["local", ...visibleSelectedColumns.filter((column) => column !== "bankName")] as Array<"local" | Exclude<Bill5OptionalColumn, "bankName">>).filter((key) =>
                  key !== "local" || showLocalColumn
                ).map((k) => (
                  <TableCell key={k} className="text-right">
                    <FormField control={control} name={`items.${parentIndex}.children.${ci}.${k}`} render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="text" inputMode="numeric" placeholder={k === "local" ? "Local con" : BILL5_OPTIONAL_COLUMNS.find((column) => column.key === k)?.label} aria-label={k === "local" ? "Local conveyance" : k} className={cn(hideEmptyColumns ? "w-full" : "w-[90px]", "text-right max-md:w-full", BILL5_FIELD_CLASS)} value={field.value ?? ""} onChange={(e)=> field.onChange(e.target.value === "" ? "" : Math.trunc(Number(e.target.value.replace(/\D/g, ""))))} />
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )} />
                  </TableCell>
                ))}
                {!hideEmptyColumns ? (
                  <TableCell className="text-right">
                    <Bill5ChildNet control={control} parentIndex={parentIndex} childIndex={ci} />
                  </TableCell>
                ) : null}
                <TableCell>
                  <FormField control={control} name={`items.${parentIndex}.children.${ci}.remarks`} render={({ field }) => (
                    <FormItem><FormControl><Input {...field} autoComplete="off" placeholder="Remarks" className={cn(hideEmptyColumns ? "w-full" : "w-[160px]", "max-md:w-full", BILL5_FIELD_CLASS)} /></FormControl><FormMessage/></FormItem>
                  )} />
                </TableCell>
                <TableCell>
                  <label
                    className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 shadow-sm transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary focus-within:ring-2 focus-within:ring-primary/20 max-md:h-7 max-md:w-7"
                    title="Attach file"
                    aria-label="Attach file"
                  >
                    <Paperclip className="h-4 w-4" />
                    <input className="sr-only" type="file" accept="image/*,application/pdf" onChange={(e) => onPickFile(parentIndex, ci, e.currentTarget.files?.[0] ?? null)} />
                  </label>
                  {files?.[parentIndex]?.[ci] ? <div className="text-xs text-muted-foreground mt-1 truncate max-w-[140px]">{files[parentIndex][ci]?.name}</div> : null}
                </TableCell>
                <TableCell className={cn("text-right max-md:col-span-3", hideEmptyColumns && "col-span-2 lg:col-span-4")}>
                  {childFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size={hideEmptyColumns ? "sm" : "icon"}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remove line ${ci + 1}`}
                      title={`Remove line ${ci + 1}`}
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to remove line ${ci + 1}?`)) {
                          removeChild(ci);
                        }
                      }}
                    >
                      <Trash2 className={cn("h-4 w-4", hideEmptyColumns && "mr-1.5")} />
                      {hideEmptyColumns ? `Remove line ${ci + 1}` : null}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-1">
        <Button type="button" variant="outline" size="sm" onClick={() => appendChild({ incident: "", purpose: "", time: "", dateFrom: "", dateTo: "", vehicle: "", local: undefined, trip: undefined, food: undefined, hotel: undefined, others: undefined, advance: undefined, remarks: "" } as any)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add row
        </Button>
      </div>
    </div>
  );
}

/* NEW: Editor for Bill-5 (combined) */
function EditorBill5({
  control,
  fields,
  append,
  remove,
  onPickFile,
  files,
  employeeName,
  selectedColumns,
  onToggleColumn,
  hideEmptyColumns = false,
}: {
  control: any;
  fields: any[];
  append: (r: RowB5) => void;
  remove: (i: number) => void;
  onPickFile: (parentIndex: number, childIndex: number, f: File | null) => void;
  files: (File | null)[][];
  employeeName?: string;
  selectedColumns: Bill5OptionalColumn[];
  onToggleColumn: (column: Bill5OptionalColumn, enabled: boolean) => void;
  hideEmptyColumns?: boolean;
}) {
  return (
    <div className={cn("min-w-0 w-full max-w-full overflow-hidden", hideEmptyColumns && "text-sm")}>
      <div className={cn("rounded-lg border border-slate-200 bg-slate-50/70 shadow-sm", hideEmptyColumns ? "mb-1.5 p-1.5" : "mb-2 p-2")}>
        <div className={cn("flex items-center gap-2", hideEmptyColumns ? "mb-1" : "mb-2")}>
          <span className="text-sm font-semibold text-slate-800">Add columns</span>
          <span className="text-xs text-slate-500">Tick to add, untick to remove</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {BILL5_OPTIONAL_COLUMNS.map((column) => {
            const checked = selectedColumns.includes(column.key);
            return (
              <label
                key={column.key}
                className={cn(
                  "flex cursor-pointer select-none items-center gap-1.5 rounded-full border font-medium transition-colors",
                  hideEmptyColumns ? "px-2 py-0.5 text-xs" : "px-2 py-1 text-xs",
                  checked
                    ? "border-primary/40 bg-primary/5 text-primary"
                    : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(value) => onToggleColumn(column.key, value === true)}
                  className="h-5 w-5 rounded-full border-slate-400 data-[state=checked]:border-primary"
                />
                {column.label}
              </label>
            );
          })}
        </div>
      </div>
      <div className="w-full max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className={cn("w-full max-w-full max-md:overflow-visible", hideEmptyColumns ? "" : "overflow-x-auto")}>
          <Table className={cn("[&_th]:h-9 [&_th]:px-2 [&_td]:py-1 max-md:block max-md:w-full max-md:min-w-0 max-md:[&>tbody]:block", hideEmptyColumns ? "block w-full [&>tbody]:block" : "w-max min-w-[1450px]")}>
            <TableHeader className={cn("bg-slate-50/90 max-md:sr-only", hideEmptyColumns && "sr-only")}>
              <TableRow className="border-slate-200 hover:bg-transparent">
                <TableHead>SL</TableHead>
                <TableHead>Date From</TableHead>
                <TableHead>Date To</TableHead>
                <TableHead className="min-w-[560px]">
                  Purpose (click Add row to add nested child)
                </TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>

            <TableBody>
              {fields.map((f, i) => (
                <TableRow key={f.id ?? i} className={cn("border-slate-200 hover:bg-slate-50/30 max-md:grid max-md:grid-cols-2 max-md:gap-0.5 max-md:rounded max-md:border max-md:p-0.5 max-md:[&_button]:!h-7 max-md:[&_button]:text-[11px] max-md:[&>td]:min-w-0", hideEmptyColumns && "grid grid-cols-[auto_minmax(0,1fr)] gap-1.5 p-1.5 md:grid-cols-[auto_115px_115px_minmax(0,1fr)_auto] [&>td]:min-w-0")}>
                  <TableCell className={cn("p-1 font-medium max-md:col-span-2 max-md:rounded-md max-md:bg-muted/40 max-md:px-2", hideEmptyColumns ? "flex items-center self-center" : "pt-3")}>
                    {i + 1}
                  </TableCell>

                  {(["dateFrom", "dateTo"] as const).map((k) => (
                    <TableCell className={cn("p-1 max-md:block", hideEmptyColumns && "flex items-center self-center [&>div]:w-full")} key={k}>
                      <FormField
                        control={control}
                        name={`items.${i}.${k}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={cn("text-xs text-muted-foreground", hideEmptyColumns && "md:sr-only")}>{k === "dateFrom" ? "Date From" : "Date To"}</FormLabel>
                            <AutoCloseDatePicker field={field} compact={hideEmptyColumns} className={cn(hideEmptyColumns ? "w-full px-2 text-xs" : "w-[150px]", "max-md:w-full", BILL5_FIELD_CLASS)} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                  ))}

                  <TableCell className={cn("p-1 overflow-hidden max-md:col-span-2 max-md:max-w-none", hideEmptyColumns ? "col-span-2 min-w-0 md:col-span-1" : "max-w-[900px]")}>
                    <Bill5ChildTable
                      control={control}
                      parentIndex={i}
                      files={files}
                      onPickFile={onPickFile}
                      selectedColumns={selectedColumns}
                      hideEmptyColumns={hideEmptyColumns}
                    />
                  </TableCell>

                  <TableCell className={cn("p-1 text-right max-md:col-span-2 max-md:flex max-md:justify-end", hideEmptyColumns && "col-span-2 flex items-center justify-end self-center md:col-span-1 md:justify-center")}>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size={hideEmptyColumns ? "sm" : "icon"}
                        className={cn("text-destructive hover:bg-destructive/10 hover:text-destructive", hideEmptyColumns && "whitespace-nowrap")}
                        aria-label={`Remove bill ${i + 1}`}
                        title={`Remove bill ${i + 1}`}
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to remove bill ${i + 1}?`)) {
                            remove(i);
                          }
                        }}
                      >
                        <Trash2 className={cn("h-4 w-4", hideEmptyColumns && "mr-1.5")} />
                        {hideEmptyColumns ? `Remove bill ${i + 1}` : null}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="mt-2"
        onClick={() =>
          append({
            name: employeeName || "",
            dateFrom: new Date(),
            dateTo: new Date(),
            children: [
              {
                incident: "",
                purpose: "",
                time: "",
                dateFrom: "",
                dateTo: "",
                vehicle: "",
                local: undefined as any,
                trip: undefined as any,
                food: undefined as any,
                hotel: undefined as any,
                others: undefined as any,
                advance: undefined as any,
                remarks: "",
              },
            ],
          } as any)
        }
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Add Row
      </Button>
    </div>
  );
}

/* NEW: View for Bill-5 */
function ViewBill5({ b, fallbackDesignation, viewerRole }: { b: BillViewData; fallbackDesignation?: string; viewerRole?: string }) {
  const [mounted, setMounted] = useState(false);
  const isEmployeeView = viewerRole === "employee";
  const isDraft = String(b.status).toUpperCase() === "DRAFT";
  const status = String(b.status).toUpperCase();
  const isAccountsApproved = [
    "APPROVED_BY_ACCOUNTS",
    "APPROVED_BY_MANAGEMENT",
    "REJECTED_BY_MANAGEMENT",
    "PAID",
  ].includes(status);
  const incidentWarningFor = (incident: string) =>
    viewerRole === "supervisor"
      ? b.incidentWarnings?.[incident.trim().replace(/\s+/g, " ").toLowerCase()]
      : undefined;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="rounded-xl border bg-white p-6 shadow-sm" />;
  }

  if (isEmployeeView && !isDraft) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="rounded-lg border bg-muted/20 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {isAccountsApproved ? "Approved Bill Amount" : "Your Submitted Bill Amount"}
          </p>
          <p className="mt-2 text-4xl font-semibold tabular-nums">
            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "BDT" }).format(Number(b.amount || 0))}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            {b.amountInWords || numberToWords(Number(b.amount || 0)) + " Only"}
          </p>
        </div>
        <Separator className="my-4" />
        <p className="text-sm text-muted-foreground">
          Bill details are hidden for employee view after submission.
        </p>
      </div>
    );
  }

  const groups: Array<{
    name: string;
    dateFrom: Date;
    dateTo: Date;
    children: Array<ReturnType<typeof decB5Child> & { attachmentUrl?: string | null }>;
  }> = [];

  const groupMap = new Map<string, (typeof groups)[number]>();

  b.items.forEach((it) => {
    const dateFrom = safeDate(it.date);
    const dateTo = it.to ? safeDate(it.to) : safeDate(it.date);
    try {
      const parsed = decB5Child(it.purpose);
      const key = [
        parsed.parentName || "",
        dateFrom.toISOString(),
        dateTo.toISOString(),
      ].join("|");

      let g = groupMap.get(key);
      if (!g) {
        g = {
          name: parsed.parentName || "",
          dateFrom,
          dateTo,
          children: [],
        };
        groupMap.set(key, g);
        groups.push(g);
      }

      g.children.push({ ...parsed, attachmentUrl: it.attachmentUrl });
    } catch {
      const key = [it.id || "", dateFrom.toISOString(), dateTo.toISOString()].join("|");
      let g = groupMap.get(key);
      if (!g) {
        g = {
          name: "",
          dateFrom,
          dateTo,
          children: [],
        };
        groupMap.set(key, g);
        groups.push(g);
      }
      g.children.push({
        parentName: "",
        time: "",
        incident: "",
        purpose: it.purpose || "",
        bankName: "",
        vehicle: "",
        selectedColumns: undefined,
        local : 0,
        trip: 0,
        food: 0,
        hotel: 0,
        others: 0,
        advance: 0,
        dateFrom: "",
        dateTo: "",
        total: 0,
        remarks: "",
        net: 0,
        attachmentUrl: it.attachmentUrl,
      });
    }
  });

  const visibleColumnsForGroup = (group: (typeof groups)[number]) => {
    const columns: Array<"local" | Bill5OptionalColumn> = [];
    if (group.children.some((child) => String(child.bankName || "").trim())) columns.push("bankName");
    (["local", "trip", "food", "hotel", "others", "advance"] as const).forEach((key) => {
      if (group.children.some((child) => Number(child[key] || 0) !== 0)) columns.push(key);
    });
    return columns;
  };

  const total = groups.reduce((acc, g) => {
    return (
      acc +
      g.children.reduce((sum, c) => {
        const net =
          (Number(c.local) || 0) +
          (Number(c.trip) || 0) +
          (Number(c.food) || 0) +
          (Number(c.hotel) || 0) +
          (Number(c.others) || 0) -
          (Number(c.advance) || 0);
        return sum + net;
      }, 0)
    );
  }, 0);

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <HeaderInfo b={b} fallbackDesignation={fallbackDesignation} />
      <div className="space-y-4">
        {groups.map((g, i) => {
          const visibleColumns = visibleColumnsForGroup(g);
          const numericColumns = visibleColumns.filter((column) => column !== "bankName") as Array<Exclude<(typeof visibleColumns)[number], "bankName">>;
          return (
            <section key={`${g.name}-${i}`} className="overflow-hidden rounded-lg border">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b bg-muted/30 px-3 py-2 text-sm">
                <span className="font-semibold">No. {i + 1}{g.name ? ` — ${g.name}` : ""}</span>
                <span>Date From: {format(g.dateFrom, "MMM d")}</span>
                <span>Date To: {format(g.dateTo, "MMM d")}</span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px] text-sm font-semibold">Incident</TableHead>
                    <TableHead className="min-w-[70px] text-sm font-semibold">Time</TableHead>
                    <TableHead className="text-sm font-semibold">From</TableHead>
                    <TableHead className="text-sm font-semibold">To</TableHead>
                    {visibleColumns.includes("bankName") ? <TableHead className="min-w-[180px] text-sm font-semibold">Bank Name</TableHead> : null}
                    <TableHead className="text-sm font-semibold">Purpose</TableHead>
                    <TableHead className="text-sm font-semibold">Vehicle</TableHead>
                    {numericColumns.map((column) => (
                      <TableHead key={column} className="text-right text-sm font-semibold">
                        {column === "local" ? "Local con" : BILL5_OPTIONAL_COLUMNS.find((item) => item.key === column)?.label}
                      </TableHead>
                    ))}
                    <TableHead className="text-right text-sm font-semibold">Net</TableHead>
                    <TableHead className="text-sm font-semibold">Remarks</TableHead>
                    <TableHead className="text-sm font-semibold">Attach</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {g.children.map((c, ci) => {
                    const net =
                      (Number(c.local) || 0) +
                      (Number(c.trip) || 0) +
                      (Number(c.food) || 0) +
                      (Number(c.hotel) || 0) +
                      (Number(c.others) || 0) -
                      (Number(c.advance) || 0);
                    return (
                      <TableRow key={`${i}-${ci}`}>
                        <TableCell className="p-3 text-sm align-middle">
                          <div>{c.incident || "-"}</div>
                          {incidentWarningFor(c.incident) ? (
                            <p className="mt-1 max-w-[220px] text-xs font-medium leading-4 text-red-600">
                              Incident &quot;{c.incident}&quot; was already used once by {incidentWarningFor(c.incident)}.
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell className="p-3 text-sm">{c.time || "-"}</TableCell>
                        <TableCell className="p-3 text-sm">{c.dateFrom || "-"}</TableCell>
                        <TableCell className="p-3 text-sm">{c.dateTo || "-"}</TableCell>
                        {visibleColumns.includes("bankName") ? <TableCell className="p-3 text-sm">{c.bankName || "-"}</TableCell> : null}
                        <TableCell className="p-3 text-sm">{c.purpose || "-"}</TableCell>
                        <TableCell className="p-3 text-sm">{c.vehicle || "-"}</TableCell>
                        {numericColumns.map((column) => (
                          <TableCell key={column} className="p-3 text-sm text-right">
                            {Number(c[column] || 0).toFixed(2)}
                          </TableCell>
                        ))}
                        <TableCell className="p-3 text-sm text-right">{net.toFixed(2)}</TableCell>
                        <TableCell className="p-3 text-sm">{c.remarks || "-"}</TableCell>
                        <TableCell className="p-3 text-sm">
                          {c.attachmentUrl ? (
                            <AttachmentPreview url={c.attachmentUrl} />
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </section>
          );
        })}
      </div>
      <Separator className="my-4" />
      <FooterTotal total={total} />
    </div>
  );
}

export function BillForm(props: Props) {
  const mode = props.mode ?? "create";
  const isView = mode === "view";
  const router = useRouter();

  const [submitState, submitAction] = useActionState(submitBill, undefined);
  const [draftState,  draftAction]  = useActionState(saveDraft, undefined);
  const [isPending, startTransition] = useTransition();
  const [reviewData, setReviewData] = useState<BillFormValues | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const lastDraftToastBillId = useRef<string | undefined>(undefined);
  const downloadedSubmittedBillId = useRef<string | undefined>(undefined);

  const initialFormat = props.bill ? detectFormat(props.bill.items) : "BILL1";
  const [formatType, setFormatType] = useState<BillFormat>(initialFormat);
  const [bill2SelectedColumns, setBill2SelectedColumns] = useState<Bill2OptionalColumn[]>(() => {
    if (initialFormat !== "BILL2" || !props.bill?.items.length) return [];
    const parsed = decB2(props.bill.items[0].purpose);
    if (parsed.selectedColumns) return parsed.selectedColumns;
    const legacy = ["trip", "others", "advance"] as Bill2OptionalColumn[];
    try { if (JSON.parse(props.bill.items[0].purpose || "{}").showBankName) legacy.unshift("bankName"); } catch {}
    return legacy;
  });
  const [bill23BankEnabled, setBill23BankEnabled] = useState(() => {
    if (!props.bill?.items.length) return false;
    if (initialFormat === "BILL3") return decB3(props.bill.items[0].purpose).showBankName;
    return false;
  });
  const [bill5SelectedColumns, setBill5SelectedColumns] = useState<Bill5OptionalColumn[]>(() => {
    if (initialFormat !== "BILL5" || !props.bill?.items.length) return [];
    const selections = props.bill.items.map((item) => decB5Child(item.purpose).selectedColumns);
    if (selections.every((selection) => selection === undefined)) {
      return BILL5_OPTIONAL_COLUMNS.filter((column) => column.key !== "bankName").map((column) => column.key);
    }
    return BILL5_OPTIONAL_COLUMNS
      .map((column) => column.key)
      .filter((key) => selections.some((selection) => selection?.includes(key)));
  });

  // Employee Code to display + submit (from existing bill or current user)
  const effectiveEmployeeCode =
    (props.bill?.employeeCode ??
      (("user" in props ? (props.user as any)?.employeeCode : "") || "")
    )?.toString()?.toUpperCase?.() ?? "";
  const effectiveEmployeeId =
    props.bill?.employeeId ?? (("user" in props ? (props.user as any)?.id : "") || "");

  /* ---------- Defaults ---------- */
  const defaults: Partial<BillFormValues> = useMemo(() => {
    if (!props.bill) {
      return {
        companyName: formatType === "BILL5" ? "Networld Technology Limited" : "Networld Bangladesh PLC",
        companyAddress:
          formatType === "BILL5"
            ? "Zeenat Bhaban, 41/1, Kazi Islam Avenue, Dhaka 1215"
            : "57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka",
        employeeName: "user" in props ? (props.user as any).name : "",
        employeeDesignation: "user" in props ? (props.user as any).designation ?? "" : "",
        supervisorId: "",
        items:
          formatType === "BILL1"
            ? [{ date: new Date(), from: "", to: "", transport: "", purpose: "", amount: undefined as any }]
            : formatType === "BILL2"
            ? [{ from:"", to:"", dateFrom:new Date(), dateTo:new Date(), purpose:"", local:undefined as any, trip:undefined as any, food:undefined as any, hotel:undefined as any, others:undefined as any, advance:undefined as any, remarks:"" }]
            : formatType === "BILL3"
            ? [{ name: "user" in props ? (props.user as any).name : "", dateFrom:new Date(), dateTo:new Date(), purpose:"", food:undefined as any, hotel:undefined as any, others:undefined as any, advance:undefined as any, remarks:"" }]
            : formatType === "BILL5"
              ? [{ name: "user" in props ? (props.user as any).name : "", dateFrom: new Date(), dateTo: new Date(), children: [{ incident: "", purpose: "", time: "", dateFrom: "", dateTo: "", vehicle: "", local: undefined as any, trip: undefined as any, food: undefined as any, hotel: undefined as any, others: undefined as any, advance: undefined as any, remarks: "" }] } as any]
            : [{date: new Date(),time: "",incident: "", purpose: "",vehicle: "",food: undefined as any,hotel: undefined as any,others: undefined as any,advance: undefined as any,remarks: ""}],
      };
    }

    // Existing bill
    const b = props.bill;
    if (initialFormat === "BILL1") {
      return {
        billId: b.id, companyName:b.companyName, companyAddress:b.companyAddress,
        employeeName:b.employeeName, employeeDesignation:b.employeeDesignation ?? "",
        supervisorId: (b as any).supervisorId ?? "",
        items: b.items.map<RowB1>((it) => ({
          date: safeDate(it.date), from: it.from, to: it.to, transport: it.transport ?? "", purpose: it.purpose, amount: Number(it.amount||0)
        })),
      };
    }
    if (initialFormat === "BILL2") {
      return {
        billId: b.id, companyName:b.companyName, companyAddress:b.companyAddress,
        employeeName:b.employeeName, employeeDesignation:b.employeeDesignation ?? "",
        supervisorId: (b as any).supervisorId ?? "",
        items: b.items.map<RowB2>((it) => {
          const p = decB2(it.purpose);
          return { from:p.from, to:p.to, dateFrom:safeDate(it.date), dateTo: it.to ? safeDate(it.to) : safeDate(it.date), purpose:p.purpose, bankName:p.bankName, selectedColumns:p.selectedColumns, local:p.local, trip:p.trip, food:p.food, hotel:p.hotel, others:p.others, advance:p.advance, remarks:p.remarks };
        }),
      };
    }
    if (initialFormat === "BILL3") {
      return {
        billId: b.id, companyName:b.companyName, companyAddress:b.companyAddress,
        employeeName:b.employeeName, employeeDesignation:b.employeeDesignation ?? "",
        supervisorId: (b as any).supervisorId ?? "",
        items: b.items.map<RowB3>((it) => {
          const p = decB3(it.purpose);
          return { from:p.from, to:p.to, dateFrom:safeDate(it.date), dateTo: it.to ? safeDate(it.to) : safeDate(it.date), purpose:p.purpose, bankName:p.bankName, showBankName:p.showBankName, food:p.food, hotel:p.hotel, others:p.others, advance:p.advance, remarks:p.remarks };
        }),
      };
    }
    if (initialFormat === "BILL5") {
      // Group existing bill items into parents by parentName (best-effort)
      const groups: Record<string, any> = {};
      b.items.forEach((it) => {
        try {
          const parsed = decB5Child(it.purpose as string);
          // A Bill-5 employee can have multiple parent rows with the same name.
          // Keep rows with different parent date ranges separate. Incident is
          // child-level, so children with different incidents stay together.
          const key = [
            parsed.parentName || "",
            safeDate(it.date).toISOString(),
            it.to ? safeDate(it.to).toISOString() : safeDate(it.date).toISOString(),
          ].join("|");
          groups[key] ??= { name: parsed.parentName || "", dateFrom: safeDate(it.date), dateTo: it.to ? safeDate(it.to) : safeDate(it.date), children: [] };
          groups[key].children.push({ incident: parsed.incident, purpose: parsed.purpose, bankName: parsed.bankName, time: parsed.time || "", dateFrom: parsed.dateFrom || "", dateTo: parsed.dateTo || "", vehicle: parsed.vehicle, local: parsed.local, trip: parsed.trip, food: parsed.food, hotel: parsed.hotel, others: parsed.others, advance: parsed.advance, remarks: parsed.remarks });
        } catch {
          // fallback: push as single parent->child
          const key = String(it.date) + JSON.stringify(it);
          groups[key] ??= { name: "", dateFrom: safeDate(it.date), dateTo: it.to ? safeDate(it.to) : safeDate(it.date), children: [] };
          groups[key].children.push({ incident: "", purpose: it.purpose, time: "", dateFrom: "", dateTo: "", meal: "", local: 0, trip:0, food:0, hotel:0, others:0, advance:0, remarks: "" });
        }
      });
      return {
        billId: b.id, companyName:b.companyName, companyAddress:b.companyAddress,
        employeeName:b.employeeName, employeeDesignation:b.employeeDesignation ?? "",
        supervisorId: (b as any).supervisorId ?? "",
        items: Object.values(groups) as RowB5[],
      };
    }
    // BILL4
    return {
      billId: b.id, companyName:b.companyName, companyAddress:b.companyAddress,
      employeeName:b.employeeName, employeeDesignation:b.employeeDesignation ?? "",
      supervisorId: (b as any).supervisorId ?? "",
      items: b.items.map<RowB4>((it) => {
        const p = decB4(it.purpose);
        return {
          date: safeDate(it.date),
          time: p.time,
          incident: p.incident,
          purpose: p.purpose,
          vehicle: p.vehicle,
          food: p.food,
          hotel: p.hotel,
          others: p.others,
          advance: p.advance,
          remarks: p.remarks
        };
      }),
    };
  }, [props, formatType]);

  // Full-schema validation on every keypress becomes increasingly expensive as
  // rows grow. Validate when the user submits/saves; field errors still update
  // after a failed submit through reValidateMode.
  const form = useForm<BillFormValues>({ resolver: zodResolver(billFormSchema), defaultValues: defaults, mode: "onSubmit", reValidateMode: "onBlur" });
  const { control, handleSubmit, reset } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const supervisors = "supervisors" in props ? props.supervisors ?? [] : [];
  const formRecordId = "bill" in props ? props.bill?.id ?? "new-bill" : props.user.id;

  // Reset only when navigating to a different bill/user. Depending on the whole
  // props/defaults object resets edited fields after every controlled-input
  // keystroke because those objects are recreated during render.
  useEffect(() => {
    reset(defaults);
    // Format changes are handled by the dedicated format-switch effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formRecordId, reset]);

  useEffect(() => {
    if ((draftState as any)?.success && (draftState as any)?.billId && lastDraftToastBillId.current !== (draftState as any).billId) {
      lastDraftToastBillId.current = (draftState as any).billId;
      toast({
        title: "Bill saved as draft",
        description: "Your draft has been saved successfully.",
      });
      // Redirect to bill detail page to view/approve
      router.push(`/bills/${(draftState as any).billId}`);
    }
  }, [draftState, router]);

  // Files for attachments: for BILL5 we need nested arrays (parent -> child files)
  const [rowFiles, setRowFiles] = useState<(File | null)[][]>(
    Array.isArray(defaults.items) ? (defaults.items as any[]).map((it) => (it.children ? Array(it.children.length).fill(null) : [null])) : []
  );

  const isSupervisorUser = "user" in props && (props.user as any)?.role === "supervisor";
  const makeSingleAttachmentRow = (): (File | null)[][] => [[null as File | null]];

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
      while (next.length < len) next.push([null]);
      // ensure inner arrays match existing children count if possible
      next.forEach((arr, idx) => {
        const children = (fields[idx]?.children ?? []);
        const target = Array.isArray(children) ? children.length : 1;
        while ((arr?.length ?? 0) < target) arr.push(null);
        if (arr.length > target) arr.splice(target);
      });
      return next;
    });
  }, [formatType, fields.length, isView]);

  // switching format resets to one blank row
  useEffect(() => {
    if (isView) return;
    const cur = form.getValues();
    if (formatType === "BILL1") {
      reset({ ...cur, items: [{ date:new Date(), from:"", to:"", transport:"", purpose:"", amount: undefined as any }] });
    } else if (formatType === "BILL2") {
      reset({ ...cur, items: [{ from:"", to:"", dateFrom:new Date(), dateTo:new Date(), purpose:"", local:undefined as any, trip:undefined as any, food:undefined as any, hotel:undefined as any, others:undefined as any, advance:undefined as any, remarks:"" }] });
      setRowFiles(makeSingleAttachmentRow());
    } else if (formatType === "BILL3") {
      reset({ ...cur, items: [{ from:"", to:"", dateFrom:new Date(), dateTo:new Date(), purpose:"", food:undefined as any, hotel:undefined as any, others:undefined as any, advance:undefined as any, remarks:"" }] });
      setRowFiles(makeSingleAttachmentRow());
    } else if (formatType === "BILL4") {
      reset({ ...cur, items: [{ date:new Date(), time:"", incident:"", purpose:"",  vehicle: "",  food:undefined as any, hotel:undefined as any, others:undefined as any, advance:undefined as any, remarks:"" }] });
      setRowFiles(makeSingleAttachmentRow());
    } else if (formatType === "BILL5") {
      reset({ ...cur, items: [{ name: "", dateFrom:new Date(), dateTo:new Date(), children: [{ incident: "", purpose: "", time: "", dateFrom: "", dateTo: "", vehicle: "", local: undefined as any, trip: undefined as any, food: undefined as any, hotel: undefined as any, others: undefined as any, advance: undefined as any, remarks: "" }] } as any] });
      setRowFiles(makeSingleAttachmentRow());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatType]);

  /* ---------- require-all validation (top + rows) ---------- */
  const validateAll = (): boolean => {
    // Bill 2 and Bill 3 intentionally allow partially blank rows.
    if ((["BILL2", "BILL3"] as BillFormat[]).includes(formatType)) return true;
    let ok = true;
    const setError = form.setError;
    const reasons: string[] = [];
    const top = form.getValues();
    const items: any[] = form.getValues("items") ?? [];

    // Top-level required
    if (isEmpty(top.companyName))   { setError("companyName" as any, { type: "manual", message: "Required" }); ok = false; reasons.push("companyName: required"); }
    if (isEmpty(top.companyAddress)){ setError("companyAddress" as any, { type: "manual", message: "Required" }); ok = false; reasons.push("companyAddress: required"); }
    if (isEmpty(top.employeeName))  { setError("employeeName" as any, { type: "manual", message: "Required" }); ok = false; reasons.push("employeeName: required"); }

    // Ensure we have a code to submit
    if (!effectiveEmployeeCode && !effectiveEmployeeId) {
      reasons.push("employee identifier missing (employeeCode or employeeId)");
      if (typeof window !== "undefined") window.alert("Employee Code or Employee ID is missing on this form.");
      ok = false;
    }

    // Rows per format
    items.forEach((r, i) => {
      if (formatType === "BILL1") {
        if (!r.date)                     { setError(`items.${i}.date` as any, { type: "manual", message: "Pick a date" }); ok = false; reasons.push(`items.${i}.date: required`); }
        if (isEmpty(r.from))             { setError(`items.${i}.from` as any, { type: "manual", message: "Required" }); ok = false; reasons.push(`items.${i}.from: required`); }
        if (isEmpty(r.to))               { setError(`items.${i}.to` as any, { type: "manual", message: "Required" }); ok = false; reasons.push(`items.${i}.to: required`); }
        if (isEmpty(r.transport))        { setError(`items.${i}.transport` as any, { type: "manual", message: "Required" }); ok = false; reasons.push(`items.${i}.transport: required`); }
        if (!(asNum(r.amount) > 0))      { setError(`items.${i}.amount` as any, { type: "manual", message: "Must be > 0" }); ok = false; reasons.push(`items.${i}.amount: must be > 0`); }
      } else if (formatType === "BILL2") {
        const local = asNum(r.local), trip = asNum(r.trip), others = asNum(r.others), advance = asNum(r.advance);
        const total = (Number(local)||0) + (Number(trip)||0) + (Number(others)||0);
        if (isEmpty(r.from))             { setError(`items.${i}.from` as any, { type: "manual", message: "Required" }); ok = false; reasons.push(`items.${i}.from: required`); }
        if (!r.dateFrom)                 { setError(`items.${i}.dateFrom` as any, { type: "manual", message: "Pick a date" }); ok = false; reasons.push(`items.${i}.dateFrom: required`); }
        if (!r.dateTo)                   { setError(`items.${i}.dateTo` as any, { type: "manual", message: "Pick a date" }); ok = false; reasons.push(`items.${i}.dateTo: required`); }
        if (!(total > 0))                { setError(`items.${i}.local` as any,  { type: "manual", message: "Enter at least one amount" }); ok = false; reasons.push(`items.${i}: enter at least one amount`); }
      } else if (formatType === "BILL3") {
        const food = asNum(r.food), hotel = asNum(r.hotel), others = asNum(r.others), advance = asNum(r.advance);
        const total = (Number(food)||0) + (Number(hotel)||0) + (Number(others)||0);
        if (isEmpty(r.from))             { setError(`items.${i}.from` as any, { type: "manual", message: "Required" }); ok = false; reasons.push(`items.${i}.from: required`); }
        if (isEmpty(r.to))               { setError(`items.${i}.to` as any, { type: "manual", message: "Required" }); ok = false; reasons.push(`items.${i}.to: required`); }
        if (!r.dateFrom)                 { setError(`items.${i}.dateFrom` as any, { type: "manual", message: "Pick a date" }); ok = false; reasons.push(`items.${i}.dateFrom: required`); }
        if (!r.dateTo)                   { setError(`items.${i}.dateTo` as any, { type: "manual", message: "Pick a date" }); ok = false; reasons.push(`items.${i}.dateTo: required`); }
        if (!(total > 0))                { setError(`items.${i}.food` as any,   { type: "manual", message: "Enter at least one amount" }); ok = false; reasons.push(`items.${i}: enter at least one amount`); }
      } else if (formatType === "BILL5") {
        // parent-level checks
        if (!r.dateFrom) { setError(`items.${i}.dateFrom` as any, { type: "manual", message: "Pick a date" }); ok = false; reasons.push(`items.${i}.dateFrom: required`); }
        if (!r.dateTo) { setError(`items.${i}.dateTo` as any, { type: "manual", message: "Pick a date" }); ok = false; reasons.push(`items.${i}.dateTo: required`); }
        // children validation
        const children = (r.children || []);
        if (!children.length) {
          setError(`items.${i}.children` as any, { type: "manual", message: "Add at least one purpose row" }); ok = false; reasons.push(`items.${i}.children: at least one row required`);
        }
        children.forEach((c: RowB5Child, ci: number) => {
          const local = asNum(c.local), trip = asNum(c.trip), food = asNum(c.food), hotel = asNum(c.hotel), others = asNum(c.others), advance = asNum(c.advance);
          const total = (Number(local)||0) + (Number(trip)||0) + (Number(food)||0) + (Number(hotel)||0) + (Number(others)||0);
        });
      } else if (formatType === "BILL4") {
        const food = asNum(r.food), hotel = asNum(r.hotel), others = asNum(r.others), advance = asNum(r.advance);
        const total = (Number(food)||0) + (Number(hotel)||0) + (Number(others)||0);
        if (!r.date)                     { setError(`items.${i}.date` as any, { type: "manual", message: "Pick a date" }); ok = false; reasons.push(`items.${i}.date: required`); }
        if (isEmpty(r.time))             { setError(`items.${i}.time` as any, { type: "manual", message: "Required" }); ok = false; reasons.push(`items.${i}.time: required`); }
        if (isEmpty(r.incident))         { setError(`items.${i}.incident` as any, { type: "manual", message: "Required" }); ok = false; reasons.push(`items.${i}.incident: required`); }
        if (isEmpty(r.meal))             { setError(`items.${i}.meal` as any, { type: "manual", message: "Required" }); ok = false; reasons.push(`items.${i}.meal: required`); }
        if (!(total > 0))                { setError(`items.${i}.food` as any, { type: "manual", message: "Enter at least one amount" }); ok = false; reasons.push(`items.${i}: enter at least one amount`); }
      }
    });

    if (!ok) {
      try { console.warn("validateAll reasons:", reasons); } catch {}
      if (typeof window !== "undefined") {
        const msg = reasons.length ? `Validation errors:\n- ${reasons.slice(0,10).join('\n- ')}` : "Validation failed";
        // show concise alert with up to 10 reasons
        window.alert(msg);
      }
    }
    return ok;
  };

  /* ---------- after successful submit ---------- */
  useEffect(() => {
    const submittedBillId = (submitState as any)?.success
      ? String((submitState as any)?.billId || "")
      : "";
    if (!submittedBillId || downloadedSubmittedBillId.current === submittedBillId) return;
    downloadedSubmittedBillId.current = submittedBillId;

    const currentUserId = "user" in props ? String((props.user as any)?.id || "") : "";
    const isBillOwnerSubmission = Boolean(currentUserId && currentUserId === String(effectiveEmployeeId));
    void (async () => {
      let pdfDownloaded = false;
      if (isBillOwnerSubmission) {
        try {
          await downloadBillPdf(submittedBillId);
          pdfDownloaded = true;
        } catch (error) {
          console.error("Automatic bill PDF download failed:", error);
        }
      }
      if (typeof window !== "undefined") {
        window.alert(
          pdfDownloaded
            ? "Submitted bill successfully. Your PDF download has started."
            : "Submitted bill successfully"
        );
        router.replace("/dashboard");
      }
    })();
  }, [submitState, router, effectiveEmployeeId]);

  /* ---------- submit payload ---------- */
  const toServerFD = (data: BillFormValues) => {
    const fd = new FormData();
    const totals = calculateBillTotals(formatType, data.items);
    if (data.billId) fd.append("billId", data.billId);
    fd.append("companyName", (data.companyName ?? "") as string);
    fd.append("companyAddress", (data.companyAddress ?? "") as string);
    fd.append("employeeName", (data.employeeName ?? "") as string);

    // identifier auto-supplied (Employee Code)
    fd.append("employeeIdOrCode", effectiveEmployeeCode);
    fd.append("employeeId", effectiveEmployeeId);

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
        const packed = encB2({ ...r, selectedColumns: bill2SelectedColumns });
        const sum = (Number(r.local)||0)+(Number(r.trip)||0)+(Number(r.food)||0)+(Number(r.hotel)||0)+(Number(r.others)||0);
        const net = sum - (Number(r.advance)||0);
        return {
          date: safeDate(r.dateFrom).toISOString(),
          from: r.dateFrom ? format(safeDate(r.dateFrom), "PPP") : "",
          to: r.dateTo ? safeDate(r.dateTo).toISOString() : "",
          transport: "__BILL2__",
          purpose: packed,
          amount: Number(net || 0),
        };
      });
      fd.append("items", JSON.stringify(rows));

      // attachments
      for (let i = 0; i < rowFiles.length; i++) {
        const f = (rowFiles[i] as (File | null)[] | undefined)?.[0] ?? null;
        if (f) fd.append(`attachment_${i}`, f);
      }
    } else if (formatType === "BILL3") {
      const rows = (data.items as RowB3[]).map((r) => {
        const packed = encB3({ ...r, showBankName: bill23BankEnabled });
        const sum = (Number(r.food)||0)+(Number(r.hotel)||0)+(Number(r.others)||0);
        const net = sum - (Number(r.advance)||0);
        return {
          date: safeDate(r.dateFrom).toISOString(),
          from: r.dateFrom ? format(safeDate(r.dateFrom), "PPP") : "",
          to: r.dateTo ? safeDate(r.dateTo).toISOString() : "",
          transport: "__BILL3__",
          purpose: packed,
          amount: Number(net || 0),
        };
      });
      fd.append("items", JSON.stringify(rows));

      for (let i = 0; i < rowFiles.length; i++) {
        const f = (rowFiles[i] as (File | null)[] | undefined)?.[0] ?? null;
        if (f) fd.append(`attachment_${i}`, f);
      }
    } else if (formatType === "BILL4") {
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
        const f = (rowFiles[i] as (File | null)[] | undefined)?.[0] ?? null;
        if (f) fd.append(`attachment_${i}`, f);
      }
    } else if (formatType === "BILL5") {
      // BILL5 (combined) — flatten parent->children into individual server rows
      const flatRows: any[] = [];
      const dateRowsEdited: boolean[] = [];
      (data.items as RowB5[]).forEach((parent, parentIndex) => {
        const parentDateEdited =
          form.getFieldState(`items.${parentIndex}.dateFrom` as any).isDirty ||
          form.getFieldState(`items.${parentIndex}.dateTo` as any).isDirty;
        (parent.children || []).forEach((child) => {
          const packed = encB5Child(parent, child, bill5SelectedColumns);
          const sum = (Number(child.local)||0)+(Number(child.trip)||0)+(Number(child.food)||0)+(Number(child.hotel)||0)+(Number(child.others)||0);
          const net = sum - (Number(child.advance)||0);
          flatRows.push({
            date: safeDate(parent.dateFrom).toISOString(),
            from: parent.dateFrom ? format(safeDate(parent.dateFrom), "PPP") : "",
            to: parent.dateTo ? safeDate(parent.dateTo).toISOString() : "",
            transport: "__BILL5__",
            purpose: packed,
            amount: Number(net || 0),
          });
          dateRowsEdited.push(parentDateEdited);
        });
      });
      // append items
      fd.append("items", JSON.stringify(flatRows));
      fd.append("bill5DateRowsEdited", JSON.stringify(dateRowsEdited));

      // append attachments in same flattened order
      let idx = 0;
      for (let p = 0; p < rowFiles.length; p++) {
        for (let c = 0; c < (rowFiles[p] || []).length; c++) {
          const f = (rowFiles[p] as (File | null)[] | undefined)?.[c] ?? null;
          if (f) fd.append(`attachment_${idx}`, f);
          idx++;
        }
      }
    }

    fd.append("totalAmount", String(totals.total));
    fd.append("amountInWords", totals.words);
    // supervisorId (optional) — allow supervisor to forward on submit
    if ((data as any).supervisorId) fd.append("supervisorId", (data as any).supervisorId);
    fd.delete("employeeDesignation");
    return fd;
  };

  const buildReviewBill = (data: BillFormValues): BillViewData => {
    const payload = toServerFD(data);
    const totals = calculateBillTotals(formatType, data.items);
    const items = JSON.parse(String(payload.get("items") || "[]")).map((item: any, index: number) => ({
      id: `review-${index}`,
      ...item,
      attachmentUrl: props.bill?.items?.[index]?.attachmentUrl ?? null,
    }));
    return {
      id: data.billId || "review",
      companyName: data.companyName || "",
      companyAddress: data.companyAddress || "",
      employeeId: effectiveEmployeeId,
      employeeName: data.employeeName || "",
      employeeDesignation: data.employeeDesignation || null,
      employeeCode: effectiveEmployeeCode,
      amount: totals.total,
      amountInWords: totals.words,
      status: "DRAFT",
      items,
    };
  };

  const renderFullReview = (data: BillFormValues) => {
    const bill = buildReviewBill(data);
    const designation = data.employeeDesignation || undefined;
    if (formatType === "BILL1") return <ViewBill1 b={bill} fallbackDesignation={designation} />;
    if (formatType === "BILL2") return <ViewBill2 b={bill} fallbackDesignation={designation} />;
    if (formatType === "BILL3") return <ViewBill3 b={bill} fallbackDesignation={designation} />;
    if (formatType === "BILL5") return <ViewBill5 b={bill} fallbackDesignation={designation} />;
    return null;
  };

  const onSubmitFinal = (d: BillFormValues) => {
    if (!validateAll()) {
      console.warn("Bill submit blocked: validation failed", d);
      if (typeof window !== "undefined") window.alert("Validation failed — please check required fields and try again.");
      return;
    }
    setReviewData(d);
    setReviewOpen(true);
  };
  const confirmReviewedSubmit = () => {
    if (!reviewData) return;
    setReviewOpen(false);
    startTransition(() => submitAction(toServerFD(reviewData)));
  };
  const onSaveDraft  = (d: BillFormValues) => {
    if (!validateAll()) return;
    try { console.log("Bill draft payload items:", d.items); } catch {}
    startTransition(() => draftAction(toServerFD(d)));
  };

  // helpers for files with append/remove (nested for BILL5)
  const appendWithFileB2 = (row: RowB2) => { append(row as any); setRowFiles((p)=>[...p, [null]]); };
  const appendWithFileB3 = (row: RowB3) => { append(row as any); setRowFiles((p)=>[...p, [null]]); };
  const appendWithFileB4 = (row: RowB4) => { append(row as any); setRowFiles((p)=>[...p, [null]]); };
  const appendWithFileB5 = (row: RowB5) => { append(row as any); setRowFiles((p)=>[...p, [null]]); };
  const removeWithFile = (i: number) => { remove(i); setRowFiles((prev) => prev.filter((_, idx) => idx !== i)); };
  const setRowFileAt = (...args: any[]) => {
    // supports two signatures: (rowIndex, file) for flat editors, or (parentIndex, childIndex, file) for nested
    let parentIndex: number, childIndex: number, f: File | null;
    if (args.length === 2) {
      parentIndex = args[0]; childIndex = 0; f = args[1];
    } else {
      parentIndex = args[0]; childIndex = args[1]; f = args[2];
    }
    setRowFiles((prev) => {
      const next = prev.map((arr)=> arr.slice());
      next[parentIndex] ??= [];
      next[parentIndex][childIndex] = f;
      return next;
    });
  };
  const toggleBill23Bank = (enabled: boolean) => {
    setBill23BankEnabled(enabled);
    const items = form.getValues("items") as Array<RowB2 | RowB3>;
    items.forEach((_, index) => {
      form.setValue(`items.${index}.showBankName` as any, enabled);
      if (!enabled) form.setValue(`items.${index}.bankName` as any, undefined);
    });
  };
  const toggleBill2Column = (column: Bill2OptionalColumn, enabled: boolean) => {
    setBill2SelectedColumns((current) => enabled
      ? BILL2_OPTIONAL_COLUMNS.map((item) => item.key).filter((key) => key === column || current.includes(key))
      : current.filter((key) => key !== column));
    if (!enabled) {
      const items = form.getValues("items") as RowB2[];
      items.forEach((_, index) => form.setValue(`items.${index}.${column}` as any, undefined));
    }
  };

  const appendChildToParent = (parentIndex: number) => {
    const items = form.getValues("items") || [];
    const copy = items.map((it:any) => ({ ...it, children: Array.isArray(it.children) ? [...it.children] : [] }));
    copy[parentIndex].children.push({ incident: "", purpose: "", time: "", dateFrom: "", dateTo: "", meal: "", local: undefined as any, trip: undefined as any, food: undefined as any, hotel: undefined as any, others: undefined as any, advance: undefined as any, remarks: "" } as any);
    setRowFiles((prev) => {
      const next = prev.map((arr) => arr.slice());
      next[parentIndex] ??= [];
      next[parentIndex].push(null);
      return next;
    });
    form.setValue("items", copy);
  };

  const removeChildFromParent = (parentIndex: number, childIndex: number) => {
    const items = form.getValues("items") || [];
    const copy = items.map((it:any) => ({ ...it, children: Array.isArray(it.children) ? [...it.children] : [] }));
    copy[parentIndex].children.splice(childIndex, 1);
    setRowFiles((prev) => {
      const next = prev.map((arr) => arr.slice());
      if (next[parentIndex]) next[parentIndex].splice(childIndex, 1);
      return next;
    });
    form.setValue("items", copy);
  };

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
    if (fmt === "BILL5") return <ViewBill5 b={b} fallbackDesignation={fallbackDesignation} viewerRole={(viewer as any)?.role} />;
    // return <ViewBill4 b={b} fallbackDesignation={fallbackDesignation} />;
    return null;
  }

  /* ---------- edit/create ---------- */
  const editorUser: User | undefined = "user" in props ? (props.user as User) : undefined;
  const hideOwnBillIdentity = !!editorUser &&
    (editorUser.role === "employee" || editorUser.role === "supervisor") &&
    (!props.bill || String(props.bill.employeeId) === String(editorUser.id));

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmitFinal)}
        autoComplete="off"
        className={cn(
          "mx-auto min-w-0 w-full max-w-full overflow-hidden rounded-xl border bg-white p-1.5 shadow-sm max-sm:[&_input]:h-11 max-sm:[&_select]:h-11 sm:p-5",
          formatType === "BILL5"
            ? mode === "edit"
              ? "space-y-2 max-sm:[&_input]:!h-7 max-sm:[&_select]:!h-7 sm:!p-3 md:!p-3"
              : "space-y-3 max-sm:[&_input]:!h-7 max-sm:[&_select]:!h-7 md:p-5"
            : "space-y-6 md:p-8"
        )}
      >
        {/* Hidden bill id if editing */}
        <FormField control={control} name="billId" render={({ field }) => <input type="hidden" name={field.name} value={field.value ?? ""} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} />} />

        {/* Hidden: actions.ts expects employeeIdOrCode; filled automatically from current user or bill */}
        <input type="hidden" name="employeeIdOrCode" value={effectiveEmployeeCode} />
        <input type="hidden" name="employeeId" value={effectiveEmployeeId} />

        {!hideOwnBillIdentity ? <div className={cn("grid md:grid-cols-2", formatType === "BILL5" ? mode === "edit" ? "gap-x-3 gap-y-1.5" : "gap-x-4 gap-y-2" : "gap-4")}>
          <FormField control={control} name="companyName" render={({ field }) => (
            <FormItem className="max-sm:hidden">
              <FormLabel>Company Name</FormLabel>
              <FormControl><Input {...field} autoComplete="off" required /></FormControl>
              <FormMessage/>
            </FormItem>
          )}/>
          <FormField control={control} name="companyAddress" render={({ field }) => (
            <FormItem className="max-sm:hidden">
              <FormLabel>Company Address</FormLabel>
              <FormControl><Input {...field} autoComplete="off" required /></FormControl>
              <FormMessage/>
            </FormItem>
          )}/>
          <FormField control={control} name="employeeName" render={({ field }) => (
            <FormItem>
              <FormLabel>Employee Name</FormLabel>
              <FormControl><Input {...field} autoComplete="off" required /></FormControl>
              <FormMessage/>
            </FormItem>
          )}/>

          {/* READ-ONLY Employee Code */}
          <div className="max-sm:hidden">
            <p className="text-sm font-medium">Employee Code</p>
            <p className={cn("font-mono", formatType === "BILL5" ? "mt-1" : "mt-2")}>{effectiveEmployeeCode || "-"}</p>
          </div>

          <FormField control={control} name="employeeDesignation" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Designation</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" placeholder="(optional for display; not submitted)" />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}/>
        </div> : null}

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <label className="text-sm font-medium">Bill Format</label>
          <select
            className="w-full md:w-[360px] rounded-md border bg-background px-3  text-sm"
            value={formatType}
            onChange={(e) => {
              const nextFormat = e.target.value as BillFormat;
              setFormatType(nextFormat);
              if (!props.bill) {
                form.setValue(
                  "companyName",
                  nextFormat === "BILL5" ? "Networld Technology Limited" : "Networld Bangladesh PLC",
                  { shouldDirty: true }
                );
                form.setValue(
                  "companyAddress",
                  nextFormat === "BILL5"
                    ? "Zeenat Bhaban, 41/1, Kazi Islam Avenue, Dhaka 1215"
                    : "57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka",
                  { shouldDirty: true }
                );
              }
            }}
          >
            <option value="BILL1">Bill-1 (standard)</option>
            <option value="BILL2">Bill-2 (Combined Conveyance / Food / Hotel)</option>
            {initialFormat === "BILL3" ? <option value="BILL3">Bill-3 (Legacy)</option> : null}
            {/* <option value="BILL4">Bill-4 (Date/Time/Incident + Food/Hotel/Others/Advance)</option> */}
            <option value="BILL5">Bill-5 (Combined: local/trip + food/hotel + incident/time)</option>
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
            onPickFile={(i,f)=> setRowFileAt(i,f)}
            files={rowFiles.map((r)=> r?.[0] ?? null)}
            selectedColumns={bill2SelectedColumns}
            onToggleColumn={toggleBill2Column}
          />
        )}
        {formatType === "BILL3" && (
          <EditorBill3
            control={control}
            fields={fields}
            append={appendWithFileB3}
            remove={removeWithFile}
            onPickFile={(i,f)=> setRowFileAt(i,f)}
            files={rowFiles.map((r)=> r?.[0] ?? null)}
            showBankName={bill23BankEnabled}
            onToggleBank={toggleBill23Bank}
          />
        )}
        {formatType === "BILL5" && (
          <EditorBill5
            control={control}
            fields={fields}
            append={appendWithFileB5}
            remove={removeWithFile}
            onPickFile={setRowFileAt}
            files={rowFiles}
            employeeName={"user" in props ? (props.user as any).name : ""}
            selectedColumns={bill5SelectedColumns}
            hideEmptyColumns={mode === "edit"}
            onToggleColumn={(column, enabled) => {
              setBill5SelectedColumns((current) =>
                enabled
                  ? BILL5_OPTIONAL_COLUMNS.map((item) => item.key).filter((key) => key === column || current.includes(key))
                  : current.filter((key) => key !== column)
              );
              if (!enabled) {
                const items = form.getValues("items") as RowB5[];
                items.forEach((parent, parentIndex) => {
                  (parent.children || []).forEach((_, childIndex) => {
                    form.setValue(`items.${parentIndex}.children.${childIndex}.${column}` as any, undefined);
                  });
                });
              }
            }}
          />
        )}
        {/* {formatType === "BILL4" && (
          <EditorBill4
            control={control}
            fields={fields}
            append={appendWithFileB4}
            remove={removeWithFile}
            onPickFile={(i,f)=> setRowFileAt(i,f)}
            files={rowFiles.map((r)=> r?.[0] ?? null)}
          />
        )} */}

        <LiveBillTotal control={control} formatType={formatType} />

        {isSupervisorUser && (
          <FormField
            control={control}
            name="supervisorId"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{formatType === "BILL5" ? "Forward to another Supervisor (optional; otherwise goes to GM)" : "Forward to Supervisor (optional)"}</FormLabel>
                <FormControl>
                  <select {...field} className="w-full rounded-md border bg-background px-3  text-sm">
                    <option value="">{formatType === "BILL5" ? "Default — forward to Bill-5 GM" : "Default — send to Accounts"}</option>
                    {supervisors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}{s.email ? ` (${s.email})` : ""}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Separator />

        {(submitState as any)?.error || (draftState as any)?.error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{(submitState as any)?.error || (draftState as any)?.error}</AlertDescription>
          </Alert>
        ) : null}

        <div className={cn("flex flex-col sm:flex-row", formatType === "BILL5" ? "gap-2" : "gap-3")}>
          <Button type="button" variant="secondary" onClick={handleSubmit(onSaveDraft)} disabled={isPending}>
            Save Draft
          </Button>
          <SubmitButton isPending={isPending}>Review &amp; Submit</SubmitButton>
        </div>

        <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
          <DialogContent className="grid h-[96vh] w-[98vw] max-w-none grid-rows-[auto_minmax(0,1fr)_auto] gap-2 p-3 sm:p-4">
            <DialogHeader>
              <DialogTitle>Review your bill before submission</DialogTitle>
              <p className="text-sm text-muted-foreground">Check the information below. Nothing will be submitted until you confirm.</p>
            </DialogHeader>
            <div className={cn("min-h-0 overflow-auto rounded-lg bg-slate-100 p-0.5 max-sm:[&>div]:p-2 sm:p-2", hideOwnBillIdentity && "[&_.bill-header-info]:hidden")}>
              {reviewData ? renderFullReview(reviewData) : null}
            </div>
            <div className="flex flex-col-reverse gap-2 border-t pt-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setReviewOpen(false)}>Back to edit</Button>
              <Button type="button" onClick={confirmReviewedSubmit} disabled={isPending}>Confirm &amp; Submit Bill</Button>
            </div>
          </DialogContent>
        </Dialog>
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
    <div className="bill-header-info mb-4 grid gap-4 md:grid-cols-2">
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
              <TableHead className="w-[50px] text-sm font-semibold">No.</TableHead>
              <TableHead className="w-[150px] text-sm font-semibold">Date</TableHead>
              <TableHead className="text-sm font-semibold">From</TableHead>
              <TableHead className="text-sm font-semibold">To</TableHead>
              <TableHead className="text-sm font-semibold">Transport</TableHead>
              <TableHead className="text-sm font-semibold">Purpose</TableHead>
              <TableHead className="text-right text-sm font-semibold">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {b.items.map((it, i) => (
              <TableRow key={it.id ?? i}>
                <TableCell className="p-3 py-3 font-medium text-sm">{i+1}</TableCell>
                <TableCell className="p-3 text-sm">{format(safeDate(it.date), "PPP")}</TableCell>
                <TableCell className="p-3 text-sm">{it.from}</TableCell>
                <TableCell className="p-3 text-sm">{it.to}</TableCell>
                <TableCell className="p-3 text-sm">{it.transport || "-"}</TableCell>
                <TableCell className="p-3 text-sm">{it.purpose}</TableCell>
                <TableCell className="p-3 text-right text-sm">{Number(it.amount).toFixed(2)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold bg-muted/30">
              <TableCell colSpan={6} className="text-right p-3 text-sm">Total Tk</TableCell>
              <TableCell className="text-right p-3 text-sm font-bold">{total.toFixed(2)}</TableCell>
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
  const selectedColumns = rows.every((row) => row.selectedColumns === undefined)
    ? (["trip", "others", "advance"] as Bill2OptionalColumn[])
    : BILL2_OPTIONAL_COLUMNS.map((column) => column.key).filter((key) => rows.some((row) => row.selectedColumns?.includes(key)));
  const total = rows.reduce((acc,r)=> acc + ((Number(r.local)||0)+(Number(r.trip)||0)+(Number(r.food)||0)+(Number(r.hotel)||0)+(Number(r.others)||0) - (Number(r.advance)||0)), 0);
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <HeaderInfo b={b} fallbackDesignation={fallbackDesignation} />
      <div className="rounded-lg border overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-sm font-semibold">No.</TableHead>
              <TableHead className="min-w-[140px] text-sm font-semibold">From</TableHead>
              <TableHead className="min-w-[140px] text-sm font-semibold">To</TableHead>
              <TableHead className="text-sm font-semibold">Date From</TableHead>
              <TableHead className="text-sm font-semibold">Date To</TableHead>
              {selectedColumns.includes("bankName") ? <TableHead className="min-w-[180px] text-sm font-semibold">Bank Name</TableHead> : null}
              <TableHead className="min-w-[220px] text-sm font-semibold">Purpose</TableHead>
              <TableHead className="text-right text-sm font-semibold">Local Conv.</TableHead>
              {BILL2_OPTIONAL_COLUMNS.filter((column) => column.key !== "bankName" && selectedColumns.includes(column.key)).map((column) => <TableHead key={column.key} className="text-right text-sm font-semibold">{column.label}</TableHead>)}
              <TableHead className="text-right text-sm font-semibold">Total</TableHead>
              <TableHead className="text-right text-sm font-semibold">Net Payable</TableHead>
              <TableHead className="min-w-[180px] text-sm font-semibold">Remarks</TableHead>
              <TableHead className="min-w-[160px] text-sm font-semibold">Attachment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r,i)=>{
              const sum = (Number(r.local)||0)+(Number(r.trip)||0)+(Number(r.food)||0)+(Number(r.hotel)||0)+(Number(r.others)||0);
              const net = sum - (Number(r.advance)||0);
              const url = b.items[i]?.attachmentUrl || null;
              return (
                <TableRow key={i}>
                  <TableCell className="p-3 py-3 font-medium text-sm">{i+1}</TableCell>
                  <TableCell className="p-3 min-w-[140px] text-sm">{r.from||"-"}</TableCell>
                  <TableCell className="p-3 min-w-[140px] text-sm">{r.to||"-"}</TableCell>
                  <TableCell className="p-3 text-sm">{format(r.dateFrom, "PPP")}</TableCell>
                  <TableCell className="p-3 text-sm">{format(r.dateTo, "PPP")}</TableCell>
                  {selectedColumns.includes("bankName") ? <TableCell className="p-3 min-w-[180px] text-sm">{r.bankName || "-"}</TableCell> : null}
                  <TableCell className="p-3 min-w-[220px] text-sm">{r.purpose}</TableCell>
                  <TableCell className="p-3 text-right text-sm">{Number(r.local).toFixed(2)}</TableCell>
                  {selectedColumns.filter((column) => column !== "bankName").map((column) => <TableCell key={column} className="p-3 text-right text-sm">{Number(r[column] || 0).toFixed(2)}</TableCell>)}
                  <TableCell className="p-3 text-right text-sm">{sum.toFixed(2)}</TableCell>
                  <TableCell className="p-3 text-right text-sm">{net.toFixed(2)}</TableCell>
                  <TableCell className="p-3 min-w-[180px] text-sm">{r.remarks||"-"}</TableCell>
                  <TableCell className="p-3 min-w-[160px] text-sm">
                    {url ? <a href={url} target="_blank" className="text-primary underline">View</a> : "-"}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow className="font-semibold bg-muted/30">
              <TableCell colSpan={12 + selectedColumns.length} className="text-right p-3 text-sm">Total Tk</TableCell>
              <TableCell className="text-right p-3 text-sm font-bold">{total.toFixed(2)}</TableCell>
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
  const showBankName = rows.some((row) => row.showBankName);
  const total = rows.reduce((acc,r)=> acc + ((Number(r.food)||0)+(Number(r.hotel)||0)+(Number(r.others)||0) - (Number(r.advance)||0)), 0);
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <HeaderInfo b={b} fallbackDesignation={fallbackDesignation} />
      <div className="rounded-lg border overflow-x-auto w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-sm font-semibold">No.</TableHead>
              <TableHead className="min-w-[140px] text-sm font-semibold">From</TableHead>
              <TableHead className="min-w-[140px] text-sm font-semibold">To</TableHead>
              <TableHead className="text-sm font-semibold">Date From</TableHead>
              <TableHead className="text-sm font-semibold">Date To</TableHead>
              {showBankName ? <TableHead className="min-w-[180px] text-sm font-semibold">Bank Name</TableHead> : null}
              <TableHead className="min-w-[220px] text-sm font-semibold">Purpose</TableHead>
              <TableHead className="text-right text-sm font-semibold">Food</TableHead>
              <TableHead className="text-right text-sm font-semibold">Hotel</TableHead>
              <TableHead className="text-right text-sm font-semibold">Others</TableHead>
              <TableHead className="text-right text-sm font-semibold">Advance</TableHead>
              <TableHead className="text-right text-sm font-semibold">Total</TableHead>
              <TableHead className="text-right text-sm font-semibold">Net Payable</TableHead>
              <TableHead className="min-w-[180px] text-sm font-semibold">Remarks</TableHead>
              <TableHead className="min-w-[160px] text-sm font-semibold">Attachment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r,i)=>{
              const sum = (Number(r.food)||0)+(Number(r.hotel)||0)+(Number(r.others)||0);
              const net = sum - (Number(r.advance)||0);
              const url = b.items[i]?.attachmentUrl || null;
              return (
                <TableRow key={i}>
                  <TableCell className="p-3 py-3 font-medium text-sm">{i+1}</TableCell>
                  <TableCell className="p-3 min-w-[140px] text-sm">{r.from||"-"}</TableCell>
                  <TableCell className="p-3 min-w-[140px] text-sm">{r.to||"-"}</TableCell>
                  <TableCell className="p-3 text-sm">{format(r.dateFrom, "PPP")}</TableCell>
                  <TableCell className="p-3 text-sm">{format(r.dateTo, "PPP")}</TableCell>
                  {showBankName ? <TableCell className="p-3 min-w-[180px] text-sm">{r.bankName || "-"}</TableCell> : null}
                  <TableCell className="p-3 min-w-[220px] text-sm">{r.purpose}</TableCell>
                  <TableCell className="p-3 text-right text-sm">{Number(r.food).toFixed(2)}</TableCell>
                  <TableCell className="p-3 text-right text-sm">{Number(r.hotel).toFixed(2)}</TableCell>
                  <TableCell className="p-3 text-right text-sm">{Number(r.others).toFixed(2)}</TableCell>
                  <TableCell className="p-3 text-right text-sm">{Number(r.advance).toFixed(2)}</TableCell>
                  <TableCell className="p-3 text-right text-sm">{sum.toFixed(2)}</TableCell>
                  <TableCell className="p-3 text-right text-sm">{net.toFixed(2)}</TableCell>
                  <TableCell className="p-3 min-w-[180px] text-sm">{r.remarks||"-"}</TableCell>
                  <TableCell className="p-3 min-w-[160px] text-sm">
                    {url ? <a href={url} target="_blank" className="text-primary underline">View</a> : "-"}
                  </TableCell>
                </TableRow>
              );
            })}

            <TableRow className="font-semibold bg-muted/30">
              <TableCell colSpan={13 + (showBankName ? 1 : 0)} className="text-right p-3 text-sm">Total Tk</TableCell>
              <TableCell className="text-right p-3 text-sm font-bold">{total.toFixed(2)}</TableCell>
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
              <TableHead className="text-sm font-semibold">SL</TableHead>
              <TableHead className="text-sm font-semibold">Date</TableHead>
              <TableHead className="min-w-[140px] text-sm font-semibold">Time</TableHead>
              <TableHead className="min-w-[220px] text-sm font-semibold">Incident</TableHead>
              <TableHead className="min-w-[240px] text-sm font-semibold">Purpose</TableHead>
              <TableHead className="min-w-[200px] text-sm font-semibold">
                Meal (Breakfast / Lunch / Dinner)
              </TableHead>
              <TableHead className="text-right text-sm font-semibold">Food</TableHead>
              <TableHead className="text-right text-sm font-semibold">Hotel</TableHead>
              <TableHead className="text-right text-sm font-semibold">Others</TableHead>
              <TableHead className="text-right text-sm font-semibold">Total</TableHead>
              <TableHead className="text-right text-sm font-semibold">Advanced</TableHead>
              <TableHead className="min-w-[200px] text-sm font-semibold">Remarks</TableHead>
              <TableHead className="min-w-[160px] text-sm font-semibold">Attachment</TableHead>
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
                  <TableCell className="p-3 py-3 font-medium text-sm">{i+1}</TableCell>
                  <TableCell className="p-3 text-sm">{format(r.date, "PPP")}</TableCell>
                  <TableCell className="p-3 text-sm">{r.time || "-"}</TableCell>
                  <TableCell className="p-3 min-w-[220px] text-sm">{r.incident || "-"}</TableCell>
                  <TableCell className="p-3 min-w-[240px] text-sm">{r.purpose}</TableCell>
                  <TableCell className="p-3 min-w-[200px] text-sm">
                    {r.vehicle || "-"}
                  </TableCell>
                  <TableCell className="p-3 text-right text-sm">{Number(r.food||0).toFixed(2)}</TableCell>
                  <TableCell className="p-3 text-right text-sm">{Number(r.hotel||0).toFixed(2)}</TableCell>
                  <TableCell className="p-3 text-right text-sm">{Number(r.others||0).toFixed(2)}</TableCell>
                  <TableCell className="p-3 text-right text-sm">{sum.toFixed(2)}</TableCell>
                  <TableCell className="p-3 text-right text-sm">{Number(r.advance||0).toFixed(2)}</TableCell>
                  <TableCell className="p-3 min-w-[200px] text-sm">{r.remarks||"-"}</TableCell>
                  <TableCell className="p-3 min-w-[160px] text-sm">
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
              <TableCell colSpan={11} className="text-right p-3 text-sm">Total Tk</TableCell>
              <TableCell className="text-right p-3 text-sm font-bold" colSpan={2}>
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
      <div className="overflow-x-auto overscroll-x-contain rounded-lg border max-sm:[&_button]:text-base max-sm:[&_input]:text-base">
        <Table className="min-w-[1160px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-sm font-semibold">No.</TableHead>
              <TableHead className="w-[190px] text-sm font-semibold">Date</TableHead>
              <TableHead className="min-w-[190px] text-sm font-semibold">From</TableHead>
              <TableHead className="min-w-[190px] text-sm font-semibold">To</TableHead>
              <TableHead className="min-w-[170px] text-sm font-semibold">Transport</TableHead>
              <TableHead className="min-w-[260px] text-sm font-semibold">Purpose</TableHead>
              <TableHead className="min-w-[140px] text-right text-sm font-semibold">Amount</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((f,i)=>(
              <TableRow key={f?.id ?? i}>
                <TableCell className="p-3 py-3 font-medium text-sm">{i+1}</TableCell>
                <TableCell className="p-3">
                  <FormField control={control} name={`items.${i}.date`} render={({ field })=>(
                    <FormItem>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button type="button" variant="outline" className={cn("w-[190px] justify-start pl-3 text-left", !field.value && "text-muted-foreground")}>
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
                        <FormControl><Input {...field} className={cn(k === "purpose" ? "w-[260px]" : k === "transport" ? "w-[170px]" : "w-[190px]")} placeholder={k} required /></FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}/>
                  </TableCell>
                ))}
                <TableCell className="p-3">
                  <FormField control={control} name={`items.${i}.amount`} render={({ field })=>(
                    <FormItem>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          className="w-[140px] text-right text-base sm:text-sm"
                          required
                          value={field.value ?? ""}
                          onChange={(e)=> field.onChange(e.target.value === "" ? "" : Math.trunc(Number(e.target.value.replace(/\D/g, ""))))}
                        />
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}/>
                </TableCell>
                <TableCell className="p-3 py-3 text-right">
                  {fields.length>1 && (
                    <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={()=>remove(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold bg-muted/30">
              <TableCell colSpan={6} className="text-right p-3 text-sm">Total Tk</TableCell>
              <TableCell className="text-right p-3 text-sm font-bold">{sum.toFixed(2)}</TableCell>
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
  control, fields, append, remove, onPickFile, files, selectedColumns, onToggleColumn,
}: {
  control:any; fields:any[]; append:(r:RowB2)=>void; remove:(i:number)=>void;
  onPickFile:(i:number,f:File|null)=>void; files:(File|null)[];
  selectedColumns:Bill2OptionalColumn[]; onToggleColumn:(column:Bill2OptionalColumn, checked:boolean)=>void;
}) {
  const rows = useWatch({ control, name:"items" }) as RowB2[];
  const sum = (rows||[]).reduce((acc,r)=> acc + ((Number(r.local)||0)+(Number(r.trip)||0)+(Number(r.food)||0)+(Number(r.hotel)||0)+(Number(r.others)||0) - (Number(r.advance)||0)), 0);

  return (
    <>
      <div className="mb-3 flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50/70 p-3 shadow-sm">
        {BILL2_OPTIONAL_COLUMNS.map((column) => {
          const checked = selectedColumns.includes(column.key);
          return <label key={column.key} className={cn("inline-flex cursor-pointer select-none items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium", checked ? "border-primary/40 bg-primary/5 text-primary" : "border-slate-300 bg-white")}><Checkbox checked={checked} onCheckedChange={(value) => onToggleColumn(column.key, value === true)} className="h-5 w-5 rounded-full border-slate-400" />{column.label}</label>;
        })}
      </div>
      <div className="overflow-x-auto overscroll-x-contain rounded-lg border max-sm:[&_button]:text-base max-sm:[&_input]:text-base">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-sm font-semibold">No.</TableHead>
              <TableHead className="min-w-[180px] text-sm font-semibold">From</TableHead>
              <TableHead className="min-w-[180px] text-sm font-semibold">To</TableHead>
              <TableHead className="text-sm font-semibold">Date From</TableHead>
              <TableHead className="text-sm font-semibold">Date To</TableHead>
              {selectedColumns.includes("bankName") ? <TableHead className="min-w-[240px] text-sm font-semibold">Bank Name</TableHead> : null}
              <TableHead className="min-w-[220px] text-sm font-semibold">Purpose</TableHead>
              <TableHead className="text-right text-sm font-semibold">Local Conv.</TableHead>
              {BILL2_OPTIONAL_COLUMNS.filter((column) => column.key !== "bankName" && selectedColumns.includes(column.key)).map((column) => <TableHead key={column.key} className="text-right text-sm font-semibold">{column.label}</TableHead>)}
              <TableHead className="text-right text-sm font-semibold">Total</TableHead>
              <TableHead className="text-right text-sm font-semibold">Net Payable</TableHead>
              <TableHead className="min-w-[180px] text-sm font-semibold">Remarks</TableHead>
              <TableHead className="min-w-[160px] text-sm font-semibold">Attachment</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((f,i)=>(
              <TableRow key={f?.id ?? i}>
                <TableCell className="p-1 pt-3 font-medium">{i+1}</TableCell>
                <TableCell className="p-1 min-w-[140px]">
                  <FormField control={control} name={`items.${i}.from`} render={({ field })=>(
                    <FormItem><FormControl><Input placeholder="From" {...field} className="w-[220px] sm:w-[190px]" /></FormControl><FormMessage/></FormItem>
                  )}/>
                </TableCell>
                <TableCell className="p-1 min-w-[140px]">
                  <FormField control={control} name={`items.${i}.to`} render={({ field })=>(
                    <FormItem><FormControl><Input placeholder="To" {...field} className="w-[220px] sm:w-[190px]" /></FormControl><FormMessage/></FormItem>
                  )}/>
                </TableCell>
                {(["dateFrom","dateTo"] as const).map((k)=>(
                  <TableCell className="p-1" key={k}>
                    <FormField control={control} name={`items.${i}.${k}`} render={({ field })=>(
                      <FormItem>
                        <AutoCloseDatePicker field={field} />
                        <FormMessage/>
                      </FormItem>
                    )}/>
                  </TableCell>
                ))}
                {selectedColumns.includes("bankName") ? (
                  <TableCell className="p-1 min-w-[240px]">
                    <FormField control={control} name={`items.${i}.bankName`} render={({ field }) => (
                      <FormItem><Select value={field.value || ""} onValueChange={field.onChange}><FormControl><SelectTrigger className="w-[240px]"><SelectValue placeholder="Select bank" /></SelectTrigger></FormControl><SelectContent>{BILL5_BANKS.map((bank) => <SelectItem key={bank} value={bank}>{bank}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>
                    )} />
                  </TableCell>
                ) : null}
                <TableCell className="p-1 min-w-[220px]">
                  <FormField control={control} name={`items.${i}.purpose`} render={({ field })=>(
                    <FormItem><FormControl><Input placeholder="Purpose" {...field} className="w-[320px] sm:w-[280px]" /></FormControl><FormMessage/></FormItem>
                  )}/>
                </TableCell>
                {(["local", ...selectedColumns.filter((column) => column !== "bankName")] as Array<"local" | Exclude<Bill2OptionalColumn, "bankName">>).map((k)=>(
                  <TableCell className="p-1" key={k}>
                    <FormField control={control} name={`items.${i}.${k}`} render={({ field })=>(
                      <FormItem><FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          className="w-[145px] text-right text-base sm:w-[130px] sm:text-sm"
                          value={field.value ?? ""}
                          onChange={(e)=> field.onChange(e.target.value === "" ? "" : Math.trunc(Number(e.target.value.replace(/\D/g, ""))))}
                        />
                      </FormControl><FormMessage/></FormItem>
                    )}/>
                  </TableCell>
                ))}
                {/* Row Total */}
                <TableCell className="p-1 text-right">
                  {(() => {
                    const r = (rows||[])[i];
                    const s = (Number(r?.local)||0)+(Number(r?.trip)||0)+(Number(r?.food)||0)+(Number(r?.hotel)||0)+(Number(r?.others)||0);
                    return s.toFixed(2);
                  })()}
                </TableCell>
                {/* Net */}
                <TableCell className="p-3 text-right text-sm">
                  {(() => {
                    const r = (rows||[])[i];
                    const s = (Number(r?.local)||0)+(Number(r?.trip)||0)+(Number(r?.food)||0)+(Number(r?.hotel)||0)+(Number(r?.others)||0);
                    const n = s - (Number(r?.advance)||0);
                    return n.toFixed(2);
                  })()}
                </TableCell>
                <TableCell className="p-3 min-w-[180px]">
                  <FormField control={control} name={`items.${i}.remarks`} render={({ field })=>(
                    <FormItem><FormControl><Input placeholder="Remarks" {...field} className="w-[260px] text-base sm:w-[220px] sm:text-sm" /></FormControl><FormMessage/></FormItem>
                  )}/>
                </TableCell>

                {/* Attachment (file) */}
                <TableCell className="p-3 min-w-[160px]">
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => onPickFile(i, e.currentTarget.files?.[0] ?? null)} />
                  {files?.[i] ? (
                    <div className="text-sm text-muted-foreground mt-1 truncate max-w-[180px]">
                      {files[i]?.name}
                    </div>
                  ) : null}
                </TableCell>

                <TableCell className="p-3 py-3 text-right">
                  {fields.length>1 && (
                    <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={()=>remove(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold bg-muted/30">
              <TableCell colSpan={11 + selectedColumns.length} className="text-right p-3 text-sm">Total Tk</TableCell>
              <TableCell className="text-right p-3 text-sm font-bold">{sum.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={()=> append({ from:"", to:"", dateFrom:new Date(), dateTo:new Date(), purpose:"", local:undefined as any, trip:undefined as any, food:undefined as any, hotel:undefined as any, others:undefined as any, advance:undefined as any, remarks:"" })}
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Add Row
      </Button>
    </>
  );
}

function EditorBill3({
  control, fields, append, remove, onPickFile, files, showBankName, onToggleBank,
}: {
  control:any; fields:any[]; append:(r:RowB3)=>void; remove:(i:number)=>void;
  onPickFile:(i:number,f:File|null)=>void; files:(File|null)[];
  showBankName:boolean; onToggleBank:(checked:boolean)=>void;
}) {
  const rows = useWatch({ control, name:"items" }) as RowB3[];
  const sum = (rows||[]).reduce((acc,r)=> acc + ((Number(r.food)||0)+(Number(r.hotel)||0)+(Number(r.others)||0) - (Number(r.advance)||0)), 0);

  return (
    <>
      <BankColumnToggle checked={showBankName} onChange={onToggleBank} />
      <div className="overflow-x-auto overscroll-x-contain rounded-lg border max-sm:[&_button]:text-base max-sm:[&_input]:text-base">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead className="min-w-[140px]">From</TableHead>
              <TableHead className="min-w-[140px]">To</TableHead>
              <TableHead>Date From</TableHead>
              <TableHead>Date To</TableHead>
              {showBankName ? <TableHead className="min-w-[240px]">Bank Name</TableHead> : null}
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
                <TableCell className="p-1 min-w-[140px]">
                  <FormField control={control} name={`items.${i}.from`} render={({ field })=>(
                    <FormItem><FormControl><Input placeholder="From" {...field} className="w-[220px] sm:w-[190px]" /></FormControl><FormMessage/></FormItem>
                  )}/>
                </TableCell>
                <TableCell className="p-1 min-w-[140px]">
                  <FormField control={control} name={`items.${i}.to`} render={({ field })=>(
                    <FormItem><FormControl><Input placeholder="To" {...field} className="w-[220px] sm:w-[190px]" /></FormControl><FormMessage/></FormItem>
                  )}/>
                </TableCell>
                {(["dateFrom","dateTo"] as const).map((k)=>(
                  <TableCell className="p-1" key={k}>
                    <FormField control={control} name={`items.${i}.${k}`} render={({ field })=>(
                      <FormItem>
                        <AutoCloseDatePicker field={field} />
                        <FormMessage/>
                      </FormItem>
                    )}/>
                  </TableCell>
                ))}
                {showBankName ? (
                  <TableCell className="p-1 min-w-[240px]">
                    <FormField control={control} name={`items.${i}.bankName`} render={({ field }) => (
                      <FormItem><Select value={field.value || ""} onValueChange={field.onChange}><FormControl><SelectTrigger className="w-[240px]"><SelectValue placeholder="Select bank" /></SelectTrigger></FormControl><SelectContent>{BILL5_BANKS.map((bank) => <SelectItem key={bank} value={bank}>{bank}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>
                    )} />
                  </TableCell>
                ) : null}
                <TableCell className="p-1 min-w-[220px]">
                  <FormField control={control} name={`items.${i}.purpose`} render={({ field })=>(
                    <FormItem><FormControl><Input placeholder="Purpose" {...field} className="w-[320px] sm:w-[280px]" /></FormControl><FormMessage/></FormItem>
                  )}/>
                </TableCell>

                {(["food","hotel","others","advance"] as const).map((k)=>(
                  <TableCell className="p-1" key={k}>
                    <FormField control={control} name={`items.${i}.${k}`} render={({ field })=>(
                      <FormItem><FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          className="w-[145px] text-right text-base sm:w-[130px] sm:text-sm"
                          value={field.value ?? ""}
                          onChange={(e)=> field.onChange(e.target.value === "" ? "" : Math.trunc(Number(e.target.value.replace(/\D/g, ""))))}
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
                    <FormItem><FormControl><Input placeholder="Remarks" {...field} className="w-[260px] text-base sm:w-[220px] sm:text-sm" /></FormControl><FormMessage/></FormItem>
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
              <TableCell colSpan={13 + (showBankName ? 1 : 0)} className="text-right p-3 text-sm">Total Tk</TableCell>
              <TableCell className="text-right p-3 text-sm font-bold">{sum.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={()=> append({ from:"", to:"", dateFrom:new Date(), dateTo:new Date(), purpose:"", food:undefined as any, hotel:undefined as any, others:undefined as any, advance:undefined as any, remarks:"" })}
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
                    <FormItem><FormControl><Input {...field} autoComplete="off" placeholder="Purpose" className="w-[220px]" /></FormControl><FormMessage/></FormItem>
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
                            type="text"
                            inputMode="numeric"
                            className="text-right w-[120px]"
                            required
                            value={field.value ?? ""}
                            onChange={(e)=>
                              field.onChange(
                                e.target.value === "" ? "" : Math.trunc(Number(e.target.value.replace(/\D/g, "")))
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
                          type="text"
                          inputMode="numeric"
                          className="text-right w-[120px]"
                          required
                          value={field.value ?? ""}
                          onChange={(e)=>
                            field.onChange(
                              e.target.value === "" ? "" : Math.trunc(Number(e.target.value.replace(/\D/g, "")))
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
          vehicle: "",
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
