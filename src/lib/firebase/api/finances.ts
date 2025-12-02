import {
  EtatFinancier,
  DepenseParCategorie,
  IndicateursFinanciers,
  FiltrePeriode,
} from "@/lib/types/finances";
import { CategorieDepense, CATEGORIE_DEPENSE_LABELS } from "@/lib/types/depense";
import { getBdls } from "./bdl";
import { getFactures } from "./facture";
import { getDepenses } from "./depense";

/**
 * Récupérer l'état financier global du système avec filtrage par période
 * Calcule tous les montants basés sur les BDL, factures et dépenses
 */
export async function getEtatFinancier(
  periode: FiltrePeriode
): Promise<EtatFinancier> {
  try {
    // 1. Récupérer tous les BDL
    const bdls = await getBdls();

    // Filtrer les BDL par période (basé sur dateLivraison)
    const bdlsPeriode = bdls.filter(
      (bdl) => bdl.dateLivraison && isDateInPeriode(bdl.dateLivraison, periode)
    );

    // Livré non facturé (BDL LIVRE sans factureId dans la période)
    const bdlsLivres = bdlsPeriode.filter(
      (bdl) => bdl.statut === "LIVRE" && !bdl.factureId
    );
    const livreMontant = bdlsLivres.reduce(
      (sum, bdl) => sum + bdl.totalNet,
      0
    );

    // BDL annulés dans la période
    const bdlsAnnules = bdlsPeriode.filter((bdl) => bdl.statut === "ANNULE");

    // 2. Récupérer toutes les factures
    const factures = await getFactures();

    // Filtrer les factures par période (basé sur dateEmission)
    const facturesPeriode = factures.filter(
      (facture) =>
        facture.dateEmission && isDateInPeriode(facture.dateEmission, periode)
    );

    // Facturé non payé (Factures EMISE + PAYEE_PARTIELLE dans la période)
    const facturesNonPayees = facturesPeriode.filter(
      (f) => f.statut === "EMISE" || f.statut === "PAYEE_PARTIELLE"
    );
    const factureMontant = facturesNonPayees.reduce(
      (sum, f) => sum + f.soldeRestant,
      0
    );

    // Payé (Factures PAYEE dans la période - on compte le totalPaye)
    const facturesPayees = facturesPeriode.filter((f) => f.statut === "PAYEE");
    const payeMontant = facturesPayees.reduce(
      (sum, f) => sum + f.totalPaye,
      0
    );

    // Factures annulées dans la période
    const facturesAnnulees = facturesPeriode.filter(
      (f) => f.statut === "ANNULEE"
    );

    // Montant annulé total (BDL + Factures) dans la période
    const annuleMontant =
      bdlsAnnules.reduce((sum, bdl) => sum + bdl.totalNet, 0) +
      facturesAnnulees.reduce((sum, f) => sum + f.totalNet, 0);

    // 3. Récupérer toutes les dépenses
    const depenses = await getDepenses();

    // Filtrer les dépenses par période (basé sur dateDepense)
    const depensesPeriode = depenses.filter(
      (depense) =>
        depense.dateDepense && isDateInPeriode(depense.dateDepense, periode)
    );

    const totalDepenses = depensesPeriode.reduce(
      (sum, d) => sum + d.montant,
      0
    );

    // Dépenses par catégorie (filtrées par période)
    const depensesParCategorie = {} as Record<CategorieDepense, number>;

    // Initialiser toutes les catégories à 0
    Object.keys(CATEGORIE_DEPENSE_LABELS).forEach((cat) => {
      depensesParCategorie[cat as CategorieDepense] = 0;
    });

    // Calculer les montants par catégorie (seulement pour la période)
    depensesPeriode.forEach((d) => {
      depensesParCategorie[d.categorie] =
        (depensesParCategorie[d.categorie] || 0) + d.montant;
    });

    // 4. Calculer le résultat net
    // Recettes = Montant total payé dans la période
    const recettes = payeMontant;
    const resultatNet = recettes - totalDepenses;

    return {
      // Cycle commercial
      livreMontant,
      livreCount: bdlsLivres.length,
      livreBdlIds: bdlsLivres.map((b) => b.id),

      factureMontant,
      factureCount: facturesNonPayees.length,
      factureIds: facturesNonPayees.map((f) => f.id),

      payeMontant,
      payeCount: facturesPayees.length,
      payeFactureIds: facturesPayees.map((f) => f.id),

      annuleMontant,
      annuleCount: bdlsAnnules.length + facturesAnnulees.length,
      annuleIds: [
        ...bdlsAnnules.map((b) => b.id),
        ...facturesAnnulees.map((f) => f.id),
      ],

      // Dépenses
      totalDepenses,
      depensesCount: depensesPeriode.length,
      depensesParCategorie,

      // Résultat
      recettes,
      resultatNet,
    };
  } catch (error) {
    console.error(
      "Erreur lors du calcul de l'état financier:",
      error
    );
    throw new Error("Impossible de calculer l'état financier");
  }
}

