/**
 * API Firebase pour les Dépenses
 * Selon le cahier des charges RAD - Section 9
 */

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
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client/config";
import { DEPENSES_COLLECTION_NAME } from "@/lib/firebase/collections_name";
import {
  Depense,
  CreateDepenseInput,
  UpdateDepenseInput,
  HistoriqueAction,
  CategorieDepense,
  StatistiquesDepenses,
} from "@/lib/types";

/**
 * Générer un numéro de dépense unique
 */
async function genererNumeroDepense(): Promise<string> {
  const year = new Date().getFullYear();
  const depensesRef = collection(db, DEPENSES_COLLECTION_NAME);
  const q = query(
    depensesRef,
    where("numero", ">=", `DEP-${year}-`),
    where("numero", "<", `DEP-${year + 1}-`),
    orderBy("numero", "desc")
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return `DEP-${year}-001`;
  }

  const dernierNumero = snapshot.docs[0].data().numero as string;
  const dernierIncrement = parseInt(dernierNumero.split("-")[2]);
  const nouveauIncrement = (dernierIncrement + 1).toString().padStart(3, "0");

  return `DEP-${year}-${nouveauIncrement}`;
}

/**
 * Créer une action d'historique
 */
function creerActionHistorique(
  action: string,
  utilisateur: string,
  details?: string
): HistoriqueAction {
  return {
    id: crypto.randomUUID(),
    action,
    utilisateur,
    date: new Date(),
    details,
  };
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
        designation: data.designation,
        categorie: data.categorie,
        montant: data.montant || 0,
        dateCreation: data.dateCreation?.toDate() || new Date(),
        dateDepense: data.dateDepense?.toDate() || new Date(),
        fournisseur: data.fournisseur,
        numeroFactureFournisseur: data.numeroFactureFournisseur,
        bdcId: data.bdcId,
        bdcNumero: data.bdcNumero,
        notes: data.notes,
        justificatifs: data.justificatifs || [],
        statut: data.statut,
        modePaiement: data.modePaiement,
        datePaiement: data.datePaiement?.toDate(),
        historique: data.historique || [],
        creePar: data.creePar,
        modifiePar: data.modifiePar,
        dateModification: data.dateModification?.toDate(),
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
      designation: data.designation,
      categorie: data.categorie,
      montant: data.montant || 0,
      dateCreation: data.dateCreation?.toDate() || new Date(),
      dateDepense: data.dateDepense?.toDate() || new Date(),
      fournisseur: data.fournisseur,
      numeroFactureFournisseur: data.numeroFactureFournisseur,
      bdcId: data.bdcId,
      bdcNumero: data.bdcNumero,
      notes: data.notes,
      justificatifs: data.justificatifs || [],
      statut: data.statut,
      modePaiement: data.modePaiement,
      datePaiement: data.datePaiement?.toDate(),
      historique: data.historique || [],
      creePar: data.creePar,
      modifiePar: data.modifiePar,
      dateModification: data.dateModification?.toDate(),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de la dépense:", error);
    throw new Error("Impossible de récupérer la dépense");
  }
}

/**
 * Créer une nouvelle dépense
 */
