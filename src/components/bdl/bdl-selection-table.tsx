"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getBdlStatusStyle, getBdlStatusLabel } from "@/lib/utils/bdl";
import type { Bdl } from "@/lib/types/bdl";

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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  disabled={selectableBdls.length === 0}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Numéro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                BDC
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date livraison
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Livreur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bdls.length > 0 ? (
              bdls.map((bdl) => {
                const isSelectable = bdl.statut === "LIVRE" && !bdl.factureId;
                const isSelected = selectedBdlIds.includes(bdl.id);

                return (
                  <tr
                    key={bdl.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isSelected ? "bg-brand/5" : ""
                    }`}
                  >
                    <td className="px-4 py-4">
                      {isSelectable ? (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggle(bdl.id)}
                        />
                      ) : (
                        <Checkbox disabled />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {bdl.numero}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/bdc/${bdl.bdcId}`}
                        className="text-brand hover:underline"
                      >
                        {bdl.bdcNumero}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bdl.clientNom}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(bdl.dateLivraison, "dd MMM yyyy", {
                          locale: fr,
                        })}
                      </div>
                      {bdl.heureLivraison && (
                        <div className="text-xs text-gray-500">
                          {bdl.heureLivraison}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bdl.nomLivreur || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {bdl.totalNet.toLocaleString("fr-FR")} GNF
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/bdl/${bdl.id}`}>
                        <Button variant="ghost" size="sm">
                          Voir
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <p className="text-lg font-medium">
                    Aucun bon de livraison trouvé
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
