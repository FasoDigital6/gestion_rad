import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client/config";
import { USERS_COLLECTION_NAME } from "@/lib/firebase/collections_name";
import { createUserAction, updateUserAction, deleteUserAction } from "@/lib/actions/users/user_actions";

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  poste?: string;
  adresse?: string;
  role: string;
  disabled?: boolean;
  createdAt?: Date;
}

export interface CreateUserInput {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  poste?: string;
  adresse?: string;
}

export interface UpdateUserInput {
  id: string;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  poste?: string;
  adresse?: string;
  role?: "admin" | "user";
  disabled?: boolean;
}

/**
 * Récupérer tous les utilisateurs
 */
export async function getUsers(): Promise<User[]> {
  try {
    const usersRef = collection(db, USERS_COLLECTION_NAME);
    const q = query(usersRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Gérer createdAt qui peut être Timestamp Firestore ou string ISO
      let createdAt: Date | undefined;
      if (data.createdAt) {
        if (typeof data.createdAt === 'string') {
          createdAt = new Date(data.createdAt);
        } else if (data.createdAt.toDate) {
          createdAt = data.createdAt.toDate();
        }
      }

      users.push({
        id: doc.id,
        email: data.email,
        nom: data.nom || "",
        prenom: data.prenom || "",
        telephone: data.telephone,
        poste: data.poste,
        adresse: data.adresse,
        role: data.role || "user",
        disabled: data.disabled || false,
        createdAt: createdAt || new Date(),
      });
    });

    return users;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    throw new Error("Impossible de récupérer les utilisateurs");
  }
}

/**
 * Récupérer un utilisateur par son ID
 */
export async function getUser(id: string): Promise<User> {
  try {
    const userDoc = doc(db, USERS_COLLECTION_NAME, id);
    const userSnapshot = await getDoc(userDoc);

    if (!userSnapshot.exists()) {
      throw new Error("Utilisateur introuvable");
    }

    const data = userSnapshot.data();

    // Gérer createdAt qui peut être Timestamp Firestore ou string ISO
    let createdAt: Date | undefined;
    if (data.createdAt) {
      if (typeof data.createdAt === 'string') {
        createdAt = new Date(data.createdAt);
      } else if (data.createdAt.toDate) {
        createdAt = data.createdAt.toDate();
      }
    }

    return {
      id: userSnapshot.id,
      email: data.email,
      nom: data.nom || "",
      prenom: data.prenom || "",
      telephone: data.telephone,
      poste: data.poste,
      adresse: data.adresse,
      role: data.role || "user",
      disabled: data.disabled || false,
      createdAt: createdAt || new Date(),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    throw new Error("Impossible de récupérer l'utilisateur");
  }
}

/**
 * Créer un nouvel utilisateur
 */
export async function createUser(input: CreateUserInput): Promise<void> {
  try {
    const result = await createUserAction(input);

    if (result.error) {
      throw new Error(result.error);
    }

    return;
  } catch (error: any) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    throw new Error(error.message || "Impossible de créer l'utilisateur");
  }
}

/**
 * Mettre à jour un utilisateur
 */
export async function updateUser(input: UpdateUserInput): Promise<void> {
  try {
    const { id, ...data } = input;
    const result = await updateUserAction(id, data);

    if (result.error) {
      throw new Error(result.error);
    }

    return;
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    throw new Error(error.message || "Impossible de mettre à jour l'utilisateur");
  }
}

/**
 * Supprimer un utilisateur
 */
export async function deleteUser(id: string): Promise<void> {
  try {
    const result = await deleteUserAction(id);

    if (result.error) {
      throw new Error(result.error);
    }

    return;
  } catch (error: any) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    throw new Error(error.message || "Impossible de supprimer l'utilisateur");
  }
}

/**
 * Activer/désactiver un utilisateur
 */
export async function toggleUserStatus(
  id: string,
  disabled: boolean
): Promise<void> {
  try {
    const result = await updateUserAction(id, { disabled });

    if (result.error) {
      throw new Error(result.error);
    }

    return;
  } catch (error: any) {
    console.error("Erreur lors du changement de statut:", error);
    throw new Error(error.message || "Impossible de changer le statut de l'utilisateur");
  }
}
