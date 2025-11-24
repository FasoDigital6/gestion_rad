"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Proforma } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statutColors: Record<string, string> = {
  brouillon: "bg-gray-500",
  envoye: "bg-blue-500",
  accepte: "bg-green-500",
  refuse: "bg-red-500",
  expire: "bg-orange-500",
};

const statutLabels: Record<string, string> = {
  brouillon: "Brouillon",
  envoye: "Envoyé",
  accepte: "Accepté",
  refuse: "Refusé",
  expire: "Expiré",
};

export const columns: ColumnDef<Proforma>[] = [
  {
    accessorKey: "numero",
    header: "Numéro",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("numero")}</div>
    ),
  },
  {
    accessorKey: "clientNom",
    header: "Client",
  },
  {
    accessorKey: "dateCreation",
    header: "Date création",
    cell: ({ row }) => {
      const date = row.getValue("dateCreation") as Date;
      return format(date, "dd MMM yyyy", { locale: fr });
    },
  },
  {
    accessorKey: "dateValidite",
    header: "Date validité",
    cell: ({ row }) => {
      const date = row.getValue("dateValidite") as Date;
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
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => {
      const statut = row.getValue("statut") as string;
      return (
        <Badge className={statutColors[statut]}>
          {statutLabels[statut]}
        </Badge>
      );
    },
  },
  {
    accessorKey: "bdcNumero",
    header: "BDC",
    cell: ({ row }) => {
      const bdcNumero = row.getValue("bdcNumero") as string;
      return bdcNumero ? (
        <span className="text-sm text-green-600">{bdcNumero}</span>
      ) : (
        <span className="text-sm text-gray-400">-</span>
      );
    },
  },
];
