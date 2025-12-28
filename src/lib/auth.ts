import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // adjust path if your authOptions is elsewhere

export async function getSession() {
  return await getServerSession(authOptions);
}