/**
 * Récupérer les dépenses détaillées par catégorie
 */
export async function getDepensesParCategorie(): Promise<
  DepenseParCategorie[]
> {
  try {
    const depenses = await getDepenses();
    const totalDepenses = depenses.reduce((sum, d) => sum + d.montant, 0);

    // Grouper par catégorie
    const grouped = depenses.reduce(
      (acc, d) => {
        if (!acc[d.categorie]) {
          acc[d.categorie] = { montant: 0, count: 0 };
        }
        acc[d.categorie].montant += d.montant;
        acc[d.categorie].count += 1;
        return acc;
      },
      {} as Record<CategorieDepense, { montant: number; count: number }>
    );

    // Convertir en tableau avec pourcentages
    const result: DepenseParCategorie[] = Object.entries(grouped).map(
      ([categorie, data]) => ({
        categorie: categorie as CategorieDepense,
        montant: data.montant,
        count: data.count,
        pourcentage:
          totalDepenses > 0 ? (data.montant / totalDepenses) * 100 : 0,
      })
    );

    // Trier par montant décroissant
    result.sort((a, b) => b.montant - a.montant);

    return result;
  } catch (error) {
    console.error(
      "Erreur lors du calcul des dépenses par catégorie:",
      error
    );
    throw new Error(
      "Impossible de calculer les dépenses par catégorie"
    );
  }
}

/**
 * Fonction helper pour filtrer par période
 */
function isDateInPeriode(date: Date, periode: FiltrePeriode): boolean {
  const dateToCheck = new Date(date);

  if (periode.type === "mois") {
    // Filtrer par mois spécifique et année
    return (
      dateToCheck.getMonth() === (periode.mois! - 1) &&
      dateToCheck.getFullYear() === periode.annee
    );
  } else if (periode.type === "annee") {
    // Filtrer par année uniquement
    return dateToCheck.getFullYear() === periode.annee;
  } else if (periode.type === "custom" && periode.dateDebut && periode.dateFin) {
    // Filtrer par période personnalisée
    const debut = new Date(periode.dateDebut);
    const fin = new Date(periode.dateFin);
    debut.setHours(0, 0, 0, 0);
    fin.setHours(23, 59, 59, 999);
    return dateToCheck >= debut && dateToCheck <= fin;
  }

  return false;
}

/**
 * Récupérer les indicateurs financiers avec filtrage par période
 */
export async function getIndicateursFinanciers(
  periode: FiltrePeriode
): Promise<IndicateursFinanciers> {
  try {
    // 1. Récupérer tous les BDL
    const bdls = await getBdls();

    // Filtrer les BDL livrés par période (basé sur dateLivraison)
    const bdlsLivres = bdls.filter(
      (bdl) =>
        bdl.statut === "LIVRE" &&
        bdl.dateLivraison &&
        isDateInPeriode(bdl.dateLivraison, periode)
    );

    // Total livré (tous les BDL livrés, facturés ou non)
    const totalLivre = bdlsLivres.reduce((sum, bdl) => sum + bdl.totalNet, 0);

    // Livré ET facturé (BDL livrés qui ont un factureId)
    const bdlsLivresFactures = bdlsLivres.filter((bdl) => bdl.factureId);
    const livreFacture = bdlsLivresFactures.reduce(
      (sum, bdl) => sum + bdl.totalNet,
      0
    );

    // 2. Récupérer toutes les factures
    const factures = await getFactures();

    // Filtrer les factures par période (basé sur dateEmission)
    const facturesPeriode = factures.filter(
      (facture) =>
        facture.dateEmission && isDateInPeriode(facture.dateEmission, periode)
    );

    // Total facturé (EMISE + PAYEE_PARTIELLE + PAYEE)
    const facturesValides = facturesPeriode.filter(
      (f) =>
        f.statut === "EMISE" ||
        f.statut === "PAYEE_PARTIELLE" ||
        f.statut === "PAYEE"
    );
    const totalFacture = facturesValides.reduce(
      (sum, f) => sum + f.totalNet,
      0
    );

    return {
      totalLivre,
      totalLivreCount: bdlsLivres.length,
      totalFacture,
      totalFactureCount: facturesValides.length,
      livreFacture,
      livreFactureCount: bdlsLivresFactures.length,
      periode,
    };
  } catch (error) {
    console.error(
      "Erreur lors du calcul des indicateurs financiers:",
      error
    );
    throw new Error("Impossible de calculer les indicateurs financiers");
  }
}
