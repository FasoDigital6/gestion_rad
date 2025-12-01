# Configuration des Emails Firebase pour la Création d'Utilisateurs

## 📧 Objectif
Permettre à Firebase d'envoyer automatiquement un email de bienvenue avec un lien de réinitialisation de mot de passe lorsqu'un administrateur crée un nouveau compte utilisateur.

---

## 🔧 Étape 1 : Configurer les Templates d'Email dans Firebase Console

### 1.1 Accéder à la Console Firebase

1. Rendez-vous sur : [Firebase Console](https://console.firebase.google.com/project/gestionrad-ebbac/authentication/emails)
2. Ou suivez ces étapes :
   - Allez sur [console.firebase.google.com](https://console.firebase.google.com)
   - Sélectionnez votre projet **"gestionrad-ebbac"**
   - Cliquez sur **"Authentication"** dans le menu de gauche
   - Cliquez sur l'onglet **"Templates"** (ou "Modèles" en français)

### 1.2 Personnaliser le Template "Réinitialisation du mot de passe"

1. **Cliquez sur le crayon** à côté de "Password reset" (Réinitialisation du mot de passe)

2. **Configurez les paramètres** :

   **Nom de l'expéditeur** (Sender name) :
   ```
   GESTPRO - RAD Guinée
   ```

   **Adresse email de l'expéditeur** (Sender email) :
   ```
   noreply@gestionrad-ebbac.firebaseapp.com
   ```
   (C'est l'email par défaut de Firebase, vous pouvez le personnaliser plus tard)

   **Sujet de l'email** (Subject) :
   ```
   Bienvenue sur GESTPRO - Définissez votre mot de passe
   ```

   **Corps de l'email** (Email body) :
   ```
   Bonjour %DISPLAY_NAME%,

   Bienvenue sur GESTPRO, l'application de gestion interne de RAD Guinée !

   Un compte a été créé pour vous par un administrateur. Pour activer votre compte et définir votre mot de passe, cliquez sur le lien ci-dessous :

   %LINK%

   Ce lien expirera dans 24 heures.

   Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

   Cordialement,
   L'équipe GESTPRO - RAD Guinée
   ```

3. **Cliquez sur "Enregistrer"** (Save)

---

## ⚙️ Étape 2 : Vérifier la Configuration du Code

Le code a déjà été configuré pour utiliser l'envoi automatique d'emails. Voici ce qui se passe :

### Fichier : `src/lib/actions/users/user_actions.ts`

```typescript
// Génère le lien et déclenche l'envoi automatique de l'email
const resetLink = await authAdmin.generatePasswordResetLink(email, {
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});
```

### Variables d'environnement : `.env`

```bash
# URL de l'application (déjà configurée)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important** : Quand vous déploierez en production, changez cette URL :
```bash
NEXT_PUBLIC_APP_URL=https://votredomaine.com
```

---

## 🧪 Étape 3 : Tester l'Envoi d'Email

### 3.1 Créer un utilisateur test

1. Lancez l'application : `npm run dev`
2. Connectez-vous avec votre compte admin
3. Allez sur la page **"Utilisateurs"** dans le menu
4. Cliquez sur **"Nouvel utilisateur"**
5. Remplissez le formulaire avec un email **que vous contrôlez**
6. Cliquez sur **"Créer l'utilisateur"**

### 3.2 Vérifier la réception

1. **Vérifiez votre boîte email** (l'email du nouvel utilisateur)
2. **Vérifiez le dossier SPAM** (Firebase peut être considéré comme spam au début)
3. Si l'email n'arrive pas, utilisez le **lien de secours** affiché dans l'interface admin

### 3.3 Tester la réinitialisation

1. Cliquez sur le lien dans l'email
2. Définissez un nouveau mot de passe
3. Connectez-vous avec les nouveaux identifiants

---

## 🚨 Résolution des Problèmes

### Problème 1 : L'email n'arrive pas

**Solutions** :
1. ✅ Vérifiez le dossier SPAM
2. ✅ Utilisez le lien de secours affiché dans l'interface admin
3. ✅ Vérifiez que l'email est valide dans Firebase Console > Authentication > Users

### Problème 2 : L'email arrive en spam

**Solutions** :
- **Court terme** : Demandez aux utilisateurs de vérifier leurs spams
- **Long terme** : Configurez un domaine email personnalisé (voir Étape 4 ci-dessous)

### Problème 3 : Le lien expire

**Solutions** :
- Les liens de réinitialisation Firebase expirent après **1 heure** par défaut
- Vous pouvez générer un nouveau lien en supprimant et recréant l'utilisateur
- Ou envoyez le lien de secours affiché dans l'interface

---

## 🎨 Étape 4 (Optionnel) : Personnaliser le Domaine Email

Pour éviter que les emails arrivent en spam et avoir un email professionnel :

### Option A : Utiliser un domaine personnalisé avec Firebase Hosting

1. Configurez Firebase Hosting avec votre domaine
2. Allez dans **Authentication > Templates > SMTP Settings**
3. Configurez votre serveur SMTP (Gmail, SendGrid, etc.)

### Option B : Utiliser Firebase Extensions

1. Installez l'extension **"Trigger Email from Firestore"**
2. Configurez avec votre service SMTP (SendGrid gratuit jusqu'à 100 emails/jour)

**Documentation** : [Firebase Email Extension](https://extensions.dev/extensions/firebase/firestore-send-email)

---

## 📝 Notes Importantes

### Limitations Firebase (Plan gratuit Spark)

- ✅ **Envoi d'emails de réinitialisation** : Illimité et gratuit
- ✅ **Templates personnalisables** : Oui
- ❌ **Emails transactionnels personnalisés** : Nécessite une extension ou service tiers

### Quand passer à un service d'emailing tiers ?

Considérez **SendGrid**, **Resend** ou **Mailgun** si vous avez besoin de :
- Emails avec design HTML complexe
- Suivi des ouvertures et clics
- Notifications automatiques (nouvelles factures, etc.)
- Meilleure délivrabilité (moins de spam)

---

## ✅ Checklist de Configuration

- [ ] Template "Réinitialisation du mot de passe" personnalisé dans Firebase Console
- [ ] Variable `NEXT_PUBLIC_APP_URL` configurée dans `.env`
- [ ] Test de création d'utilisateur effectué
- [ ] Email de bienvenue reçu et testé
- [ ] Réinitialisation de mot de passe fonctionnelle

---

## 🆘 Besoin d'Aide ?

Si vous rencontrez des problèmes :

1. Vérifiez les logs de la console Firebase : [Console Firebase > Authentication > Users](https://console.firebase.google.com/project/gestionrad-ebbac/authentication/users)
2. Consultez la documentation Firebase : [Firebase Auth Email Templates](https://firebase.google.com/docs/auth/custom-email-handler)
3. Testez avec plusieurs adresses email (Gmail, Outlook, etc.)

---

**Prochaine étape** : Une fois que les emails fonctionnent, nous pourrons implémenter la gestion des rôles et des permissions ! 🎉
