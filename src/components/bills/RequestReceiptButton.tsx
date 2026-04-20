// src/components/bills/RequestReceiptButton.tsx
"use client";

import { useState, useTransition } from "react";
import { requestReceiptAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function RequestReceiptButton({
  billId,
  hasPaymentRequest = false,
}: {
  billId: string;
  hasPaymentRequest?: boolean;
}) {
  const [pending, start] = useTransition();
  const [requested, setRequested] = useState(hasPaymentRequest);
  const [error, setError] = useState<string | null>(null);

  const onClick = () => {
    if (requested) return;
    setError(null);
    start(async () => {
      try {
        await requestReceiptAction(billId);
        setRequested(true);
      } catch (e: any) {
        setError(e?.message || "Failed to send request.");
      }
    });
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={onClick}
        disabled={pending || requested}
        className={requested ? "bg-emerald-600 hover:bg-emerald-600 text-white" : "bg-amber-600 hover:bg-amber-700 text-white"}
      >
        {pending ? "Requesting..." : requested ? "Request Sent!" : "Send Request"}
      </Button>
      {requested && (
        <p className="text-xs text-muted-foreground">
          Payment request sent — waiting for employee confirmation.
        </p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
