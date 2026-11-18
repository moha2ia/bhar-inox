# BHAR INOX — Site web & plateforme de devis

Site vitrine premium pour **STE BHAR INO MAR — SARL (BHAR INOX)**, menuiserie inox sur mesure : présentation des métiers, portfolio filtrable, demande de devis multi-étapes et espace d'administration sécurisé.

Conforme au **Cahier des Prescriptions Spéciales** (septembre 2026) et à la charte graphique BHAR INOX (logo officiel, bleu royal `#1716A5`, gris métallique `#5C6C6A`, blanc, neutre `#F5F6F7`, charbon `#17191B`).

---

## 1. Démarrage rapide (local : XAMPP + PHP + MySQL)

Prérequis : **XAMPP** (Apache, PHP 8.2, MySQL/MariaDB) et **Node.js 20+**.

1. Ouvrir le **panneau XAMPP** et démarrer **Apache** et **MySQL**.
2. Installer les dépendances et initialiser la base :

```bash
npm install
C:\xampp\php\php.exe server/install.php   # crée la base bhar_inox, les tables et la clé API
C:\xampp\php\php.exe server/seed.php      # importe projets, services et paramètres du site
npm run dev
```

3. Ouvrir http://localhost:3000

- **Base de données** : MySQL/MariaDB, base `bhar_inox` (projets, services, paramètres, devis, messages). Les données survivent aux redémarrages.
- **API PHP** : le dossier `server/public` est exposé par Apache sur http://localhost/bhar-api. Un raccourci Windows (`C:\xampp\htdocs\bhar-api` → `server\public`) est nécessaire une seule fois.

```powershell
New-Item -ItemType Junction -Path C:\xampp\htdocs\bhar-api -Target <chemin-du-projet>\server\public
```

- **Photographies** : les 20 visuels d'origine sont dans `public/photos/`. Depuis l'administration (`/admin/projets`, `/admin/services`), vous pouvez **téléverser des images depuis votre appareil**, les retirer, choisir la couverture, ou encore référencer un chemin existant. Les fichiers envoyés sont enregistrés dans `public/uploads/` et leur chemin est stocké en base (`/uploads/...`).
- **Administration** : http://localhost:3000/admin — identifiants définis dans `.env.local` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`). Changez-les avant toute mise en ligne.
- **Clé API** : `PHP_API_KEY` dans `.env.local` doit être identique à celle de `server/config.local.php` (générée par `install.php`). Les identifiants MySQL se trouvent dans ce même fichier, non versionné.

## 2. Passage en production (PHP/MySQL)

1. **API PHP** : héberger le contenu de `server/public` sur un hébergement PHP 8.1+ (pdo_mysql activé) avec MySQL 5.7+/MariaDB 10.4+. Le fichier `.htaccess` fourni route toutes les requêtes vers `index.php`.
2. **Configuration serveur** : copier `server/config.example.php` vers `server/config.local.php` (hors dépôt) et renseigner `db_host`, `db_port`, `db_name`, `db_user`, `db_pass` et `api_key`. Les variables d'environnement `BHAR_DB_*` / `BHAR_API_KEY` sont également prises en charge.
3. **Base** : exécuter `php server/install.php` puis `php server/seed.php` sur le serveur (ou importer `server/schema.sql` via phpMyAdmin et `server/seed-data.json` manuellement).
4. **Site Next.js** : déployer sur un hébergement Node.js 20+ puis renseigner `.env.local` / les variables de production :

```
PHP_API_URL=https://api.votredomaine.com
PHP_API_KEY=<clé générée, identique au serveur PHP>
AUTH_SECRET=<openssl rand -base64 32>
ADMIN_EMAIL=admin@votredomaine.com
ADMIN_PASSWORD=<mot de passe fort>
NEXT_PUBLIC_SITE_URL=https://www.bhar-inox.ma
```

5. Redémarrer (`npm run build && npm start`). Le site Next.js interroge l'API PHP en **serveur à serveur** (jamais depuis le navigateur).
6. **Images téléversées** : elles sont écrites dans `public/uploads/` sur le serveur Node. Ce dossier doit être **persistant et accessible en écriture** (volume disque). Sur un hébergement sans disque persistant (Vercel/serverless), remplacez le stockage local par un stockage objet (S3, R2, Cloudflare Images…) ou faites pointer les uploads vers un dossier servi par PHP.

### Sécurité appliquée

