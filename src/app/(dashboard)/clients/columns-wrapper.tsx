"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Client } from "@/lib/types/client";
import { ClientActions } from "@/components/clients/client-actions";
import Link from "next/link";

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
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nom du client
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const client = row.original;
        return (
          <Link
            href={`/clients/${client.id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.getValue("nom")}
          </Link>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
      accessorKey: "totalDu",
      header: () => <div className="text-right">Total Dû</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalDu"));
        const formatted = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "GNF",
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
