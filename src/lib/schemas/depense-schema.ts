import { z } from "zod";

/**
 * Schéma pour les catégories de dépenses
 */
const categorieDepenseSchema = z.enum([
  "ACHAT_MARCHANDISE",
  "TRANSPORT",
  "SALAIRE",
  "LOYER",
  "ELECTRICITE",
  "EAU",
  "TELEPHONE",
  "FOURNITURE",
  "MAINTENANCE",
  "MARKETING",
  "CARBURANT",
  "ASSURANCE",
  "TAXE",
  "AUTRE",
]);

/**
 * Schéma pour la création d'une dépense
 */
export const createDepenseSchema = z.object({
  montant: z
    .number({
      message: "Le montant doit être un nombre",
    })
    .positive("Le montant doit être supérieur à 0"),

  categorie: categorieDepenseSchema,

  description: z
    .string()
    .min(3, "La description doit contenir au moins 3 caractères")
    .max(500, "La description ne peut pas dépasser 500 caractères"),

  dateDepense: z.date({
    message: "La date de la dépense est requise",
  }),

  bdcId: z.string().optional(),
  bdcNumero: z.string().optional(),

  notes: z.string().max(1000, "Les notes ne peuvent pas dépasser 1000 caractères").optional(),

  fichierUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  fichierNom: z.string().optional(),
  fichierType: z.string().optional(),
});

/**
 * Schéma pour la mise à jour d'une dépense
 */
export const updateDepenseSchema = createDepenseSchema.partial().extend({
  id: z.string().min(1, "L'ID est requis"),
});

/**
 * Type inféré depuis le schéma
 */
export type CreateDepenseFormValues = z.infer<typeof createDepenseSchema>;
export type UpdateDepenseFormValues = z.infer<typeof updateDepenseSchema>;
