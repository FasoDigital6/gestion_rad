1) Auth

flowchart TD
    START([Debut]) --> AUTH_OPEN[Ouvrir la page de connexion]

    %% Connexion
    AUTH_OPEN --> LOGIN[Se connecter]
    LOGIN --> LOGIN_SUCCESS[Connexion reussie]
    LOGIN --> LOGIN_FAIL[Erreur de connexion]

    %% Creation de compte (utilisateur standard)
    START --> USER_CREATE[Creer un compte]
    USER_CREATE --> USER_FORM[Entrer email et mot de passe]
    USER_FORM --> USER_SAVE[Compte cree]

    %% Changement de mot de passe
    LOGIN_SUCCESS --> CHANGE_PWD[Changer mot de passe]
    CHANGE_PWD --> PWD_SAVE[Nouveau mot de passe enregistre]

    %% Administration
    ADMIN([Administrateur]) --> ADMIN_OPEN[Ouvrir gestion utilisateurs]

    ADMIN_OPEN --> ADMIN_CREATE[Creer un utilisateur]
    ADMIN_CREATE --> ADMIN_FORM[Entrer infos et role]
    ADMIN_FORM --> ADMIN_SAVE[Utilisateur enregistre]

    ADMIN_OPEN --> ADMIN_EDIT[Modifier un utilisateur]
    ADMIN_EDIT --> ADMIN_ACTIV[Activer un compte]
    ADMIN_EDIT --> ADMIN_DESACT[Desactiver un compte]
    ADMIN_EDIT --> ADMIN_ROLE[Changer de role]

    %% Roles disponibles
    ADMIN_SAVE --> ROLES[Roles: Administrateur, Gestionnaire, Lecture seule]
    ADMIN_ROLE --> ROLES




3) gestions clients
flowchart TD
    START([Debut]) --> OPEN[Ouvrir la section Clients]

    %% Creation ou modification
    OPEN --> CREATE[Creer un client]
    CREATE --> FORM_CREATE[Remplir les informations du client]
    FORM_CREATE --> SAVE_CREATE[Enregistrer le client]

    OPEN --> EDIT[Modifier un client]
    EDIT --> FORM_EDIT[Mettre a jour les informations]
    FORM_EDIT --> SAVE_EDIT[Enregistrer les modifications]

    %% Fiche client
    OPEN --> OPEN_FILE[Ouvrir la fiche client]
    OPEN_FILE --> DOC_PRO[Voir Proformas]
    OPEN_FILE --> DOC_BDC[Voir BDC]
    OPEN_FILE --> DOC_BL[Voir BL]
    OPEN_FILE --> DOC_FACT[Voir Factures]
    OPEN_FILE --> DOC_PAY[Voir Paiements]

    %% Totaux visibles
    OPEN_FILE --> TOTAL_LIVRE[Total livre]
    OPEN_FILE --> TOTAL_FACT[Total facture]
    OPEN_FILE --> TOTAL_PAYE[Total paye]
    OPEN_FILE --> TOTAL_DU[Total du]


 4) proforma et appels d'offres

    flowchart TD
    START([Début]) --> OPEN[Ouvrir section Proformas]

    OPEN --> CREATE[Créer un proforma]
    CREATE --> LINES[Saisir designation, quantite, unite]
    LINES --> PRICES[Completer les prix unitaires]
    PRICES --> SAVE1[Enregistrer le proforma]
    SAVE1 --> EXPORT1[Exporter en PDF avec template client]

    OPEN --> IMPORT[Importer un appel d'offres]
    IMPORT --> SOURCE[Source: Email, PDF, Excel, Word]
    SOURCE --> EXTRACT[Extraction automatique des lignes]
    EXTRACT --> COMPLETE[Completer les prix unitaires]
    COMPLETE --> SAVE2[Enregistrer le proforma]
    SAVE2 --> EXPORT2[Exporter en PDF]


5)  BDC
flowchart TD
    START([Début]) --> OPEN[Ouvrir section BDC]

    %% Création du BDC
    OPEN --> FROM_PROFORMA[Créer BDC depuis un proforma validé]
    FROM_PROFORMA --> SELECT_PROFORMA[Sélectionner le proforma valide]
    SELECT_PROFORMA --> GEN_BDC[BDC généré automatiquement]
    GEN_BDC --> SAVE1[Enregistrer le BDC]

    OPEN --> FROM_PDF[Importer BDC client en PDF]
    FROM_PDF --> UPLOAD[Importer le fichier PDF]
    UPLOAD --> SAVE2[Enregistrer le BDC importé]

    %% Consultation
    OPEN --> VIEW[Consulter un BDC]
    VIEW --> STATUS[Modifier le statut du BDC]
    VIEW --> SEE_BL[Voir les BL liés]
    VIEW --> SEE_FACT[Voir les factures liées]

    %% Rappel important
    VIEW --> INFO[Le BDC ne rentre pas dans les finances]


