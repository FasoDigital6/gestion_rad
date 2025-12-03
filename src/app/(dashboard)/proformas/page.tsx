"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Send, CheckCircle } from "lucide-react";
import { useProformas } from "@/lib/hooks/use-proformas";
import { useClients } from "@/lib/hooks/use-clients";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { pdf } from "@react-pdf/renderer";
import { ProformaPDFTemplate } from "@/components/proformas/proforma-pdf-template";
import { ProformaFormSheet } from "@/components/proformas/proforma-form-sheet";
import { Proforma, ProformaStatut } from "@/lib/types/proforma";
import { DataTable } from "@/components/data-table/data-table";
import { createColumns } from "./columns-wrapper";
import { useDataFilters } from "@/lib/hooks/use-data-filters";
import {
  DataTableFilters,
  ClientFilter,
  StatusFilter,
  PeriodFilter,
} from "@/components/filters";
import { PROFORMA_STATUS_OPTIONS } from "@/lib/constants/status-options";

export default function ProformasPage() {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProforma, setSelectedProforma] = useState<Proforma | null>(null);

  const { data: proformas, isLoading, error } = useProformas();
  const { data: clients } = useClients();

  const {
    filters,
    setFilter,
    clearAllFilters,
    hasActiveFilters,
    activeFiltersCount,
  } = useDataFilters();

  const handleAddProforma = () => {
    setSelectedProforma(null);
    setIsFormOpen(true);
  };

  const handleEditProforma = (proforma: Proforma) => {
    setSelectedProforma(proforma);
    setIsFormOpen(true);
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

  // Filtrer les proformas
  const filteredProformas = useMemo(() => {
    return proformas?.filter((proforma) => {
      // Filtre par client
      if (filters.client && proforma.clientId !== filters.client) {
        return false;
      }

      // Filtre par statut
      if (filters.status) {
        const statusMap: Record<string, ProformaStatut> = {
          brouillon: "BROUILLON",
          envoye: "ENVOYE",
          valide: "VALIDE",
        };
        if (proforma.statut !== statusMap[filters.status]) {
          return false;
        }
      }

      // Filtre par période
      if (filters.period && proforma.dateCreation) {
        const proformaDate = new Date(proforma.dateCreation);
        if (filters.period.startDate && proformaDate < filters.period.startDate) {
          return false;
        }
        if (filters.period.endDate && proformaDate > filters.period.endDate) {
          return false;
        }
      }

      return true;
    });
  }, [proformas, filters]);

  // Statistiques
  const stats = {
    brouillons: proformas?.filter((p) => p.statut === "BROUILLON").length || 0,
    envoyes: proformas?.filter((p) => p.statut === "ENVOYE").length || 0,
    valides: proformas?.filter((p) => p.statut === "VALIDE").length || 0,
  };

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Gestion des proformas
          </h1>
          <p className="text-base text-muted-foreground">
            Créez et gérez vos devis et proformas
          </p>
        </div>
        <Button onClick={handleAddProforma} className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90">
          <Plus className="h-4 w-4" />
          Nouveau proforma
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Brouillons</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.brouillons}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Envoyés</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.envoyes}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center">
                <Send className="h-6 w-6 text-brand" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Validés</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.valides}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des proformas */}
      <Card className="border-border">
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b border-border">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Liste des proformas
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredProformas?.length || 0} proforma(s) au total
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Chargement...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-destructive">Erreur lors du chargement des proformas</div>
            </div>
          ) : (
            <DataTable
              columns={createColumns({
                onEdit: handleEditProforma,
                onView: (proforma) => router.push(`/proformas/${proforma.id}`),
              })}
              data={filteredProformas || []}
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
                    options={PROFORMA_STATUS_OPTIONS}
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

      <ProformaFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        proforma={selectedProforma}
      />
    </div>
  );
}
