import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Facture } from "@/lib/types/facture";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { montantEnLettres } from "@/lib/utils/facture";

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: "#000",
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 60,
  },
  headerTitle: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: "bold",
  },
  companySubtitle: {
    textAlign: "center",
    fontSize: 9,
    marginTop: 5,
    fontStyle: "italic",
  },
  factureTitle: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  clientSection: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 10,
  },
  bdlReferences: {
    textAlign: "center",
    fontSize: 8,
    marginTop: 5,
    marginBottom: 10,
    fontStyle: "italic",
  },
  datesSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    fontSize: 9,
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderTop: 1,
    borderBottom: 1,
    borderColor: "#000",
    paddingVertical: 5,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: 1,
    borderColor: "#ccc",
    paddingVertical: 4,
  },
  colNumero: {
    width: "5%",
    textAlign: "center",
    paddingHorizontal: 2,
  },
  colDesignation: {
    width: "40%",
    paddingHorizontal: 4,
  },
  colUnite: {
    width: "8%",
    textAlign: "center",
    paddingHorizontal: 2,
  },
  colQuantite: {
    width: "8%",
    textAlign: "center",
    paddingHorizontal: 2,
  },
  colPrixUnitaire: {
    width: "15%",
    textAlign: "right",
    paddingHorizontal: 4,
  },
  colPrixTotal: {
    width: "24%",
    textAlign: "right",
    paddingHorizontal: 4,
  },
  totalsSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 3,
    borderTop: 1,
    borderColor: "#000",
  },
  totalLabel: {
    width: "60%",
    textAlign: "right",
    fontWeight: "bold",
    paddingRight: 10,
  },
  totalValue: {
    width: "24%",
    textAlign: "right",
    paddingRight: 4,
  },
  totalNetRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 5,
    borderTop: 2,
    borderBottom: 2,
    borderColor: "#000",
    fontWeight: "bold",
    fontSize: 11,
  },
  amountInWords: {
    marginTop: 5,
    fontSize: 9,
    fontStyle: "italic",
    textAlign: "justify",
  },
  conditionsPaiement: {
    marginTop: 10,
    fontSize: 9,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 30,
  },
  dateLocation: {
    textAlign: "right",
    fontSize: 10,
    fontStyle: "italic",
    marginBottom: 20,
  },
  signatureSection: {
    textAlign: "center",
    marginTop: 20,
  },
  signatureTitle: {
    fontSize: 11,
    fontWeight: "bold",
    fontStyle: "italic",
    marginBottom: 40,
  },
  signatureName: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 10,
  },
  companyInfo: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    borderTop: 1,
    borderColor: "#000",
    paddingTop: 10,
    fontSize: 7,
    textAlign: "center",
  },
});

interface FacturePDFTemplateProps {
  facture: Facture;
}

