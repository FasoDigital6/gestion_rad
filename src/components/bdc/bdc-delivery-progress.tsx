"use client";

import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Truck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBdcDeliveryProgress, useBdlsByBdc } from "@/lib/hooks/use-bdl";
import { getBdlStatusStyle, getBdlStatusLabel } from "@/lib/utils/bdl";
import { Bdc } from "@/lib/types/bdc";

interface BdcDeliveryProgressProps {
  bdc: Bdc;
  onCreateBdl?: () => void;
}

export function BdcDeliveryProgress({
  bdc,
  onCreateBdl,
}: BdcDeliveryProgressProps) {
  const { data: progress, isLoading: progressLoading, error: progressError } =
    useBdcDeliveryProgress(bdc.id);
  const { data: bdls, isLoading: bdlsLoading } = useBdlsByBdc(bdc.id);

  const isLoading = progressLoading || bdlsLoading;
  const canCreateBdl =
    bdc.statut === "APPROUVE" && progress && !progress.estCompletementLivre;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Progression de livraison
        </CardTitle>
        <CardDescription>
          État des livraisons pour ce bon de commande
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* État de chargement */}
        {isLoading && (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        )}

        {/* Erreur */}
        {!isLoading && progressError && (
          <div className="text-center py-4">
            <p className="text-destructive">Erreur lors du chargement des données de livraison</p>
          </div>
        )}

        {/* Contenu si données disponibles */}
        {!isLoading && progress && (
          <>
            {/* Progression globale */}
            <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progression globale</span>
            <span className="text-sm font-semibold text-brand">
              {progress.pourcentageGlobalLivre.toFixed(1)}%
            </span>
          </div>
          <Progress
            value={progress.pourcentageGlobalLivre}
            className="h-3"
          />
          {progress.estCompletementLivre && (
            <p className="text-xs text-success mt-2 font-medium">
              ✓ Commande entièrement livrée
            </p>
          )}
        </div>

        {/* Progression par ligne */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Détails par article</h4>
          {progress.lignesProgress.map((ligne) => (
            <div
              key={ligne.ligneNumero}
              className="border rounded-lg p-4 space-y-2 bg-card"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="font-medium text-sm">{ligne.designation}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Unité: {ligne.unite}
                  </p>
                </div>
                <Badge
                  className={
                    ligne.quantiteRestante === 0
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {ligne.quantiteTotaleLivree} / {ligne.quantiteCommandee}{" "}
                  {ligne.unite}
                </Badge>
              </div>
              <Progress value={ligne.pourcentageLivre} className="h-2" />
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">
                  Livré: {ligne.pourcentageLivre.toFixed(1)}%
                </span>
                <span
                  className={
                    ligne.quantiteRestante > 0
                      ? "text-brand font-medium"
                      : "text-muted-foreground"
                  }
                >
                  Restant: {ligne.quantiteRestante} {ligne.unite}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Liste des BDLs associés */}
        {bdls && bdls.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">
              Bons de livraison associés ({bdls.length})
            </h4>
            <div className="space-y-2">
              {bdls.map((bdl) => (
                <Link
                  key={bdl.id}
                  href={`/bdl/${bdl.id}`}
                  className="block"
                >
                  <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{bdl.numero}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(bdl.dateLivraison, "dd MMMM yyyy", {
                          locale: fr,
                        })}
                        {bdl.nomLivreur && ` • ${bdl.nomLivreur}`}
                      </p>
                    </div>
                    <Badge className={getBdlStatusStyle(bdl.statut)}>
                      {getBdlStatusLabel(bdl.statut)}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

            {/* Bouton créer nouveau BDL */}
            {canCreateBdl && onCreateBdl && (
              <Button
                className="w-full"
                onClick={onCreateBdl}
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer nouveau bon de livraison
              </Button>
            )}

            {!canCreateBdl && bdc.statut !== "APPROUVE" && (
              <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  ⚠️ Le BDC doit être approuvé pour créer un bon de livraison
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Utilisez les boutons ci-dessus pour changer le statut
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
