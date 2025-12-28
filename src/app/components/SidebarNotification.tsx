import React from "react";
import { getPendingCountForUser } from "@/lib/repo";

export default async function SidebarNotification({
  session,
}: {
  session?: { user: { id: string; role: string } } | null;
}) {
  if (!session) return null;

  const count = await getPendingCountForUser(session.user.id, session.user.role as any);
  if (!count) return null;

  return (
    <span aria-live="polite" className="ml-2 inline-flex items-center">
      <span className="inline-flex h-6 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-2 text-xs font-medium text-white">
        {count}
      </span>
    </span>
  );
}