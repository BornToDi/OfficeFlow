import type { User } from "@/lib/types";
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

interface TeamMembersTableProps {
  users: User[];
  allUsers: User[];
}

export function TeamMembersTable({ users, allUsers }: TeamMembersTableProps) {
  const userMap = new Map(allUsers.map((user) => [user.id, user.name]));

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Supervisor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => {
              const initials = user.name.split(" ").map((n) => n[0]).join("");
              return (
                <TableRow key={user.id}>
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
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{user.role}</Badge>
                  </TableCell>
                  <TableCell>{user.designation || 'N/A'}</TableCell>
                  <TableCell>{user.supervisorId ? userMap.get(user.supervisorId) : 'N/A'}</TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No team members found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
