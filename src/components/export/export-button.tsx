"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import type { Bill, User } from "@/lib/types";

interface ExportButtonProps {
  bills: Bill[];
  users: User[];
  fileName: string;
  userRole?: string;
  exportType?: "default" | "paid-bills";
}

export function ExportButton({ bills, users, fileName, userRole, exportType = "default" }: ExportButtonProps) {
  const userMap = new Map(users.map((user) => [user.id, user]));

  const handleExport = () => {
    let dataToExport: Record<string, unknown>[] = [];
    let columnWidths: { wch: number }[] = [];

    if (exportType === "paid-bills" && (userRole === "accounts" || userRole === "management")) {
      // Special format for paid bills export for accounts and management
      const userIdToDepartment = new Map(users.map((user) => [user.id, user.department || "Unassigned"]));

      // Calculate date range from the bills
      const dates = bills
        .map((bill) => new Date(bill.createdAt).getTime())
        .filter((d) => !isNaN(d));
      
      const minDate = dates.length > 0 ? new Date(Math.min(...dates)) : null;
      const maxDate = dates.length > 0 ? new Date(Math.max(...dates)) : null;

      const dateRangeStr = minDate && maxDate
        ? `${minDate.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })} to ${maxDate.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}`
        : "N/A";

      dataToExport = bills.map((bill) => {
        const employee = userMap.get(bill.employeeId);
        return {
          "Bill ID": bill.id,
          "Employee Name": employee?.name || "Unknown",
          "Department": userIdToDepartment.get(bill.employeeId) || "Unassigned",
          "Employee ID": employee?.employeeCode || "N/A",
          "Total Amount": Number(bill.amount || 0),
          "Date Range": dateRangeStr,
        };
      });

      columnWidths = [
        { wch: 20 }, // Bill ID
        { wch: 25 }, // Employee Name
        { wch: 20 }, // Department
        { wch: 15 }, // Employee ID
        { wch: 15 }, // Total Amount
        { wch: 35 }, // Date Range
      ];
    } else {
      // Default export format
      dataToExport = bills.map((bill) => {
        const employee = userMap.get(bill.employeeId);
        return {
          "Bill ID": bill.id,
          "Employee Name": employee?.name || "Unknown",
          "Company Name": bill.companyName,
          "Total Amount": bill.amount,
          "Status": bill.status.replace(/_/g, " "),
          "Submitted Date": new Date(bill.createdAt).toLocaleDateString(),
          "Last Updated": new Date(bill.updatedAt).toLocaleDateString(),
        };
      });

      columnWidths = [
        { wch: 30 }, // Bill ID
        { wch: 20 }, // Employee Name
        { wch: 25 }, // Company Name
        { wch: 15 }, // Total Amount
        { wch: 25 }, // Status
        { wch: 15 }, // Submitted Date
        { wch: 15 }, // Last Updated
      ];
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bills");

    // Set column widths for better readability
    worksheet["!cols"] = columnWidths;

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  return (
    <Button onClick={handleExport} variant="outline" size="sm" disabled={bills.length === 0}>
      <Download className="mr-2 h-4 w-4" />
      Export to Excel
    </Button>
  );
}
