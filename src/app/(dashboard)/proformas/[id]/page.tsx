"use client";

import { use } from "react";
import { useProforma } from "@/lib/hooks/use-proformas";
import { useClients } from "@/lib/hooks/use-clients";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Edit,
  Download,
  Send,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { pdf } from "@react-pdf/renderer";
import { ProformaPDFTemplate } from "@/components/proformas/proforma-pdf-template";

export default function ProformaDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: proforma, isLoading, error } = useProforma(id);
  const { data: clients } = useClients();

  const handleDownloadPDF = async () => {
    if (!proforma) return;
    try {
      const blob = await pdf(<ProformaPDFTemplate proforma={proforma} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Proforma_${proforma.numero.replace(/\//g, "_")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la génération du PDF");
    }
  };

  const handleSendEmail = async () => {
    if (!proforma) return;
    try {
      // Trouver le client
      const client = clients?.find((c) => c.id === proforma.clientId);

      // Générer le PDF
      const blob = await pdf(<ProformaPDFTemplate proforma={proforma} />).toBlob();

      // Convertir le blob en base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        // Préparer le contenu de l'email
        const emailTo = client?.email || "";
        const emailSubject = `Proforma ${proforma.numero} - ${proforma.clientNom}`;
        const emailBody = `Bonjour,

Veuillez trouver ci-joint notre proforma ${proforma.numero} d'un montant de ${proforma.totalNet.toLocaleString("fr-FR")} GNF.

Ce proforma est valable ${proforma.dateLivraison}.

N'hésitez pas à nous contacter pour toute question.

Cordialement,
Réseau Africain de Développement (RAD)`;

        // Créer un lien mailto
        const mailtoLink = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

        // Ouvrir le client email
        window.open(mailtoLink, '_blank');

        // Télécharger aussi le PDF pour attachement manuel
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Proforma_${proforma.numero.replace(/\//g, "_")}.pdf`;
        link.click();
        URL.revokeObjectURL(url);

        alert("Le PDF a été téléchargé. Veuillez l'attacher manuellement à votre email.");
      };
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la préparation de l'email");
    }
  };

  const handleGenerateBDC = () => {
    alert("Génération du BDC à implémenter");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !proforma) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">Proforma introuvable</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Header avec actions */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {proforma.numero}
            </h1>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                proforma.statut === "BROUILLON"
                  ? "bg-gray-100 text-gray-800"
                  : proforma.statut === "ENVOYE"
                  ? "bg-blue-100 text-blue-800"
                  : proforma.statut === "VALIDE"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {proforma.statut === "BROUILLON"
                ? "Brouillon"
                : proforma.statut === "ENVOYE"
                ? "Envoyé"
                : proforma.statut === "VALIDE"
                ? "Validé"
                : "Rejeté"}
            </span>
          </div>
          <p className="text-base text-gray-500 mt-1">
            Client: {proforma.clientNom}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {proforma.statut === "BROUILLON" && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => router.push(`/proformas/${id}/modifier`)}
            >
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
          )}
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleDownloadPDF}
          >
            <Download className="h-4 w-4" />
            Télécharger PDF
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleSendEmail}>
            <Send className="h-4 w-4" />
            Envoyer par email
          </Button>
          {proforma.statut === "VALIDE" && (
            <Button
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={handleGenerateBDC}
            >
              <ShoppingCart className="h-4 w-4" />
              Générer BDC
            </Button>
          )}
        </div>
      </div>

      {/* Informations générales */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Date d'émission</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {format(proforma.dateCreation, "dd MMMM yyyy", { locale: fr })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Validité</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {proforma.dateLivraison}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Montant total</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {proforma.totalNet.toLocaleString("fr-FR")} GNF
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Détail des articles */}
      <Card>
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-gray-900">
              Détail des articles
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-medium text-gray-600">
                    Désignation
                  </th>
                  <th className="px-6 py-4 text-left font-medium text-gray-600">
                    Unité
                  </th>
                  <th className="px-6 py-4 text-right font-medium text-gray-600">
                    Quantité
                  </th>
                  <th className="px-6 py-4 text-right font-medium text-gray-600">
                    Prix unitaire
                  </th>
                  <th className="px-6 py-4 text-right font-medium text-gray-600">
                    Total HT
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {proforma.lignes.map((ligne) => (
                  <tr key={ligne.numero} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {ligne.designation}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{ligne.unite}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm text-gray-900">
                        {ligne.quantite}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm text-gray-900">
                        {ligne.prixUnitaire.toLocaleString("fr-FR")} GNF
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {ligne.prixTotal.toLocaleString("fr-FR")} GNF
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totaux */}
          <div className="border-t bg-gray-50 px-6 py-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Sous-total HT</span>
              <span className="font-medium">
                {proforma.total.toLocaleString("fr-FR")} GNF
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                TVA ({proforma.remisePourcentage}%)
              </span>
              <span className="font-medium">
                {proforma.remiseMontant.toLocaleString("fr-FR")} GNF
              </span>
            </div>

            <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
              <span>Total TTC</span>
              <span>{proforma.totalNet.toLocaleString("fr-FR")} GNF</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
