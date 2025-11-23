"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Proforma } from "@/lib/types/proforma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2, FileText, Download } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { ProformaPDFTemplate } from "@/components/proformas/proforma-pdf-template";
import { useDeleteProforma } from "@/lib/hooks/use-proformas";

const statutColors = {
  BROUILLON: "bg-gray-500",
  ENVOYE: "bg-blue-500",
  VALIDE: "bg-green-500",
  REJETE: "bg-red-500",
};

const statutLabels = {
  BROUILLON: "Brouillon",
  ENVOYE: "Envoyé",
  VALIDE: "Validé",
  REJETE: "Rejeté",
};

interface CreateColumnsProps {
  onEdit: (proforma: Proforma) => void;
  onView: (proforma: Proforma) => void;
}

export function createColumns({
  onEdit,
  onView,
}: CreateColumnsProps): ColumnDef<Proforma>[] {
  return [
    {
      accessorKey: "numero",
      header: "N° Proforma",
      cell: ({ row }) => {
        const numero = row.getValue("numero") as string;
        return <div className="font-medium">{numero}</div>;
      },
    },
    {
      accessorKey: "numeroDA",
      header: "N° DA",
      cell: ({ row }) => {
        const numeroDA = row.getValue("numeroDA") as string;
        return <div className="text-sm">{numeroDA}</div>;
      },
    },
    {
      accessorKey: "clientNom",
      header: "Client",
      cell: ({ row }) => {
        const clientNom = row.getValue("clientNom") as string;
        return <div className="max-w-[200px] truncate">{clientNom}</div>;
      },
    },
    {
      accessorKey: "totalNet",
      header: "Montant (GNF)",
      cell: ({ row }) => {
        const montant = row.getValue("totalNet") as number;
        return (
          <div className="font-medium">
            {montant.toLocaleString("fr-FR")} GNF
          </div>
        );
      },
    },
    {
      accessorKey: "statut",
      header: "Statut",
      cell: ({ row }) => {
        const statut = row.getValue("statut") as Proforma["statut"];
        return (
          <Badge className={statutColors[statut]}>
            {statutLabels[statut]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "dateCreation",
      header: "Date création",
      cell: ({ row }) => {
        const date = row.getValue("dateCreation") as Date;
        return (
          <div className="text-sm text-muted-foreground">
            {format(date, "dd/MM/yyyy", { locale: fr })}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const proforma = row.original;
        const deleteMutation = useDeleteProforma();

        const handleGeneratePDF = async () => {
          try {
            const blob = await pdf(
              <ProformaPDFTemplate proforma={proforma} />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Proforma_${proforma.numero.replace(/\//g, "_")}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
          } catch (error) {
            console.error("Erreur lors de la génération du PDF:", error);
            alert("Erreur lors de la génération du PDF");
          }
        };

        const handleDelete = async () => {
          if (
            confirm(
              `Êtes-vous sûr de vouloir supprimer le proforma ${proforma.numero} ?`
            )
          ) {
            try {
              await deleteMutation.mutateAsync(proforma.id);
            } catch (error) {
              console.error("Erreur lors de la suppression:", error);
              alert("Erreur lors de la suppression du proforma");
            }
          }
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView(proforma)}>
                <Eye className="mr-2 h-4 w-4" />
                Voir détails
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleGeneratePDF}>
                <Download className="mr-2 h-4 w-4" />
                Télécharger PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {proforma.statut === "BROUILLON" && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(proforma)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={handleDelete}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