6) BL

flowchart TD
    START([Début]) --> OPEN[Ouvrir section BL]

    %% Création du BL
    OPEN --> FROM_BDC[Créer un BL depuis un BDC]
    FROM_BDC --> SELECT[Sélectionner le BDC]

    %% Types de livraisons
    SELECT --> PARTIAL[Effectuer une livraison partielle]
    SELECT --> FULL[Effectuer une livraison complète]
    SELECT --> MULTIPLE[Gérer plusieurs livraisons]

    %% Annulation de quantités
    SELECT --> CANCEL_QTE[Annuler certaines quantités]

    %% Enregistrement
    PARTIAL --> SAVE1[Enregistrer le BL]
    FULL --> SAVE2[Enregistrer le BL]
    MULTIPLE --> SAVE3[Enregistrer le BL]
    CANCEL_QTE --> SAVE4[Enregistrer le BL]

    %% Impact financier
    SAVE1 --> FIN_STATUS[Statut finances : Livré - Non facturé]
    SAVE2 --> FIN_STATUS
    SAVE3 --> FIN_STATUS
    SAVE4 --> FIN_STATUS


7) Facturation

flowchart TD
    START([Début]) --> OPEN[Ouvrir section Facturation]

    %% Création de la facture
    OPEN --> FROM_BL[Créer une facture à partir d'un ou plusieurs BL]
    FROM_BL --> SELECT_BL[Sélectionner les BL]

    %% Remplissage automatique
    SELECT_BL --> AUTO_FILL[Remplissage automatique: client, BDC, BL, designations, quantites, montants]

    %% Enregistrement
    AUTO_FILL --> SAVE[Enregistrer la facture]

    %% Impact financier
    SAVE --> STATUS_FIN[Statut finances: Facturé - Non payé]


8) Finances

flowchart TD
    START([Début]) --> OPEN_FIN[Ouvrir section Finances]

    %% Suivi des états financiers du cycle commercial
    OPEN_FIN --> TRACK1[Suivre Livré non facturé]
    OPEN_FIN --> TRACK2[Suivre Facturé non payé]
    OPEN_FIN --> TRACK3[Suivre Payé]
    OPEN_FIN --> TRACK4[Suivre Annulé]

    %% Dépenses
    OPEN_FIN --> ADD_EXP[Ajouter une dépense]
    ADD_EXP --> EXP_FORM[Entrer montant, categorie, description]
    EXP_FORM --> EXP_ATTACH[Joindre un fichier]
    EXP_ATTACH --> EXP_LINK[Lier la dépense a une commande]
    EXP_LINK --> SAVE_EXP[Enregistrer la dépense]

    %% Résultat net
    TRACK1 --> RESULT[Calculer resultat net]
    TRACK2 --> RESULT
    TRACK3 --> RESULT
    TRACK4 --> RESULT
    SAVE_EXP --> RESULT

    RESULT --> DASH[Afficher le resultat net]


9) gestion users

flowchart TD
    START([Début]) --> OPEN[Ouvrir la section Utilisateurs]

    %% --- Liste des utilisateurs ---
    OPEN --> VIEW_LIST[Voir la liste des utilisateurs]

    %% --- Création d'un utilisateur ---
    VIEW_LIST --> CREATE[Créer un nouvel utilisateur]
    CREATE --> CREATE_FORM[Remplir nom, email, mot de passe, rôle]
    CREATE_FORM --> SAVE_CREATE[Enregistrer l'utilisateur]

    %% --- Modification d'un utilisateur ---
    VIEW_LIST --> EDIT[Modifier un utilisateur]
    EDIT --> CHANGE_FIELDS[Changer nom, email ou rôle]
    CHANGE_FIELDS --> SAVE_EDIT[Enregistrer les modifications]

    %% --- Gestion des droits ---
    EDIT --> ACTIVATE[Activer un compte]
    EDIT --> DEACTIVATE[Désactiver un compte]

    ACTIVATE --> SAVE_EDIT
    DEACTIVATE --> SAVE_EDIT

    %% --- Rôles disponibles ---
    SAVE_EDIT --> ROLES[Les rôles contrôlent les permissions : Admin / Gestionnaire / Lecture seule]

9) Signature et Cachet

