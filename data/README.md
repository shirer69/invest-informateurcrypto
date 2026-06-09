# Liste des UID Kraken « active »

`active-ids.json` contient les identifiants des membres dont l'attribution Kraken
est **active** (vus dans « user-level attribution » du dashboard affilié).

- On ne stocke que les **4 derniers caractères de l'IIBAN / UID** (ex. `"A1B2"`).
- L'entrée `"DEMO"` est un exemple à retirer.
- Pour ajouter un membre : ajoutez ses 4 derniers caractères dans le tableau,
  commit + push → Vercel redéploie et l'accès devient automatique.
- Alternative sans toucher au code : variable d'environnement Vercel
  `KRAKEN_ACTIVE_IDS` (valeurs séparées par des virgules), fusionnée avec ce fichier.

Le lien Telegram d'invitation délivré aux membres « active » se règle via la
variable d'environnement `TELEGRAM_INVITE_URL` (sinon repli sur le Telegram public).
