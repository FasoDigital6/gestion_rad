"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Facture } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statutColors: Record<string, string> = {
  brouillon: "bg-gray-500",
  envoyee: "bg-blue-500",
  partiellement_payee: "bg-yellow-500",
  payee: "bg-green-500",
  en_retard: "bg-red-500",
  annulee: "bg-gray-400",
};

const statutLabels: Record<string, string> = {
  brouillon: "Brouillon",
  envoyee: "Envoyée",
  partiellement_payee: "Payée partiellement",
  payee: "Payée",
  en_retard: "En retard",
  annulee: "Annulée",
};

export const columns: ColumnDef<Facture>[] = [
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
    accessorKey: "dateFacture",
    header: "Date facture",
    cell: ({ row }) => {
      const date = row.getValue("dateFacture") as Date;
      return format(date, "dd MMM yyyy", { locale: fr });
    },
  },
  {
    accessorKey: "dateEcheance",
    header: "Échéance",
    cell: ({ row }) => {
      const date = row.getValue("dateEcheance") as Date;
      const estEnRetard = new Date() > date;
      return (
        <span className={estEnRetard ? "text-red-600 font-medium" : ""}>
          {format(date, "dd MMM yyyy", { locale: fr })}
        </span>
      );
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
    header: "Payé / Restant",
    cell: ({ row }) => {
      const facture = row.original;
      return (
        <div className="flex flex-col text-sm">
          <span className="text-green-600 font-medium">
            {new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "XOF",
            }).format(facture.montantPaye)}
          </span>
          {facture.montantRestant > 0 && (
            <span className="text-red-600">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "XOF",
              }).format(facture.montantRestant)}
            </span>
          )}
        </div>
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
