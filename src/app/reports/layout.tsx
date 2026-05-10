// src/app/reports/layout.tsx
import { getSession } from "@/lib/actions";
import { redirect } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarGroup,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  LayoutGrid,
  FileText,
  BarChart,
  Users,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { pendingCountForUser } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/");

  // DB-backed count for sidebar badge
  const pendingCount = await pendingCountForUser(session.user);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>

        <SidebarContent>
          {(["employee", "supervisor"] as const).includes(session.user.role as any) && (
            <SidebarGroup>
              <Button asChild className="w-full justify-start" size="lg">
                <Link href="/bills/new">
                  <PlusCircle />
                  New Bill
                </Link>
              </Button>
            </SidebarGroup>
          )}

          <SidebarMenu>
            <SidebarMenuItem><Link href="/dashboard" className="flex h-8 items-center gap-2 rounded-md px-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"><LayoutGrid />Dashboard</Link></SidebarMenuItem>
            <SidebarMenuItem><Link href="/bills" className="flex h-8 items-center gap-2 rounded-md px-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"><FileText />Bills</Link>{pendingCount > 0 && <SidebarMenuBadge>{pendingCount}</SidebarMenuBadge>}</SidebarMenuItem>
            <SidebarMenuItem><Link href="/reports" className="flex h-8 items-center gap-2 rounded-md px-2 text-sm bg-sidebar-accent text-sidebar-accent-foreground"><BarChart />Reports</Link></SidebarMenuItem>
            <SidebarMenuItem><Link href="/team" className="flex h-8 items-center gap-2 rounded-md px-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"><Users />All Employee</Link></SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem><Link href="/settings" className="flex h-8 items-center gap-2 rounded-md px-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"><Settings />Settings</Link></SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-8 bg-white">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
