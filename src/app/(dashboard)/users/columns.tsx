"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/lib/firebase/api/users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Mail, Phone, Briefcase, Trash2 } from "lucide-react";

export const createColumns = (
  onViewUser: (user: User) => void,
  onDeleteUser: (user: User) => void
): ColumnDef<User>[] => [
  {
    accessorKey: "nom",
    header: "Utilisateur",
    cell: ({ row }) => {
      const user = row.original;
      const fullName = `${user.prenom} ${user.nom}`;
      return (
        <div>
          <div className="font-medium">{fullName}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {user.email}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "telephone",
    header: "Téléphone",
    cell: ({ row }) => {
      const telephone = row.original.telephone;
      if (!telephone) {
        return <span className="text-muted-foreground text-sm">-</span>;
      }
      return (
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-3 w-3 text-muted-foreground" />
          {telephone}
        </div>
      );
    },
  },
  {
    accessorKey: "poste",
    header: "Poste",
    cell: ({ row }) => {
      const poste = row.original.poste;
      if (!poste) {
        return <span className="text-muted-foreground text-sm">-</span>;
      }
      return (
        <div className="flex items-center gap-2 text-sm">
          <Briefcase className="h-3 w-3 text-muted-foreground" />
          {poste}
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
    accessorKey: "disabled",
    header: "Statut",
    cell: ({ row }) => {
      const disabled = row.original.disabled;
      return (
        <Badge
          variant={disabled ? "destructive" : "default"}
          className={disabled ? "" : "bg-green-600"}
        >
          {disabled ? "Désactivé" : "Actif"}
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
            onClick={() => onViewUser(user)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteUser(user)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
