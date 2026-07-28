import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/actions";
import { findUserById, updateUserProfile } from "@/lib/repo";

const requestSchema = z.object({
  userId: z.string().min(1),
  email: z.string().trim().email("Enter a valid email address."),
  employeeCode: z.string().trim().min(1, "Employee code is required."),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !["management", "followup"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const parsed = requestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid employee details." },
      { status: 400 }
    );
  }

  const target = await findUserById(parsed.data.userId);
  if (!target || !["employee", "supervisor"].includes(target.role)) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }

  try {
    await updateUserProfile(target.id, {
      email: parsed.data.email.trim().toLowerCase(),
      employeeCode: parsed.data.employeeCode,
    });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update employee." },
      { status: 400 }
    );
  }
}
