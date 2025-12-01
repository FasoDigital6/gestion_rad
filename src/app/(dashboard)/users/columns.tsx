"use client";

import { ColumnDef } from "@tanstack/react-table";
import { userData } from "@/lib/actions/auth/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const createColumns = (
  onDeleteUser: (userId: string, userEmail: string) => void
): ColumnDef<userData>[] => [
  {
    accessorKey: "name",
    header: "Utilisateur",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name
              )}&background=0b63b5&color=fff`}
              alt={user.name}
            />
            <AvatarFallback className="bg-brand text-brand-foreground">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Rôle",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge
          variant={role === "admin" ? "default" : "secondary"}
          className={
            role === "admin" ? "bg-brand text-brand-foreground" : ""
          }
        >
          {role === "admin" ? "Administrateur" : "Utilisateur"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteUser(user.id, user.email)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
