"use client";

import { use, useState } from "react";
import { useFacture } from "@/lib/hooks/use-facture";
import { usePaiementsByFacture } from "@/lib/hooks/use-paiement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  getFactureStatusLabel,
  getFactureStatusStyle,
} from "@/lib/utils/facture";
import { FactureActions } from "@/components/facture/facture-actions";
import { FactureLignesTable } from "@/components/facture/facture-lignes-table";
import { PaiementSummaryCard } from "@/components/paiement/paiement-summary-card";
import { PaiementHistoryTable } from "@/components/paiement/paiement-history-table";
import { PaiementFormDialog } from "@/components/paiement/paiement-form-dialog";

export default function FactureDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: facture, isLoading, error } = useFacture(id);
  const { data: paiements = [] } = usePaiementsByFacture(id);
  const [isPaiementFormOpen, setIsPaiementFormOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !facture) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Facture non trouvée
          </h2>
          <p className="text-gray-500 mb-4">
            La facture demandée n'existe pas ou a été supprimée.
          </p>
          <Button onClick={() => router.push("/factures")}>
            Retour aux factures
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Bouton retour */}
      <Button
        variant="ghost"
        onClick={() => router.push("/factures")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour aux factures
      </Button>

      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            Facture {facture.numero}
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getFactureStatusStyle(
                facture.statut
              )}`}
            >
              {getFactureStatusLabel(facture.statut)}
            </span>
          </h1>
          <p className="text-base text-gray-500 mt-1">
            Client:{" "}
            <Link
              href={`/clients/${facture.clientId}`}
              className="text-brand hover:underline"
            >
              {facture.clientNom}
            </Link>
          </p>
        </div>

        {/* Actions */}
        <FactureActions facture={facture} />
      </div>

      {/* Lien vers BDL sources */}
      {facture.bdlIds && facture.bdlIds.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Généré depuis les bons de livraison:</strong>{" "}
            {facture.bdlNumeros?.map((numero, index) => (
              <span key={facture.bdlIds![index]}>
                <Link
                  href={`/bdl/${facture.bdlIds![index]}`}
                  className="text-brand hover:underline font-medium"
                >
                  {numero}
                </Link>
                {index < facture.bdlNumeros!.length - 1 && ", "}
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Motif annulation */}
      {facture.statut === "ANNULEE" && facture.motifAnnulation && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800">
            Motif d'annulation:
          </p>
          <p className="text-sm text-red-700 mt-1">{facture.motifAnnulation}</p>
        </div>
      )}

      {/* Informations générales */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Dates
              </h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Émission:</dt>
                  <dd className="text-sm font-medium">
                    {format(facture.dateEmission, "dd MMM yyyy", { locale: fr })}
                  </dd>
                </div>
                {facture.dateEcheance && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Échéance:</dt>
                    <dd className="text-sm font-medium">
                      {format(facture.dateEcheance, "dd MMM yyyy", {
                        locale: fr,
                      })}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Création:</dt>
                  <dd className="text-sm font-medium">
                    {format(facture.dateCreation, "dd MMM yyyy HH:mm", {
                      locale: fr,
                    })}
                  </dd>
                </div>
                {facture.datePayeeComplete && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Payée le:</dt>
                    <dd className="text-sm font-medium text-green-600">
                      {format(facture.datePayeeComplete, "dd MMM yyyy", {
                        locale: fr,
                      })}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Détails
              </h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Lieu:</dt>
                  <dd className="text-sm font-medium">{facture.lieu}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Fournisseur:</dt>
                  <dd className="text-sm font-medium">{facture.fournisseur}</dd>
                </div>
                {facture.conditionsPaiement && (
                  <div>
                    <dt className="text-sm text-gray-600 mb-1">
                      Conditions de paiement:
                    </dt>
                    <dd className="text-sm font-medium">
                      {facture.conditionsPaiement}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lignes de facture */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Articles facturés</CardTitle>
        </CardHeader>
        <CardContent>
          <FactureLignesTable
            lignes={facture.lignes}
            total={facture.total}
            remisePourcentage={facture.remisePourcentage}
            remiseMontant={facture.remiseMontant}
            totalNet={facture.totalNet}
          />
        </CardContent>
      </Card>

      {/* Paiements */}
      {facture.statut !== "BROUILLON" && facture.statut !== "ANNULEE" && (
        <div className="space-y-6 mb-6">
          <PaiementSummaryCard
            facture={facture}
            onAddPaiement={() => setIsPaiementFormOpen(true)}
          />
          <PaiementHistoryTable paiements={paiements} />
        </div>
      )}

      {/* Notes */}
      {facture.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes internes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {facture.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog ajout paiement */}
      {facture.statut !== "BROUILLON" && facture.statut !== "ANNULEE" && (
        <PaiementFormDialog
          open={isPaiementFormOpen}
          onOpenChange={setIsPaiementFormOpen}
          facture={facture}
        />
      )}
    </div>
  );
}
