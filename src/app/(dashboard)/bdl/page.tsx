"use client";

import { useState, useMemo } from "react";
import { Truck } from "lucide-react";
import { useBdls } from "@/lib/hooks/use-bdl";
import { useClients } from "@/lib/hooks/use-clients";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BdlStatut } from "@/lib/types/bdl";
import { BdlSelectionTable } from "@/components/bdl/bdl-selection-table";
import { FactureFormSheet } from "@/components/facture/facture-form-sheet";
import { useDataFilters } from "@/lib/hooks/use-data-filters";
import {
  DataTableFilters,
  ClientFilter,
  StatusFilter,
  PeriodFilter,
} from "@/components/filters";
import { BDL_STATUS_OPTIONS } from "@/lib/constants/status-options";

export default function BdlPage() {
  const [selectedBdlIds, setSelectedBdlIds] = useState<string[]>([]);
  const [isFactureFormOpen, setIsFactureFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: bdls, isLoading, error } = useBdls();
  const { data: clients } = useClients();

  const {
    filters,
    setFilter,
    clearAllFilters,
    hasActiveFilters,
    activeFiltersCount,
  } = useDataFilters();

  // Filtrer les BDLs
  const filteredBdls = useMemo(() => {
    return bdls?.filter((bdl) => {
      // Filtre par recherche
      if (searchTerm) {
        const matchesSearch =
          bdl.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bdl.clientNom.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;
      }

      // Filtre par client
      if (filters.client && bdl.clientId !== filters.client) {
        return false;
      }

      // Filtre par statut
      if (filters.status) {
        const statusMap: Record<string, BdlStatut> = {
          brouillon: "BROUILLON",
          en_route: "EN_ROUTE",
          livre: "LIVRE",
          annule: "ANNULE",
        };
        if (bdl.statut !== statusMap[filters.status]) {
          return false;
        }
      }

      // Filtre par période
      if (filters.period && bdl.dateLivraison) {
        const bdlDate = new Date(bdl.dateLivraison);
        if (filters.period.startDate && bdlDate < filters.period.startDate) {
          return false;
        }
        if (filters.period.endDate && bdlDate > filters.period.endDate) {
          return false;
        }
      }

      return true;
    });
  }, [bdls, filters, searchTerm]);

  // Calculer les stats
  const stats = {
    brouillons: bdls?.filter((bdl) => bdl.statut === "BROUILLON").length || 0,
    enRoute: bdls?.filter((bdl) => bdl.statut === "EN_ROUTE").length || 0,
    livres: bdls?.filter((bdl) => bdl.statut === "LIVRE").length || 0,
    annules: bdls?.filter((bdl) => bdl.statut === "ANNULE").length || 0,
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Truck className="h-8 w-8 text-brand" />
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des bons de livraison
          </h1>
        </div>
        <p className="text-gray-500">
          Gérez les livraisons effectuées depuis les bons de commande
        </p>
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
            <p className="text-sm font-medium text-gray-600">En route</p>
            <p className="text-3xl font-bold text-brand mt-2">
              {stats.enRoute}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Livrés</p>
            <p className="text-3xl font-bold text-success mt-2">
              {stats.livres}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Annulés</p>
            <p className="text-3xl font-bold text-destructive mt-2">
              {stats.annules}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* BDL Table avec sélection */}
      <Card>
        <CardContent className="p-0">
          {/* Barre de recherche et filtres */}
          <div className="flex items-center py-4 px-6 gap-2 flex-wrap border-b">
            <Input
              placeholder="Rechercher par numéro ou client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
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
                options={BDL_STATUS_OPTIONS}
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
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p>Chargement...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-red-600">Erreur lors du chargement des BDLs</p>
            </div>
          ) : (
            <BdlSelectionTable
              bdls={filteredBdls || []}
              selectedBdlIds={selectedBdlIds}
              onSelectionChange={setSelectedBdlIds}
              onCreateFacture={() => setIsFactureFormOpen(true)}
            />
          )}
        </CardContent>
      </Card>

      {/* Formulaire de création de facture depuis BDL */}
      <FactureFormSheet
        open={isFactureFormOpen}
        onOpenChange={(open) => {
          setIsFactureFormOpen(open);
          if (!open) setSelectedBdlIds([]);
        }}
        mode="bdl"
        selectedBdls={bdls?.filter((b) => selectedBdlIds.includes(b.id))}
      />
    </div>
  );
}
