"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BonDeLivraison } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statutColors: Record<string, string> = {
  prepare: "bg-blue-500",
  livre: "bg-green-500",
  facture: "bg-purple-500",
  annule: "bg-red-500",
};

const statutLabels: Record<string, string> = {
  prepare: "Préparé",
  livre: "Livré",
  facture: "Facturé",
  annule: "Annulé",
};

export const columns: ColumnDef<BonDeLivraison>[] = [
  {
    accessorKey: "numero",
    header: "Numéro",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("numero")}</div>
    ),
  },
  {
    accessorKey: "bdcNumero",
    header: "BDC",
  },
  {
    accessorKey: "clientNom",
    header: "Client",
  },
  {
    accessorKey: "dateLivraison",
    header: "Date livraison",
    cell: ({ row }) => {
      const date = row.getValue("dateLivraison") as Date;
      return format(date, "dd MMM yyyy", { locale: fr });
    },
  },
  {
    accessorKey: "totalTTC",
    header: "Montant TTC",
    cell: ({ row }) => {
      const montant = row.getValue("totalTTC") as number;
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF",
      }).format(montant);
    },
  },
  {
    accessorKey: "typeLivraison",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("typeLivraison") as string;
      return (
        <Badge variant="outline">
          {type === "complete" ? "Complète" : "Partielle"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => {
      const statut = row.getValue("statut") as string;
      return (
        <Badge className={statutColors[statut]}>{statutLabels[statut]}</Badge>
      );
    },
  },
];
