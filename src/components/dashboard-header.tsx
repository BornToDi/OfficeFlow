// src/components/DashboardHeader.tsx
import Link from "next/link";
import { getSession, logout } from "@/lib/actions";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut, Settings, LifeBuoy } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";

export async function DashboardHeader() {
  const session = await getSession();
  const user = session?.user;

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={`https://placehold.co/100x100.png?text=${initials}`}
                  alt={user.name}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs">
              <div className="font-medium">{user.name}</div>
              <div className="text-muted-foreground">{user.email}</div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* ✅ Settings navigates to /settings */}
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>

            {/* Optional Support link (change href as needed) */}
            <DropdownMenuItem asChild>
              <Link href="/support" className="flex items-center gap-2">
                <LifeBuoy className="h-4 w-4" />
                Support
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Logout via server action */}
            <form action={logout}>
              <DropdownMenuItem asChild>
                <button type="submit" className="flex w-full items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
