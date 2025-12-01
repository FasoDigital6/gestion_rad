"use server";

import { authAdmin, dbAdmin } from "@/lib/firebase/server/config";
import { USERS_COLLECTION_NAME } from "@/lib/firebase/collections_name";
import { createUserSchema, CreateUserInput, updateUserSchema, UpdateUserInput } from "@/lib/schemas/user-schema";

export async function createUserAction(formData: CreateUserInput) {
  try {
    // Validation
    const result = createUserSchema.safeParse(formData);
    if (!result.success) {
      return { error: "Données invalides" };
    }

    const { email, nom, prenom, telephone, poste, adresse } = result.data;

    console.log("Telephone value after Zod parsing:", telephone, typeof telephone);

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
    const createUserData: any = {
      email,
      displayName: `${prenom} ${nom}`,
      password: tempPassword,
      emailVerified: false,
    };

    // N'ajouter phoneNumber que s'il est fourni
    if (telephone) {
      createUserData.phoneNumber = telephone;
    }

    const userRecord = await authAdmin.createUser(createUserData);

    // Définir le rôle par défaut (user) dans les custom claims
    await authAdmin.setCustomUserClaims(userRecord.uid, { role: "user" });

    // Créer le document dans Firestore
    await dbAdmin
      .collection(USERS_COLLECTION_NAME)
      .doc(userRecord.uid)
      .set({
        email,
        nom,
        prenom,
        telephone: telephone || "",
        poste: poste || "",
        adresse: adresse || "",
        role: "user",
        disabled: false,
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

export async function updateUserAction(userId: string, formData: UpdateUserInput) {
  try {
    // Validation
    const result = updateUserSchema.safeParse(formData);
    if (!result.success) {
      return { error: "Données invalides" };
    }

    const { email, nom, prenom, telephone, poste, adresse, role, disabled } = result.data;

    // Mettre à jour Firebase Auth
    const updateAuthData: any = {};
    if (nom && prenom) {
      updateAuthData.displayName = `${prenom} ${nom}`;
    }
    if (email) {
      updateAuthData.email = email;
    }
    if (telephone !== undefined) {
      // Si telephone est undefined (chaîne vide transformée), utiliser null pour supprimer le numéro
      // Sinon, utiliser la valeur fournie (qui doit être au format E.164)
      updateAuthData.phoneNumber = telephone || null;
    }
    if (disabled !== undefined) {
      updateAuthData.disabled = disabled;
    }

    if (Object.keys(updateAuthData).length > 0) {
      await authAdmin.updateUser(userId, updateAuthData);
    }

    // Mettre à jour les custom claims si le rôle change
    if (role) {
      await authAdmin.setCustomUserClaims(userId, { role });
    }

    // Mettre à jour Firestore
    const updateFirestoreData: any = {
      updatedAt: new Date().toISOString(),
    };
    if (email) updateFirestoreData.email = email;
    if (nom) updateFirestoreData.nom = nom;
    if (prenom) updateFirestoreData.prenom = prenom;
    if (telephone !== undefined) updateFirestoreData.telephone = telephone;
    if (poste !== undefined) updateFirestoreData.poste = poste;
    if (adresse !== undefined) updateFirestoreData.adresse = adresse;
    if (role) updateFirestoreData.role = role;
    if (disabled !== undefined) updateFirestoreData.disabled = disabled;

    await dbAdmin
      .collection(USERS_COLLECTION_NAME)
      .doc(userId)
      .update(updateFirestoreData);

    return {
      success: true,
      message: "Utilisateur mis à jour avec succès",
    };
  } catch (error: unknown) {
    console.error("Error updating user:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Erreur lors de la mise à jour de l'utilisateur" };
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
