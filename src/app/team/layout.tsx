import { getSession } from "@/lib/actions";
import { redirect } from "next/navigation";
import {
  SidebarProvider, Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarHeader, SidebarContent, SidebarFooter, SidebarInset, SidebarGroup
} from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, LayoutGrid, FileText, BarChart, Users, Settings } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TeamLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          {(["employee", "supervisor"] as const).includes(session.user.role as any) && (
            <SidebarGroup>
              <Button asChild className="w-full justify-start group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0" size="lg">
                <Link href="/bills/new">
                  <PlusCircle />
                  <span className="group-data-[collapsible=icon]:hidden">New Bill</span>
                </Link>
              </Button>
            </SidebarGroup>
          )}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard">
                <Link href="/dashboard">
                  <LayoutGrid />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Bills">
                <Link href="/bills">
                  <FileText />
                  <span>Bills</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Reports">
                <Link href="/reports">
                  <BarChart />
                  <span>Reports</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive tooltip="All Employee">
                <Link href="/team">
                  <Users />
                  <span>All Employee</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings">
                <Link href="/settings">
                  <Settings />
                  <span>Settings</span>
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