export async function createDepense(
  depenseData: CreateDepenseInput,
  userId: string
): Promise<string> {
  try {
    // Générer le numéro de dépense
    const numero = await genererNumeroDepense();

    // Déterminer le statut initial
    const statut = depenseData.datePaiement ? "payee" : "en_attente";

    // Créer l'historique initial
    const historique = [
      creerActionHistorique("creation", userId, "Création de la dépense"),
    ];

    const depensesRef = collection(db, DEPENSES_COLLECTION_NAME);
    const docRef = await addDoc(depensesRef, {
      numero,
      designation: depenseData.designation,
      categorie: depenseData.categorie,
      montant: depenseData.montant,
      dateCreation: serverTimestamp(),
      dateDepense: Timestamp.fromDate(depenseData.dateDepense),
      fournisseur: depenseData.fournisseur,
      numeroFactureFournisseur: depenseData.numeroFactureFournisseur,
      bdcId: depenseData.bdcId,
      notes: depenseData.notes,
      justificatifs: [],
      statut,
      modePaiement: depenseData.modePaiement,
      datePaiement: depenseData.datePaiement
        ? Timestamp.fromDate(depenseData.datePaiement)
        : null,
      historique,
      creePar: userId,
    });

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
  depenseData: UpdateDepenseInput,
  userId: string
): Promise<void> {
  try {
    const { id, ...updateData } = depenseData;
    const depenseDoc = doc(db, DEPENSES_COLLECTION_NAME, id);

    // Préparer les données de mise à jour
    const dataToUpdate: any = {
      dateModification: serverTimestamp(),
      modifiePar: userId,
    };

    if (updateData.designation !== undefined)
      dataToUpdate.designation = updateData.designation;
    if (updateData.categorie !== undefined)
      dataToUpdate.categorie = updateData.categorie;
    if (updateData.montant !== undefined)
      dataToUpdate.montant = updateData.montant;
    if (updateData.dateDepense)
      dataToUpdate.dateDepense = Timestamp.fromDate(updateData.dateDepense);
    if (updateData.fournisseur !== undefined)
      dataToUpdate.fournisseur = updateData.fournisseur;
    if (updateData.numeroFactureFournisseur !== undefined)
      dataToUpdate.numeroFactureFournisseur =
        updateData.numeroFactureFournisseur;
    if (updateData.notes !== undefined) dataToUpdate.notes = updateData.notes;
    if (updateData.statut !== undefined) dataToUpdate.statut = updateData.statut;
    if (updateData.modePaiement !== undefined)
      dataToUpdate.modePaiement = updateData.modePaiement;
    if (updateData.datePaiement)
      dataToUpdate.datePaiement = Timestamp.fromDate(updateData.datePaiement);

    // Récupérer l'historique actuel et ajouter une nouvelle action
    const depenseSnapshot = await getDoc(depenseDoc);
    if (depenseSnapshot.exists()) {
      const currentHistorique = depenseSnapshot.data().historique || [];
      const nouvelleAction = creerActionHistorique(
        "modification",
        userId,
        "Modification de la dépense"
      );
      dataToUpdate.historique = [...currentHistorique, nouvelleAction];
    }

    await updateDoc(depenseDoc, dataToUpdate);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la dépense:", error);
    throw new Error("Impossible de mettre à jour la dépense");
  }
}

/**
 * Supprimer une dépense
 */
export async function deleteDepense(id: string): Promise<void> {
  try {
    const depenseDoc = doc(db, DEPENSES_COLLECTION_NAME, id);
    await deleteDoc(depenseDoc);
  } catch (error) {
    console.error("Erreur lors de la suppression de la dépense:", error);
    throw new Error("Impossible de supprimer la dépense");
  }
}

/**
 * Récupérer les statistiques des dépenses
 */
export async function getStatistiquesDepenses(): Promise<StatistiquesDepenses> {
  try {
    const depenses = await getDepenses();

    const now = new Date();
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
    const debutAnnee = new Date(now.getFullYear(), 0, 1);

    const totalDepenses = depenses.reduce((sum, d) => sum + d.montant, 0);

    const depensesCeMois = depenses
      .filter((d) => d.dateDepense >= debutMois)
      .reduce((sum, d) => sum + d.montant, 0);

    const depensesCetteAnnee = depenses
      .filter((d) => d.dateDepense >= debutAnnee)
      .reduce((sum, d) => sum + d.montant, 0);

    // Par catégorie
    const parCategorie = Object.values(
      depenses.reduce((acc, d) => {
        if (!acc[d.categorie]) {
          acc[d.categorie] = {
            categorie: d.categorie,
            montant: 0,
            pourcentage: 0,
          };
        }
        acc[d.categorie].montant += d.montant;
        return acc;
      }, {} as Record<CategorieDepense, { categorie: CategorieDepense; montant: number; pourcentage: number }>)
    );

    // Calculer les pourcentages
    parCategorie.forEach((cat) => {
      cat.pourcentage =
        totalDepenses > 0 ? (cat.montant / totalDepenses) * 100 : 0;
    });

    // Évolution mensuelle (12 derniers mois)
    const evolutionMensuelle: { mois: string; montant: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const moisSuivant = new Date(date.getFullYear(), date.getMonth() + 1, 1);

      const montant = depenses
        .filter((d) => d.dateDepense >= date && d.dateDepense < moisSuivant)
        .reduce((sum, d) => sum + d.montant, 0);

      evolutionMensuelle.push({
        mois: date.toLocaleDateString("fr-FR", {
          month: "short",
          year: "numeric",
        }),
        montant,
      });
    }

    return {
      totalDepenses,
      depensesCeMois,
      depensesCetteAnnee,
      parCategorie,
      evolutionMensuelle,
    };
  } catch (error) {
    console.error(
      "Erreur lors du calcul des statistiques des dépenses:",
      error
    );
    throw new Error("Impossible de calculer les statistiques des dépenses");
  }
}
