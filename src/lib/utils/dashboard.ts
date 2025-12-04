import type { Proforma } from "../types/proforma";
import type { Bdc } from "../types/bdc";
import type { Bdl } from "../types/bdl";
import type { Facture } from "../types/facture";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Formate un montant en GNF (Franc Guinéen)
 */
export function formatMontant(montant: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "GNF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant);
}

/**
 * Formate une date en français
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd MMM yyyy", { locale: fr });
}

/**
 * Statistiques pour un type de document
 */
export interface DocumentStats {
  total: number;
  parStatut: Record<string, number>;
}

/**
 * Calcule les statistiques pour un type de document
 */
export function calculateDocumentStats<T extends { statut: string }>(
  documents: T[],
  statutsList: string[]
): DocumentStats {
  const total = documents.length;
  const parStatut = statutsList.reduce((acc, statut) => {
    acc[statut] = documents.filter((d) => d.statut === statut).length;
    return acc;
  }, {} as Record<string, number>);

  return { total, parStatut };
}

/**
 * Taux de conversion du pipeline
 */
export interface ConversionRates {
  proformaVersBDC: number;
  bdcVersBDL: number;
  bdlVersFacture: number;
  factureVersPaiement: number;
}

/**
 * Calcule les taux de conversion du pipeline de vente
 */
export function calculateConversionRates({
  proformas,
  bdcs,
  bdls,
  factures,
}: {
  proformas: Proforma[];
  bdcs: Bdc[];
  bdls: Bdl[];
  factures: Facture[];
}): ConversionRates {
  const proformasValides = proformas.filter((p) => p.statut === "VALIDE").length;
  const bdcsApprouves = bdcs.filter((b) => b.statut === "APPROUVE").length;
  const bdlsLivres = bdls.filter((b) => b.statut === "LIVRE").length;
  const facturesEmises = factures.filter((f) =>
    ["EMISE", "PAYEE_PARTIELLE", "PAYEE"].includes(f.statut)
  ).length;
  const facturesPayees = factures.filter((f) => f.statut === "PAYEE").length;

  return {
    proformaVersBDC: proformasValides > 0 ? (bdcsApprouves / proformasValides) * 100 : 0,
    bdcVersBDL: bdcsApprouves > 0 ? (bdlsLivres / bdcsApprouves) * 100 : 0,
    bdlVersFacture: bdlsLivres > 0 ? (facturesEmises / bdlsLivres) * 100 : 0,
    factureVersPaiement: facturesEmises > 0 ? (facturesPayees / facturesEmises) * 100 : 0,
  };
}

/**
 * Priorité d'une action requise
 */
export type ActionPriority = "URGENTE" | "IMPORTANTE" | "MOYENNE" | "NORMALE";

/**
 * Item d'action requise
 */
export interface ActionItem {
  priority: ActionPriority;
  type: string;
  title: string;
  client: string;
  metadata: { label: string; value: string }[];
  link: string;
}

/**
 * Génère la liste des actions requises selon les règles métier
 */
export function generateActionItems({
  factures,
  bdcs,
  proformas,
  bdls,
}: {
  factures: Facture[];
  bdcs: Bdc[];
  proformas: Proforma[];
  bdls: Bdl[];
}): ActionItem[] {
  const today = new Date();
  const actions: ActionItem[] = [];

  // 1. Factures en retard (URGENTE)
  factures
    .filter(
      (f) =>
        f.dateEcheance &&
        new Date(f.dateEcheance) < today &&
        f.soldeRestant > 0 &&
        ["EMISE", "PAYEE_PARTIELLE"].includes(f.statut)
    )
    .forEach((f) =>
      actions.push({
        priority: "URGENTE",
        type: "facture-retard",
        title: `Relancer facture ${f.numero}`,
        client: f.clientNom,
        metadata: [
          { label: "Montant dû", value: formatMontant(f.soldeRestant) },
          { label: "Échéance", value: formatDate(f.dateEcheance!) },
        ],
        link: `/factures/${f.id}`,
      })
    );

  // 2. BDC approuvés à livrer (> 7 jours) (IMPORTANTE)
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  bdcs
    .filter(
      (b) =>
        b.statut === "APPROUVE" &&
        b.dateApprobation &&
        new Date(b.dateApprobation) < sevenDaysAgo &&
        !bdls.some((bdl) => bdl.bdcId === b.id && bdl.statut === "LIVRE")
    )
    .forEach((b) =>
      actions.push({
        priority: "IMPORTANTE",
        type: "livraison-attente",
        title: `Livraison en attente - BDC ${b.numero}`,
        client: b.clientNom,
        metadata: [
          { label: "Approuvé le", value: formatDate(b.dateApprobation!) },
          {
            label: "Délai souhaité",
            value: b.dateLivraisonSouhaitee || "Non spécifié",
          },
        ],
        link: `/bdc/${b.id}`,
      })
    );

  // 3. Proformas envoyés sans réponse (> 15 jours) (MOYENNE)
  const fifteenDaysAgo = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000);
  proformas
    .filter(
      (p) =>
        p.statut === "ENVOYE" &&
        p.dateEnvoi &&
        new Date(p.dateEnvoi) < fifteenDaysAgo
    )
    .forEach((p) =>
      actions.push({
        priority: "MOYENNE",
        type: "proforma-relance",
        title: `Relancer proforma ${p.numero}`,
        client: p.clientNom,
        metadata: [
          { label: "Envoyé le", value: formatDate(p.dateEnvoi!) },
          { label: "Montant", value: formatMontant(p.totalNet) },
        ],
        link: `/proformas/${p.id}`,
      })
    );

  // 4. BDL livrés non facturés (> 3 jours) (NORMALE)
  const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
  bdls
    .filter(
      (b) =>
        b.statut === "LIVRE" &&
        b.dateLivree &&
        new Date(b.dateLivree) < threeDaysAgo &&
        !b.factureId
    )
    .forEach((b) =>
      actions.push({
        priority: "NORMALE",
        type: "bdl-a-facturer",
        title: `Facturer BDL ${b.numero}`,
        client: b.clientNom,
        metadata: [
          { label: "Livré le", value: formatDate(b.dateLivree!) },
          { label: "Montant", value: formatMontant(b.totalNet) },
        ],
        link: `/factures/new?bdl=${b.id}`,
      })
    );

  // Trier par priorité
  const priorityOrder: Record<ActionPriority, number> = {
    URGENTE: 0,
    IMPORTANTE: 1,
    MOYENNE: 2,
    NORMALE: 3,
  };
  return actions.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}

/**
 * Retourne les classes CSS pour un badge de priorité
 */
export function getPriorityBadgeStyle(priority: ActionPriority): string {
  const styles: Record<ActionPriority, string> = {
    URGENTE: "bg-red-100 text-red-800 border-red-200",
    IMPORTANTE: "bg-orange-100 text-orange-800 border-orange-200",
    MOYENNE: "bg-yellow-100 text-yellow-800 border-yellow-200",
    NORMALE: "bg-blue-100 text-blue-800 border-blue-200",
  };
  return styles[priority];
}

/**
 * Retourne le label français pour une priorité
 */
export function getPriorityLabel(priority: ActionPriority): string {
  const labels: Record<ActionPriority, string> = {
    URGENTE: "Urgent",
    IMPORTANTE: "Important",
    MOYENNE: "Moyen",
    NORMALE: "Normal",
  };
  return labels[priority];
}
