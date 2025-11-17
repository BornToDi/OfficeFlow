
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

  const filteredUsers = useMemo(() => {
    return initialUsers.filter((user) => {
      const nameMatch = user.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const roleMatch = roleFilter === "all" || user.role === roleFilter;
      return nameMatch && roleMatch;
    });
  }, [initialUsers, searchTerm, roleFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={roleFilter}
          onValueChange={(value: Role | "all") => setRoleFilter(value)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
            <SelectItem value="supervisor">Supervisor</SelectItem>
            <SelectItem value="accounts">Accounts</SelectItem>
            <SelectItem value="management">Management</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <TeamMembersTable users={filteredUsers} allUsers={allUsers} />
    </div>
  );
}
