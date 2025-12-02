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
  where,
  Timestamp,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client/config";
import {
  DEPENSES_COLLECTION_NAME,
  COUNTERS_COLLECTION_NAME,
} from "@/lib/firebase/collections_name";
import { Depense, CreateDepenseInput, UpdateDepenseInput } from "@/lib/types/depense";

/**
 * Génère le prochain numéro de dépense
 * Format: "001/DEP/2025"
 */
async function getNextDepenseNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const counterId = `DEP-${year}`;

  return await runTransaction(db, async (transaction) => {
    const counterRef = doc(db, COUNTERS_COLLECTION_NAME, counterId);
    const counterDoc = await transaction.get(counterRef);

    let nextNumber = 1;
    if (counterDoc.exists()) {
      nextNumber = (counterDoc.data().lastNumber || 0) + 1;
      transaction.update(counterRef, { lastNumber: nextNumber });
    } else {
      transaction.set(counterRef, { lastNumber: nextNumber });
    }

    // Format: 001, 002, ..., 099, 100
    const numeroFormatted = nextNumber.toString().padStart(3, "0");
    return `${numeroFormatted}/DEP/${year}`;
  });
}

/**
 * Récupérer toutes les dépenses
 */
export async function getDepenses(): Promise<Depense[]> {
  try {
    const depensesRef = collection(db, DEPENSES_COLLECTION_NAME);
    const q = query(depensesRef, orderBy("dateCreation", "desc"));
    const querySnapshot = await getDocs(q);

    const depenses: Depense[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      depenses.push({
        id: doc.id,
        numero: data.numero,
        montant: data.montant || 0,
        categorie: data.categorie,
        description: data.description,
        bdcId: data.bdcId,
        bdcNumero: data.bdcNumero,
        fichierUrl: data.fichierUrl,
        fichierNom: data.fichierNom,
        fichierType: data.fichierType,
        dateDepense: data.dateDepense?.toDate() || new Date(),
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateModification: data.dateModification?.toDate(),
        notes: data.notes,
        createdBy: data.createdBy,
        createdByNom: data.createdByNom,
      });
    });

    return depenses;
  } catch (error) {
    console.error("Erreur lors de la récupération des dépenses:", error);
    throw new Error("Impossible de récupérer les dépenses");
  }
}

/**
 * Récupérer une dépense par son ID
 */
export async function getDepense(id: string): Promise<Depense> {
  try {
    const depenseDoc = doc(db, DEPENSES_COLLECTION_NAME, id);
    const depenseSnapshot = await getDoc(depenseDoc);

    if (!depenseSnapshot.exists()) {
      throw new Error("Dépense introuvable");
    }

    const data = depenseSnapshot.data();
    return {
      id: depenseSnapshot.id,
      numero: data.numero,
      montant: data.montant || 0,
      categorie: data.categorie,
      description: data.description,
      bdcId: data.bdcId,
      bdcNumero: data.bdcNumero,
      fichierUrl: data.fichierUrl,
      fichierNom: data.fichierNom,
      fichierType: data.fichierType,
      dateDepense: data.dateDepense?.toDate() || new Date(),
      dateCreation: data.dateCreation?.toDate() || new Date(),
      dateModification: data.dateModification?.toDate(),
      notes: data.notes,
      createdBy: data.createdBy,
      createdByNom: data.createdByNom,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de la dépense:", error);
    throw new Error("Impossible de récupérer la dépense");
  }
}

/**
 * Récupérer les dépenses liées à un BDC
 */
export async function getDepensesByBdc(bdcId: string): Promise<Depense[]> {
  try {
    const depensesRef = collection(db, DEPENSES_COLLECTION_NAME);
    const q = query(
      depensesRef,
      where("bdcId", "==", bdcId),
      orderBy("dateCreation", "desc")
    );
    const querySnapshot = await getDocs(q);

    const depenses: Depense[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      depenses.push({
        id: doc.id,
        numero: data.numero,
        montant: data.montant || 0,
        categorie: data.categorie,
        description: data.description,
        bdcId: data.bdcId,
        bdcNumero: data.bdcNumero,
        fichierUrl: data.fichierUrl,
        fichierNom: data.fichierNom,
        fichierType: data.fichierType,
        dateDepense: data.dateDepense?.toDate() || new Date(),
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateModification: data.dateModification?.toDate(),
        notes: data.notes,
        createdBy: data.createdBy,
        createdByNom: data.createdByNom,
      });
    });

    return depenses;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des dépenses du BDC:",
      error
    );
    throw new Error("Impossible de récupérer les dépenses du BDC");
  }
}

