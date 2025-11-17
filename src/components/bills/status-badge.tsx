import type { BillStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusMap: Record<
  BillStatus,
  { text: string; className: string }
> = {
  DRAFT: { text: "Draft", className: "bg-gray-500" },
  SUBMITTED: { text: "Submitted", className: "bg-blue-500" },
  APPROVED_BY_SUPERVISOR: { text: "Approved by Supervisor", className: "bg-cyan-500" },
  APPROVED_BY_ACCOUNTS: { text: "Approved by Accounts", className: "bg-teal-500" },
  APPROVED_BY_MANAGEMENT: { text: "Final Approval", className: "bg-green-600" },
  REJECTED_BY_SUPERVISOR: { text: "Rejected by Supervisor", className: "bg-red-500" },
  REJECTED_BY_ACCOUNTS: { text: "Rejected by Accounts", className: "bg-red-500" },
  REJECTED_BY_MANAGEMENT: { text: "Rejected by Management", className: "bg-red-500" },
  PAID: { text: "Paid", className: "bg-primary" },
};

export function StatusBadge({ status }: { status: BillStatus }) {
  const { text, className } = statusMap[status] || { text: "Unknown", className: "bg-gray-400" };

  return (
    <Badge
      className={cn(
        "text-white text-xs font-medium whitespace-nowrap",
        className
      )}
    >
      {text.replace(/_/g, " ").toUpperCase()}
    </Badge>
  );
}