- API PHP protégée par une **clé secrète** (`X-Api-Key`) ; `config.local.php` est stocké hors docroot et ignoré par git.
- Téléversements : réservés à l'admin connecté, formats **JPG/PNG/WebP/AVIF uniquement**, 10 Mo max, contrôle de la **signature binaire**, nom de fichier aléatoire (aucun chemin fourni par le client).
- Devis et messages : créés et lus **exclusivement côté serveur** (Next.js → API PHP) ; jamais exposés au navigateur.
- Requêtes SQL **préparées** (PDO) contre l'injection SQL ; sortie JSON échappée.
- Sessions admin : cookie `httpOnly` signé HMAC-SHA256, expiration 8 h.
- Formulaires : validation client **et** serveur (schéma Zod partagé), honeypot anti-spam, limitation de débit (5 req/min/IP), restrictions de type/taille des fichiers (JPG/PNG/WebP/PDF, 10 Mo, 5 fichiers max).
- Aucune donnée personnelle dans les logs.

## 3. Notifications email

Le module `src/lib/notify.ts` envoie une confirmation au client et une notification interne à chaque demande de devis :

- **Sans configuration** : aucun envoi, simple journalisation console — l'application reste pleinement fonctionnelle.
- **Avec Resend** : définir `RESEND_API_KEY`, `NOTIFY_EMAIL` (destinataire interne) et éventuellement `NOTIFY_FROM_EMAIL`. Domaine d'expédition à valider dans Resend.
- L'envoi s'exécute **après** l'enregistrement serveur effectif, jamais avant (critère n°5 du CPS).

## 4. Administration — procédures

| Module | URL | Actions |
|---|---|---|
| Vue d'ensemble | `/admin` | Statistiques, demandes récentes |
| Devis | `/admin/devis` | Recherche, filtre par statut, tri par date, détail, changement de statut (Nouveau → En cours → Devis envoyé → Accepté / Refusé → Archivé) |
| Projets | `/admin/projets` | Créer, modifier, publier/dépublier, ordonner, supprimer (avec confirmation), téléverser/retirer des images, choisir la couverture |
| Services | `/admin/services` | Créer, modifier, ordonner, publier, supprimer, téléverser/remplacer l'image |
| Contenu & SEO | `/admin/parametres` | Hero, À propos, coordonnées, horaires, métadonnées SEO |

## 5. Structure du projet

```
src/
  app/
    (site)/            Pages publiques (accueil, services, réalisations, à-propos, devis, contact, légal)
    admin/             Tableau de bord protégé
    api/               Routes serveur Next.js (quote, contact, admin/*)
    sitemap.ts robots.ts
  components/          UI (Hero, Reveal, ProjectCard, header, footer)
  lib/                 data.ts (client de l'API PHP), schémas Zod, sessions, charte
server/
  public/              Docroot de l'API PHP (index.php, .htaccess)
  lib/repository.php   Accès MySQL (PDO), requêtes préparées
  schema.sql           Schéma de la base bhar_inox
  seed-data.json       Contenus de démonstration (projets, services, paramètres)
  install.php          Création de la base + clé API
  seed.php             Import idempotent des contenus
public/brand/          Logo officiel (extrait du PDF fourni, non modifié)
public/photos/         Photographies authentiques des réalisations (20 visuels)
public/uploads/        Images téléversées depuis l'administration (non versionnées)
```

## 6. Stack

Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · Framer Motion · PHP 8.2 (API REST maison) · MySQL/MariaDB · Zod.

## 7. Vérifications avant mise en ligne (extraits du CPS §16)

- [x] Logo officiel affiché sans déformation ; palette conforme.
- [x] Photographies authentiques des réalisations intégrées (portfolio, services, hero, À propos).
- [x] Pages publiques responsives (mobile / tablette / desktop).
- [x] Aucun faux chiffre ni témoignage ; placeholders « à confirmer par BHAR INOX ».
- [x] Identité légale intégrée depuis les documents officiels fournis (registre de commerce 54737/Meknès, ICE, IF) : mentions légales complétées ; dossier `STE INFO/` privé et ignoré par git — jamais publié ni versionné.
- [x] Formulaire guidé, réponses conservées entre étapes, erreurs de validation signalées.
- [x] Demande enregistrée côté serveur avec référence unique ; aucun faux succès (les erreurs sont affichées).
- [x] Accès admin protégé (page + routes API) ; documents devis en stockage privé.
- [x] États chargement / vide / erreur / succès traités ; confirmations sur actions destructives.
- [ ] Coordonnées réelles (téléphone, email, horaires) et textes restants validés par BHAR INOX **avant publication**.
- [ ] Service email configuré et testé.
- [ ] Domaine, hébergement et mentions légales définitifs validés.