/**
 * Créer une nouvelle dépense
 */
export async function createDepense(
  depenseData: CreateDepenseInput,
  userId?: string,
  userName?: string
): Promise<string> {
  try {
    // Générer le numéro de dépense
    const numero = await getNextDepenseNumber();

    // Construire le payload en évitant les valeurs undefined
    const payload: Record<string, unknown> = {
      numero,
      montant: depenseData.montant,
      categorie: depenseData.categorie,
      description: depenseData.description,
      dateDepense: Timestamp.fromDate(depenseData.dateDepense),
      dateCreation: serverTimestamp(),
    };

    // Ajouter les champs optionnels seulement s'ils ont une valeur
    if (depenseData.bdcId) {
      payload.bdcId = depenseData.bdcId;
    }
    if (depenseData.bdcNumero) {
      payload.bdcNumero = depenseData.bdcNumero;
    }
    if (depenseData.fichierUrl) {
      payload.fichierUrl = depenseData.fichierUrl;
    }
    if (depenseData.fichierNom) {
      payload.fichierNom = depenseData.fichierNom;
    }
    if (depenseData.fichierType) {
      payload.fichierType = depenseData.fichierType;
    }
    if (depenseData.notes) {
      payload.notes = depenseData.notes;
    }
    if (userId) {
      payload.createdBy = userId;
    }
    if (userName) {
      payload.createdByNom = userName;
    }

    const depensesRef = collection(db, DEPENSES_COLLECTION_NAME);
    const docRef = await addDoc(depensesRef, payload);

    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de la création de la dépense:", error);
    throw new Error("Impossible de créer la dépense");
  }
}

/**
 * Mettre à jour une dépense
 */
export async function updateDepense(
  depenseData: UpdateDepenseInput
): Promise<void> {
  try {
    const { id, ...updateData } = depenseData;
    const depenseDoc = doc(db, DEPENSES_COLLECTION_NAME, id);

    // Vérifier que la dépense existe
    const currentDepense = await getDoc(depenseDoc);
    if (!currentDepense.exists()) {
      throw new Error("Dépense introuvable");
    }

    // Préparer les données de mise à jour
    const updatePayload: Record<string, unknown> = {
      dateModification: serverTimestamp(),
    };

    if (updateData.montant !== undefined) {
      updatePayload.montant = updateData.montant;
    }
    if (updateData.categorie !== undefined) {
      updatePayload.categorie = updateData.categorie;
    }
    if (updateData.description !== undefined) {
      updatePayload.description = updateData.description;
    }
    if (updateData.dateDepense !== undefined) {
      updatePayload.dateDepense = Timestamp.fromDate(updateData.dateDepense);
    }
    if (updateData.bdcId !== undefined) {
      updatePayload.bdcId = updateData.bdcId;
    }
    if (updateData.bdcNumero !== undefined) {
      updatePayload.bdcNumero = updateData.bdcNumero;
    }
    if (updateData.fichierUrl !== undefined) {
      updatePayload.fichierUrl = updateData.fichierUrl;
    }
    if (updateData.fichierNom !== undefined) {
      updatePayload.fichierNom = updateData.fichierNom;
    }
    if (updateData.fichierType !== undefined) {
      updatePayload.fichierType = updateData.fichierType;
    }
    if (updateData.notes !== undefined) {
      updatePayload.notes = updateData.notes;
    }

    await updateDoc(depenseDoc, updatePayload);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la dépense:", error);
    throw error;
  }
}

/**
 * Supprimer une dépense
 */
export async function deleteDepense(id: string): Promise<void> {
  try {
    const depenseDoc = doc(db, DEPENSES_COLLECTION_NAME, id);

    // Vérifier que la dépense existe
    const currentDepense = await getDoc(depenseDoc);
    if (!currentDepense.exists()) {
      throw new Error("Dépense introuvable");
    }

    await deleteDoc(depenseDoc);
  } catch (error) {
    console.error("Erreur lors de la suppression de la dépense:", error);
    throw error;
  }
}
