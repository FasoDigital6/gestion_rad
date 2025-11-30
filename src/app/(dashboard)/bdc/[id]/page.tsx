"use client";

import { use, useState } from "react";
import { useBdc } from "@/lib/hooks/use-bdc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { getBdcStatusStyle, getBdcStatusLabel, canEditBdc } from "@/lib/utils/bdc";
import { BdcFormSheet } from "@/components/bdc/bdc-form-sheet";
import { BdcActions } from "@/components/bdc/bdc-actions";
import { BdcDeliveryProgress } from "@/components/bdc/bdc-delivery-progress";
import { BdlFormSheet } from "@/components/bdl/bdl-form-sheet";

export default function BdcDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: bdc, isLoading, error } = useBdc(id);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBdlFormOpen, setIsBdlFormOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !bdc) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur lors du chargement du BDC</p>
          <Button onClick={() => router.push("/bdc")}>Retour à la liste</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push("/bdc")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour à la liste
      </Button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              BDC {bdc.numero}
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getBdcStatusStyle(
                  bdc.statut
                )}`}
              >
                {getBdcStatusLabel(bdc.statut)}
              </span>
            </h1>
            <p className="text-base text-gray-500 mt-1">
              Client: {bdc.clientNom}
            </p>
          </div>
          {canEditBdc(bdc) && (
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-brand hover:bg-brand/90"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          )}
        </div>

        {/* Actions de changement de statut */}
        <BdcActions bdc={bdc} />
      </div>

      {/* Lien vers proforma source */}
      {bdc.proformaId && bdc.proformaNumero && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Créé depuis le proforma</p>
                <p className="text-lg font-semibold text-brand">
                  {bdc.proformaNumero}
                </p>
              </div>
              <Link href={`/proformas/${bdc.proformaId}`}>
                <Button variant="outline" size="sm">
                  Voir le proforma
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informations générales */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Date de commande</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {format(bdc.dateCommande, "dd/MM/yyyy", { locale: fr })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">
              Date de livraison souhaitée
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {bdc.dateLivraisonSouhaitee || "Non spécifiée"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Montant total</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {bdc.totalNet.toLocaleString("fr-FR")} GNF
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Articles commandés */}
      <Card className="mb-8">
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-gray-900">
              Articles commandés
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N°
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Désignation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unité
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix unitaire
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bdc.lignes.map((ligne) => (
                  <tr key={ligne.numero}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ligne.numero}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {ligne.designation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ligne.unite}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {ligne.quantite}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {ligne.prixUnitaire.toLocaleString("fr-FR")} GNF
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {ligne.prixTotal.toLocaleString("fr-FR")} GNF
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-sm font-medium text-gray-900 text-right"
                  >
                    Sous-total HT
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    {bdc.total.toLocaleString("fr-FR")} GNF
                  </td>
                </tr>
                {bdc.remisePourcentage > 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-sm font-medium text-gray-900 text-right"
                    >
                      Remise ({bdc.remisePourcentage}%)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600 text-right">
                      -{bdc.remiseMontant.toLocaleString("fr-FR")} GNF
                    </td>
                  </tr>
                )}
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-base font-bold text-gray-900 text-right"
                  >
                    TOTAL TTC
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-gray-900 text-right">
                    {bdc.totalNet.toLocaleString("fr-FR")} GNF
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Progression de livraison */}
      <div className="mb-8">
        <BdcDeliveryProgress
          bdc={bdc}
          onCreateBdl={() => setIsBdlFormOpen(true)}
        />
      </div>

      {/* Informations additionnelles */}
      {(bdc.notes || bdc.conditionsPaiement) && (
        <div className="grid gap-6 md:grid-cols-2">
          {bdc.notes && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Notes
                </h3>
                <p className="text-gray-900 whitespace-pre-wrap">{bdc.notes}</p>
              </CardContent>
            </Card>
          )}
          {bdc.conditionsPaiement && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Conditions de paiement
                </h3>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {bdc.conditionsPaiement}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Formulaire d'édition BDC */}
      <BdcFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        bdc={bdc}
      />

      {/* Formulaire de création BDL */}
      <BdlFormSheet
        open={isBdlFormOpen}
        onOpenChange={setIsBdlFormOpen}
        bdc={bdc}
      />
    </div>
  );
}
