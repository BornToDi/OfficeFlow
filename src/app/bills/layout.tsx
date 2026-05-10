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

export default async function BillsLayout({
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
                 {(["employee", "supervisor"] as const).includes(user.role as any) && (
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
                    <SidebarMenuItem>
                        <Link href="/dashboard" className="flex h-8 items-center gap-2 rounded-md px-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                            <LayoutGrid />
                            Dashboard
                        </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <Link href="/bills" className="flex h-8 items-center gap-2 rounded-md px-2 text-sm bg-sidebar-accent text-sidebar-accent-foreground">
                            <FileText />
                            Bills
                        </Link>
                        {pendingCount > 0 && <SidebarMenuBadge>{pendingCount}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <Link href="/reports" className="flex h-8 items-center gap-2 rounded-md px-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                            <BarChart />
                            Reports
                        </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <Link href="/team" className="flex h-8 items-center gap-2 rounded-md px-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                            <Users />
                            All Employee
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Link href="/settings" className="flex h-8 items-center gap-2 rounded-md px-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                            <Settings />
                            Settings
                        </Link>
                    </SidebarMenuItem>
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
