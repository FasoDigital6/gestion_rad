/**
 * Types pour la gestion des dépenses
 */

/**
 * Catégories de dépenses disponibles
 */
export type CategorieDepense =
  | "ACHAT_MARCHANDISE" // Achats de produits/stock
  | "TRANSPORT" // Frais de transport/livraison
  | "SALAIRE" // Salaires et charges sociales
  | "LOYER" // Loyer bureaux/locaux
  | "ELECTRICITE" // Factures électricité
  | "EAU" // Factures eau
  | "TELEPHONE" // Téléphone/Internet
  | "FOURNITURE" // Fournitures de bureau
  | "MAINTENANCE" // Maintenance équipements
  | "MARKETING" // Publicité/Marketing
  | "CARBURANT" // Carburant véhicules
  | "ASSURANCE" // Assurances diverses
  | "TAXE" // Taxes et impôts
  | "AUTRE"; // Autres dépenses

/**
 * Labels pour les catégories de dépenses
 */
export const CATEGORIE_DEPENSE_LABELS: Record<CategorieDepense, string> = {
  ACHAT_MARCHANDISE: "Achat marchandise",
  TRANSPORT: "Transport",
  SALAIRE: "Salaire",
  LOYER: "Loyer",
  ELECTRICITE: "Électricité",
  EAU: "Eau",
  TELEPHONE: "Téléphone/Internet",
  FOURNITURE: "Fournitures",
  MAINTENANCE: "Maintenance",
  MARKETING: "Marketing",
  CARBURANT: "Carburant",
  ASSURANCE: "Assurance",
  TAXE: "Taxes/Impôts",
  AUTRE: "Autre",
};

/**
 * Type Depense complet
 */
export type Depense = {
  id: string;
  numero: string; // Format: "001/DEP/2025"

  // Informations de base
  montant: number;
  categorie: CategorieDepense;
  description: string;

  // Lien optionnel à un BDC
  bdcId?: string;
  bdcNumero?: string;

  // Fichier justificatif (URL Firebase Storage)
  fichierUrl?: string;
  fichierNom?: string;
  fichierType?: string; // "pdf", "jpg", "png", etc.

  // Dates
  dateDepense: Date; // Date de la dépense
  dateCreation: Date;
  dateModification?: Date;

  // Métadonnées
  notes?: string;
  createdBy?: string; // ID utilisateur
  createdByNom?: string; // Nom utilisateur (dénormalisé)
};

/**
 * Type pour la création d'une nouvelle dépense
 */
export type CreateDepenseInput = {
  montant: number;
  categorie: CategorieDepense;
  description: string;
  bdcId?: string;
  bdcNumero?: string;
  dateDepense: Date;
  notes?: string;
  fichierUrl?: string;
  fichierNom?: string;
  fichierType?: string;
};

/**
 * Type pour la mise à jour d'une dépense
 */
export type UpdateDepenseInput = Partial<CreateDepenseInput> & {
  id: string;
};
