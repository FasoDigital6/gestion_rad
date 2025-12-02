/**
 * Types pour le module Finances
 */

import { CategorieDepense } from "./depense";

/**
 * État financier global du système
 */
export type EtatFinancier = {
  // === CYCLE COMMERCIAL ===

  // Livré non facturé (BDL LIVRE sans factureId)
  livreMontant: number;
  livreCount: number;
  livreBdlIds: string[];

  // Facturé non payé (Factures EMISE + PAYEE_PARTIELLE)
  factureMontant: number; // Somme des soldeRestant
  factureCount: number;
  factureIds: string[];

  // Payé (Factures PAYEE)
  payeMontant: number; // Somme des totalPaye
  payeCount: number;
  payeFactureIds: string[];

  // Annulé (BDL + Factures ANNULE)
  annuleMontant: number;
  annuleCount: number;
  annuleIds: string[];

  // === DÉPENSES ===

  totalDepenses: number;
  depensesCount: number;
  depensesParCategorie: Record<CategorieDepense, number>;

  // === RÉSULTAT ===

  recettes: number; // = payeMontant
  resultatNet: number; // = recettes - totalDepenses
};

/**
 * Statistiques financières par période
 */
export type StatistiquesFinancieres = {
  periode: string; // "2025-01" pour janvier 2025
  recettes: number;
  depenses: number;
  resultatNet: number;
};

/**
 * Détails d'une catégorie de dépense
 */
export type DepenseParCategorie = {
  categorie: CategorieDepense;
  montant: number;
  count: number;
  pourcentage: number; // % du total des dépenses
};

/**
 * Options de filtrage pour les données financières
 */
export type FiltresFinanciers = {
  dateDebut?: Date;
  dateFin?: Date;
  clientId?: string;
  categorieDepense?: CategorieDepense;
};

/**
 * Type de période pour le filtrage
 */
export type TypePeriode = "mois" | "annee" | "custom";

/**
 * Filtres de période
 */
export type FiltrePeriode = {
  type: TypePeriode;
  mois?: number; // 1-12 (pour type "mois")
  annee: number; // Année (pour tous les types)
  dateDebut?: Date; // Pour type "custom"
  dateFin?: Date; // Pour type "custom"
};

/**
 * Indicateurs financiers globaux (avec filtrage par période)
 */
export type IndicateursFinanciers = {
  // Total de tous les BDL avec statut LIVRE (facturés ou non)
  totalLivre: number;
  totalLivreCount: number;

  // Total de toutes les factures (EMISE + PAYEE_PARTIELLE + PAYEE)
  totalFacture: number;
  totalFactureCount: number;

  // Total des BDL livrés ET facturés (qui ont un factureId)
  livreFacture: number;
  livreFactureCount: number;

  // Période appliquée
  periode: FiltrePeriode;
};
