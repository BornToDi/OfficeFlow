// src/app/bills/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { getBillById } from "@/lib/repo";
import BillEditForm from "@/components/bills/BillEditForm";

type PageProps = { params: Promise<{ id: string }> | { id: string } };

export default async function EditBillPage({ params }: PageProps) {
  const { id } = await Promise.resolve(params);
  const bill = await getBillById(id);
  if (!bill) return notFound();

  return (
    <BillEditForm
      bill={{
        id: bill.id,
        companyName: bill.companyName,
        companyAddress: bill.companyAddress,
        amount: Number(bill.amount),
        amountInWords: bill.amountInWords ?? "",
        items: bill.items.map((item) => ({
          id: item.id,
          date: item.date,
          from: item.from,
          to: item.to,
          transport: item.transport ?? null,
          purpose: item.purpose,
          amount: Number(item.amount),
          attachmentUrl: item.attachmentUrl ?? null,
        })),
      } as any}
    />
  );
}
