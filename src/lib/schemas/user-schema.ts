import { z } from "zod";

// Helper pour transformer les chaînes vides en undefined
const emptyStringToUndefined = z
  .string()
  .optional()
  .transform((val) => (val === "" ? undefined : val));

export const createUserSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  telephone: emptyStringToUndefined,
  poste: emptyStringToUndefined,
  adresse: emptyStringToUndefined,
});

export const updateUserSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères").optional(),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères").optional(),
  email: z.string().email("Email invalide").optional(),
  telephone: emptyStringToUndefined,
  poste: emptyStringToUndefined,
  adresse: emptyStringToUndefined,
  role: z.enum(["admin", "user"]).optional(),
  disabled: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