flowchart TD
    START([Début]) --> OPEN[Ouvrir les paramètres de signature]

    %% --- Ajout des signatures ---
    OPEN --> ADD_SIGNATURE[Ajouter une signature électronique]
    ADD_SIGNATURE --> UPLOAD_SIGN[Importer une image de signature]
    UPLOAD_SIGN --> SAVE_SIGN[Enregistrer la signature]

    %% --- Ajout du cachet ---
    OPEN --> ADD_STAMP[Ajouter un cachet de l'entreprise]
    ADD_STAMP --> UPLOAD_STAMP[Importer l'image du cachet]
    UPLOAD_STAMP --> SAVE_STAMP[Enregistrer le cachet]

    %% --- Utilisation sur documents ---
    START --> DOC_SECTION[Créer ou ouvrir un document : Proforma, BDC, BL, Facture]
    DOC_SECTION --> APPLY_SIGN[Choisir d'ajouter signature]
    APPLY_SIGN --> APPLY_STAMP[Choisir d'ajouter cachet]
    APPLY_STAMP --> EXPORT[Exporter le document signé en PDF]

    %% Optionnel
    EXPORT --> OPTIONAL[(Cette fonctionnalité est optionnelle\net peut être activée ou désactivée)]
10) Tableau de bord

flowchart TD
    START([Debut]) --> OPEN_DASH[Ouvrir le tableau de bord]

    %% Indicateurs principaux
    OPEN_DASH --> TOTAL_LIVRE[Voir total livre]
    OPEN_DASH --> TOTAL_FACT[Voir total facture]
    OPEN_DASH --> TOTAL_PAYE[Voir total paye]
    OPEN_DASH --> LATE_DELIV[Voir livraisons en retard]
    OPEN_DASH --> PENDING_FACT[Voir factures en attente]
    OPEN_DASH --> TO_CLAIM[Voir montants a reclamer]

    %% Graphiques mensuels
    OPEN_DASH --> GRAPH_REC[Graphique mensuel des recettes]
    OPEN_DASH --> GRAPH_DEP[Graphique mensuel des depenses]
    OPEN_DASH --> GRAPH_RES[Graphique mensuel du resultat net]
 
11) GEneration de pdf
flowchart TD
    START([Début]) --> OPEN[Ouvrir un document]

    %% Types de documents exportables
    OPEN --> PROFORMA[Proforma]
    OPEN --> BDC[BDC]
    OPEN --> BL[BL]
    OPEN --> FACTURE[Facture]
    OPEN --> RAPPORT[Rapport]

    %% Export PDF
    PROFORMA --> EXPORT1[Exporter en PDF]
    BDC --> EXPORT2[Exporter en PDF]
    BL --> EXPORT3[Exporter en PDF]
    FACTURE --> EXPORT4[Exporter en PDF]
    RAPPORT --> EXPORT5[Exporter en PDF]

    %% Contenu obligatoire du PDF
    EXPORT1 --> CONTENT[Inclure logo RAD, en-tete, pied de page, identite legale]
    EXPORT2 --> CONTENT
    EXPORT3 --> CONTENT
    EXPORT4 --> CONTENT
    EXPORT5 --> CONTENT

    %% Signature & cachet optionnels
    CONTENT --> OPT_SIGN[Signature et cachet optionnels]

12) Historique et archivages
flowchart TD
    START([Debut]) --> OPEN_DOC[Ouvrir un document]

    OPEN_DOC --> SEE_HIST[Voir l historique du document]
    SEE_HIST --> ACTIONS[Actions: creation, modification, validation]
    SEE_HIST --> PDF_VERS[Versions PDF archivees]
    SEE_HIST --> ATTACH[Pieces jointes conservees]

    ADMIN([Administrateur]) --> OPEN_LOG[Ouvrir le journal global]
    OPEN_LOG --> VIEW_LOG[Consulter toutes les actions du systeme]


13) Enchaînement logique
flowchart TD
    START([Debut]) --> PROFORMA[Proforma]

    PROFORMA --> BDC[BDC]
    BDC --> BL[BL]
    BL --> FACTURE[Facture]
    FACTURE --> PAIEMENT[Paiement]

    %% Documents liés
    PROFORMA --> LINK_BDC[Liste des BDC liés]
    BDC --> LINK_BL[Liste des BL liés]
    BL --> LINK_FACT[Liste des factures liées]
    FACTURE --> LINK_PAY[Liste des paiements]

    %% Quantités suivies
    BDC --> QTE_CMD[Quantites commandees]
    BL --> QTE_LIV[Quantites livre]
    FACTURE --> QTE_FACT[Quantites facturees]
    PAIEMENT --> QTE_PAY[Montants payes]
    BDC --> QTE_ANNUL[Quantites annulees]

