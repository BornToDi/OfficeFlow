// // src/components/bills/BillForm.tsx
// "use client";

// import { useActionState, useTransition } from "react";
// import { useForm, useFieldArray, FormProvider } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { cn, numberToWords } from "@/lib/utils";
// import { format } from "date-fns";
// import { Calendar as CalendarIcon, PlusCircle, Trash2 } from "lucide-react";

// import { submitBill, saveDraft } from "@/lib/actions";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { AlertCircle } from "lucide-react";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from "@/components/ui/form";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Separator } from "@/components/ui/separator";

// import type { User, BillStatus } from "@/lib/types";

// /* ---------- Types used by view mode ---------- */

// export type BillViewItem = {
//   id: string;
//   date: string; // ISO
//   from: string;
//   to: string;
//   transport?: string | null;
//   purpose: string;
//   amount: number; // plain number
// };

// export type BillViewData = {
//   id: string;
//   companyName: string;
//   companyAddress: string;
//   employeeId: string;
//   employeeName: string;
//   employeeDesignation?: string | null;
//   amount: number;
//   amountInWords: string;
//   status: BillStatus;
//   items: BillViewItem[];
// };

// /* ---------- Validation ---------- */

// const billItemSchema = z.object({
//   date: z.date({ required_error: "A date is required." }),
//   from: z.string().min(1, "From location is required."),
//   to: z.string().min(1, "To location is required."),
//   transport: z.string().optional(),
//   purpose: z.string().min(1, "Purpose is required."),
//   amount: z.coerce.number().min(0.01, "Amount must be > 0."),
// });

// const billFormSchema = z.object({
//   billId: z.string().optional(), // used for drafts/edit
//   companyName: z.string().min(1, "Company name is required."),
//   companyAddress: z.string().min(1, "Company address is required."),
//   employeeId: z.string().min(1, "Employee ID is required."),
//   employeeName: z.string().min(1, "Employee name is required."),
//   employeeDesignation: z.string().optional(),
//   items: z.array(billItemSchema).min(1, "At least one bill item is required."),
// });

// type BillFormValues = z.infer<typeof billFormSchema>;

// type Mode = "create" | "edit" | "view";

// type Props =
//   | { mode?: Extract<Mode, "create" | "edit">; user: User; bill?: BillViewData }
//   | { mode: "view"; bill: BillViewData; user?: User };

// function SubmitButton({ isPending, children, disabled }: { isPending: boolean; children: React.ReactNode; disabled?: boolean }) {
//   return (
//     <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={disabled || isPending}>
//       {isPending ? "Working..." : children}
//     </Button>
//   );
// }

// export function BillForm(props: Props) {
//   const mode: Mode = props.mode ?? "create";
//   const isView = mode === "view";

//   // actions
//   const [submitState, submitAction] = useActionState(submitBill, undefined);
//   const [draftState, draftAction] = useActionState(saveDraft, undefined);
//   const [isPending, startTransition] = useTransition();

//   // compute defaults depending on mode/inputs
//   const defaultsFromBill = (b: BillViewData | undefined): Partial<BillFormValues> =>
//     b
//       ? {
//           billId: b.id,
//           companyName: b.companyName,
//           companyAddress: b.companyAddress,
//           employeeId: b.employeeId,
//           employeeName: b.employeeName,
//           employeeDesignation: b.employeeDesignation ?? "",
//           items: b.items.map((it) => ({
//             date: new Date(it.date),
//             from: it.from,
//             to: it.to,
//             transport: it.transport ?? "",
//             purpose: it.purpose,
//             amount: it.amount,
//           })),
//         }
//       : {};

//   const defaultsFromUser = ("user" in props && props.user)
//     ? {
//         employeeId: props.user.id,
//         employeeName: props.user.name,
//         employeeDesignation: props.user.designation ?? "",
//       }
//     : {};

//   const form = useForm<BillFormValues>({
//     resolver: zodResolver(billFormSchema),
//     defaultValues: {
//       companyName: props.bill?.companyName ?? "Networld Bangladesh Limited",
//       companyAddress:
//         props.bill?.companyAddress ?? "57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka",
//       items:
//         props.bill?.items?.map((it) => ({
//           date: new Date(it.date),
//           from: it.from,
//           to: it.to,
//           transport: it.transport ?? "",
//           purpose: it.purpose,
//           amount: it.amount,
//         })) ?? [{ date: new Date(), from: "", to: "", transport: "", purpose: "", amount: 0 }],
//       ...defaultsFromBill(props.bill),
//       ...defaultsFromUser,
//     },
//     mode: "onChange",
//   });

//   const { control, handleSubmit, watch, setValue } = form;
//   const { fields, append, remove } = useFieldArray({ control, name: "items" });

//   const watchedItems = watch("items");
//   const totalAmount = watchedItems.reduce((acc, current) => acc + (Number(current.amount) || 0), 0);
//   const amountInWords = numberToWords(totalAmount) + " Only";

//   // keep a hidden field in sync for server actions
//   // (Radix Select etc. would need similar technique; here simple inputs are fine)
//   // no-op here, just a reminder comment.

//   const runSubmit = (payload: FormData) => {
//     startTransition(() => submitAction(payload));
//   };
//   const runSaveDraft = (payload: FormData) => {
//     startTransition(() => draftAction(payload));
//   };

//   const onSubmit = (data: BillFormValues, submitKind: "final" | "draft") => {
//     const formData = new FormData();

//     const itemsForServer = data.items.map((item) => ({
//       ...item,
//       date: item.date.toISOString(),
//     }));

//     if (data.billId) formData.append("billId", data.billId);
//     formData.append("companyName", data.companyName);
//     formData.append("companyAddress", data.companyAddress);
//     formData.append("employeeId", data.employeeId);
//     formData.append("employeeName", data.employeeName);
//     formData.append("employeeDesignation", data.employeeDesignation ?? "");
//     formData.append("items", JSON.stringify(itemsForServer));
//     formData.append("totalAmount", totalAmount.toString());
//     formData.append("amountInWords", amountInWords);

//     if (submitKind === "final") runSubmit(formData);
//     else runSaveDraft(formData);
//   };

//   /* ---------- VIEW MODE (read-only) ---------- */
//   if (isView) {
//     const b = props.bill!;
//     const total = b.items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
//     const words = numberToWords(total) + " Only";

//     return (
//       <div className="rounded-xl border bg-white p-6 shadow-sm">
//         <div className="grid md:grid-cols-2 gap-4 mb-6">
//           <div>
//             <p className="text-xs text-muted-foreground">Company Name</p>
//             <p className="font-medium">{b.companyName}</p>
//           </div>
//           <div>
//             <p className="text-xs text-muted-foreground">Company Address</p>
//             <p className="font-medium">{b.companyAddress}</p>
//           </div>
//           <div>
//             <p className="text-xs text-muted-foreground">Employee Name</p>
//             <p className="font-medium">{b.employeeName}</p>
//           </div>
//           <div>
//             <p className="text-xs text-muted-foreground">Employee ID</p>
//             <p className="font-medium">{b.employeeId}</p>
//           </div>
//           <div className="md:col-span-2">
//             <p className="text-xs text-muted-foreground">Designation</p>
//             <p className="font-medium">{b.employeeDesignation || "-"}</p>
//           </div>
//         </div>

