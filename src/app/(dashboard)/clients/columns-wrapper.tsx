"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Client } from "@/lib/types/client";
import { ClientActions } from "@/components/clients/client-actions";

export function createColumns(
  onEdit: (client: Client) => void
): ColumnDef<Client>[] {
  return [
    {
      accessorKey: "nom",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Nom du client
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue("nom")}</div>;
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div className="lowercase">{row.getValue("email")}</div>;
      },
    },
    {
      accessorKey: "telephone",
      header: "Téléphone",
      cell: ({ row }) => {
        return <div>{row.getValue("telephone")}</div>;
      },
    },
    {
      accessorKey: "statut",
      header: "Statut",
      cell: ({ row }) => {
        const statut = row.getValue("statut") as string;
        return (
          <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              statut === "actif"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {statut === "actif" ? "Actif" : "Inactif"}
          </div>
        );
      },
    },
    {
      accessorKey: "totalDu",
      header: () => <div className="text-right">Total Dû</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalDu"));
        const formatted = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "XOF",
          minimumFractionDigits: 0,
        }).format(amount);

        return (
          <div
            className={`text-right font-medium ${
              amount > 0 ? "text-red-600" : "text-gray-600"
            }`}
          >
            {formatted}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const client = row.original;
        return <ClientActions client={client} onEdit={onEdit} />;
      },
    },
  ];
}
