"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { useFactures } from "@/lib/hooks/use-facture";
import { useClients } from "@/lib/hooks/use-clients";
import { Card, CardContent } from "@/components/ui/card";
import { formatMontant } from "@/lib/utils/facture";
import type { FactureStatut } from "@/lib/types/facture";
import { FactureFormSheet } from "@/components/facture/facture-form-sheet";
import { DataTable } from "@/components/data-table/data-table";
import { createColumns } from "./columns-wrapper";
import { useDataFilters } from "@/lib/hooks/use-data-filters";
import {
  DataTableFilters,
  ClientFilter,
  StatusFilter,
  PeriodFilter,
} from "@/components/filters";
import { FACTURE_STATUS_OPTIONS } from "@/lib/constants/status-options";

export default function FacturesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"bdl" | "manual">("manual");

  const { data: factures = [], isLoading, error } = useFactures();
  const { data: clients } = useClients();

  const {
    filters,
    setFilter,
    clearAllFilters,
    hasActiveFilters,
    activeFiltersCount,
  } = useDataFilters();

  // Filtrer les factures
  const filteredFactures = useMemo(() => {
    return factures?.filter((facture) => {
      // Filtre par client
      if (filters.client && facture.clientId !== filters.client) {
        return false;
      }

      // Filtre par statut
      if (filters.status) {
        const statusMap: Record<string, FactureStatut> = {
          emise: "EMISE",
          partiel: "PAYEE_PARTIELLE",
          paye: "PAYEE",
        };
        if (facture.statut !== statusMap[filters.status]) {
          return false;
        }
      }

      // Filtre par période
      if (filters.period && facture.dateEmission) {
        const factureDate = new Date(facture.dateEmission);
        if (filters.period.startDate && factureDate < filters.period.startDate) {
          return false;
        }
        if (filters.period.endDate && factureDate > filters.period.endDate) {
          return false;
        }
      }

      return true;
    });
  }, [factures, filters]);

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
          onClick={() => {
            setFormMode("manual");
            setIsFormOpen(true);
          }}
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
                {hasActiveFilters
                  ? "Aucune facture ne correspond aux critères de recherche"
                  : "Commencez par créer votre première facture"}
              </p>
            </div>
          ) : (
            <DataTable
              columns={createColumns({
                onView: (facture) => window.location.href = `/factures/${facture.id}`,
              })}
              data={filteredFactures}
              filterColumn="numero"
              filterPlaceholder="Rechercher par numéro..."
              filters={
                <DataTableFilters
                  onClearAll={clearAllFilters}
                  hasActiveFilters={hasActiveFilters}
                  activeFiltersCount={activeFiltersCount}
                >
                  <ClientFilter
                    clients={clients || []}
                    value={filters.client || null}
                    onChange={(value) => setFilter("client", value)}
                    placeholder="Tous les clients"
                  />
                  <StatusFilter
                    options={FACTURE_STATUS_OPTIONS}
                    value={filters.status || null}
                    onChange={(value) => setFilter("status", value)}
                    placeholder="Tous les statuts"
                  />
                  <PeriodFilter
                    value={filters.period || null}
                    onChange={(value) => setFilter("period", value)}
                    placeholder="Toutes les périodes"
                  />
                </DataTableFilters>
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Formulaire de création */}
      <FactureFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        mode={formMode}
        facture={null}
      />
    </div>
  );
}
