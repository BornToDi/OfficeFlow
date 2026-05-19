import { NextResponse } from "next/server";
import { getSession } from "@/lib/actions";
import { updateUserPassword } from "@/lib/repo";
import { scrypt as _scrypt, randomBytes } from "crypto";
import { promisify } from "util";
const scrypt = promisify(_scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `s:${salt}:${derived.toString("hex")}`;
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !["management", "followup"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const userId = body?.userId;
  const newPassword = body?.newPassword;
  if (!userId || !newPassword) return NextResponse.json({ error: "Missing userId or newPassword" }, { status: 400 });

  if (typeof newPassword !== "string" || newPassword.length < 4) {
    return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
  }

  try {
    const passwordHash = await hashPassword(newPassword);
    await updateUserPassword(userId, passwordHash);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to reset password" }, { status: 500 });
  }
}
