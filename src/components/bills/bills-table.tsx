import Link from "next/link";
import type { Bill, User } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { Eye } from "lucide-react";
import { ClientDate } from "../client-date";

interface BillsTableProps {
  bills: Bill[];
  users: User[];
  title: string;
  action?: React.ReactNode;
}

export function BillsTable({ bills, users, title, action }: BillsTableProps) {
  const userMap = new Map(users.map((user) => [user.id, user.name]));

  return (
    <div>
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">{title}</h2>
          {action}
        </div>
      )}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Details</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.length > 0 ? (
              bills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-medium">
                    {bill.companyName}
                    <p className="text-xs text-muted-foreground">{bill.id}</p>
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "BDT",
                    }).format(bill.amount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={bill.status} />
                  </TableCell>
                  <TableCell>{userMap.get(bill.employeeId) || "Unknown"}</TableCell>
                  <TableCell><ClientDate dateString={bill.createdAt} format="date" /></TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/bills/${bill.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View Bill</span>
                      </Link>
                    </Button>
                  </TableCell>

                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No bills found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