//         <div className="rounded-lg border">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-[50px]">No.</TableHead>
//                 <TableHead className="w-[150px]">Date</TableHead>
//                 <TableHead>From</TableHead>
//                 <TableHead>To</TableHead>
//                 <TableHead>Transport</TableHead>
//                 <TableHead>Purpose</TableHead>
//                 <TableHead className="w-[120px] text-right">Amount</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {b.items.map((it, idx) => (
//                 <TableRow key={it.id ?? idx}>
//                   <TableCell className="p-1 pt-3 font-medium">{idx + 1}</TableCell>
//                   <TableCell className="p-1">{format(new Date(it.date), "PPP")}</TableCell>
//                   <TableCell className="p-1">{it.from}</TableCell>
//                   <TableCell className="p-1">{it.to}</TableCell>
//                   <TableCell className="p-1">{it.transport || "-"}</TableCell>
//                   <TableCell className="p-1">{it.purpose}</TableCell>
//                   <TableCell className="p-1 text-right">
//                     {new Intl.NumberFormat("en-IN", { style: "currency", currency: "BDT" }).format(Number(it.amount))}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>

//         <Separator className="my-4" />

//         <div className="flex justify-between items-start">
//           <div>
//             <p className="font-medium">Amount in Words:</p>
//             <p className="text-muted-foreground">{words}</p>
//           </div>
//           <div className="w-full max-w-xs space-y-2">
//             <div className="flex justify-between items-center text-xl font-bold">
//               <span>Total</span>
//               <span>
//                 {new Intl.NumberFormat("en-IN", { style: "currency", currency: "BDT" }).format(total)}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   /* ---------- CREATE/EDIT MODE (interactive) ---------- */

//   const onSubmitFinal = (data: BillFormValues) => onSubmit(data, "final");
//   const onSubmitDraft = (data: BillFormValues) => onSubmit(data, "draft");

//   return (
//     <FormProvider {...form}>
//       <form
//         onSubmit={handleSubmit(onSubmitFinal)}
//         className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
//       >
//         <FormField
//           control={form.control}
//           name="billId"
//           render={({ field }) => <input type="hidden" {...field} />}
//         />

//         <div className="grid md:grid-cols-2 gap-4">
//           <FormField
//             control={form.control}
//             name="companyName"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Company Name</FormLabel>
//                 <FormControl>
//                   <Input placeholder="e.g. Acme Corporation" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="companyAddress"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Company Address</FormLabel>
//                 <FormControl>
//                   <Input placeholder="e.g. 123 Main St, City" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="employeeName"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Employee Name</FormLabel>
//                 <FormControl>
//                   <Input {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="employeeId"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Employee ID</FormLabel>
//                 <FormControl>
//                   <Input {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="employeeDesignation"
//             render={({ field }) => (
//               <FormItem className="md:col-span-2">
//                 <FormLabel>Designation</FormLabel>
//                 <FormControl>
//                   <Input placeholder="e.g. Software Engineer" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         </div>

