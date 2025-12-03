"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { useBdcs } from "@/lib/hooks/use-bdc";
import { useClients } from "@/lib/hooks/use-clients";
import { Card, CardContent } from "@/components/ui/card";
import { BdcStatut } from "@/lib/types/bdc";
import { BdcFormSheet } from "@/components/bdc/bdc-form-sheet";
import { DataTable } from "@/components/data-table/data-table";
import { createColumns } from "./columns-wrapper";
import { useDataFilters } from "@/lib/hooks/use-data-filters";
import {
  DataTableFilters,
  ClientFilter,
  StatusFilter,
  PeriodFilter,
} from "@/components/filters";
import { BDC_STATUS_OPTIONS } from "@/lib/constants/status-options";

export default function BdcPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: bdcs, isLoading, error } = useBdcs();
  const { data: clients } = useClients();

  const {
    filters,
    setFilter,
    clearAllFilters,
    hasActiveFilters,
    activeFiltersCount,
  } = useDataFilters();

  // Filtrer les BDCs
  const filteredBdcs = useMemo(() => {
    return bdcs?.filter((bdc) => {
      // Filtre par client
      if (filters.client && bdc.clientId !== filters.client) {
        return false;
      }

      // Filtre par statut
      if (filters.status) {
        const statusMap: Record<string, BdcStatut> = {
          brouillon: "BROUILLON",
          approuve: "APPROUVE",
          annule: "ANNULE",
        };
        if (bdc.statut !== statusMap[filters.status]) {
          return false;
        }
      }

      // Filtre par période
      if (filters.period && bdc.dateCommande) {
        const bdcDate = new Date(bdc.dateCommande);
        if (filters.period.startDate && bdcDate < filters.period.startDate) {
          return false;
        }
        if (filters.period.endDate && bdcDate > filters.period.endDate) {
          return false;
        }
      }

      return true;
    });
  }, [bdcs, filters]);

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
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Brouillons</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.brouillons}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Envoyés</p>
            <p className="text-3xl font-bold text-brand mt-2">
              {stats.envoyes}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Approuvés</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats.approuves}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Annulés</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {stats.annules}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des BDCs */}
      <Card>
        <CardContent className="p-0">
          {filteredBdcs && filteredBdcs.length > 0 ? (
            <DataTable
              columns={createColumns({
                onView: (bdc) => window.location.href = `/bdc/${bdc.id}`,
              })}
              data={filteredBdcs}
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
                    options={BDC_STATUS_OPTIONS}
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
