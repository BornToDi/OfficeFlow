// src/components/bills/ConfirmReceiveButton.tsx
"use client";

import { useTransition } from "react";
import { confirmReceiptAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function ConfirmReceiveButton({ billId }: { billId: string }) {
  const [pending, start] = useTransition();

  const onClick = () => {
    const ok = window.confirm("Are you sure you received the money?");
    if (!ok) return;
    start(async () => { await confirmReceiptAction(billId); });
  };

  return (
    <Button onClick={onClick} disabled={pending} className="bg-black text-white">
      {pending ? "Confirming..." : "I received the money"}
    </Button>
  );
}
