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
    <form className="w-full max-w-full space-y-5 overflow-hidden">
      <input type="hidden" name="billId" value={bill.id} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-700">
            Company Name
          </label>
          <input
            name="companyName"
            defaultValue={bill.companyName}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            required
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-700">
            Total Amount
          </label>
          <input
            type="number"
            step="0.01"
            name="totalAmount"
            defaultValue={bill.amount ?? calculatedTotal}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            required
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-700">
          Company Address
        </label>
        <textarea
          name="companyAddress"
          defaultValue={bill.companyAddress}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          rows={3}
          required
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-700">
          Amount in Words
        </label>
        <input
          name="amountInWords"
          defaultValue={bill.amountInWords ?? ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
        <input
          id="includeRows"
          type="checkbox"
          checked={includeRows}
          onChange={(e) => setIncludeRows(e.target.checked)}
          className="mt-1 h-4 w-4"
        />
        <label htmlFor="includeRows" className="text-sm leading-6 text-gray-700">
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

          {/* ONLY THIS TABLE AREA WILL SCROLL HORIZONTALLY */}
          <div className="w-full max-w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="border-b px-4 py-3 text-left font-semibold whitespace-nowrap">
                      Date
                    </th>
                    <th className="border-b px-4 py-3 text-left font-semibold whitespace-nowrap">
                      From
                    </th>
                    <th className="border-b px-4 py-3 text-left font-semibold whitespace-nowrap">
                      To
                    </th>
                    <th className="border-b px-4 py-3 text-left font-semibold whitespace-nowrap">
                      Transport
                    </th>
                    <th className="border-b px-4 py-3 text-left font-semibold whitespace-nowrap">
                      Purpose
                    </th>
                    <th className="border-b px-4 py-3 text-right font-semibold whitespace-nowrap">
                      Amount
                    </th>
                    <th className="border-b px-4 py-3 text-left font-semibold whitespace-nowrap">
                      Attachment
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {itemsPayload.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(item.date).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.from}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.to}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.transport ?? "-"}
                      </td>

                      <td className="min-w-[260px] px-4 py-3">
                        {item.purpose}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap font-medium">
                        {Number(item.amount).toFixed(2)}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.attachmentUrl ? (
                          <a
                            href={item.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 underline underline-offset-2"
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

      <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row">
        <button
          type="submit"
          formAction={saveDraft}
          className="w-full rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-200 sm:w-auto"
        >
          Save Draft
        </button>

        <button
          type="submit"
          formAction={submitBill}
          className="w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 sm:w-auto"
        >
          Submit Bill
        </button>
      </div>
    </form>
  );
}