14) Parametres
flowchart TD
    START([Debut]) --> OPEN[Ouvrir les paramètres du systeme]

    %% Numerotation automatique
    OPEN --> NUM_AUTO[Configurer la numerotation automatique]

    %% Modeles PDF par client
    OPEN --> PDF_MODELES[Definir les modeles PDF par client]

    %% TVA
    OPEN --> TVA_OPT[Activer ou desactiver la TVA]

    %% Signature et cachet
    OPEN --> SIGN_STAMP[Configurer signature et cachet]

    %% Categories de depenses
    OPEN --> CAT_DEP[Configurer categories de depenses]

    %% Delais de paiement
    OPEN --> DELAIS_PAY[Configurer delais de paiement]

15) NAV 
flowchart TD
    START([Debut]) --> SIDEBAR[Barre laterale principale]

    %% Sections principales
    SIDEBAR --> DASH[Tableau de bord]
    SIDEBAR --> VENTES[Ventes]
    SIDEBAR --> FINANCES[Finances]
    SIDEBAR --> CLIENTS[Clients]
    SIDEBAR --> PARAMETRES[Parametres]

    %% Sous-sections de Ventes
    VENTES --> PRO[Proformas]
    VENTES --> BDC[BDC]
    VENTES --> BL[BL]
    VENTES --> FACT[Factures]

    %% Sous-sections de Finances
    FINANCES --> REC[Recettes]
    FINANCES --> DEP[Depenses]
    FINANCES --> RAP[Rapports]

    %% Contenu de Clients
    CLIENTS --> DOCS_CLIENTS[Tous les documents regroupes]

 16) contrat
 flowchart TD
    START([Début]) --> OPEN[Section Contrats]

    START --> OPEN_CLIENT[Fiche client]
    OPEN_CLIENT --> TAB_CONTRATS[Onglet Contrats]
    TAB_CONTRATS --> OPEN

    OPEN --> CREATE[Créer]
    CREATE --> FORM_CREATE[Formulaire création]
    FORM_CREATE --> ADD_LINES[Ajouter lignes]
    ADD_LINES --> ATTACH_PDF[Ajouter PDF signé]
    ATTACH_PDF --> SAVE_CONTRACT[Sauvegarder]

    OPEN --> EDIT[Modifier]
    EDIT --> FORM_EDIT[Mettre à jour]
    FORM_EDIT --> SAVE_EDIT[Sauvegarder modif]

    SAVE_CONTRACT --> STATUS[Statut]
    SAVE_EDIT --> STATUS

    OPEN --> OPEN_CONTRACT[Fiche contrat]
    OPEN_CONTRACT --> VIEW_INFO[Infos générales]
    OPEN_CONTRACT --> VIEW_LINES[Lignes produits/services]
    OPEN_CONTRACT --> VIEW_LINKED[Docs liés]
    OPEN_CONTRACT --> VIEW_STATS[Stats financières]

    VIEW_LINES --> CONTROL_QTE[Suivi quantités]
   

17) Paiements

flowchart TD
    START([Début]) --> OPEN[Ouvrir section Paiements]

    OPEN --> SELECT_FACT[Sélectionner une facture]
    SELECT_FACT --> ADD_PAY[Ajouter un paiement]

    ADD_PAY --> INPUTS[Entrer montant du paiement]
    INPUTS --> UPDATE1[Mise à jour du montant payé]
    UPDATE1 --> UPDATE2[Mise à jour du restant dû]

    UPDATE2 --> FIN_REC[Le paiement entre dans les Recettes]

    UPDATE2 --> STATUS[Le statut devient: Payé ou Partiellement payé]


