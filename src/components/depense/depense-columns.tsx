"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Depense } from "@/lib/types/depense";
import { CATEGORIE_DEPENSE_LABELS } from "@/lib/types/depense";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatMontant } from "@/lib/utils/facture";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MoreHorizontal, Edit, Trash2, FileText, Link as LinkIcon } from "lucide-react";

export const createDepenseColumns = (
  onEdit: (depense: Depense) => void,
  onDelete: (depense: Depense) => void
): ColumnDef<Depense>[] => [
  {
    accessorKey: "numero",
    header: "N°",
    cell: ({ row }) => {
      const numero = row.getValue("numero") as string;
      return <span className="font-mono text-sm">{numero}</span>;
    },
  },
  {
    accessorKey: "dateDepense",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("dateDepense") as Date;
      return (
        <span className="text-sm">
          {format(date, "dd MMM yyyy", { locale: fr })}
        </span>
      );
    },
  },
  {
    accessorKey: "montant",
    header: "Montant",
    cell: ({ row }) => {
      const montant = row.getValue("montant") as number;
      return (
        <span className="font-semibold text-sm">
          {formatMontant(montant)}
        </span>
      );
    },
  },
  {
    accessorKey: "categorie",
    header: "Catégorie",
    cell: ({ row }) => {
      const categorie = row.getValue("categorie") as string;
      const label = CATEGORIE_DEPENSE_LABELS[categorie as keyof typeof CATEGORIE_DEPENSE_LABELS] || categorie;

      return (
        <Badge variant="outline" className="text-xs">
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        <span className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </span>
      );
    },
  },
  {
    accessorKey: "bdcNumero",
    header: "BDC lié",
    cell: ({ row }) => {
      const bdcNumero = row.original.bdcNumero;
      if (!bdcNumero) {
        return <span className="text-xs text-muted-foreground">-</span>;
      }
      return (
        <div className="flex items-center gap-1 text-xs">
          <LinkIcon className="h-3 w-3 text-muted-foreground" />
          <span className="font-mono">{bdcNumero}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "fichierNom",
    header: "Justificatif",
    cell: ({ row }) => {
      const fichierNom = row.original.fichierNom;
      if (!fichierNom) {
        return <span className="text-xs text-muted-foreground">-</span>;
      }
      return (
        <div className="flex items-center gap-1 text-xs">
          <FileText className="h-3 w-3 text-brand" />
          <span className="truncate max-w-[100px]">{fichierNom}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdByNom",
    header: "Créé par",
    cell: ({ row }) => {
      const createdByNom = row.original.createdByNom;
      if (!createdByNom) {
        return <span className="text-xs text-muted-foreground">-</span>;
      }
      return <span className="text-xs">{createdByNom}</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const depense = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(depense)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(depense)}
              className="text-destructive"
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
