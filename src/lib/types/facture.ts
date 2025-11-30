/**
 * Types pour le système de facturation
 */

/**
 * Statuts de facture avec workflow logique
 */
export type FactureStatut =
  | "BROUILLON" // Facture en cours de création
  | "EMISE" // Facture émise mais non payée
  | "PAYEE_PARTIELLE" // Paiements partiels reçus
  | "PAYEE" // Totalement payée (état final)
  | "ANNULEE"; // Facture annulée (état final)

/**
 * Ligne de facture (article facturé)
 * Peut provenir d'un ou plusieurs BDL
 */
export type FactureLigne = {
  numero: number;
  designation: string;
  unite: string; // UN, KG, M, L, etc.
  quantite: number; // Quantité facturée
  prixUnitaire: number;
  prixTotal: number; // quantite * prixUnitaire

  // Traçabilité : origine des quantités (optionnel)
  bdlSource?: {
    bdlId: string;
    bdlNumero: string;
    quantite: number; // Quantité provenant de ce BDL
  }[];
};

/**
 * Type Facture complet
 */
export type Facture = {
  id: string;
  numero: string; // Format: "001/FACT/2025"

  // Références sources (optionnel - peut être créée manuellement)
  bdlIds?: string[]; // IDs des BDL inclus dans la facture
  bdlNumeros?: string[]; // Numéros des BDL pour affichage

  // Informations client
  clientId: string;
  clientNom: string; // Dénormalisé pour performance

  // Dates
  dateEmission: Date; // Date d'émission de la facture
  dateEcheance?: Date; // Date d'échéance de paiement

  // Lignes de facture
  lignes: FactureLigne[];

  // Calculs financiers
  total: number; // Somme des prixTotal de toutes les lignes
  remisePourcentage: number; // 0 à 100
  remiseMontant: number; // Calculé depuis remisePourcentage
  totalNet: number; // total - remiseMontant (MONTANT À PAYER)

  // Gestion des paiements
  totalPaye: number; // Somme de tous les paiements reçus
  soldeRestant: number; // totalNet - totalPaye

  // Statut et dates
  dateCreation: Date;
  dateModification?: Date;
  dateEmise?: Date; // Quand passée de BROUILLON à EMISE
  datePayeeComplete?: Date; // Quand totalement payée
  dateAnnulation?: Date; // Quand annulée
  statut: FactureStatut;

  // Informations additionnelles
  notes?: string; // Notes internes
  conditionsPaiement?: string; // Ex: "Paiement à 30 jours"
  motifAnnulation?: string; // Si annulée

  // Informations de génération PDF
  lieu: string; // Ex: "Siguiri"
  fournisseur: string; // Ex: "Mr Balla TRAORE"
};

/**
 * Type pour créer une facture depuis des BDL
 */
export type CreateFactureFromBdlsInput = {
  bdlIds: string[]; // Liste des BDL à inclure
  dateEmission: Date;
  dateEcheance?: Date;
  conditionsPaiement?: string;
  notes?: string;
  remisePourcentage?: number; // Peut override la remise des BDL
  lieu?: string;
  fournisseur?: string;
};

/**
 * Type pour créer une facture manuellement
 */
export type CreateFactureManueleInput = {
  clientId: string;
  clientNom: string;
  dateEmission: Date;
  dateEcheance?: Date;
  lignes: Omit<FactureLigne, "numero" | "prixTotal" | "bdlSource">[]; // Sans numero et prixTotal
  remisePourcentage?: number;
  conditionsPaiement?: string;
  notes?: string;
  lieu?: string; // Par défaut "Siguiri"
  fournisseur?: string; // Par défaut "Mr Balla TRAORE"
};

/**
 * Type pour mettre à jour une facture (seulement BROUILLON)
 */
export type UpdateFactureInput = Partial<
  Omit<Facture, "id" | "numero" | "dateCreation" | "statut">
> & {
  id: string;
};

/**
 * Type pour changer le statut d'une facture
 */
export type UpdateFactureStatutInput = {
  id: string;
  statut: FactureStatut;
  dateEmise?: Date;
  datePayeeComplete?: Date;
  dateAnnulation?: Date;
  motifAnnulation?: string;
};
