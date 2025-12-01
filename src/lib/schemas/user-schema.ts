import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Email invalide"),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
