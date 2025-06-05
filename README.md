# Les quiz à papa

Ce dépôt contient une petite application web de quiz écrite en **HTML/JavaScript** et **PHP**. Les questionnaires sont stockés sous forme de fichiers JSON dans le dossier `data/` et l'historique des tentatives est envoyé vers une feuille Google Sheets.

## Fonctionnement technique

- **Front‑end** : la page `index.html` charge `css/style.css` et `js/app.js`. Le script JavaScript récupère la liste des quiz à partir de `data/index.json`, affiche les questions et calcule le score de l'utilisateur.
- **Données** : chaque quiz est défini dans un fichier JSON (exemple : `quizz_1746882674.json`). Un workflow GitHub (`.github/workflows/update_index.yml`) met automatiquement à jour `data/index.json` en listant tous les fichiers présents dans `data/`.
- **API PHP** :
  - `api/save_history.php` reçoit les résultats d'un quiz et les transmet à un script Google Apps Script pour les enregistrer dans Google Sheets.
  - `api/clear_history.php` est un point d'entrée factice : l'historique n'est pas réellement supprimé puisque les données sont stockées sur Google Sheets.
- **Déploiement** : un `Dockerfile` fournit une image PHP/Apache. Le fichier `render.yaml` décrit le service pour un déploiement sur [Render](https://render.com). Le workflow `.github/workflows/deploy_render.yaml` déclenche la mise en ligne après chaque push sur `main`.

## Utilisation locale

1. **Prérequis** : PHP 8 ou Docker.
2. **Cloner** le dépôt puis lancer un serveur PHP :
   ```bash
   php -S localhost:8000
   ```
   Ou avec Docker :
   ```bash
   docker build -t quizapp .
   docker run -p 8080:80 quizapp
   ```
3. Accéder ensuite à `http://localhost:8000` (ou `http://localhost:8080` avec Docker) pour commencer à jouer.
4. Les résultats seront envoyés vers la feuille Google Sheets configurée dans `api/save_history.php`.

## Ajouter un nouveau quiz

1. Créer un fichier JSON dans `data/` suivant ce modèle :
   ```json
   {
     "titre": "Titre du quiz",
     "questions": [
       {
         "question": "Texte de la question",
         "options": ["Réponse A", "Réponse B", "Réponse C"],
         "correct": 0,
         "explanation": "Pourquoi la réponse est juste"
       }
     ]
   }
   ```
2. Commiter le fichier et pousser sur `main`. Le workflow GitHub mettra à jour `data/index.json` automatiquement.

## Historique et personnalisation

- Si vous souhaitez stocker l'historique ailleurs que dans la feuille Google Sheets actuelle, modifiez l'URL définie dans `api/save_history.php` (`$googleScriptUrl`).
- Le style général se trouve dans `css/style.css` et peut être personnalisé.

Bon quiz !
