// src/app/bills/[id]/edit/page.tsx
import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditBillPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/bills/${encodeURIComponent(id)}?edit=1`);
}
