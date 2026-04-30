
"use client";

import { useState, useMemo } from "react";
import type { User, Role } from "@/lib/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeamMembersTable } from "./team-members-table";

interface TeamViewProps {
  initialUsers: User[];
  allUsers: User[];
}

export function TeamView({ initialUsers, allUsers }: TeamViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  const departments = useMemo(() => {
    const unique = new Set(
      initialUsers
        .map((user) => user.department)
        .filter((d): d is string => Boolean(d && d.trim()))
        .map((d) => d.trim())
    );
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [initialUsers]);

  const filteredUsers = useMemo(() => {
    return initialUsers.filter((user) => {
      const nameMatch = user.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const roleMatch = roleFilter === "all" || user.role === roleFilter;
      const departmentMatch =
        departmentFilter === "all" || (user.department ?? "").trim() === departmentFilter;
      return nameMatch && roleMatch && departmentMatch;
    });
  }, [initialUsers, searchTerm, roleFilter, departmentFilter]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-gradient-to-r from-sky-50 via-cyan-50 to-emerald-50 p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm border-sky-300 bg-white/80 shadow-sm transition-all duration-200 focus-visible:border-sky-500 focus-visible:ring-sky-400"
          />
          <Select
            value={roleFilter}
            onValueChange={(value: Role | "all") => setRoleFilter(value)}
          >
            <SelectTrigger className="w-full border-emerald-300 bg-white/80 text-emerald-900 shadow-sm transition-all duration-200 focus:ring-emerald-400 md:w-[200px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent className="border-emerald-200 bg-gradient-to-b from-white to-emerald-50">
              <SelectItem value="all" className="text-slate-700 focus:bg-slate-100 focus:text-slate-900">All Roles</SelectItem>
              <SelectItem value="employee" className="text-blue-700 focus:bg-blue-50 focus:text-blue-900">Employee</SelectItem>
              <SelectItem value="supervisor" className="text-amber-700 focus:bg-amber-50 focus:text-amber-900">Supervisor</SelectItem>
              <SelectItem value="accounts" className="text-violet-700 focus:bg-violet-50 focus:text-violet-900">Accounts</SelectItem>
              <SelectItem value="management" className="text-emerald-700 focus:bg-emerald-50 focus:text-emerald-900">Management</SelectItem>
              <SelectItem value="followup" className="text-cyan-700 focus:bg-cyan-50 focus:text-cyan-900">Follow-up</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full border-cyan-300 bg-white/80 text-cyan-900 shadow-sm transition-all duration-200 focus:ring-cyan-400 md:w-[220px]">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent className="border-cyan-200 bg-gradient-to-b from-white to-cyan-50">
              <SelectItem value="all" className="text-slate-700 focus:bg-slate-100 focus:text-slate-900">All Departments</SelectItem>
              {departments.map((department) => (
                <SelectItem
                  key={department}
                  value={department}
                  className="text-cyan-700 focus:bg-cyan-50 focus:text-cyan-900"
                >
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <TeamMembersTable users={filteredUsers} allUsers={allUsers} />
    </div>
  );
}
