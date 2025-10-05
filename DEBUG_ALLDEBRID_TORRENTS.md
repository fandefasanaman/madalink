# Guide de débogage - Upload de torrents AllDebrid

## Problème rencontré
Erreur "Réponse invalide de l'API Alldebrid" lors de l'ajout de torrents.

## Améliorations apportées

### 1. Logs détaillés
- Ajout de `JSON.stringify()` pour voir la structure complète de la réponse API
- Logs des erreurs avec détails complets (`response.data`, `status`)

### 2. Gestion flexible de la structure API
Le code gère maintenant plusieurs structures de réponse possibles :

```javascript
// Structure 1: response.data.data.magnets[0]
// Structure 2: response.data.data.files[0]
// Structure 3: response.data.data (direct)
```

### 3. Vérifications de sécurité
- Vérification de `response.data` avant accès
- Détection des erreurs API (`status === 'error'`)
- Messages d'erreur plus explicites

## Comment déboguer

### Étape 1: Ouvrir la console du navigateur
`F12` → Onglet Console

### Étape 2: Essayer d'ajouter un torrent
Vous verrez ces logs :
```
Adding torrent with magnet: magnet:?xt=...
Torrent upload response: { ... }
```

### Étape 3: Analyser la structure de réponse
Cherchez dans les logs la structure exacte retournée par l'API :

```json
{
  "status": "success",
  "data": {
    "magnets": [
      {
        "id": 123,
        "filename": "example.mkv",
        "status": "Ready",
        ...
      }
    ]
  }
}
```

### Étape 4: Vérifier l'endpoint API

#### Pour fichiers .torrent
L'application utilise : `POST /magnet/upload/file`

Vérifiez dans la documentation AllDebrid si cet endpoint existe ou s'il faut utiliser :
- `POST /magnet/upload/file` (upload de fichier)
- `GET /magnet/upload` (magnet link)

#### Pour magnet links
L'application utilise : `GET /magnet/upload?magnets=...`

## Erreurs courantes

### 1. Endpoint inexistant
**Symptôme**: 404 Not Found
**Solution**: Vérifier la documentation AllDebrid pour le bon endpoint

### 2. Format de fichier incorrect
**Symptôme**: "Invalid torrent file"
**Solution**: Vérifier que le fichier est bien un .torrent valide

### 3. Quota dépassé
**Symptôme**: "Quota exceeded"
**Solution**: Vérifier le quota avec `GET /user`

### 4. Clé API invalide
**Symptôme**: 401 Unauthorized
**Solution**: Régénérer la clé API dans les paramètres AllDebrid

## Tests recommandés

### Test 1: Magnet link simple
```
magnet:?xt=urn:btih:c12fe1c06bba254a9dc9f519b335aa7c1367a88a
```

### Test 2: Hash torrent
```
c12fe1c06bba254a9dc9f519b335aa7c1367a88a
```

### Test 3: Fichier .torrent
Télécharger un petit torrent légal (Ubuntu, par exemple) et l'uploader.

## API AllDebrid - Documentation

### Endpoint officiel pour torrents
Documentation : https://docs.alldebrid.com/

### Méthodes disponibles
1. **Upload magnet** : `GET /v4/magnet/upload?magnets[]=...&apikey=...`
2. **Upload file** : `POST /v4/magnet/upload/file` avec body multipart
3. **Status** : `GET /v4/magnet/status?id=...&apikey=...`

## Solution implémentée : Upload via FormData

✅ **Problème résolu** : L'API AllDebrid nécessite un upload multipart/form-data, pas du JSON avec base64.

### Erreur rencontrée
```json
{
  "status": "error",
  "error": {
    "code": "MAGNET_FILE_UPLOAD_FAILED",
    "message": "File upload failed"
  }
}
```

### Changements apportés

**Avant (ne fonctionnait pas)** :
```javascript
const response = await this.api.post('/magnet/upload/file',
  { files: [base64Content] },
  { headers: { 'Content-Type': 'application/json' } }
);
```

**Après (fonctionne)** :
```javascript
// Convertir base64 en Blob
const binaryString = atob(base64Content);
const bytes = new Uint8Array(binaryString.length);
for (let i = 0; i < binaryString.length; i++) {
  bytes[i] = binaryString.charCodeAt(i);
}
const blob = new Blob([bytes], { type: 'application/x-bittorrent' });

// Créer FormData
const formData = new FormData();
formData.append('files[]', blob, filename);

// Envoyer avec multipart/form-data
const response = await this.api.post('/magnet/upload/file',
  formData,
  {
    params: { apikey: apiKey },
    headers: { 'Content-Type': 'multipart/form-data' }
  }
);
```

## Prochaines étapes

1. ✅ Logs détaillés ajoutés
2. ✅ Gestion flexible de la structure API
3. ✅ Upload via FormData implémenté
4. ✅ Conversion base64 → Blob → FormData
5. 🧪 Tester avec un vrai fichier .torrent