export function FacturePDFTemplate({ facture }: FacturePDFTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logo}>
              <Text style={{ fontSize: 8, fontWeight: "bold" }}>RAD</Text>
            </View>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={styles.headerTitle}>
                Réseau Africain de Développement
              </Text>
              <Text style={styles.companySubtitle}>
                Exécution des Travaux d'Ingénierie, Commerce Général,
                Fourniture,{"\n"}Prestations de Services & Divers
              </Text>
            </View>
            <View style={styles.logo}>
              <Text style={{ fontSize: 8, fontWeight: "bold" }}>RAD</Text>
            </View>
          </View>

          <Text style={styles.factureTitle}>
            FACTURE N° {facture.numero}
          </Text>

          <Text style={styles.clientSection}>
            CLIENT: {facture.clientNom}
          </Text>

          {/* Références BDL si applicable */}
          {facture.bdlIds && facture.bdlIds.length > 0 && (
            <Text style={styles.bdlReferences}>
              Réf. BDL: {facture.bdlNumeros?.join(", ")}
            </Text>
          )}
        </View>

        {/* Dates */}
        <View style={styles.datesSection}>
          <Text>
            Date d'émission: {format(facture.dateEmission, "dd/MM/yyyy", { locale: fr })}
          </Text>
          {facture.dateEcheance && (
            <Text>
              Date d'échéance: {format(facture.dateEcheance, "dd/MM/yyyy", { locale: fr })}
            </Text>
          )}
        </View>

        {/* Tableau */}
        <View style={styles.table}>
          {/* En-tête du tableau */}
          <View style={styles.tableHeader}>
            <Text style={styles.colNumero}>N°</Text>
            <Text style={styles.colDesignation}>DESIGNATION</Text>
            <Text style={styles.colUnite}>UN</Text>
            <Text style={styles.colQuantite}>QTE</Text>
            <Text style={styles.colPrixUnitaire}>Prix Unitaire</Text>
            <Text style={styles.colPrixTotal}>Prix Total GNF</Text>
          </View>

          {/* Lignes du tableau */}
          {facture.lignes.map((ligne) => (
            <View key={ligne.numero} style={styles.tableRow}>
              <Text style={styles.colNumero}>{ligne.numero}</Text>
              <Text style={styles.colDesignation}>{ligne.designation}</Text>
              <Text style={styles.colUnite}>{ligne.unite}</Text>
              <Text style={styles.colQuantite}>{ligne.quantite}</Text>
              <Text style={styles.colPrixUnitaire}>
                {ligne.prixUnitaire.toLocaleString("fr-FR")}
              </Text>
              <Text style={styles.colPrixTotal}>
                {ligne.prixTotal.toLocaleString("fr-FR")}
              </Text>
            </View>
          ))}
        </View>

        {/* Totaux */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total HT</Text>
            <Text style={styles.totalValue}>
              {facture.total.toLocaleString("fr-FR")}
            </Text>
          </View>

          {facture.remisePourcentage > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Remise ({facture.remisePourcentage}%)
              </Text>
              <Text style={styles.totalValue}>
                {facture.remiseMontant.toLocaleString("fr-FR")}
              </Text>
            </View>
          )}

          <View style={styles.totalNetRow}>
            <Text style={styles.totalLabel}>TOTAL NET À PAYER</Text>
            <Text style={styles.totalValue}>
              {facture.totalNet.toLocaleString("fr-FR")}
            </Text>
          </View>
        </View>

        {/* Montant en lettres */}
        <View style={styles.amountInWords}>
          <Text>
            Arrêtée la présente facture à la somme de:{" "}
            {montantEnLettres(facture.totalNet)}
          </Text>
        </View>

        {/* Conditions de paiement */}
        {facture.conditionsPaiement && (
          <View style={styles.conditionsPaiement}>
            <Text>Conditions de paiement:</Text>
            <Text style={{ fontWeight: "normal", marginTop: 5 }}>
              {facture.conditionsPaiement}
            </Text>
          </View>
        )}

        {/* Pied de page */}
        <View style={styles.footer}>
          <Text style={styles.dateLocation}>
            {facture.lieu}, le{" "}
            {format(facture.dateEmission, "dd MMMM yyyy", { locale: fr })}
          </Text>

          <View style={styles.signatureSection}>
            <Text style={styles.signatureTitle}>Le Fournisseur</Text>
            <Text style={styles.signatureName}>{facture.fournisseur}</Text>
          </View>
        </View>

        {/* Informations entreprise (bas de page) */}
        <View style={styles.companyInfo}>
          <Text>
            Réseau Africain de Développement - N° Entreprise / RCCM /
            GN.KAL.2018 A.083.619 - TVA SF
          </Text>
          <Text>
            N° de Compte Bancaire 042 00 11 00 03 NSIA Bank - N° 00018 -
            0820872041 02 Orabank
          </Text>
          <Text>
            N° de Compte Bancaire 73 72 00 52 67 Ecobank - NIF: 474269636 -
            Email: radguinee@gmail.com
          </Text>
          <Text>
            Siège Social: Siguiri Koura 1/Rép. Guinée - Tél: (00224) 622 61 54
            31 / 620 44 33 33
          </Text>
        </View>
      </Page>
    </Document>
  );
}
