"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Search, Plus } from "lucide-react";
import { useBdcs } from "@/lib/hooks/use-bdc";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getBdcStatusStyle, getBdcStatusLabel } from "@/lib/utils/bdc";
import { BdcStatut } from "@/lib/types/bdc";
import { BdcFormSheet } from "@/components/bdc/bdc-form-sheet";

export default function BdcPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<BdcStatut | "all">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: bdcs, isLoading, error } = useBdcs();

  // Filtrer les BDCs
  const filteredBdcs = bdcs?.filter((bdc) => {
    const matchesSearch =
      searchTerm === "" ||
      bdc.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bdc.clientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bdc.proformaNumero &&
        bdc.proformaNumero.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === "all" || bdc.statut === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Calculer les stats
  const stats = {
    brouillons: bdcs?.filter((bdc) => bdc.statut === "BROUILLON").length || 0,
    envoyes: bdcs?.filter((bdc) => bdc.statut === "ENVOYE").length || 0,
    approuves: bdcs?.filter((bdc) => bdc.statut === "APPROUVE").length || 0,
    annules: bdcs?.filter((bdc) => bdc.statut === "ANNULE").length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">Erreur lors du chargement des BDCs</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des bons de commande
          </h1>
          <p className="text-gray-500">
            Gérez les bons de commande générés depuis les proformas validés
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-brand hover:bg-brand/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau BDC
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card
          className={`cursor-pointer transition-all ${
            filterStatus === "BROUILLON" ? "ring-2 ring-brand" : ""
          }`}
          onClick={() =>
            setFilterStatus(filterStatus === "BROUILLON" ? "all" : "BROUILLON")
          }
        >
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Brouillons</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.brouillons}
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            filterStatus === "ENVOYE" ? "ring-2 ring-brand" : ""
          }`}
          onClick={() =>
            setFilterStatus(filterStatus === "ENVOYE" ? "all" : "ENVOYE")
          }
        >
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Envoyés</p>
            <p className="text-3xl font-bold text-brand mt-2">
              {stats.envoyes}
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            filterStatus === "APPROUVE" ? "ring-2 ring-brand" : ""
          }`}
          onClick={() =>
            setFilterStatus(filterStatus === "APPROUVE" ? "all" : "APPROUVE")
          }
        >
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Approuvés</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats.approuves}
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            filterStatus === "ANNULE" ? "ring-2 ring-brand" : ""
          }`}
          onClick={() =>
            setFilterStatus(filterStatus === "ANNULE" ? "all" : "ANNULE")
          }
        >
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Annulés</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {stats.annules}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher par numéro, client ou proforma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {filterStatus !== "all" && (
              <Button variant="outline" onClick={() => setFilterStatus("all")}>
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des BDCs */}
      <Card>
        <CardContent className="p-0">
          {filteredBdcs && filteredBdcs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Numéro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proforma
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date commande
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBdcs.map((bdc) => (
                    <tr key={bdc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {bdc.numero}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {bdc.proformaNumero || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {bdc.clientNom}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {format(bdc.dateCommande, "dd/MM/yyyy", {
                            locale: fr,
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {bdc.totalNet.toLocaleString("fr-FR")} GNF
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBdcStatusStyle(
                            bdc.statut
                          )}`}
                        >
                          {getBdcStatusLabel(bdc.statut)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link href={`/bdc/${bdc.id}`}>
                          <Button variant="ghost" size="sm">
                            Voir détails
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">Aucun BDC trouvé</p>
              <p className="text-sm opacity-70 mt-1">
                Les BDCs sont générés automatiquement depuis les proformas validés
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulaire BDC */}
      <BdcFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        bdc={null}
      />
    </div>
  );
}
