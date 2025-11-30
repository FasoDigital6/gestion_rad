import { useMemo } from "react";
import { useClients } from "./use-clients";
import { useProformas } from "./use-proformas";
import { useBdcs } from "./use-bdc";
import { useBdls } from "./use-bdl";
import { useFactures } from "./use-facture";
import {
  calculateDocumentStats,
  calculateConversionRates,
  generateActionItems,
  type DocumentStats,
  type ConversionRates,
  type ActionItem,
} from "../utils/dashboard";
import type { Client } from "../types/client";
import type { Facture } from "../types/facture";

/**
 * KPIs financiers globaux
 */
export interface FinancialKPIs {
  totalLivre: number;
  totalFacture: number;
  totalPaye: number;
  totalDu: number;
}

/**
 * Statistiques des documents
 */
export interface DocumentCounts {
  proformas: DocumentStats;
  bdcs: DocumentStats;
  bdls: DocumentStats;
  factures: DocumentStats;
}

/**
 * Données récentes
 */
export interface RecentData {
  clients: Client[];
  factures: Facture[];
}

/**
 * Toutes les statistiques du dashboard
 */
export interface DashboardStats {
  financialKPIs: FinancialKPIs;
  documentCounts: DocumentCounts;
  conversionRates: ConversionRates;
  actionItems: ActionItem[];
  recentData: RecentData;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Hook principal pour récupérer toutes les statistiques du dashboard
 */
export function useDashboardStats(): DashboardStats {
  const {
    data: clients = [],
    isLoading: isLoadingClients,
    isError: isErrorClients,
  } = useClients();
  const {
    data: proformas = [],
    isLoading: isLoadingProformas,
    isError: isErrorProformas,
  } = useProformas();
  const {
    data: bdcs = [],
    isLoading: isLoadingBdcs,
    isError: isErrorBdcs,
  } = useBdcs();
  const {
    data: bdls = [],
    isLoading: isLoadingBdls,
    isError: isErrorBdls,
  } = useBdls();
  const {
    data: factures = [],
    isLoading: isLoadingFactures,
    isError: isErrorFactures,
  } = useFactures();

  // Calcul des KPIs financiers
  const financialKPIs = useMemo<FinancialKPIs>(() => {
    return {
      totalLivre: clients.reduce((sum, c) => sum + (c.totalLivre || 0), 0),
      totalFacture: clients.reduce((sum, c) => sum + (c.totalFacture || 0), 0),
      totalPaye: clients.reduce((sum, c) => sum + (c.totalPaye || 0), 0),
      totalDu: clients.reduce((sum, c) => sum + (c.totalDu || 0), 0),
    };
  }, [clients]);

  // Compteurs de documents par statut
  const documentCounts = useMemo<DocumentCounts>(() => {
    return {
      proformas: calculateDocumentStats(proformas, [
        "BROUILLON",
        "ENVOYE",
        "VALIDE",
        "REJETE",
      ]),
      bdcs: calculateDocumentStats(bdcs, [
        "BROUILLON",
        "ENVOYE",
        "APPROUVE",
        "ANNULE",
      ]),
      bdls: calculateDocumentStats(bdls, [
        "BROUILLON",
        "EN_ROUTE",
        "LIVRE",
        "ANNULE",
      ]),
      factures: calculateDocumentStats(factures, [
        "BROUILLON",
        "EMISE",
        "PAYEE_PARTIELLE",
        "PAYEE",
        "ANNULEE",
      ]),
    };
  }, [proformas, bdcs, bdls, factures]);

  // Taux de conversion du pipeline
  const conversionRates = useMemo<ConversionRates>(() => {
    return calculateConversionRates({
      proformas,
      bdcs,
      bdls,
      factures,
    });
  }, [proformas, bdcs, bdls, factures]);

  // Actions requises
  const actionItems = useMemo<ActionItem[]>(() => {
    return generateActionItems({
      factures,
      bdcs,
      proformas,
      bdls,
    });
  }, [factures, bdcs, proformas, bdls]);

  // Données récentes
  const recentData = useMemo<RecentData>(() => {
    return {
      clients: [...clients]
        .sort(
          (a, b) =>
            new Date(b.dateCreation).getTime() -
            new Date(a.dateCreation).getTime()
        )
        .slice(0, 5),
      factures: [...factures]
        .filter((f) => f.statut !== "BROUILLON")
        .sort(
          (a, b) =>
            new Date(b.dateEmission).getTime() -
            new Date(a.dateEmission).getTime()
        )
        .slice(0, 5),
    };
  }, [clients, factures]);

  const isLoading =
    isLoadingClients ||
    isLoadingProformas ||
    isLoadingBdcs ||
    isLoadingBdls ||
    isLoadingFactures;

  const isError =
    isErrorClients ||
    isErrorProformas ||
    isErrorBdcs ||
    isErrorBdls ||
    isErrorFactures;

  return {
    financialKPIs,
    documentCounts,
    conversionRates,
    actionItems,
    recentData,
    isLoading,
    isError,
  };
}
