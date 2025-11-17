// src/components/bills/RequestReceiptButton.tsx
"use client";

import { useTransition } from "react";
import { requestReceiptAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function RequestReceiptButton({ billId }: { billId: string }) {
  const [pending, start] = useTransition();

  return (
    <Button
      onClick={() => start(async () => { await requestReceiptAction(billId); })}
      disabled={pending}
      className="bg-amber-600 hover:bg-amber-700 text-white"
    >
      {pending ? "Requesting..." : "Request Receipt from Employee"}
    </Button>
  );
}
