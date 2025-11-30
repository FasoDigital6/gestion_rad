"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, FileText, Truck, User, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBdl } from "@/lib/hooks/use-bdl";
import { getBdlStatusStyle, getBdlStatusLabel } from "@/lib/utils/bdl";
import { BdlActions } from "@/components/bdl/bdl-actions";
import { BdlLignesTable } from "@/components/bdl/bdl-lignes-table";

interface BdlDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function BdlDetailsPage({ params }: BdlDetailsPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: bdl, isLoading, error } = useBdl(resolvedParams.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  if (error || !bdl) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">BDL introuvable</p>
          <Button onClick={() => router.push("/bdl")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/bdl")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux bons de livraison
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Truck className="h-8 w-8 text-brand" />
              <h1 className="text-3xl font-bold text-gray-900">
                Bon de livraison {bdl.numero}
              </h1>
              <Badge className={getBdlStatusStyle(bdl.statut)}>
                {getBdlStatusLabel(bdl.statut)}
              </Badge>
            </div>
            <p className="text-gray-500">{bdl.clientNom}</p>
          </div>

          <BdlActions bdl={bdl} />
        </div>
      </div>

      {/* Référence BDC */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bon de commande source
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Link href={`/bdc/${bdl.bdcId}`}>
            <Button variant="outline" className="w-full md:w-auto">
              <FileText className="mr-2 h-4 w-4" />
              Voir le BDC {bdl.bdcNumero}
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Informations de livraison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date de livraison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {format(bdl.dateLivraison, "dd MMM yyyy", { locale: fr })}
            </p>
          </CardContent>
        </Card>

        {bdl.heureLivraison && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Heure de livraison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{bdl.heureLivraison}</p>
            </CardContent>
          </Card>
        )}

        {bdl.nomLivreur && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <User className="h-4 w-4" />
                Livreur / Transporteur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">{bdl.nomLivreur}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Informations complémentaires */}
      {(bdl.observations || bdl.signatureReception) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {bdl.observations && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Observations de livraison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {bdl.observations}
                </p>
              </CardContent>
            </Card>
          )}

          {bdl.signatureReception && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Signature / Preuve de réception
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900">{bdl.signatureReception}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Articles livrés */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Articles livrés</CardTitle>
        </CardHeader>
        <CardContent>
          <BdlLignesTable
            lignes={bdl.lignes}
            total={bdl.total}
            remisePourcentage={bdl.remisePourcentage}
            remiseMontant={bdl.remiseMontant}
            totalNet={bdl.totalNet}
          />
        </CardContent>
      </Card>

      {/* Notes internes */}
      {bdl.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Notes internes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900 whitespace-pre-wrap">{bdl.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Informations de génération */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Créé le :</span>{" "}
            {format(bdl.dateCreation, "dd/MM/yyyy à HH:mm", { locale: fr })}
          </div>
          {bdl.dateModification && (
            <div>
              <span className="font-medium">Modifié le :</span>{" "}
              {format(bdl.dateModification, "dd/MM/yyyy à HH:mm", {
                locale: fr,
              })}
            </div>
          )}
          <div>
            <span className="font-medium">Lieu :</span> {bdl.lieu}
          </div>
        </div>
      </div>
    </div>
  );
}
