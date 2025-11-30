"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Truck, Search } from "lucide-react";
import { useBdls } from "@/lib/hooks/use-bdl";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getBdlStatusStyle, getBdlStatusLabel } from "@/lib/utils/bdl";
import { BdlStatut } from "@/lib/types/bdl";
import { Badge } from "@/components/ui/badge";
import { BdlSelectionTable } from "@/components/bdl/bdl-selection-table";
import { FactureFormSheet } from "@/components/facture/facture-form-sheet";

export default function BdlPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<BdlStatut | "all">("all");
  const [selectedBdlIds, setSelectedBdlIds] = useState<string[]>([]);
  const [isFactureFormOpen, setIsFactureFormOpen] = useState(false);

  const { data: bdls, isLoading, error } = useBdls();

  // Filtrer les BDLs
  const filteredBdls = bdls?.filter((bdl) => {
    const matchesSearch =
      searchTerm === "" ||
      bdl.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bdl.clientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bdl.bdcNumero.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || bdl.statut === filterStatus;

    return matchesSearch && matchesStatus;
  });

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
            filterStatus === "EN_ROUTE" ? "ring-2 ring-brand" : ""
          }`}
          onClick={() =>
            setFilterStatus(filterStatus === "EN_ROUTE" ? "all" : "EN_ROUTE")
          }
        >
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">En route</p>
            <p className="text-3xl font-bold text-brand mt-2">
              {stats.enRoute}
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            filterStatus === "LIVRE" ? "ring-2 ring-success" : ""
          }`}
          onClick={() =>
            setFilterStatus(filterStatus === "LIVRE" ? "all" : "LIVRE")
          }
        >
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Livrés</p>
            <p className="text-3xl font-bold text-success mt-2">
              {stats.livres}
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            filterStatus === "ANNULE" ? "ring-2 ring-destructive" : ""
          }`}
          onClick={() =>
            setFilterStatus(filterStatus === "ANNULE" ? "all" : "ANNULE")
          }
        >
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Annulés</p>
            <p className="text-3xl font-bold text-destructive mt-2">
              {stats.annules}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Rechercher par numéro, client, ou BDC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as BdlStatut | "all")
              }
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="all">Tous les statuts</option>
              <option value="BROUILLON">Brouillon</option>
              <option value="EN_ROUTE">En route</option>
              <option value="LIVRE">Livré</option>
              <option value="ANNULE">Annulé</option>
            </select>

            {(searchTerm || filterStatus !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* BDL Table avec sélection */}
      <Card>
        <CardContent className="p-0">
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
