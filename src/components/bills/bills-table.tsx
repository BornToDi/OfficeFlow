"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
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
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil((bills?.length || 0) / pageSize));

  // clamp page when bills change
  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

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
            {(bills.length || 0) > 0 ? (
              // slice for pagination
              bills.slice((page - 1) * pageSize, page * pageSize).map((bill) => (
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

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            className="rounded border px-3 py-1 text-sm hover:bg-muted disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              aria-current={p === page ? "page" : undefined}
              className={`rounded border px-3 py-1 text-sm ${p === page ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              {p}
            </button>
          ))}

          <button
            className="rounded border px-3 py-1 text-sm hover:bg-muted disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