//         <div className="rounded-lg border">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-[50px]">No.</TableHead>
//                 <TableHead className="w-[150px]">Date</TableHead>
//                 <TableHead>From</TableHead>
//                 <TableHead>To</TableHead>
//                 <TableHead>Transport</TableHead>
//                 <TableHead>Purpose</TableHead>
//                 <TableHead className="w-[120px] text-right">Amount</TableHead>
//                 <TableHead className="w-[50px]" />
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {fields.map((field, index) => (
//                 <TableRow key={field?.id ?? index} className="align-top">
//                   <TableCell className="p-1 pt-3 font-medium">{index + 1}</TableCell>
//                   <TableCell className="p-1">
//                     <FormField
//                       control={form.control}
//                       name={`items.${index}.date`}
//                       render={({ field }) => (
//                         <FormItem>
//                           <Popover>
//                             <PopoverTrigger asChild>
//                               <FormControl>
//                                 <Button
//                                   type="button"
//                                   variant="outline"
//                                   className={cn(
//                                     "w-full justify-start pl-3 text-left font-normal",
//                                     !field.value && "text-muted-foreground"
//                                   )}
//                                 >
//                                   {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
//                                   <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                                 </Button>
//                               </FormControl>
//                             </PopoverTrigger>
//                             <PopoverContent className="w-auto p-0" align="start">
//                               <Calendar
//                                 mode="single"
//                                 selected={field.value}
//                                 onSelect={field.onChange}
//                                 disabled={(date) =>
//                                   date > new Date() || date < new Date("1900-01-01")
//                                 }
//                                 initialFocus
//                               />
//                             </PopoverContent>
//                           </Popover>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <FormField
//                       control={form.control}
//                       name={`items.${index}.from`}
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormControl>
//                             <Input placeholder="e.g. Office" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <FormField
//                       control={form.control}
//                       name={`items.${index}.to`}
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormControl>
//                             <Input placeholder="e.g. Client Office" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <FormField
//                       control={form.control}
//                       name={`items.${index}.transport`}
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormControl>
//                             <Input placeholder="e.g. Pathao, CNG" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <FormField
//                       control={form.control}
//                       name={`items.${index}.purpose`}
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormControl>
//                             <Input placeholder="e.g. Meeting" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <FormField
//                       control={form.control}
//                       name={`items.${index}.amount`}
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormControl>
//                             <Input
//                               type="number"
//                               step="0.01"
//                               placeholder="0.00"
//                               className="text-right"
//                               {...field}
//                             />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </TableCell>
//                   <TableCell className="p-1 pt-3 text-right">
//                     {fields.length > 1 && (
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="icon"
//                         className="text-destructive hover:text-destructive"
//                         onClick={() => remove(index)}
//                         aria-label={`Remove row ${index + 1}`}
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>

//         <Button
//           type="button"
//           variant="outline"
//           onClick={() =>
//             append({ date: new Date(), from: "", to: "", transport: "", purpose: "", amount: 0 })
//           }
//         >
//           <PlusCircle className="mr-2 h-4 w-4" />
//           Add Item
//         </Button>

//         <Separator />

//         <div className="flex justify-between items-start">
//           <div>
//             <p className="font-medium">Amount in Words:</p>
//             <p className="text-muted-foreground">{amountInWords}</p>
//           </div>
//           <div className="w-full max-w-xs space-y-2">
//             <div className="flex justify-between items-center text-xl font-bold">
//               <span>Total</span>
//               <span>
//                 {new Intl.NumberFormat("en-IN", { style: "currency", currency: "BDT" }).format(totalAmount)}
//               </span>
//             </div>
//           </div>
//         </div>

//         <Separator />

//         <div className="mt-6 space-y-4">
//           {(submitState?.error || draftState?.error) && (
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertTitle>Error</AlertTitle>
//               <AlertDescription>{submitState?.error || draftState?.error}</AlertDescription>
//             </Alert>
//           )}
//           <div className="flex flex-col gap-3 sm:flex-row">
//             <Button
//               type="button"
//               variant="secondary"
//               onClick={handleSubmit(onSubmitDraft)}
//               disabled={isPending}
//             >
//               Save Draft
//             </Button>
//             <SubmitButton isPending={isPending}>Submit Bill</SubmitButton>
//           </div>
//         </div>
//       </form>
//     </FormProvider>
//   );
// }


// src/components/bills/bill-form.tsx
// "use client";

// import { useActionState, useTransition, useState } from "react";
// import { FormProvider, useFieldArray, useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { cn, numberToWords } from "@/lib/utils";
// import { format } from "date-fns";
// import {
//   Calendar as CalendarIcon,
//   PlusCircle,
//   Trash2,
// } from "lucide-react";

// import { submitBill, saveDraft } from "@/lib/actions";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { AlertCircle } from "lucide-react";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Separator } from "@/components/ui/separator";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// import type { User, BillStatus } from "@/lib/types";

// /* ---------------- Types for read-only view ---------------- */

// export type BillViewItem = {
//   id: string;
//   date: string; // ISO
//   from: string;
//   to: string;
//   transport?: string | null;
//   purpose: string;
//   amount: number;
// };

// export type BillViewData = {
//   id: string;
//   companyName: string;
//   companyAddress: string;
//   employeeId: string;
//   employeeName: string;
//   employeeDesignation?: string | null;
//   amount: number;
//   amountInWords: string;
//   status: BillStatus;
//   items: BillViewItem[];
// };

// type Mode = "create" | "edit" | "view";

// /* ---------------- Helpers ---------------- */

// function toDate(value: unknown): Date | undefined {
//   if (value instanceof Date) return isNaN(value.getTime()) ? undefined : value;
//   if (typeof value === "string" && value) {
//     const d = new Date(value);
//     return isNaN(d.getTime()) ? undefined : d;
//   }
//   return undefined;
// }

// /* ---------------- Validation for Bill-1 ---------------- */

// const bill1ItemSchema = z.object({
//   date: z.coerce.date({ required_error: "A date is required." }),
//   from: z.string().min(1, "From location is required."),
//   to: z.string().min(1, "To location is required."),
//   transport: z.string().optional(),
//   purpose: z.string().min(1, "Purpose is required."),
//   amount: z.coerce.number().min(0.01, "Amount must be > 0."),
// });

// const bill1FormSchema = z.object({
//   billId: z.string().optional(),
//   companyName: z.string().min(1, "Company name is required."),
//   companyAddress: z.string().min(1, "Company address is required."),
//   employeeId: z.string().min(1, "Employee ID is required."),
//   employeeName: z.string().min(1, "Employee name is required."),
//   employeeDesignation: z.string().optional(),
//   items: z.array(bill1ItemSchema).min(1, "At least one bill item is required."),
// });

// type Bill1Values = z.infer<typeof bill1FormSchema>;

// /* ---------------- Types for Bill-2 / Bill-3 rows ---------------- */

// type SheetBaseRow = {
//   name: string;
//   designation: string;
//   dateFrom?: Date;
//   dateTo?: Date;
//   purpose: string;
//   advance: number;
//   remarks?: string;
// };

// type Bill2Row = SheetBaseRow & {
//   localConv: number;
//   tripConv: number;
//   others: number;
// };

// type Bill3Row = SheetBaseRow & {
//   food: number;
//   hotel: number;
//   others: number;
// };

// type BillDesign = "bill-1" | "bill-2" | "bill-3";

// /* ===================== MAIN COMPONENT ===================== */

// type Props =
//   | { mode?: Extract<Mode, "create" | "edit">; user: User; bill?: BillViewData; employees?: User[] }
//   | { mode: "view"; bill: BillViewData; user?: User; employees?: User[] };

// function SubmitButton({
//   isPending,
//   children,
//   disabled,
// }: {
//   isPending: boolean;
//   children: React.ReactNode;
//   disabled?: boolean;
// }) {
//   return (
//     <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={disabled || isPending}>
//       {isPending ? "Working..." : children}
//     </Button>
//   );
// }

// export function BillForm(props: Props) {
//   const mode: Mode = props.mode ?? "create";
//   const isView = mode === "view";

//   const [submitState, submitAction] = useActionState(submitBill, undefined);
//   const [draftState, draftAction] = useActionState(saveDraft, undefined);
//   const [isPending, startTransition] = useTransition();

//   // Bill type selector (Bill-1 default). For edit/view we stick to Bill-1 renderer.
//   const [design, setDesign] = useState<BillDesign>("bill-1");

//   /* --------------- RHF for the top (shared) fields + Bill-1 items --------------- */

//   const defaultsFromBill = (b?: BillViewData): Partial<Bill1Values> =>
//     b
//       ? {
//           billId: b.id,
//           companyName: b.companyName,
//           companyAddress: b.companyAddress,
//           employeeId: b.employeeId,
//           employeeName: b.employeeName,
//           employeeDesignation: b.employeeDesignation ?? "",
//           items: b.items.map((it) => ({
//             date: toDate(it.date) ?? new Date(),
//             from: it.from,
//             to: it.to,
//             transport: it.transport ?? "",
//             purpose: it.purpose,
//             amount: it.amount,
//           })),
//         }
//       : {};

//   const defaultsFromUser =
//     "user" in props && props.user
//       ? {
//           employeeId: props.user.id,
//           employeeName: props.user.name,
//           employeeDesignation: props.user.designation ?? "",
//         }
//       : {};

//   const form = useForm<Bill1Values>({
//     resolver: zodResolver(bill1FormSchema),
//     defaultValues: {
//       companyName: props.bill?.companyName ?? "Networld Bangladesh Limited",
//       companyAddress:
//         props.bill?.companyAddress ??
//         "57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka",
//       items:
//         props.bill?.items?.map((it) => ({
//           date: toDate(it.date) ?? new Date(),
//           from: it.from,
//           to: it.to,
//           transport: it.transport ?? "",
//           purpose: it.purpose,
//           amount: it.amount,
//         })) ?? [{ date: new Date(), from: "", to: "", transport: "", purpose: "", amount: 0 }],
//       ...defaultsFromBill(props.bill),
//       ...defaultsFromUser,
//     },
//     mode: "onChange",
//   });

//   const { control, handleSubmit, watch } = form;
//   const { fields, append, remove } = useFieldArray({ control, name: "items" });

//   const watchedItems = watch("items");
//   const bill1Total = watchedItems.reduce((acc, current) => acc + (Number(current.amount) || 0), 0);

//   /* --------------- Local state arrays for Bill-2 / Bill-3 --------------- */

//   const [bill2Rows, setBill2Rows] = useState<Bill2Row[]>([
//     {
//       name: "",
//       designation: "",
//       dateFrom: new Date(),
//       dateTo: new Date(),
//       purpose: "",
//       localConv: 0,
//       tripConv: 0,
//       others: 0,
//       advance: 0,
//       remarks: "",
//     },
//   ]);

//   const [bill3Rows, setBill3Rows] = useState<Bill3Row[]>([
//     {
//       name: "",
//       designation: "",
//       dateFrom: new Date(),
//       dateTo: new Date(),
//       purpose: "",
//       food: 0,
//       hotel: 0,
//       others: 0,
//       advance: 0,
//       remarks: "",
//     },
//   ]);

//   /* --------------- Amounts for Bill-2 / Bill-3 --------------- */

//   const bill2Total = bill2Rows.reduce(
//     (sum, r) => sum + (r.localConv || 0) + (r.tripConv || 0) + (r.others || 0),
//     0
//   );

//   const bill3Total = bill3Rows.reduce(
//     (sum, r) => sum + (r.food || 0) + (r.hotel || 0) + (r.others || 0),
//     0
//   );

//   const overallTotal =
//     design === "bill-1" ? bill1Total : design === "bill-2" ? bill2Total : bill3Total;

//   const amountInWords = numberToWords(overallTotal) + " Only";

//   /* --------------- Submit helpers --------------- */

//   const runSubmit = (payload: FormData) => startTransition(() => submitAction(payload));
//   const runSaveDraft = (payload: FormData) => startTransition(() => draftAction(payload));

//   function makeItemsForServer(kind: BillDesign, data: Bill1Values) {
//     if (kind === "bill-1") {
//       // Convert Bill-1 items to plain JSON
//       return data.items.map((item) => ({
//         ...item,
//         date: (toDate(item.date) ?? new Date()).toISOString(),
//       }));
//     }

//     // Bill-2 & Bill-3 → flatten rows into core schema items
//     const rows = kind === "bill-2" ? bill2Rows : bill3Rows;

//     const perRowItems = rows.flatMap((r) => {
//       const base = {
//         date: (toDate(r.dateFrom) ?? new Date()).toISOString(),
//         from: r.name || "-",
//         to: r.designation || "-",
//         purpose:
//           r.purpose +
//           (r.dateFrom && r.dateTo
//             ? ` (${format(toDate(r.dateFrom) ?? new Date(), "dd/MM/yyyy")}–${format(
//                 toDate(r.dateTo) ?? new Date(),
//                 "dd/MM/yyyy"
//               )})`
//             : ""),
//       };

//       const items: any[] = [];

//       if (kind === "bill-2") {
//         const rr = r as Bill2Row;
//         if (rr.localConv > 0)
//           items.push({ ...base, transport: "Local Conveyance", amount: rr.localConv });
//         if (rr.tripConv > 0)
//           items.push({ ...base, transport: "Trip Conveyance", amount: rr.tripConv });
//         if (rr.others > 0) items.push({ ...base, transport: "Others", amount: rr.others });
//       } else {
//         const rr = r as Bill3Row;
//         if (rr.food > 0) items.push({ ...base, transport: "Food", amount: rr.food });
//         if (rr.hotel > 0) items.push({ ...base, transport: "Hotel", amount: rr.hotel });
//         if (rr.others > 0) items.push({ ...base, transport: "Others", amount: rr.others });
//       }

//       // (Optional) record advance in purpose line (0 amount) — we skip to keep totals clean

//       return items;
//     });

//     return perRowItems;
//   }

//   function submitFromDesign(data: Bill1Values, kind: "final" | "draft") {
//     const formData = new FormData();

//     const itemsForServer = makeItemsForServer(design, data);

//     if (data.billId) formData.append("billId", data.billId);
//     formData.append("companyName", data.companyName);
//     formData.append("companyAddress", data.companyAddress);
//     formData.append("employeeId", data.employeeId);
//     formData.append("employeeName", data.employeeName);
//     formData.append("employeeDesignation", data.employeeDesignation ?? "");
//     formData.append("items", JSON.stringify(itemsForServer));
//     formData.append("totalAmount", String(overallTotal));
//     formData.append("amountInWords", amountInWords);

//     if (kind === "final") runSubmit(formData);
//     else runSaveDraft(formData);
//   }

//   const onSubmitFinal = (values: Bill1Values) => submitFromDesign(values, "final");
//   const onSubmitDraft = (values: Bill1Values) => submitFromDesign(values, "draft");

//   /* ---------------- VIEW MODE (read-only, generic) ---------------- */

//   if (isView) {
//     const b = props.bill!;
//     const total = b.items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
//     const words = numberToWords(total) + " Only";

//     return (
//       <div className="rounded-xl border bg-white p-6 shadow-sm">
//         <div className="grid md:grid-cols-2 gap-4 mb-6">
//           <div>
//             <p className="text-xs text-muted-foreground">Company Name</p>
//             <p className="font-medium">{b.companyName}</p>
//           </div>
//           <div>
//             <p className="text-xs text-muted-foreground">Company Address</p>
//             <p className="font-medium">{b.companyAddress}</p>
//           </div>
//           <div>
//             <p className="text-xs text-muted-foreground">Employee Name</p>
//             <p className="font-medium">{b.employeeName}</p>
//           </div>
//           <div>
//             <p className="text-xs text-muted-foreground">Employee ID</p>
//             <p className="font-medium">{b.employeeId}</p>
//           </div>
//           <div className="md:col-span-2">
//             <p className="text-xs text-muted-foreground">Designation</p>
//             <p className="font-medium">{b.employeeDesignation || "-"}</p>
//           </div>
//         </div>

//         <div className="rounded-lg border">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-[50px]">No.</TableHead>
//                 <TableHead className="w-[150px]">Date</TableHead>
//                 <TableHead>From</TableHead>
//                 <TableHead>To</TableHead>
//                 <TableHead>Transport</TableHead>
//                 <TableHead>Purpose</TableHead>
//                 <TableHead className="w-[120px] text-right">Amount</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {b.items.map((it, idx) => (
//                 <TableRow key={it.id ?? idx}>
//                   <TableCell className="p-1 pt-3 font-medium">{idx + 1}</TableCell>
//                   <TableCell className="p-1">
//                     {format(toDate(it.date) ?? new Date(), "PPP")}
//                   </TableCell>
//                   <TableCell className="p-1">{it.from}</TableCell>
//                   <TableCell className="p-1">{it.to}</TableCell>
//                   <TableCell className="p-1">{it.transport || "-"}</TableCell>
//                   <TableCell className="p-1">{it.purpose}</TableCell>
//                   <TableCell className="p-1 text-right">
//                     {new Intl.NumberFormat("en-IN", { style: "currency", currency: "BDT" }).format(
//                       Number(it.amount)
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>

//         <Separator className="my-4" />

//         <div className="flex justify-between items-start">
//           <div>
//             <p className="font-medium">Amount in Words:</p>
//             <p className="text-muted-foreground">{words}</p>
//           </div>
//           <div className="w-full max-w-xs space-y-2">
//             <div className="flex justify-between items-center text-xl font-bold">
//               <span>Total</span>
//               <span>
//                 {new Intl.NumberFormat("en-IN", { style: "currency", currency: "BDT" }).format(total)}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   /* ---------------- CREATE / EDIT (with Bill Type selector) ---------------- */

//   return (
//     <FormProvider {...form}>
//       <form
//         onSubmit={handleSubmit(onSubmitFinal)}
//         className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
//       >
//         <FormField control={form.control} name="billId" render={({ field }) => <input type="hidden" {...field} />} />

//         {/* Bill type + shared header fields */}
//         <div className="grid md:grid-cols-4 gap-4">
//           <div className="md:col-span-2">
//             <FormLabel>Bill Type</FormLabel>
//             <Select value={design} onValueChange={(v: BillDesign) => setDesign(v)}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select bill type" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="bill-1">Bill-1 (Standard)</SelectItem>
//                 <SelectItem value="bill-2">Bill-2 (Conveyance Sheet)</SelectItem>
//                 <SelectItem value="bill-3">Bill-3 (Food &amp; Hotel)</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <FormField
//             control={form.control}
//             name="companyName"
//             render={({ field }) => (
//               <FormItem className="md:col-span-2">
//                 <FormLabel>Company Name</FormLabel>
//                 <FormControl>
//                   <Input placeholder="e.g. Networld Bangladesh PLC" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="companyAddress"
//             render={({ field }) => (
//               <FormItem className="md:col-span-4">
//                 <FormLabel>Company Address</FormLabel>
//                 <FormControl>
//                   <Input placeholder="Address" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="employeeName"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Employee Name</FormLabel>
//                 <FormControl>
//                   <Input {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="employeeId"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Employee ID</FormLabel>
//                 <FormControl>
//                   <Input {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="employeeDesignation"
//             render={({ field }) => (
//               <FormItem className="md:col-span-2">
//                 <FormLabel>Designation</FormLabel>
//                 <FormControl>
//                   <Input placeholder="e.g. Assistant Engineer" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         </div>

//         {/* ========== BODY ========== */}
//         {design === "bill-1" && (
//           <Bill1Table
//             fields={fields}
//             control={form.control}
//             remove={remove}
//             append={() =>
//               append({ date: new Date(), from: "", to: "", transport: "", purpose: "", amount: 0 })
//             }
//           />
//         )}

//         {design === "bill-2" && (
//           <Bill2Table rows={bill2Rows} setRows={setBill2Rows} />
//         )}

//         {design === "bill-3" && (
//           <Bill3Table rows={bill3Rows} setRows={setBill3Rows} />
//         )}

//         <Separator />

//         <div className="flex justify-between items-start">
//           <div>
//             <p className="font-medium">Amount in Words:</p>
//             <p className="text-muted-foreground">{amountInWords}</p>
//           </div>
//           <div className="w-full max-w-xs space-y-2">
//             <div className="flex justify-between items-center text-xl font-bold">
//               <span>Total</span>
//               <span>
//                 {new Intl.NumberFormat("en-IN", { style: "currency", currency: "BDT" }).format(
//                   overallTotal
//                 )}
//               </span>
//             </div>
//           </div>
//         </div>

//         <Separator />

//         <div className="mt-6 space-y-4">
//           {(submitState?.error || draftState?.error) && (
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertTitle>Error</AlertTitle>
//               <AlertDescription>{submitState?.error || draftState?.error}</AlertDescription>
//             </Alert>
//           )}
//           <div className="flex flex-col gap-3 sm:flex-row">
//             <Button type="button" variant="secondary" onClick={handleSubmit(onSubmitDraft)} disabled={isPending}>
//               Save Draft
//             </Button>
//             <SubmitButton isPending={isPending}>Submit Bill</SubmitButton>
//           </div>
//         </div>
//       </form>
//     </FormProvider>
//   );
// }

// /* ===================== SUB-COMPONENTS ===================== */

// /* ---- Bill-1 table (standard) ---- */
// function Bill1Table({
//   fields,
//   control,
//   remove,
//   append,
// }: {
//   fields: any[];
//   control: any;
//   remove: (index: number) => void;
//   append: () => void;
// }) {
//   return (
//     <>
//       <div className="rounded-lg border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="w-[44px]">#</TableHead>
//               <TableHead className="w-[160px]">Date</TableHead>
//               <TableHead>From</TableHead>
//               <TableHead>To</TableHead>
//               <TableHead>Transport</TableHead>
//               <TableHead>Purpose</TableHead>
//               <TableHead className="w-[120px] text-right">Amount</TableHead>
//               <TableHead className="w-[46px]" />
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {fields.map((field, index) => {
//               return (
//                 <TableRow key={field?.id ?? index} className="align-top">
//                   <TableCell className="p-1 pt-3 font-medium">{index + 1}</TableCell>
//                   <TableCell className="p-1">
//                     <FormField
//                       control={control}
//                       name={`items.${index}.date`}
//                       render={({ field }) => {
//                         const safe = toDate(field.value) ?? new Date();
//                         return (
//                           <FormItem>
//                             <Popover>
//                               <PopoverTrigger asChild>
//                                 <FormControl>
//                                   <Button
//                                     type="button"
//                                     variant="outline"
//                                     className={cn("w-full justify-start pl-3 text-left font-normal")}
//                                   >
//                                     {format(safe, "PPP")}
//                                     <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                                   </Button>
//                                 </FormControl>
//                               </PopoverTrigger>
//                               <PopoverContent className="w-auto p-0" align="start">
//                                 <Calendar
//                                   mode="single"
//                                   selected={safe}
//                                   onSelect={(d) => field.onChange(d ?? safe)}
//                                   disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
//                                   initialFocus
//                                 />
//                               </PopoverContent>
//                             </Popover>
//                             <FormMessage />
//                           </FormItem>
//                         );
//                       }}
//                     />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <FormField
//                       control={control}
//                       name={`items.${index}.from`}
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormControl>
//                             <Input placeholder="e.g. Office" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <FormField
//                       control={control}
//                       name={`items.${index}.to`}
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormControl>
//                             <Input placeholder="e.g. Client Office" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <FormField
//                       control={control}
//                       name={`items.${index}.transport`}
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormControl>
//                             <Input placeholder="e.g. Pathao, Bus" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <FormField
//                       control={control}
//                       name={`items.${index}.purpose`}
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormControl>
//                             <Input placeholder="e.g. AC Call at PM" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <FormField
//                       control={control}
//                       name={`items.${index}.amount`}
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormControl>
//                             <Input type="number" step="0.01" placeholder="0.00" className="text-right" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </TableCell>
//                   <TableCell className="p-1 pt-3 text-right">
//                     {fields.length > 1 && (
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="icon"
//                         className="text-destructive hover:text-destructive"
//                         onClick={() => remove(index)}
//                         aria-label={`Remove row ${index + 1}`}
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               );
//             })}
//           </TableBody>
//         </Table>
//       </div>

//       <Button type="button" variant="outline" onClick={append}>
//         <PlusCircle className="mr-2 h-4 w-4" />
//         Add Item
//       </Button>
//     </>
//   );
// }

// /* ---- Bill-2 (Conveyance Sheet) ---- */
// function Bill2Table({
//   rows,
//   setRows,
// }: {
//   rows: Bill2Row[];
//   setRows: (rows: Bill2Row[]) => void;
// }) {
//   const addRow = () =>
//     setRows([
//       ...rows,
//       {
//         name: "",
//         designation: "",
//         dateFrom: new Date(),
//         dateTo: new Date(),
//         purpose: "",
//         localConv: 0,
//         tripConv: 0,
//         others: 0,
//         advance: 0,
//         remarks: "",
//       },
//     ]);

//   const update = (i: number, patch: Partial<Bill2Row>) => {
//     const next = [...rows];
//     next[i] = { ...next[i], ...patch };
//     setRows(next);
//   };
//   const remove = (i: number) => setRows(rows.filter((_, idx) => idx !== i));

//   return (
//     <>
//       <div className="rounded-lg border overflow-x-auto">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="w-[44px]">#</TableHead>
//               <TableHead className="min-w-[160px]">Name</TableHead>
//               <TableHead className="min-w-[140px]">Designation</TableHead>
//               <TableHead className="min-w-[150px]">Date From</TableHead>
//               <TableHead className="min-w-[150px]">Date To</TableHead>
//               <TableHead className="min-w-[180px]">Purpose</TableHead>
//               <TableHead className="min-w-[130px] text-right">Local Conv.</TableHead>
//               <TableHead className="min-w-[130px] text-right">Trip Conv.</TableHead>
//               <TableHead className="min-w-[120px] text-right">Others</TableHead>
//               <TableHead className="min-w-[120px] text-right">Advance</TableHead>
//               <TableHead className="min-w-[120px] text-right">Total</TableHead>
//               <TableHead className="min-w-[120px] text-right">Net Payable</TableHead>
//               <TableHead className="min-w-[160px]">Remarks</TableHead>
//               <TableHead className="w-[46px]" />
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {rows.map((r, i) => {
//               const total = (r.localConv || 0) + (r.tripConv || 0) + (r.others || 0);
//               const net = total - (r.advance || 0);
//               const df = toDate(r.dateFrom) ?? new Date();
//               const dt = toDate(r.dateTo) ?? new Date();

//               return (
//                 <TableRow key={i} className="align-top">
//                   <TableCell className="pt-3">{i + 1}</TableCell>
//                   <TableCell className="p-1">
//                     <Input value={r.name} onChange={(e) => update(i, { name: e.target.value })} />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <Input
//                       value={r.designation}
//                       onChange={(e) => update(i, { designation: e.target.value })}
//                     />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <DateCell value={df} onChange={(d) => update(i, { dateFrom: d })} />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <DateCell value={dt} onChange={(d) => update(i, { dateTo: d })} />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <Input value={r.purpose} onChange={(e) => update(i, { purpose: e.target.value })} />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <NumInput value={r.localConv} onChange={(v) => update(i, { localConv: v })} />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <NumInput value={r.tripConv} onChange={(v) => update(i, { tripConv: v })} />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <NumInput value={r.others} onChange={(v) => update(i, { others: v })} />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <NumInput value={r.advance} onChange={(v) => update(i, { advance: v })} />
//                   </TableCell>
//                   <TableCell className="p-1 text-right">{total.toFixed(2)}</TableCell>
//                   <TableCell className="p-1 text-right">{net.toFixed(2)}</TableCell>
//                   <TableCell className="p-1">
//                     <Input value={r.remarks} onChange={(e) => update(i, { remarks: e.target.value })} />
//                   </TableCell>
//                   <TableCell className="p-1 pt-3 text-right">
//                     {rows.length > 1 && (
//                       <Button type="button" variant="ghost" size="icon" className="text-destructive"
//                         onClick={() => remove(i)}>
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               );
//             })}
//           </TableBody>
//         </Table>
//       </div>

//       <Button type="button" variant="outline" onClick={addRow}>
//         <PlusCircle className="mr-2 h-4 w-4" />
//         Add Row
//       </Button>
//     </>
//   );
// }

// /* ---- Bill-3 (Food & Hotel) ---- */
// function Bill3Table({
//   rows,
//   setRows,
// }: {
//   rows: Bill3Row[];
//   setRows: (rows: Bill3Row[]) => void;
// }) {
//   const addRow = () =>
//     setRows([
//       ...rows,
//       {
//         name: "",
//         designation: "",
//         dateFrom: new Date(),
//         dateTo: new Date(),
//         purpose: "",
//         food: 0,
//         hotel: 0,
//         others: 0,
//         advance: 0,
//         remarks: "",
//       },
//     ]);

//   const update = (i: number, patch: Partial<Bill3Row>) => {
//     const next = [...rows];
//     next[i] = { ...next[i], ...patch };
//     setRows(next);
//   };
//   const remove = (i: number) => setRows(rows.filter((_, idx) => idx !== i));

//   return (
//     <>
//       <div className="rounded-lg border overflow-x-auto">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="w-[44px]">#</TableHead>
//               <TableHead className="min-w-[160px]">Name</TableHead>
//               <TableHead className="min-w-[140px]">Designation</TableHead>
//               <TableHead className="min-w-[150px]">Date From</TableHead>
//               <TableHead className="min-w-[150px]">Date To</TableHead>
//               <TableHead className="min-w-[180px]">Purpose</TableHead>
//               <TableHead className="min-w-[110px] text-right">Food</TableHead>
//               <TableHead className="min-w-[110px] text-right">Hotel</TableHead>
//               <TableHead className="min-w-[110px] text-right">Others</TableHead>
//               <TableHead className="min-w-[120px] text-right">Advance</TableHead>
//               <TableHead className="min-w-[120px] text-right">Total</TableHead>
//               <TableHead className="min-w-[120px] text-right">Net Payable</TableHead>
//               <TableHead className="min-w-[160px]">Remarks</TableHead>
//               <TableHead className="w-[46px]" />
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {rows.map((r, i) => {
//               const total = (r.food || 0) + (r.hotel || 0) + (r.others || 0);
//               const net = total - (r.advance || 0);
//               const df = toDate(r.dateFrom) ?? new Date();
//               const dt = toDate(r.dateTo) ?? new Date();

//               return (
//                 <TableRow key={i} className="align-top">
//                   <TableCell className="pt-3">{i + 1}</TableCell>
//                   <TableCell className="p-1">
//                     <Input value={r.name} onChange={(e) => update(i, { name: e.target.value })} />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <Input
//                       value={r.designation}
//                       onChange={(e) => update(i, { designation: e.target.value })}
//                     />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <DateCell value={df} onChange={(d) => update(i, { dateFrom: d })} />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <DateCell value={dt} onChange={(d) => update(i, { dateTo: d })} />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <Input value={r.purpose} onChange={(e) => update(i, { purpose: e.target.value })} />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <NumInput value={r.food} onChange={(v) => update(i, { food: v })} />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <NumInput value={r.hotel} onChange={(v) => update(i, { hotel: v })} />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <NumInput value={r.others} onChange={(v) => update(i, { others: v })} />
//                   </TableCell>
//                   <TableCell className="p-1">
//                     <NumInput value={r.advance} onChange={(v) => update(i, { advance: v })} />
//                   </TableCell>
//                   <TableCell className="p-1 text-right">{total.toFixed(2)}</TableCell>
//                   <TableCell className="p-1 text-right">{net.toFixed(2)}</TableCell>
//                   <TableCell className="p-1">
//                     <Input value={r.remarks} onChange={(e) => update(i, { remarks: e.target.value })} />
//                   </TableCell>
//                   <TableCell className="p-1 pt-3 text-right">
//                     {rows.length > 1 && (
//                       <Button type="button" variant="ghost" size="icon" className="text-destructive"
//                         onClick={() => remove(i)}>
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               );
//             })}
//           </TableBody>
//         </Table>
//       </div>

//       <Button type="button" variant="outline" onClick={addRow}>
//         <PlusCircle className="mr-2 h-4 w-4" />
//         Add Row
//       </Button>
//     </>
//   );
// }

// /* ---- Small helpers ---- */

// function NumInput({
//   value,
//   onChange,
// }: {
//   value: number;
//   onChange: (v: number) => void;
// }) {
//   return (
//     <Input
//       type="number"
//       step="0.01"
//       className="text-right"
//       value={Number.isFinite(value) ? value : 0}
//       onChange={(e) => onChange(parseFloat(e.target.value || "0"))}
//     />
//   );
// }

// function DateCell({
//   value,
//   onChange,
// }: {
//   value: Date;
//   onChange: (d: Date) => void;
// }) {
//   const safe = toDate(value) ?? new Date();
//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <Button type="button" variant="outline" className="w-full justify-start pl-3 text-left font-normal">
//           {format(safe, "PPP")}
//           <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-auto p-0" align="start">
//         <Calendar
//           mode="single"
//           selected={safe}
//           onSelect={(d) => onChange(d ?? safe)}
//           disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
//           initialFocus
//         />
//       </PopoverContent>
//     </Popover>
//   );
// }

// src/components/bills/bill-form.tsx
"use client";

import { useActionState, useTransition } from "react";
import * as React from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn, numberToWords } from "@/lib/utils";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  PlusCircle,
  Trash2,
} from "lucide-react";

import { submitBill, saveDraft } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { User, BillStatus } from "@/lib/types";

/* ---------- Types for VIEW mode (unchanged) ---------- */
export type BillViewItem = {
  id: string;
  date: string; // ISO
  from: string;
  to: string;
  transport?: string | null;
  purpose: string;
  amount: number;
};

export type BillViewData = {
  id: string;
  companyName: string;
  companyAddress: string;
  employeeId: string;
  employeeName: string;
  employeeDesignation?: string | null;
  amount: number;
  amountInWords: string;
  status: BillStatus;
  items: BillViewItem[];
};

/* ---------- Validation Schemas ---------- */

const bill1ItemSchema = z.object({
  date: z.date({ required_error: "A date is required." }),
  from: z.string().min(1, "From is required."),
  to: z.string().min(1, "To is required."),
  transport: z.string().optional(),
  purpose: z.string().min(1, "Purpose is required."),
  amount: z.coerce.number().min(0.01, "Amount must be > 0"),
});

const bill23ItemSchema = z.object({
  name: z.string().min(1, "Name is required."),
  designation: z.string().min(1, "Designation is required."),
  dateFrom: z.date({ required_error: "From date required." }),
  dateTo: z.date({ required_error: "To date required." }),
  purpose: z.string().min(1, "Purpose is required."),
  localConv: z.coerce.number().min(0, "Local Conv must be ≥ 0"),
  tripConv: z.coerce.number().min(0, "Trip Conv must be ≥ 0"),
  others: z.coerce.number().min(0, "Others must be ≥ 0"),
  advance: z.coerce.number().min(0, "Advance must be ≥ 0"),
  total: z.coerce.number().min(0, "Total must be ≥ 0"),
  netPayable: z.coerce.number().min(0, "Net Payable must be ≥ 0"),
  remarks: z.string().optional(),
});

const baseCommon = {
  billId: z.string().optional(),
  companyName: z.string().min(1, "Company name is required."),
  companyAddress: z.string().min(1, "Company address is required."),
  employeeId: z.string().min(1, "Employee ID is required."),
  employeeName: z.string().min(1, "Employee name is required."),
  employeeDesignation: z.string().optional(),
};

const schema = z.discriminatedUnion("format", [
  z.object({
    format: z.literal("bill-1"),
    ...baseCommon,
    items1: z.array(bill1ItemSchema).min(1, "Add at least one row."),
    items23: z.never().optional(),
  }),
  z.object({
    format: z.literal("bill-2"),
    ...baseCommon,
    items23: z.array(bill23ItemSchema).min(1, "Add at least one row."),
    items1: z.never().optional(),
  }),
  z.object({
    format: z.literal("bill-3"),
    ...baseCommon,
    items23: z.array(bill23ItemSchema).min(1, "Add at least one row."),
    items1: z.never().optional(),
  }),
]);

type FormValues = z.infer<typeof schema>;

type Mode = "create" | "edit" | "view";

type Props =
  | { mode?: Extract<Mode, "create" | "edit">; user: User; bill?: BillViewData }
  | { mode: "view"; bill: BillViewData; user?: User };

/* ---------- Small helpers ---------- */

function moneyBDT(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "BDT" }).format(n || 0);
}

function SubmitButton({
  isPending,
  children,
  disabled,
}: {
  isPending: boolean;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={disabled || isPending}>
      {isPending ? "Working..." : children}
    </Button>
  );
}

/* =======================================================
   Component
======================================================= */

export function BillForm(props: Props) {
  const mode: Mode = props.mode ?? "create";
  const isView = mode === "view";

  const [submitState, submitAction] = useActionState(submitBill, undefined);
  const [draftState, draftAction] = useActionState(saveDraft, undefined);
  const [isPending, startTransition] = useTransition();

  // Defaults
  const defaultsFromBill = (b: BillViewData | undefined) =>
    b
      ? ({
          billId: b.id,
          companyName: b.companyName,
          companyAddress: b.companyAddress,
          employeeId: b.employeeId,
          employeeName: b.employeeName,
          employeeDesignation: b.employeeDesignation ?? "",
        } as Partial<FormValues>)
      : {};

  const defaultsFromUser =
    "user" in props && props.user
      ? ({
          employeeId: props.user.id,
          employeeName: props.user.name,
          employeeDesignation: props.user.designation ?? "",
        } as Partial<FormValues>)
      : {};

  // If viewing an existing bill with items, default to Bill-1 view (read-only). For create/edit, default to bill-1.
  const defaultFormat: "bill-1" | "bill-2" | "bill-3" = isView ? "bill-1" : "bill-1";

  // If viewing existing bill, map db items to items1 rows
  const viewItems1 =
    props.bill?.items?.map((it) => ({
      date: new Date(it.date),
      from: it.from,
      to: it.to,
      transport: it.transport ?? "",
      purpose: it.purpose,
      amount: it.amount,
    })) ?? [{ date: new Date(), from: "", to: "", transport: "", purpose: "", amount: 0 }];

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      format: defaultFormat,
      companyName: props.bill?.companyName ?? "Networld Bangladesh Limited",
      companyAddress:
        props.bill?.companyAddress ??
        "57 & 57/A, Uday Tower, (4th Floor) Gulshan 1, Gulshan Avenue, 1212 Dhaka",
      items1: viewItems1,
      items23: [
        {
          name: props.user?.name ?? "",
          designation: props.user?.designation ?? "",
          dateFrom: new Date(),
          dateTo: new Date(),
          purpose: "",
          localConv: 0,
          tripConv: 0,
          others: 0,
          advance: 0,
          total: 0,
          netPayable: 0,
          remarks: "",
        },
      ],
      ...defaultsFromBill(props.bill),
      ...defaultsFromUser,
    } as any,
    mode: "onChange",
  });

  const formatWatch = form.watch("format");

  // field arrays for both shapes
  const items1FA = useFieldArray({ control: form.control, name: "items1" as any });
  const items23FA = useFieldArray({ control: form.control, name: "items23" as any });

  // totals per format (for UI & server)
  const total1 = (form.watch("items1") || []).reduce((s, it: any) => s + (Number(it?.amount) || 0), 0);
  const total23 = (form.watch("items23") || []).reduce((s, it: any) => s + (Number(it?.netPayable) || 0), 0);
  const overallTotal = formatWatch === "bill-1" ? total1 : total23;
  const amountInWords = numberToWords(overallTotal) + " Only";

  // Submit helpers
  const runSubmit = (fd: FormData) => startTransition(() => submitAction(fd));
  const runSaveDraft = (fd: FormData) => startTransition(() => draftAction(fd));

  function buildFormDataForServer(data: FormValues, submitKind: "final" | "draft") {
    const fd = new FormData();

    // common fields
    if (data.billId) fd.append("billId", data.billId);
    fd.append("companyName", data.companyName);
    fd.append("companyAddress", data.companyAddress);
    fd.append("employeeId", data.employeeId);
    fd.append("employeeName", data.employeeName);
    fd.append("employeeDesignation", data.employeeDesignation ?? "");

    // format → server items
    if (data.format === "bill-1") {
      const itemsForServer = (data.items1 || []).map((row) => ({
        date: row.date.toISOString(),
        from: row.from,
        to: row.to,
        transport: row.transport || "",
        purpose: row.purpose,
        amount: Number(row.amount || 0),
      }));

      fd.append("items", JSON.stringify(itemsForServer));
      fd.append("totalAmount", String(total1));
    } else {
      // bill-2 and bill-3: pack extra columns into purpose; use netPayable as amount
      const itemsForServer = (data.items23 || []).map((row) => {
        const purposePacked =
          `${row.purpose} | ` +
          `DateFrom: ${format(row.dateFrom, "yyyy-MM-dd")} - DateTo: ${format(row.dateTo, "yyyy-MM-dd")} | ` +
          `LocalConv: ${row.localConv} | TripConv: ${row.tripConv} | Others: ${row.others} | ` +
          `Advance: ${row.advance} | Total: ${row.total} | NetPayable: ${row.netPayable}` +
          (row.remarks ? ` | Remarks: ${row.remarks}` : "");

        return {
          date: row.dateFrom.toISOString(), // keep one ISO date; full range is in purposePacked
          from: row.name,
          to: row.designation,
          transport: row.remarks || "",
          purpose: purposePacked,
          amount: Number(row.netPayable || 0),
        };
      });

      fd.append("items", JSON.stringify(itemsForServer));
      fd.append("totalAmount", String(total23));
    }

    fd.append("amountInWords", amountInWords);

    return fd;
  }

  const onSubmitFinal = (data: FormValues) => {
    const fd = buildFormDataForServer(data, "final");
    runSubmit(fd);
  };
  const onSubmitDraft = (data: FormValues) => {
    const fd = buildFormDataForServer(data, "draft");
    runSaveDraft(fd);
  };

  /* ================= VIEW MODE ================= */
  if (isView) {
    const b = props.bill!;
    const total = b.items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
    const words = numberToWords(total) + " Only";

    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-muted-foreground">Company Name</p>
            <p className="font-medium">{b.companyName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Company Address</p>
            <p className="font-medium">{b.companyAddress}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Employee Name</p>
            <p className="font-medium">{b.employeeName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Employee ID</p>
            <p className="font-medium">{b.employeeId}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-muted-foreground">Designation</p>
            <p className="font-medium">{b.employeeDesignation || "-"}</p>
          </div>
        </div>

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
                <TableHead className="w-[120px] text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {b.items.map((it, idx) => (
                <TableRow key={it.id ?? idx}>
                  <TableCell className="p-1 pt-3 font-medium">{idx + 1}</TableCell>
                  <TableCell className="p-1">{format(new Date(it.date), "PPP")}</TableCell>
                  <TableCell className="p-1">{it.from}</TableCell>
                  <TableCell className="p-1">{it.to}</TableCell>
                  <TableCell className="p-1">{it.transport || "-"}</TableCell>
                  <TableCell className="p-1">{it.purpose}</TableCell>
                  <TableCell className="p-1 text-right">{moneyBDT(Number(it.amount))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">Amount in Words:</p>
            <p className="text-muted-foreground">{words}</p>
          </div>
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total</span>
              <span>{moneyBDT(total)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================= CREATE / EDIT ================= */

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmitFinal)}
        className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
      >
        <FormField control={form.control} name="billId" render={({ field }) => <input type="hidden" {...field} />} />

        {/* Company + Employee */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Networld Bangladesh Limited" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="companyAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Address</FormLabel>
                <FormControl>
                  <Input placeholder="Address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="employeeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee ID</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="employeeDesignation"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Designation</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Format selector */}
        <FormField
          control={form.control}
          name="format"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bill Format</FormLabel>
              <Select
                onValueChange={(v) => field.onChange(v as "bill-1" | "bill-2" | "bill-3")}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bill format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bill-1">Bill-1 (standard)</SelectItem>
                  <SelectItem value="bill-2">Bill-2 (tabular: Local/Trip/Others/Advance)</SelectItem>
                  <SelectItem value="bill-3">Bill-3 (tabular variant)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Items table by format */}
        {formatWatch === "bill-1" ? (
          <Bill1Rows itemsFA={items1FA} control={form.control} />
        ) : (
          <Bill23Rows itemsFA={items23FA} control={form.control} />
        )}

        {/* Totals */}
        <Separator />
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">Amount in Words:</p>
            <p className="text-muted-foreground">{amountInWords}</p>
          </div>
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total</span>
              <span>{moneyBDT(overallTotal)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <Separator />
        <div className="mt-6 space-y-4">
          {(submitState?.error || draftState?.error) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{submitState?.error || draftState?.error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              onClick={form.handleSubmit(onSubmitDraft)}
              disabled={isPending}
            >
              Save Draft
            </Button>
            <SubmitButton isPending={isPending}>Submit Bill</SubmitButton>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

/* =======================================================
   Rows for Bill-1
======================================================= */
function Bill1Rows({
  itemsFA,
  control,
}: {
  itemsFA: ReturnType<typeof useFieldArray<any>>;
  control: any;
}) {
  const { fields, append, remove } = itemsFA;

  return (
    <>
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
              <TableHead className="w-[120px] text-right">Amount</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field: any, index: number) => (
              <TableRow key={field.id ?? index} className="align-top">
                <TableCell className="p-1 pt-3 font-medium">{index + 1}</TableCell>
                <TableCell className="p-1">
                  <FormField
                    control={control}
                    name={`items1.${index}.date`}
                    render={({ field }) => (
                      <FormItem>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  "w-full justify-start pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell className="p-1">
                  <FormField
                    control={control}
                    name={`items1.${index}.from`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="From" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell className="p-1">
                  <FormField
                    control={control}
                    name={`items1.${index}.to`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="To" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell className="p-1">
                  <FormField
                    control={control}
                    name={`items1.${index}.transport`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Transport" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell className="p-1">
                  <FormField
                    control={control}
                    name={`items1.${index}.purpose`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Purpose" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell className="p-1">
                  <FormField
                    control={control}
                    name={`items1.${index}.amount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" className="text-right" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell className="p-1 pt-3 text-right">
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => remove(index)}
                      aria-label={`Remove row ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({ date: new Date(), from: "", to: "", transport: "", purpose: "", amount: 0 })
        }
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Item
      </Button>
    </>
  );
}

/* =======================================================
   Rows for Bill-2 / Bill-3 (same columns)
======================================================= */
function Bill23Rows({
  itemsFA,
  control,
}: {
  itemsFA: ReturnType<typeof useFieldArray<any>>;
  control: any;
}) {
  const { fields, append, remove } = itemsFA;

  return (
    <>
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">#</TableHead>
              <TableHead className="min-w-[140px]">Name</TableHead>
              <TableHead className="min-w-[140px]">Designation</TableHead>
              <TableHead className="min-w-[140px]">Date From</TableHead>
              <TableHead className="min-w-[140px]">Date To</TableHead>
              <TableHead className="min-w-[160px]">Purpose</TableHead>
              <TableHead className="min-w-[120px] text-right">Local Conv.</TableHead>
              <TableHead className="min-w-[120px] text-right">Trip Conv.</TableHead>
              <TableHead className="min-w-[120px] text-right">Others</TableHead>
              <TableHead className="min-w-[120px] text-right">Advance</TableHead>
              <TableHead className="min-w-[120px] text-right">Total</TableHead>
              <TableHead className="min-w-[140px] text-right">Net Payable</TableHead>
              <TableHead className="min-w-[160px]">Remarks</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((f: any, index: number) => (
              <TableRow key={f.id ?? index} className="align-top">
                <TableCell className="p-1 pt-3 font-medium">{index + 1}</TableCell>

                <TableCell className="p-1">
                  <FormField
                    control={control}
                    name={`items23.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>

                <TableCell className="p-1">
                  <FormField
                    control={control}
                    name={`items23.${index}.designation`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Designation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>

                <TableCell className="p-1">
                  <FormField
                    control={control}
                    name={`items23.${index}.dateFrom`}
                    render={({ field }) => (
                      <FormItem>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  "w-full justify-start pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>From</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>

                <TableCell className="p-1">
                  <FormField
                    control={control}
                    name={`items23.${index}.dateTo`}
                    render={({ field }) => (
                      <FormItem>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  "w-full justify-start pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>To</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>

                <TableCell className="p-1">
                  <FormField
                    control={control}
                    name={`items23.${index}.purpose`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Purpose" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>

                {[
                  { key: "localConv", ph: "0.00" },
                  { key: "tripConv", ph: "0.00" },
                  { key: "others", ph: "0.00" },
                  { key: "advance", ph: "0.00" },
                  { key: "total", ph: "0.00" },
                  { key: "netPayable", ph: "0.00" },
                ].map((col) => (
                  <TableCell className="p-1" key={col.key}>
                    <FormField
                      control={control}
                      name={`items23.${index}.${col.key}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder={col.ph} className="text-right" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                ))}

                <TableCell className="p-1">
                  <FormField
                    control={control}
                    name={`items23.${index}.remarks`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Remarks" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TableCell>

                <TableCell className="p-1 pt-3 text-right">
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => remove(index)}
                      aria-label={`Remove row ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({
            name: "",
            designation: "",
            dateFrom: new Date(),
            dateTo: new Date(),
            purpose: "",
            localConv: 0,
            tripConv: 0,
            others: 0,
            advance: 0,
            total: 0,
            netPayable: 0,
            remarks: "",
          })
        }
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Row
      </Button>
    </>
  );
}
