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
    <form className="w-full max-w-2xl space-y-4">
      <input type="hidden" name="billId" value={bill.id} />

      <div className="grid gap-2">
        <label className="text-sm font-medium">Company Name</label>
        <input
          name="companyName"
          defaultValue={bill.companyName}
          className="w-full rounded border p-2"
          required
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Company Address</label>
        <textarea
          name="companyAddress"
          defaultValue={bill.companyAddress}
          className="w-full rounded border p-2"
          rows={3}
          required
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Amount in Words</label>
        <input
          name="amountInWords"
          defaultValue={bill.amountInWords ?? ""}
          className="w-full rounded border p-2"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Total Amount</label>
        <input
          type="number"
          step="0.01"
          name="totalAmount"
          defaultValue={bill.amount ?? calculatedTotal}
          className="w-full rounded border p-2"
          required
        />
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input
          id="includeRows"
          type="checkbox"
          checked={includeRows}
          onChange={(e) => setIncludeRows(e.target.checked)}
        />
        <label htmlFor="includeRows" className="text-sm">
          Include current line items in this update (will replace DB rows)
        </label>
      </div>

      {includeRows && (
        <>
          <input
            type="hidden"
            name="items"
            value={JSON.stringify(itemsPayload)}
          />

          {/* Only this table area will scroll horizontally */}
          <div className="w-full overflow-hidden rounded-lg border">
            <div className="w-full overflow-x-auto">
              <table className="min-w-[900px] w-full border-collapse text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-3 py-2 text-left">Date</th>
                    <th className="border px-3 py-2 text-left">From</th>
                    <th className="border px-3 py-2 text-left">To</th>
                    <th className="border px-3 py-2 text-left">Transport</th>
                    <th className="border px-3 py-2 text-left">Purpose</th>
                    <th className="border px-3 py-2 text-right">Amount</th>
                    <th className="border px-3 py-2 text-left">Attachment</th>
                  </tr>
                </thead>

                <tbody>
                  {itemsPayload.map((item, index) => (
                    <tr key={index}>
                      <td className="border px-3 py-2 whitespace-nowrap">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="border px-3 py-2 whitespace-nowrap">
                        {item.from}
                      </td>
                      <td className="border px-3 py-2 whitespace-nowrap">
                        {item.to}
                      </td>
                      <td className="border px-3 py-2 whitespace-nowrap">
                        {item.transport ?? "-"}
                      </td>
                      <td className="border px-3 py-2 min-w-[250px]">
                        {item.purpose}
                      </td>
                      <td className="border px-3 py-2 text-right whitespace-nowrap">
                        {Number(item.amount).toFixed(2)}
                      </td>
                      <td className="border px-3 py-2 whitespace-nowrap">
                        {item.attachmentUrl ? (
                          <a
                            href={item.attachmentUrl}
                            target="_blank"
                            className="text-blue-600 underline"
                          >
                            View
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <input type="hidden" name="formatType" value="BILL1" />

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          formAction={saveDraft}
          className="rounded bg-gray-900 px-4 py-2 text-white"
        >
          Save draft
        </button>

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