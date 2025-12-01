import {
  RiDashboard3Line,
  RiFileTextLine,
  RiShoppingCartLine,
  RiTruckLine,
  RiFileList2Line,
  RiWalletLine,
  RiShoppingBagLine,
  RiFileChartLine,
  RiGroupLine,
  RiSettings3Line,
  RiUserLine,
} from "react-icons/ri";
import { ItemNav } from "./types";

export const navItems: { name: string; items: ItemNav[] }[] = [
  {
    name: "Principal",
    items: [
      {
        name: "Tableau de bord",
        slug: "dashboard",
        description: "Vue d'ensemble: total livré, facturé, payé, graphiques",
        icon: RiDashboard3Line,
      },
    ],
  },
  {
    name: "Gestion",
    items: [
      {
        name: "Clients",
        slug: "clients",
        description: "Gestion de la base clients et historique",
        icon: RiGroupLine,
      },
    ],
  },
  {
    name: "Ventes",
    items: [
      {
        name: "Proformas",
        slug: "proformas",
        description: "Gestion des proformas et appels d'offres",
        icon: RiFileTextLine,
      },
      {
        name: "Bons de commande",
        slug: "bdc",
        description: "Suivi des bons de commande clients",
        icon: RiShoppingCartLine,
      },
      {
        name: "Bons de livraison",
        slug: "bdl",
        description: "Gestion des bons de livraison",
        icon: RiTruckLine,
      },
      {
        name: "Factures",
        slug: "factures",
        description: "Facturation et suivi des paiements",
        icon: RiFileList2Line,
      },
    ],
  },
  {
    name: "Finances",
    items: [
      {
        name: "Recettes",
        slug: "recettes",
        description: "Paiements reçus et à recevoir",
        icon: RiWalletLine,
      },
      {
        name: "Dépenses",
        slug: "depenses",
        description: "Dépenses et factures fournisseurs",
        icon: RiShoppingBagLine,
      },
      {
        name: "Rapports",
        slug: "rapports",
        description: "Rapports financiers et résultats",
        icon: RiFileChartLine,
      },
    ],
  },
  {
    name: "Administration",
    items: [
      {
        name: "Utilisateurs",
        slug: "users",
        description: "Gestion des comptes utilisateurs",
        icon: RiUserLine,
      },
    ],
  },
  {
    name: "Application",
    items: [
      {
        name: "Paramètres",
        slug: "settings",
        description: "Configuration: numérotation, PDF, TVA, délais",
        icon: RiSettings3Line,
      },
    ],
  },
];
