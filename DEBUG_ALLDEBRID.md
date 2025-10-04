# Guide de débogage Alldebrid

## Problème : Le bouton "Générer lien premium" tourne sans se lancer

### Modifications apportées

1. **Correction de l'API Alldebrid** :
   - Suppression du header `User-Agent` bloqué par le navigateur
   - Modification de l'authentification : utilisation de `?apikey=` dans les paramètres d'URL au lieu de `Authorization: Bearer`
   - Changement de POST à GET pour `/link/unlock`

2. **Ajout de logs de débogage** :
   - Dans `LinkUnlocker.tsx` : logs au début du processus
   - Dans `useAlldebrid.ts` : logs détaillés de chaque étape
   - Dans `alldebridApi.ts` : logs des erreurs API

### Comment tester

1. **Ouvrez la console du navigateur** (F12)

2. **Configurez votre clé API** :
   - Allez dans l'onglet "Config" du dashboard
   - Entrez votre clé API Alldebrid
   - Sauvegardez

3. **Testez un lien** :
   - Collez votre URL RapidGator
   - Cliquez sur "Générer lien premium"
   - Observez les logs dans la console

### Logs attendus

```
Starting unlock process for: https://rapidgator.net/file/...
API Key available: true
useAlldebrid.unlockLink called with: https://rapidgator.net/file/...
Service available: true
User available: true
Calling alldebridService.unlockLink...
Attempting to unlock: https://rapidgator.net/file/...
Unlock response: { data: { ... } }
Service returned: { success: true, data: { ... } }
Link unlocked successfully: { link: "...", filename: "...", ... }
```

### Si vous voyez ces erreurs

#### "Service Alldebrid non initialisé"
- La clé API n'est pas configurée
- Solution : Allez dans l'onglet "Config" et entrez votre clé API

#### "Utilisateur non connecté"
- Vous n'êtes pas authentifié
- Solution : Connectez-vous ou créez un compte

#### "Alldebrid API Error" dans la console
- La clé API est invalide
- Le service Alldebrid est hors ligne
- L'URL n'est pas supportée
- Solution : Vérifiez votre clé API sur alldebrid.com

#### Le bouton tourne indéfiniment
- Regardez la console pour voir où ça bloque
- Vérifiez l'onglet Network pour voir si la requête est envoyée
- Vérifiez que vous avez bien une connexion internet

### Structure de l'API Alldebrid

L'API attend :
```
GET https://api.alldebrid.com/v4/link/unlock?apikey=VOTRE_CLE&link=URL_A_DEBLOQUER&agent=MadaLink
```

Réponse attendue :
```json
{
  "status": "success",
  "data": {
    "link": "https://...",
    "host": "rapidgator.net",
    "filename": "...",
    "filesize": 123456789
  }
}
```

### Prochaines étapes

Si le problème persiste après ces corrections :
1. Copiez tous les logs de la console
2. Vérifiez l'onglet Network pour voir la requête exacte envoyée
3. Vérifiez que votre clé API fonctionne sur le site d'Alldebrid
