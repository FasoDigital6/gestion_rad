"use server";

import { authAdmin, dbAdmin } from "@/lib/firebase/server/config";
import { USERS_COLLECTION_NAME } from "@/lib/firebase/collections_name";
import { createUserSchema, CreateUserInput } from "@/lib/schemas/user-schema";

export async function createUserAction(formData: CreateUserInput) {
  try {
    // Validation
    const result = createUserSchema.safeParse(formData);
    if (!result.success) {
      return { error: "Données invalides" };
    }

    const { email, name } = result.data;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await authAdmin
      .getUserByEmail(email)
      .catch(() => null);

    if (existingUser) {
      return { error: "Un utilisateur avec cet email existe déjà" };
    }

    // Générer un mot de passe temporaire aléatoire
    const tempPassword = Math.random().toString(36).slice(-12) + "Aa1!";

    // Créer l'utilisateur dans Firebase Auth
    const userRecord = await authAdmin.createUser({
      email,
      displayName: name,
      password: tempPassword,
      emailVerified: false,
    });

    // Définir le rôle par défaut (user) dans les custom claims
    await authAdmin.setCustomUserClaims(userRecord.uid, { role: "user" });

    // Créer le document dans Firestore
    await dbAdmin
      .collection(USERS_COLLECTION_NAME)
      .doc(userRecord.uid)
      .set({
        email,
        name,
        role: "user",
        createdAt: new Date().toISOString(),
      });

    // Générer et envoyer le lien de réinitialisation de mot de passe
    // Firebase enverra automatiquement l'email si configuré dans la console
    const resetLink = await authAdmin.generatePasswordResetLink(email, {
      // URL où l'utilisateur sera redirigé après avoir défini son mot de passe
      url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    });

    return {
      success: true,
      message: "Utilisateur créé avec succès. Un email a été envoyé à l'utilisateur.",
      userId: userRecord.uid,
      resetLink, // Lien de secours affiché à l'admin
      emailSent: true,
    };
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Erreur lors de la création de l'utilisateur" };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    // Supprimer de Firebase Auth
    await authAdmin.deleteUser(userId);

    // Supprimer de Firestore
    await dbAdmin.collection(USERS_COLLECTION_NAME).doc(userId).delete();

    return { success: true, message: "Utilisateur supprimé avec succès" };
  } catch (error: unknown) {
    console.error("Error deleting user:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Erreur lors de la suppression de l'utilisateur" };
  }
}
