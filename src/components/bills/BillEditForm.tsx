// src/components/bills/BillEditForm.tsx
"use client";

import * as React from "react";
import { saveDraft, submitBill } from "@/lib/actions";

type BillItem = {
  id: string;
  date: string | Date;
  from: string;
  to: string;
  transport: string | null;
  purpose: string;
  amount: number;
  attachmentUrl?: string | null;
};

type Bill = {
  id: string;
  companyName: string;
  companyAddress: string;
  amount: number | null;
  amountInWords: string | null;
  items: BillItem[];
};

export default function BillEditForm({ bill }: { bill: Bill }) {
  // If you DON’T want to touch rows from this page, leave this OFF.
  // Turning it ON will include current DB rows as JSON in the POST (“items”),
  // which will replace DB rows.
  const [includeRows, setIncludeRows] = React.useState(false);

  const itemsPayload = React.useMemo(
    () =>
      (bill.items || []).map((it) => ({
        date:
          it.date instanceof Date
            ? it.date.toISOString()
            : new Date(it.date).toISOString(),
        from: it.from ?? "",
        to: it.to ?? "",
        transport: it.transport ?? undefined,
        purpose: it.purpose ?? "",
        amount: Number(it.amount ?? 0),
        attachmentUrl: it.attachmentUrl ?? null,
      })),
    [bill.items]
  );

  const calculatedTotal = React.useMemo(
    () => itemsPayload.reduce((s, r) => s + (Number(r.amount) || 0), 0),
    [itemsPayload]
  );

  return (
    <form className="max-w-2xl space-y-4">
      {/* 🔑 IMPORTANT: this makes it an EDIT, not a NEW draft */}
      <input type="hidden" name="billId" value={bill.id} />

      <div className="grid gap-2">
        <label className="text-sm font-medium">Company Name</label>
        <input
          name="companyName"
          defaultValue={bill.companyName}
          className="rounded border p-2"
          required
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Company Address</label>
        <textarea
          name="companyAddress"
          defaultValue={bill.companyAddress}
          className="rounded border p-2"
          rows={3}
          required
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Amount in Words</label>
        <input
          name="amountInWords"
          defaultValue={bill.amountInWords ?? ""}
          className="rounded border p-2"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Total Amount</label>
        <input
          type="number"
          step="0.01"
          name="totalAmount"
          defaultValue={bill.amount ?? calculatedTotal}
          className="rounded border p-2"
          required
        />
      </div>

      {/* ✅ Only include rows if you REALLY want to replace DB rows */}
      <div className="flex items-center gap-2 pt-2">
        <input
          id="includeRows"
          type="checkbox"
          checked={includeRows}
          onChange={(e) => setIncludeRows(e.target.checked)}
        />
        <label htmlFor="includeRows">
          Include current line items in this update (will replace DB rows)
        </label>
      </div>

      {includeRows && (
        <input
          type="hidden"
          name="items"
          value={JSON.stringify(itemsPayload)}
        />
      )}

      {/* Optional: formatType (defaults to BILL1 on server anyway) */}
      <input type="hidden" name="formatType" value="BILL1" />

      <div className="flex gap-3 pt-4">
        {/* Save as Draft */}
        <button
          type="submit"
          formAction={saveDraft}
          className="rounded bg-gray-900 px-4 py-2 text-white"
        >
          Save draft
        </button>

        {/* Submit */}
        <button
          type="submit"
          formAction={submitBill}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
