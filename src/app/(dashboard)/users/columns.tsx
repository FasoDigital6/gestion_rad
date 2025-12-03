"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/lib/firebase/api/users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Eye, Mail, Phone, Briefcase, Trash2, Edit, MoreHorizontal, UserCheck, UserX } from "lucide-react";

export const createColumns = (
  onViewUser: (user: User) => void,
  onEditUser: (user: User) => void,
  onDeleteUser: (user: User) => void,
  onToggleStatus: (user: User) => void
): ColumnDef<User>[] => [
  {
    accessorKey: "nom",
    header: "Utilisateur",
    cell: ({ row }) => {
      const user = row.original;
      const fullName = `${user.prenom} ${user.nom}`;
      return (
        <div
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onViewUser(user)}
        >
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Ouvrir le menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onViewUser(user)}>
              <Eye className="mr-2 h-4 w-4" />
              Voir les détails
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEditUser(user)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleStatus(user)}>
              {user.disabled ? (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Activer
                </>
              ) : (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  Désactiver
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDeleteUser(user)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
