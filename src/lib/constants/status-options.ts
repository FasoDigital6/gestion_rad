import { StatusOption } from "@/components/filters";

// Statuts pour BDL (Bons de Livraison)
export const BDL_STATUS_OPTIONS: StatusOption[] = [
  { value: "brouillon", label: "Brouillon", color: "bg-gray-500" },
  { value: "en_route", label: "En route", color: "bg-blue-500" },
  { value: "livre", label: "Livré", color: "bg-green-500" },
  { value: "annule", label: "Annulé", color: "bg-red-500" },
];

// Statuts pour BDC (Bons de Commande)
export const BDC_STATUS_OPTIONS: StatusOption[] = [
  { value: "brouillon", label: "Brouillon", color: "bg-gray-500" },
  { value: "approuve", label: "Approuvé", color: "bg-green-500" },
  { value: "annule", label: "Annulé", color: "bg-red-500" },
];

// Statuts pour Proforma
export const PROFORMA_STATUS_OPTIONS: StatusOption[] = [
  { value: "brouillon", label: "Brouillon", color: "bg-gray-500" },
  { value: "envoye", label: "Envoyé", color: "bg-blue-500" },
  { value: "valide", label: "Validé", color: "bg-green-500" },
];

// Statuts pour Factures
export const FACTURE_STATUS_OPTIONS: StatusOption[] = [
  { value: "emise", label: "Émise", color: "bg-blue-500" },
  { value: "partiel", label: "Partiellement payée", color: "bg-yellow-500" },
  { value: "paye", label: "Payée", color: "bg-green-500" },
];
