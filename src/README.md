@@ .. @@
 # MadaLink - Plateforme Premium de Téléchargement

 Plateforme de téléchargement premium adaptée à Madagascar avec intégration Alldebrid.

+## 🔥 Nouvelles fonctionnalités Firebase
+
+- **Authentification Firebase** : Système d'auth sécurisé
+- **Base de données Firestore** : Stockage en temps réel
+- **Historique persistant** : Sauvegarde de tous les téléchargements
+- **Statistiques avancées** : Analytics détaillées
+- **Synchronisation multi-appareils** : Accès depuis n'importe où
+
 ## 🚀 Fonctionnalités

 - **Déverrouillage de liens premium** via API Alldebrid
@@ -15,6 +25,25 @@ Plateforme de téléchargement premium adaptée à Madagascar avec intégration
 - **Interface multilingue** (Français/Malgache)
 - **Thème sombre/clair**

+## 📋 Configuration Firebase
+
+1. Créez un projet Firebase sur [console.firebase.google.com](https://console.firebase.google.com)
+
+2. Activez les services suivants :
+   - **Authentication** (Email/Password)
+   - **Firestore Database**
+   - **Storage** (optionnel)
+   - **Analytics** (optionnel)
+
+3. Copiez `.env.example` vers `.env` et remplissez vos clés Firebase
+
+4. Configurez les règles Firestore :
+```javascript
+// Règles de sécurité Firestore
+rules_version = '2';
+service cloud.firestore {
+  match /databases/{database}/documents {
+    // Les utilisateurs peuvent lire/écrire leurs propres données
+    match /users/{userId} {
+      allow read, write: if request.auth != null && request.auth.uid == userId;
+    }
+    
+    // Les téléchargements sont privés à chaque utilisateur
+    match /downloads/{downloadId} {
+      allow read, write: if request.auth != null && 
+        resource.data.userId == request.auth.uid;
+    }
+    
+    // Les torrents sont privés à chaque utilisateur
+    match /torrents/{torrentId} {
+      allow read, write: if request.auth != null && 
+        resource.data.userId == request.auth.uid;
+    }
+    
+    // Seuls les admins peuvent accéder aux stats globales
+    match /admin/{document=**} {
+      allow read, write: if request.auth != null && 
+        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
+    }
+  }
+}
+```
+
 ## 🛠️ Installation

 ```bash
@@ -30,6 +59,12 @@ npm run dev
 npm run build
 ```

+## 🔐 Sécurité
+
+- **Clés API chiffrées** : Stockage sécurisé dans Firebase
+- **Authentification robuste** : Firebase Auth avec validation
+- **Règles Firestore** : Accès contrôlé aux données
+- **HTTPS obligatoire** : Toutes les communications chiffrées
+
 ## 📱 Fonctionnalités Alldebrid

 - Support de 80+ hébergeurs de fichiers