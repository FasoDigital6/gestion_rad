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
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client/config";
import {
  CLIENTS_COLLECTION_NAME,
  FACTURES_COLLECTION_NAME,
} from "@/lib/firebase/collections_name";
import {
  Client,
  CreateClientInput,
  UpdateClientInput,
} from "@/lib/types/client";

/**
 * Récupérer tous les clients
 */
export async function getClients(): Promise<Client[]> {
  try {
    const clientsRef = collection(db, CLIENTS_COLLECTION_NAME);
    const q = query(clientsRef, orderBy("dateCreation", "desc"));
    const querySnapshot = await getDocs(q);

    const clients: Client[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      clients.push({
        id: doc.id,
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
        adresse: data.adresse,
        rccm: data.rccm,
        dateCreation: data.dateCreation?.toDate() || new Date(),
        totalLivre: data.totalLivre || 0,
        totalFacture: data.totalFacture || 0,
        totalPaye: data.totalPaye || 0,
        totalDu: data.totalDu || 0,
      });
    });

    return clients;
  } catch (error) {
    console.error("Erreur lors de la récupération des clients:", error);
    throw new Error("Impossible de récupérer les clients");
  }
}

/**
 * Récupérer un client par son ID
 */
export async function getClient(id: string): Promise<Client> {
  try {
    const clientDoc = doc(db, CLIENTS_COLLECTION_NAME, id);
    const clientSnapshot = await getDoc(clientDoc);

    if (!clientSnapshot.exists()) {
      throw new Error("Client introuvable");
    }

    const data = clientSnapshot.data();
    return {
      id: clientSnapshot.id,
      nom: data.nom,
      email: data.email,
      telephone: data.telephone,
      adresse: data.adresse,
      rccm: data.rccm,
      dateCreation: data.dateCreation?.toDate() || new Date(),
      totalLivre: data.totalLivre || 0,
      totalFacture: data.totalFacture || 0,
      totalPaye: data.totalPaye || 0,
      totalDu: data.totalDu || 0,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du client:", error);
    throw new Error("Impossible de récupérer le client");
  }
}

/**
 * Créer un nouveau client
 */
export async function createClient(
  clientData: CreateClientInput
): Promise<string> {
  try {
    const clientsRef = collection(db, CLIENTS_COLLECTION_NAME);
    const docRef = await addDoc(clientsRef, {
      ...clientData,
      dateCreation: serverTimestamp(),
      totalLivre: 0,
      totalFacture: 0,
      totalPaye: 0,
      totalDu: 0,
    });

    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de la création du client:", error);
    throw new Error("Impossible de créer le client");
  }
}

/**
 * Mettre à jour un client
 */
export async function updateClient(
  clientData: UpdateClientInput
): Promise<void> {
  try {
    const { id, ...updateData } = clientData;
    const clientDoc = doc(db, CLIENTS_COLLECTION_NAME, id);
    await updateDoc(clientDoc, updateData);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du client:", error);
    throw new Error("Impossible de mettre à jour le client");
  }
}

/**
 * Supprimer un client
 */
export async function deleteClient(id: string): Promise<void> {
  try {
    const clientDoc = doc(db, CLIENTS_COLLECTION_NAME, id);
    await deleteDoc(clientDoc);
  } catch (error) {
    console.error("Erreur lors de la suppression du client:", error);
    throw new Error("Impossible de supprimer le client");
  }
}

/**
 * Activer/Désactiver un client
 */
export async function toggleClientStatus(
  id: string,
  statut: "actif" | "inactif"
): Promise<void> {
  try {
    const clientDoc = doc(db, CLIENTS_COLLECTION_NAME, id);
    await updateDoc(clientDoc, { statut });
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    throw new Error("Impossible de changer le statut du client");
  }
}

/**
 * Recalculer tous les totaux d'un client depuis les factures
 * Appelé automatiquement lors émission facture ou ajout paiement
 * Peut aussi être appelé manuellement pour correction
 */
export async function recalculateClientTotals(clientId: string): Promise<void> {
  try {
    // Récupérer toutes les factures EMISES, PAYEE_PARTIELLE, PAYEE du client
    const facturesRef = collection(db, FACTURES_COLLECTION_NAME);
    const q = query(
      facturesRef,
      where("clientId", "==", clientId),
      where("statut", "in", ["EMISE", "PAYEE_PARTIELLE", "PAYEE"])
    );
    const querySnapshot = await getDocs(q);

    let totalFacture = 0;
    let totalPaye = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalFacture += data.totalNet || 0;
      totalPaye += data.totalPaye || 0;
    });

    const totalDu = totalFacture - totalPaye;

    // Mettre à jour le client
    const clientDoc = doc(db, CLIENTS_COLLECTION_NAME, clientId);
    await updateDoc(clientDoc, {
      totalFacture,
      totalPaye,
      totalDu,
    });
  } catch (error) {
    console.error("Erreur lors du recalcul des totaux du client:", error);
    throw new Error("Impossible de recalculer les totaux du client");
  }
}
