"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import type { Bill, User } from "@/lib/types";

interface ExportButtonProps {
  bills: Bill[];
  users: User[];
  fileName: string;
}

export function ExportButton({ bills, users, fileName }: ExportButtonProps) {
  const userMap = new Map(users.map((user) => [user.id, user.name]));

  const handleExport = () => {
    const dataToExport = bills.map((bill) => ({
      "Bill ID": bill.id,
      "Employee Name": userMap.get(bill.employeeId) || "Unknown",
      "Company Name": bill.companyName,
      "Total Amount": bill.amount,
      "Status": bill.status.replace(/_/g, " "),
      "Submitted Date": new Date(bill.createdAt).toLocaleDateString(),
      "Last Updated": new Date(bill.updatedAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bills");

    // Set column widths for better readability
    worksheet["!cols"] = [
        { wch: 30 }, // Bill ID
        { wch: 20 }, // Employee Name
        { wch: 25 }, // Company Name
        { wch: 15 }, // Total Amount
        { wch: 25 }, // Status
        { wch: 15 }, // Submitted Date
        { wch: 15 }, // Last Updated
    ];

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  return (
    <Button onClick={handleExport} variant="outline" size="sm" disabled={bills.length === 0}>
      <Download className="mr-2 h-4 w-4" />
      Export to Excel
    </Button>
  );
}
