"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings, LogOut, User2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions";
import type { Role } from "@/lib/types";

export default function ProfileMenu({
  user,
}: {
  user: { name: string; email: string; role: Role };
}) {
  const router = useRouter();

  return (
    <DropdownMenu>
      {/* Trigger MUST use asChild so the button is clickable */}
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <User2 className="h-4 w-4" />
          <span className="hidden sm:inline">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs">
          <div className="font-medium">{user.name}</div>
          <div className="text-muted-foreground">{user.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Option A: Next Link (recommended) */}
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        {/* Option B: programmatic nav (alternative) */}
        {/* 
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            router.push("/settings");
          }}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Settings
        </DropdownMenuItem>
        */}

        <DropdownMenuSeparator />

        {/* Logout via server action */}
        <form action={logout}>
          <DropdownMenuItem asChild>
            <button type="submit" className="flex w-full items-center gap-2">
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
