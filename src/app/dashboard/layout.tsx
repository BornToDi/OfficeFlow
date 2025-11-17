import { getSession } from "@/lib/actions";
import { redirect } from "next/navigation";
import { SidebarProvider, Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarContent, SidebarFooter, SidebarInset, SidebarGroup, SidebarMenuBadge } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, LayoutGrid, FileText, BarChart, Users, Settings } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { getBills, getUsers } from "@/lib/data";
import type { BillStatus } from "@/lib/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  const user = session.user;
  const allBills = await getBills();
  const allUsers = await getUsers();

  let pendingCount = 0;
  switch (user.role) {
      case 'supervisor':
          const teamMemberIds = allUsers
              .filter(u => u.supervisorId === user.id)
              .map(u => u.id);
          pendingCount = allBills.filter(bill => 
              teamMemberIds.includes(bill.employeeId) && bill.status === 'SUBMITTED'
          ).length;
          break;
      case 'accounts':
          pendingCount = allBills.filter(bill => 
              bill.status === 'APPROVED_BY_SUPERVISOR' || bill.status === 'APPROVED_BY_MANAGEMENT'
          ).length;
          break;
      case 'management':
          pendingCount = allBills.filter(bill => 
              bill.status === 'APPROVED_BY_ACCOUNTS'
          ).length;
          break;
      case 'employee':
          const employeePendingStatuses: BillStatus[] = [
              'SUBMITTED',
              'APPROVED_BY_SUPERVISOR',
              'APPROVED_BY_ACCOUNTS',
              'APPROVED_BY_MANAGEMENT'
          ];
          pendingCount = allBills.filter(bill => 
              bill.employeeId === user.id && employeePendingStatuses.includes(bill.status)
          ).length;
          break;
  }

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
                        <SidebarMenuButton asChild tooltip="Dashboard" isActive>
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
                        <SidebarMenuButton asChild tooltip="Team">
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
            <main className="flex-1 p-4 md:p-8">{children}</main>
        </SidebarInset>
    </SidebarProvider>
  );
}
