import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type PdfItem = {
  date: string;
  from: string;
  to: string;
  transport: string | null;
  purpose: string;
  amount: number;
};

type PdfBill = {
  id: string;
  companyName: string;
  companyAddress: string;
  amount: number;
  amountInWords: string;
  status: string;
  employee: { name: string; employeeCode?: string | null; designation?: string | null } | null;
  items: PdfItem[];
};

const dash = "-";
const number = (value: unknown) => Number(value || 0).toFixed(2);
const date = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value || dash : parsed.toLocaleDateString("en-GB");
};
const json = (value: string) => {
  try { return JSON.parse(value || "{}"); } catch { return { purpose: value }; }
};

function tableFor(items: PdfItem[]) {
  const marker = items[0]?.transport;

  if (marker === "__BILL5__") {
    const rows = items.map((item) => ({ item, data: json(item.purpose) }));
    const moneyColumns = ["local", "trip", "food", "hotel", "others", "advance"]
      .filter((key) => rows.some(({ data }) => Number(data[key] || 0) !== 0));
    const labels: Record<string, string> = { local: "Local", trip: "Trip", food: "Food", hotel: "Hotel", others: "Others", advance: "Advance" };
    return {
      head: ["No.", "Date From", "Date To", "Incident", "Time", "From", "To", "Purpose", "Vehicle", ...moneyColumns.map((key) => labels[key]), "Net", "Remarks"],
      body: rows.map(({ item, data }, index) => [
        index + 1, date(item.date), item.to || dash, data.incident || dash, data.time || dash,
        data.dateFrom || dash, data.dateTo || dash, data.purpose || dash, data.vehicle || dash,
        ...moneyColumns.map((key) => number(data[key])), number(data.net ?? item.amount), data.remarks || dash,
      ]),
    };
  }

  if (marker === "__BILL2__") {
    const rows = items.map((item) => ({ item, data: json(item.purpose) }));
    return {
      head: ["No.", "From", "To", "Date From", "Date To", "Purpose", "Local", "Trip", "Others", "Advance", "Net", "Remarks"],
      body: rows.map(({ item, data }, index) => [index + 1, data.from || dash, data.to || dash, date(item.date), item.to || dash, data.purpose || dash, number(data.local), number(data.trip), number(data.others), number(data.advance), number(data.net ?? item.amount), data.remarks || dash]),
    };
  }

  if (marker === "__BILL3__") {
    const rows = items.map((item) => ({ item, data: json(item.purpose) }));
    return {
      head: ["No.", "From", "To", "Date From", "Date To", "Purpose", "Food", "Hotel", "Others", "Advance", "Net", "Remarks"],
      body: rows.map(({ item, data }, index) => [index + 1, data.from || dash, data.to || dash, date(item.date), item.to || dash, data.purpose || dash, number(data.food), number(data.hotel), number(data.others), number(data.advance), number(data.net ?? item.amount), data.remarks || dash]),
    };
  }

  if (marker === "__BILL4__") {
    const rows = items.map((item) => ({ item, data: json(item.purpose) }));
    return {
      head: ["SL", "Date", "Time", "Incident", "Purpose", "Meal/Vehicle", "Food", "Hotel", "Others", "Total", "Advance", "Net", "Remarks"],
      body: rows.map(({ item, data }, index) => [index + 1, date(item.date), data.time || dash, data.incident || dash, data.purpose || dash, data.meal || data.vehicle || dash, number(data.food), number(data.hotel), number(data.others), number(data.total), number(data.advance), number(data.net ?? item.amount), data.remarks || dash]),
    };
  }

  return {
    head: ["No.", "Date", "From", "To", "Transport", "Purpose", "Amount (BDT)"],
    body: items.map((item, index) => [index + 1, date(item.date), item.from || dash, item.to || dash, item.transport || dash, item.purpose || dash, number(item.amount)]),
  };
}

export async function downloadBillPdf(billId: string) {
  const response = await fetch(`/api/bills/${encodeURIComponent(billId)}/pdf-data`, { cache: "no-store" });
  if (!response.ok) throw new Error("Could not prepare the submitted bill PDF.");

  const bill = (await response.json()) as PdfBill;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const table = tableFor(bill.items);
  const totalColumn = Math.max(table.head.indexOf("Net"), table.head.indexOf("Amount (BDT)"));
  const totalRow = table.head.map(() => "");
  totalRow[Math.max(0, totalColumn - 1)] = "Total Tk";
  totalRow[totalColumn] = number(bill.amount);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("CONVEYANCE BILL", 148.5, 13, { align: "center" });
  doc.setFontSize(14);
  doc.text(bill.companyName || "Company", 14, 22);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(doc.splitTextToSize(bill.companyAddress || "", 180), 14, 27);

  doc.setFontSize(9);
  doc.text(`Employee: ${bill.employee?.name || dash}`, 14, 37);
  doc.text(`Designation: ${bill.employee?.designation || dash}`, 105, 37);
  doc.text(`Employee Code: ${bill.employee?.employeeCode || dash}`, 205, 37);
  doc.text(`Bill Reference: ${bill.id}`, 14, 43);
  doc.text(`Status: ${bill.status.replaceAll("_", " ")}`, 205, 43);

  autoTable(doc, {
    startY: 48,
    head: [table.head],
    body: table.body,
    foot: [totalRow],
    theme: "grid",
    margin: { left: 10, right: 10 },
    styles: { fontSize: table.head.length > 12 ? 6.2 : 7.5, cellPadding: 1.5, overflow: "linebreak", valign: "middle" },
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: "bold", halign: "center" },
    footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: "bold", halign: "right" },
    didParseCell: (data) => {
      const header = table.head[data.column.index] || "";
      if (["Local", "Trip", "Food", "Hotel", "Others", "Advance", "Total", "Net", "Amount (BDT)"].includes(header)) {
        data.cell.styles.halign = "right";
      }
    },
  });

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 48;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Amount in words:", 14, finalY + 8);
  doc.setFont("helvetica", "normal");
  doc.text(doc.splitTextToSize(bill.amountInWords || dash, 265), 14, finalY + 13);
  doc.save(`bill-${bill.id.slice(-8)}.pdf`);
}
