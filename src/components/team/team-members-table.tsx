"use client";

import { useState } from "react";
import type { AdvanceSummary, EmployeeAdvance, User } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "../ui/badge";
import { AccountsAdvanceDialog } from "../dashboard/employee-advance-panel";

interface TeamMembersTableProps {
  users: User[];
  allUsers: User[];
  currentUserRole?: User["role"];
  advances: EmployeeAdvance[];
  advanceSummaries: AdvanceSummary[];
}

export function TeamMembersTable({ users, allUsers, currentUserRole, advances, advanceSummaries }: TeamMembersTableProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const userMap = new Map(allUsers.map((user) => [user.id, user.name]));

  async function handleDelete(userId: string) {
    if (!confirm("Delete this user? This action cannot be undone.")) return;
    try {
      const res = await fetch("/api/users/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Delete failed");
      location.reload();
    } catch (e: any) {
      alert(e?.message || "Failed to delete user");
    }
  }

  async function handleResetPassword(userId: string) {
    const pwd = prompt("Enter a temporary password for the user (min 4 chars):");
    if (!pwd) return;
    if (pwd.length < 4) return alert("Password must be at least 4 characters");
    try {
      const res = await fetch("/api/users/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, newPassword: pwd }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Reset failed");
      alert("Password reset successfully. Tell the user to change it after login.");
    } catch (e: any) {
      alert(e?.message || "Failed to reset password");
    }
  }

  async function handleEditIdentifiers(user: User) {
    const email = prompt("Employee email:", user.email);
    if (email === null) return;

    const employeeCode = prompt("Employee code:", user.employeeCode || "");
    if (employeeCode === null) return;
    if (!email.trim() || !employeeCode.trim()) {
      alert("Email and employee code are required.");
      return;
    }

    try {
      const res = await fetch("/api/users/update-identifiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email, employeeCode }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Update failed");
      alert("Employee email and code updated successfully.");
      location.reload();
    } catch (error: any) {
      alert(error?.message || "Failed to update employee.");
    }
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Employee ID</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Supervisor</TableHead>
            {currentUserRole === "accounts" && <TableHead className="text-right">Advance Balance</TableHead>}
            {(currentUserRole === "management" || currentUserRole === "followup") && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => {
              const initials = user.name.split(" ").map((n) => n[0]).join("");
              return (
                <TableRow
                  key={user.id}
                  className={currentUserRole === "accounts" && (user.role === "employee" || user.role === "supervisor") ? "cursor-pointer hover:bg-sky-50" : undefined}
                  onClick={() => { if (currentUserRole === "accounts" && (user.role === "employee" || user.role === "supervisor")) setSelectedEmployee(user); }}
                >
                  <TableCell>
                    <div className="flex items-center gap-4">
                       <Avatar>
                         <AvatarImage src={`https://placehold.co/100x100.png?text=${initials}`} />
                         <AvatarFallback>{initials}</AvatarFallback>
                       </Avatar>
                       <div>
                         <p className="font-medium">{user.name}</p>
                         <p className="text-sm text-muted-foreground">{user.email}</p>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.employeeCode || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{user.role}</Badge>
                  </TableCell>
                  <TableCell>{user.designation || 'N/A'}</TableCell>
                  <TableCell>{user.supervisorId ? userMap.get(user.supervisorId) : 'N/A'}</TableCell>
                  {currentUserRole === "accounts" && (
                    <TableCell className={`text-right font-bold ${(advanceSummaries.find((item) => item.employeeId === user.id)?.balance || 0) < 0 ? "text-red-600" : "text-emerald-700"}`}>
                      {(user.role === "employee" || user.role === "supervisor") ? `BDT ${new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(advanceSummaries.find((item) => item.employeeId === user.id)?.balance || 0)}` : "-"}
                    </TableCell>
                  )}
                  {(currentUserRole === "management" || currentUserRole === "followup") && (
                    <TableCell>
                      <div className="flex gap-2">
                        {(user.role === "employee" || user.role === "supervisor") && (
                          <button className="btn btn-sm rounded bg-blue-600 px-2 py-1 text-white" onClick={() => handleEditIdentifiers(user)}>Edit</button>
                        )}
                        <button className="btn btn-sm rounded px-2 py-1 bg-red-600 text-white" onClick={() => handleDelete(user.id)}>Delete</button>
                        <button className="btn btn-sm rounded px-2 py-1 bg-yellow-500 text-black" onClick={() => handleResetPassword(user.id)}>Reset Password</button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No team members found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <AccountsAdvanceDialog
        employee={selectedEmployee}
        summary={advanceSummaries.find((item) => item.employeeId === selectedEmployee?.id)}
        advances={advances.filter((entry) => entry.employeeId === selectedEmployee?.id)}
        open={!!selectedEmployee}
        onOpenChange={(open) => { if (!open) setSelectedEmployee(null); }}
      />
    </Card>
  );
}
