"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, FileText, Send, CheckCircle, Download, Mail } from "lucide-react";
import { useProformas } from "@/lib/hooks/use-proformas";
import { useClients } from "@/lib/hooks/use-clients";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { pdf } from "@react-pdf/renderer";
import { ProformaPDFTemplate } from "@/components/proformas/proforma-pdf-template";

export default function ProformasPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "BROUILLON" | "ENVOYE" | "VALIDE">("all");

  const { data: proformas, isLoading, error } = useProformas();
  const { data: clients } = useClients();

  const handleAddProforma = () => {
    router.push("/proformas/nouveau");
  };

  const handleDownloadPDF = async (proforma: any) => {
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
    }
  };

  const handleSendEmail = async (proforma: any) => {
    try {
      // Trouver le client
      const client = clients?.find((c) => c.id === proforma.clientId);

      // Générer le PDF
      const blob = await pdf(<ProformaPDFTemplate proforma={proforma} />).toBlob();

      // Convertir le blob en base64 pour l'attacher
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result as string;

        // Préparer le contenu de l'email
        const emailTo = client?.email || "";
        const emailSubject = `Proforma ${proforma.numero} - ${proforma.clientNom}`;
        const emailBody = `Bonjour,

Veuillez trouver ci-joint notre proforma ${proforma.numero} d'un montant de ${proforma.totalNet.toLocaleString("fr-FR")} GNF.

Ce proforma est valable ${proforma.dateLivraison}.

N'hésitez pas à nous contacter pour toute question.

Cordialement,
Réseau Africain de Développement (RAD)`;

        // Créer un lien mailto avec le PDF encodé (note: les pièces jointes ne fonctionnent pas toujours avec mailto)
        // Pour une vraie implémentation, il faudrait un service backend d'envoi d'emails
        const mailtoLink = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

        // Ouvrir le client email
        window.open(mailtoLink, '_blank');

        // Télécharger aussi le PDF pour que l'utilisateur puisse l'attacher manuellement
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

  // Statistiques
  const stats = {
    brouillons: proformas?.filter((p) => p.statut === "BROUILLON").length || 0,
    envoyes: proformas?.filter((p) => p.statut === "ENVOYE").length || 0,
    valides: proformas?.filter((p) => p.statut === "VALIDE").length || 0,
  };

  // Filtrage
  const filteredProformas = proformas?.filter((proforma) => {
    const matchesSearch =
      proforma.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proforma.clientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proforma.numeroDA.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === "all" || proforma.statut === filterStatus;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Gestion des proformas
        </h1>
        <p className="text-base text-gray-500">
          Créez et gérez vos devis et proformas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card
          className={`border cursor-pointer transition-all ${
            filterStatus === "BROUILLON"
              ? "border-gray-400 shadow-md"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => setFilterStatus(filterStatus === "BROUILLON" ? "all" : "BROUILLON")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Brouillons</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.brouillons}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`border cursor-pointer transition-all ${
            filterStatus === "ENVOYE"
              ? "border-blue-400 shadow-md"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => setFilterStatus(filterStatus === "ENVOYE" ? "all" : "ENVOYE")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Envoyés</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.envoyes}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Send className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`border cursor-pointer transition-all ${
            filterStatus === "VALIDE"
              ? "border-green-400 shadow-md"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => setFilterStatus(filterStatus === "VALIDE" ? "all" : "VALIDE")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Validés</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.valides}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher un proforma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Tous les statuts
          </Button>
          <Button onClick={handleAddProforma} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Nouveau proforma
          </Button>
        </div>
      </div>

      {/* Liste des proformas */}
      <Card className="border-border">
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-gray-900">
              Liste des proformas
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredProformas?.length || 0} proforma(s) au total
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Chargement...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-red-600">Erreur lors du chargement des proformas</div>
            </div>
          ) : filteredProformas && filteredProformas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Numéro
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {filteredProformas.map((proforma) => (
                    <tr
                      key={proforma.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {proforma.numero}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-[200px] truncate">
                          {proforma.clientNom}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {format(proforma.dateCreation, "dd/MM/yyyy", { locale: fr })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {proforma.totalNet.toLocaleString("fr-FR")} GNF
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadPDF(proforma)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Télécharger PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendEmail(proforma)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Envoyer par email"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Link href={`/proformas/${proforma.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            >
                              Voir détails
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FileText className="h-12 w-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium">Aucun proforma trouvé</p>
              <p className="text-sm text-gray-400 mt-1">
                Commencez par créer votre premier proforma
              </p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
