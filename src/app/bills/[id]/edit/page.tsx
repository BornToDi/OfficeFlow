// src/app/bills/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { getBillById } from "@/lib/repo";
import BillEditForm from "@/components/bills/BillEditForm";

type PageProps = { params: { id: string } };

export default async function EditBillPage({ params }: PageProps) {
  const bill = await getBillById(params.id);
  if (!bill) return notFound();

  return <BillEditForm bill={bill} />;
}
