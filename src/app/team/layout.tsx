import { getSession } from "@/lib/actions";
import { redirect } from "next/navigation";
import {
  SidebarProvider, Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarHeader, SidebarContent, SidebarFooter, SidebarInset, SidebarGroup, SidebarMenuBadge
} from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, LayoutGrid, FileText, BarChart, Users, Settings } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { pendingCountForUser } from "@/lib/repo"; // ← DB-backed helper

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TeamLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/");

  const pendingCount = await pendingCountForUser(session.user);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <Button asChild className="w-full justify-start" size="lg">
              <Link href="/bills/new">
                <PlusCircle />
                New Bill
              </Link>
            </Button>
          </SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard">
                <Link href="/dashboard">
                  <LayoutGrid />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Bills">
                <Link href="/bills">
                  <FileText />
                  Bills
                </Link>
              </SidebarMenuButton>
              {pendingCount > 0 && <SidebarMenuBadge>{pendingCount}</SidebarMenuBadge>}
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Reports">
                <Link href="/reports">
                  <BarChart />
                  Reports
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Team" isActive>
                <Link href="/team">
                  <Users />
                  Team
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings">
                <Link href="#">
                  <Settings />
                  Settings
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <DashboardHeader />
        <main className=" ">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
