"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getBdlStatusStyle, getBdlStatusLabel } from "@/lib/utils/bdl";
import type { Bdl } from "@/lib/types/bdl";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BdlSelectionTableProps {
  bdls: Bdl[];
  selectedBdlIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onCreateFacture: () => void;
}

export function BdlSelectionTable({
  bdls,
  selectedBdlIds,
  onSelectionChange,
  onCreateFacture,
}: BdlSelectionTableProps) {
  // Filtre des BDL sélectionnables (LIVRE et non facturés)
  const selectableBdls = useMemo(
    () => bdls.filter((bdl) => bdl.statut === "LIVRE" && !bdl.factureId),
    [bdls]
  );

  // BDL sélectionnés
  const selectedBdls = useMemo(
    () => bdls.filter((bdl) => selectedBdlIds.includes(bdl.id)),
    [bdls, selectedBdlIds]
  );

  // Total sélectionné
  const selectedTotal = useMemo(
    () => selectedBdls.reduce((sum, bdl) => sum + bdl.totalNet, 0),
    [selectedBdls]
  );

  // Validation: tous les BDL doivent être du même client
  const validateSelection = (newIds: string[]): boolean => {
    if (newIds.length === 0) return true;

    const selected = bdls.filter((b) => newIds.includes(b.id));
    const clientIds = new Set(selected.map((b) => b.clientId));

    if (clientIds.size > 1) {
      alert("Tous les BDL sélectionnés doivent appartenir au même client");
      return false;
    }

    return true;
  };

  // Toggle individuel
  const handleToggle = (bdlId: string) => {
    const newSelection = selectedBdlIds.includes(bdlId)
      ? selectedBdlIds.filter((id) => id !== bdlId)
      : [...selectedBdlIds, bdlId];

    if (validateSelection(newSelection)) {
      onSelectionChange(newSelection);
    }
  };

  // Toggle "Tout sélectionner"
  const handleSelectAll = () => {
    if (selectedBdlIds.length === selectableBdls.length && selectableBdls.length > 0) {
      // Désélectionner tout
      onSelectionChange([]);
    } else {
      // Sélectionner tous les BDL du même client que le premier sélectionnable
      if (selectableBdls.length > 0) {
        const firstBdl = selectableBdls[0];
        const sameClientBdls = selectableBdls
          .filter((b) => b.clientId === firstBdl.clientId)
          .map((b) => b.id);
        onSelectionChange(sameClientBdls);
      }
    }
  };

  // Vérifie si tous les sélectionnables sont sélectionnés
  const allSelected =
    selectableBdls.length > 0 &&
    selectedBdlIds.length === selectableBdls.length;

  // Définition des colonnes
  const columns = useMemo<ColumnDef<Bdl>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <Checkbox
            checked={allSelected}
            onCheckedChange={handleSelectAll}
            disabled={selectableBdls.length === 0}
          />
        ),
        cell: ({ row }) => {
          const bdl = row.original;
          const isSelectable = bdl.statut === "LIVRE" && !bdl.factureId;
          const isSelected = selectedBdlIds.includes(bdl.id);

          return isSelectable ? (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => handleToggle(bdl.id)}
            />
          ) : (
            <Checkbox disabled />
          );
        },
      },
      {
        accessorKey: "numero",
        header: "Numéro",
        cell: ({ row }) => <div className="font-medium">{row.getValue("numero")}</div>,
      },
      {
        accessorKey: "bdcNumero",
        header: "BDC",
        cell: ({ row }) => {
          const bdl = row.original;
          return (
            <Link
              href={`/bdc/${bdl.bdcId}`}
              className="text-brand hover:underline"
            >
              {bdl.bdcNumero}
            </Link>
          );
        },
      },
      {
        accessorKey: "clientNom",
        header: "Client",
      },
      {
        accessorKey: "dateLivraison",
        header: "Date livraison",
        cell: ({ row }) => {
          const bdl = row.original;
          return (
            <div>
              <div className="text-sm text-gray-900">
                {format(bdl.dateLivraison, "dd MMM yyyy", { locale: fr })}
              </div>
              {bdl.heureLivraison && (
                <div className="text-xs text-gray-500">
                  {bdl.heureLivraison}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "nomLivreur",
        header: "Livreur",
        cell: ({ row }) => row.original.nomLivreur || "-",
      },
      {
        accessorKey: "statut",
        header: "Statut",
        cell: ({ row }) => {
          const bdl = row.original;
          return (
            <div className="flex flex-col gap-1">
              <Badge className={getBdlStatusStyle(bdl.statut)}>
                {getBdlStatusLabel(bdl.statut)}
              </Badge>
              {bdl.factureId && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 border-blue-300 text-blue-700"
                >
                  Facturé
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "totalNet",
        header: "Montant",
        cell: ({ row }) => (
          <div className="text-right font-medium">
            {row.original.totalNet.toLocaleString("fr-FR")} GNF
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="text-right">
            <Link href={`/bdl/${row.original.id}`}>
              <Button variant="ghost" size="sm">
                Voir
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    [allSelected, selectableBdls, selectedBdlIds, handleSelectAll, handleToggle]
  );

  const table = useReactTable({
    data: bdls,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div>
      {/* Barre d'actions sticky */}
      {selectedBdlIds.length > 0 && (
        <div className="sticky top-0 z-10 bg-brand/10 border border-brand p-4 rounded-lg mb-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-brand">
                {selectedBdlIds.length} BDL(s) sélectionné(s)
              </p>
              <p className="text-sm text-gray-600">
                Total: {selectedTotal.toLocaleString("fr-FR")} GNF
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onSelectionChange([])}
              >
                Désélectionner tout
              </Button>
              <Button
                onClick={onCreateFacture}
                className="bg-brand hover:bg-brand/90"
              >
                <FileText className="h-4 w-4 mr-2" />
                Créer une facture
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={selectedBdlIds.includes(row.original.id) && "selected"}
                  className={selectedBdlIds.includes(row.original.id) ? "bg-brand/5" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucun bon de livraison trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {selectedBdlIds.length > 0 && (
            <span>
              {selectedBdlIds.length} BDL(s) sélectionné(s)
            </span>
          )}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Lignes par page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} sur{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Aller à la première page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Page précédente</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Page suivante</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Aller à la dernière page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
