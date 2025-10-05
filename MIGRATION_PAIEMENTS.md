# Migration du système de paiements vers Supabase

## Changements effectués

### 1. Base de données Supabase

Deux tables ont été créées dans Supabase :

#### Table `users`
- Stocke les informations des utilisateurs
- Synchronisée automatiquement avec Firebase Auth
- Contient le plan actif et le statut admin

#### Table `payments`
- Stocke tous les paiements (pending, validated, rejected)
- Référence les utilisateurs par `user_id`
- Permet le suivi complet des transactions

### 2. Services créés

- **`supabaseClient.ts`** : Client Supabase avec types TypeScript
- **`paymentService.ts`** : Gestion complète des paiements
- **`userSyncService.ts`** : Synchronisation Firebase → Supabase

### 3. Pages modifiées

#### PaymentPage (`/payment`)
- Enregistre maintenant les paiements dans Supabase
- Les paiements ont le statut "pending" par défaut
- Nécessite un utilisateur connecté

#### AdminPage (`/admin` - onglet "Validation paiements")
- Affiche les paiements en temps réel depuis Supabase
- Bouton "Rafraîchir" pour recharger la liste
- Actions de validation/rejet fonctionnelles
- Mise à jour automatique du plan utilisateur après validation

### 4. Synchronisation automatique

L'AuthContext synchronise automatiquement les utilisateurs Firebase vers Supabase :
- À la connexion
- À l'inscription
- Au changement d'état d'authentification

## Comment tester

### 1. Créer un compte admin
Un compte admin de test a été créé :
- Email: `admin@madalink.mg`
- Il faut créer ce compte dans Firebase avec ce même email

### 2. Tester un paiement
1. Connectez-vous avec un compte utilisateur normal
2. Allez sur `/payment`
3. Sélectionnez un plan et suivez le processus
4. Le paiement sera enregistré avec le statut "pending"

### 3. Valider un paiement
1. Connectez-vous avec le compte admin
2. Allez sur `/admin`
3. Cliquez sur l'onglet "Validation paiements"
4. Cliquez sur "Rafraîchir" pour voir les nouveaux paiements
5. Utilisez les boutons ✓ (valider) ou ✕ (rejeter)

## Points importants

- **Temps réel** : Les paiements n'apparaissent pas automatiquement, utilisez le bouton "Rafraîchir"
- **Statuts** : pending → validated/rejected
- **Sécurité** : RLS activé sur toutes les tables
- **Validation** : Valider un paiement active automatiquement le plan de l'utilisateur pour 30 jours

## Prochaines étapes possibles

1. Implémenter un système de notifications en temps réel (Supabase Realtime)
2. Ajouter l'upload de reçu avec Supabase Storage
3. Ajouter un historique des paiements validés/rejetés
4. Envoyer des emails de notification après validation
