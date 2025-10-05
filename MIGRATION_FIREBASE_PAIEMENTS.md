# Système de paiements avec Firebase

## Vue d'ensemble

Le système de paiements utilise maintenant Firebase Firestore pour stocker et gérer tous les paiements d'upgrade. Les nouveaux paiements apparaissent en temps réel dans le panneau d'administration.

## Structure Firestore

### Collection `payments`

Chaque document contient :
- `userId` : ID de l'utilisateur (référence Firebase Auth)
- `userEmail` : Email de l'utilisateur
- `userName` : Nom de l'utilisateur
- `plan` : Plan acheté (bronze, silver, gold)
- `amount` : Montant en MGA
- `paymentMethod` : Méthode de paiement (mvola, orange, airtel)
- `reference` : Référence unique de la transaction (MDL + timestamp)
- `receiptUrl` : URL du reçu (optionnel)
- `status` : Statut du paiement (pending, validated, rejected)
- `validatedBy` : ID de l'admin qui a validé (optionnel)
- `validatedAt` : Date de validation (optionnel)
- `rejectionReason` : Raison du rejet (optionnel)
- `createdAt` : Date de création (timestamp)
- `updatedAt` : Date de mise à jour (timestamp)

### Collection `users`

La collection existante des utilisateurs est mise à jour avec :
- `plan` : Plan actuel de l'utilisateur
- `planStatus` : Statut du plan (active, pending, expired)
- `planExpiry` : Date d'expiration du plan (timestamp)

## Flux de paiement

### 1. Création d'un paiement (PaymentPage)

```typescript
await FirebasePaymentService.createPayment({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  plan: 'silver',
  amount: 3000,
  paymentMethod: 'mvola',
  reference: 'MDL123456'
});
```

Le paiement est créé avec le statut `pending`.

### 2. Validation par l'admin (AdminPage)

L'admin voit tous les paiements en attente dans l'onglet "Validation paiements" :

- **Bouton "Rafraîchir"** : Recharge la liste des paiements
- **Bouton ✓ (Valider)** :
  - Change le statut à `validated`
  - Met à jour le plan de l'utilisateur
  - Active le plan pour 30 jours

- **Bouton ✕ (Rejeter)** :
  - Change le statut à `rejected`
  - Enregistre la raison du rejet

### 3. Mise à jour du plan utilisateur

Lors de la validation, le service met automatiquement à jour :

```typescript
await FirebasePaymentService.updateUserPlan(userId, plan);
```

Cela active le plan pour 30 jours à partir de la date de validation.

## Services créés

### `firebasePaymentService.ts`

Service complet pour gérer les paiements :

- `createPayment()` : Créer un nouveau paiement
- `getPendingPayments()` : Récupérer tous les paiements en attente
- `getAllPayments()` : Récupérer tous les paiements
- `getUserPayments()` : Récupérer les paiements d'un utilisateur
- `validatePayment()` : Valider ou rejeter un paiement
- `updateUserPlan()` : Mettre à jour le plan d'un utilisateur
- `formatPaymentMethod()` : Formater l'affichage de la méthode
- `formatDate()` : Formater l'affichage de la date

## Comment tester

### 1. Créer un paiement test

1. Connectez-vous avec un compte utilisateur
2. Allez sur `/payment`
3. Sélectionnez un plan (Bronze, Silver, Gold)
4. Suivez le processus jusqu'à l'étape 3
5. Téléchargez un fichier de reçu (simulé)
6. Cliquez sur "Envoyer et finaliser"

Le paiement est maintenant enregistré dans Firestore avec le statut "pending".

### 2. Valider le paiement

1. Connectez-vous avec un compte admin (isAdmin: true dans Firestore)
2. Allez sur `/admin`
3. Cliquez sur l'onglet "Validation paiements"
4. Cliquez sur "Rafraîchir" pour voir les nouveaux paiements
5. Vous verrez le paiement avec toutes les informations :
   - Utilisateur (nom + email)
   - Plan
   - Montant
   - Méthode de paiement
   - Référence
   - Date de création
6. Cliquez sur ✓ pour valider ou ✕ pour rejeter

### 3. Vérification

Après validation :
- Le statut du paiement passe à "validated"
- Le plan de l'utilisateur est mis à jour
- Le planStatus devient "active"
- Le planExpiry est fixé à aujourd'hui + 30 jours

## Règles de sécurité Firestore recommandées

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les paiements
    match /payments/{paymentId} {
      // Les utilisateurs peuvent créer leurs propres paiements
      allow create: if request.auth != null &&
                    request.resource.data.userId == request.auth.uid;

      // Les utilisateurs peuvent lire leurs propres paiements
      allow read: if request.auth != null &&
                  (resource.data.userId == request.auth.uid ||
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);

      // Seuls les admins peuvent mettre à jour les paiements
      allow update: if request.auth != null &&
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Règles pour les utilisateurs
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                   (request.auth.uid == userId ||
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
    }
  }
}
```

## Index Firestore nécessaires

Pour optimiser les requêtes, créez ces index composites :

1. Collection: `payments`
   - Champs: `status` (Ascending), `createdAt` (Descending)

2. Collection: `payments`
   - Champs: `userId` (Ascending), `createdAt` (Descending)

Ces index seront créés automatiquement lorsque vous exécuterez les requêtes pour la première fois. Firebase vous fournira un lien pour les créer.

## Prochaines étapes possibles

1. **Notifications en temps réel** : Utiliser Firestore onSnapshot pour mettre à jour automatiquement la liste
2. **Upload de reçus** : Utiliser Firebase Storage pour stocker les captures d'écran
3. **Historique complet** : Ajouter un onglet pour voir tous les paiements (validés, rejetés)
4. **Statistiques** : Dashboard avec graphiques des revenus
5. **Emails automatiques** : Envoyer un email de confirmation après validation
6. **Webhooks** : Intégration avec les API de paiement mobile

## Notes importantes

- Les timestamps utilisent `serverTimestamp()` pour assurer la cohérence
- La référence de transaction est générée côté client mais devrait être unique
- Les plans ont une durée fixe de 30 jours (modifiable dans `updateUserPlan`)
- Aucune dépendance à Supabase - système 100% Firebase
