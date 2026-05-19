import { NextResponse } from "next/server";
import { getSession } from "@/lib/actions";
import { deleteUser } from "@/lib/repo";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !["management", "followup"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const userId = body?.userId;
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  try {
    await deleteUser(userId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to delete user" }, { status: 500 });
  }
}
