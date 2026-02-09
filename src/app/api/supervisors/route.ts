import { NextResponse } from "next/server";
import { listSupervisors } from "@/lib/repo";

export async function GET() {
  const sup = await listSupervisors();
  return NextResponse.json(sup);
}
