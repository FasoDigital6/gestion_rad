"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Search, Plus } from "lucide-react";
import { useFactures } from "@/lib/hooks/use-facture";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  getFactureStatusLabel,
  getFactureStatusStyle,
  formatMontant,
} from "@/lib/utils/facture";
import type { FactureStatut } from "@/lib/types/facture";

export default function FacturesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FactureStatut | "all">(
    "all"
  );

  const { data: factures = [], isLoading, error } = useFactures();

  // Filtrage
  const filteredFactures = factures.filter((facture) => {
    const matchesSearch =
      facture.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facture.clientNom.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || facture.statut === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Statistiques
  const stats = {
    total: factures.length,
    brouillon: factures.filter((f) => f.statut === "BROUILLON").length,
    emises: factures.filter((f) => f.statut === "EMISE").length,
    payeesPartielles: factures.filter((f) => f.statut === "PAYEE_PARTIELLE")
      .length,
    payees: factures.filter((f) => f.statut === "PAYEE").length,
    annulees: factures.filter((f) => f.statut === "ANNULEE").length,
    totalMontant: factures
      .filter(
        (f) =>
          f.statut === "EMISE" ||
          f.statut === "PAYEE_PARTIELLE" ||
          f.statut === "PAYEE"
      )
      .reduce((sum, f) => sum + f.totalNet, 0),
    totalPaye: factures
      .filter(
        (f) =>
          f.statut === "EMISE" ||
          f.statut === "PAYEE_PARTIELLE" ||
          f.statut === "PAYEE"
      )
      .reduce((sum, f) => sum + f.totalPaye, 0),
    totalDu: factures
      .filter(
        (f) =>
          f.statut === "EMISE" ||
          f.statut === "PAYEE_PARTIELLE" ||
          f.statut === "PAYEE"
      )
      .reduce((sum, f) => sum + f.soldeRestant, 0),
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des factures
          </h1>
          <p className="text-gray-500">
            Gérez toutes vos factures et suivez les paiements
          </p>
        </div>
        <Button
          onClick={() => alert("Formulaire création facture à implémenter")}
          className="bg-brand hover:bg-brand/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle facture
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500 mb-1">
              Total facturé
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatMontant(stats.totalMontant)}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.total} factures au total
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500 mb-1">
              Total payé
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatMontant(stats.totalPaye)}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.payees} factures payées
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500 mb-1">
              Solde restant
            </div>
            <div className="text-2xl font-bold text-red-600">
              {formatMontant(stats.totalDu)}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.emises + stats.payeesPartielles} en attente
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500 mb-1">
              Brouillons
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.brouillon}
            </div>
            <p className="text-xs text-gray-500 mt-2">Non émises</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par numéro ou client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtre statut */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
                className={
                  filterStatus === "all" ? "bg-brand hover:bg-brand/90" : ""
                }
              >
                Toutes ({stats.total})
              </Button>
              <Button
                variant={filterStatus === "EMISE" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("EMISE")}
                className={
                  filterStatus === "EMISE" ? "bg-brand hover:bg-brand/90" : ""
                }
              >
                Émises ({stats.emises})
              </Button>
              <Button
                variant={
                  filterStatus === "PAYEE_PARTIELLE" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setFilterStatus("PAYEE_PARTIELLE")}
                className={
                  filterStatus === "PAYEE_PARTIELLE"
                    ? "bg-brand hover:bg-brand/90"
                    : ""
                }
              >
                Partielles ({stats.payeesPartielles})
              </Button>
              <Button
                variant={filterStatus === "PAYEE" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("PAYEE")}
                className={
                  filterStatus === "PAYEE" ? "bg-brand hover:bg-brand/90" : ""
                }
              >
                Payées ({stats.payees})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des factures */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
              <p className="mt-2 text-gray-500">Chargement des factures...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">
                Erreur lors du chargement des factures
              </p>
            </div>
          ) : filteredFactures.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Aucune facture
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterStatus !== "all"
                  ? "Aucune facture ne correspond aux critères de recherche"
                  : "Commencez par créer votre première facture"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Numéro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date émission
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payé
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Solde
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFactures.map((facture) => (
                    <tr
                      key={facture.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/factures/${facture.id}`)
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/factures/${facture.id}`}
                          className="text-sm font-medium text-brand hover:underline"
                        >
                          {facture.numero}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {facture.clientNom}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {format(facture.dateEmission, "dd MMM yyyy", {
                            locale: fr,
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatMontant(facture.totalNet)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-green-600">
                          {formatMontant(facture.totalPaye)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div
                          className={`text-sm font-medium ${
                            facture.soldeRestant > 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {formatMontant(facture.soldeRestant)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFactureStatusStyle(
                            facture.statut
                          )}`}
                        >
                          {getFactureStatusLabel(facture.statut)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
