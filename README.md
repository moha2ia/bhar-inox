# BHAR INOX — Site web & plateforme de devis

Site vitrine premium pour **STE BHAR INO MAR — SARL (BHAR INOX)**, menuiserie inox sur mesure : présentation des métiers, portfolio filtrable, demande de devis multi-étapes et espace d'administration sécurisé.

Conforme au **Cahier des Prescriptions Spéciales** (septembre 2026) et à la charte graphique BHAR INOX (logo officiel, bleu royal `#1716A5`, gris métallique `#5C6C6A`, blanc, neutre `#F5F6F7`, charbon `#17191B`).

---

## 1. Démarrage rapide (local : PostgreSQL + Next.js)

Prérequis : **Node.js 20+** et **PostgreSQL 14+** (installé localement, via Docker, ou une base Neon gratuite).

1. Installer PostgreSQL (Windows) :

```powershell
winget install --id PostgreSQL.PostgreSQL.17 -e
```

2. Copier `.env.example` vers `.env.local` et renseigner au minimum :

```
DATABASE_URL=postgresql://postgres:<mot-de-passe>@127.0.0.1:5432/bhar_inox
ADMIN_EMAIL=<email admin>
ADMIN_PASSWORD=<mot de passe admin>
AUTH_SECRET=<openssl rand -base64 32>
```

3. Installer les dépendances, initialiser la base et lancer le site :

```bash
npm install
npm run db:setup   # crée le schéma (db/schema.sql) et importe db/seed-data.json
npm run dev
```

4. Ouvrir http://localhost:3000

- **Base de données** : PostgreSQL (projets, services, paramètres, devis, messages). Les données survivent aux redémarrages.
- **Photographies** : les 20 visuels d'origine sont dans `public/photos/`. Depuis l'administration (`/admin/projets`, `/admin/services`), vous pouvez **téléverser des images depuis votre appareil**, les retirer, choisir la couverture, ou encore référencer un chemin existant. Sans `BLOB_READ_WRITE_TOKEN`, les fichiers sont écrits dans `public/uploads/` ; avec le jeton Vercel Blob, ils sont envoyés dans le stockage objet (URL absolue en base).
- **Administration** : http://localhost:3000/admin — identifiants définis dans `.env.local` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`). Changez-les avant toute mise en ligne.
- **Réinitialiser la base** : supprimer puis recréer la base `bhar_inox`, puis relancer `npm run db:setup`.

## 2. Déploiement sur Vercel

1. Pousser le dépôt sur GitHub puis importer le projet dans Vercel (framework **Next.js**, branche `main`).
2. **Base de données** : dans Vercel → **Storage** → **Postgres** (Neon), créer une base et la connecter au projet. `DATABASE_URL` est ajoutée automatiquement aux environnements. À défaut, créer une base chez [Neon](https://neon.tech) et copier son URL **pooled**.
3. **Images** : dans Vercel → **Storage** → **Blob**, créer un store et le connecter au projet. `BLOB_READ_WRITE_TOKEN` est ajoutée automatiquement.
4. **Variables d'environnement** (Production) :

```
ADMIN_EMAIL=admin@votredomaine.com
ADMIN_PASSWORD=<mot de passe fort>
AUTH_SECRET=<openssl rand -base64 32>
NEXT_PUBLIC_SITE_URL=https://www.bhar-inox.ma
```

5. **Initialiser la base distante** : récupérer l'URL Neon (`DATABASE_URL`) et l'exécuter **une seule fois** depuis votre machine :

```powershell
$env:DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"
npm run db:setup
```

6. **Redéployer** après l'ajout des variables (Vercel → Deployments → Redeploy). L'administration est ensuite accessible sur `https://votre-domaine/admin`.

Notes :

- Le build Vercel n'exécute aucune requête base : les pages sont rendues à la demande (`force-dynamic`).
- Les images téléversées vont dans Vercel Blob ; aucun disque persistant n'est nécessaire.
- Le dossier `server/` (ancienne API PHP/MySQL) n'est plus utilisé par l'application et peut servir de référence.

### Sécurité appliquée

- Téléversements : réservés à l'admin connecté, formats **JPG/PNG/WebP/AVIF uniquement**, 4 Mo max (limite des fonctions Vercel), contrôle de la **signature binaire**, nom de fichier aléatoire (aucun chemin fourni par le client).
- Devis et messages : créés et lus **exclusivement côté serveur** ; jamais exposés au navigateur.
- Requêtes SQL **paramétrées** (`pg` / PostgreSQL) contre l'injection SQL ; identifiants de connexion uniquement dans les variables d'environnement Vercel.
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
  components/          UI (Hero, Reveal, ProjectCard, header, footer, ImageUploader)
  lib/                 db.ts (PostgreSQL), data.ts (requêtes SQL), schémas Zod, sessions, charte
db/
  schema.sql           Schéma PostgreSQL
  seed-data.json       Contenus de démonstration (projets, services, paramètres)
scripts/
  db-setup.mjs         Création du schéma + import idempotent (npm run db:setup)
server/                Ancienne API PHP/MySQL (non utilisée, conservée pour référence)
public/brand/          Logo officiel (extrait du PDF fourni, non modifié)
public/photos/         Photographies authentiques des réalisations (20 visuels)
public/uploads/        Images locales (sans jeton Vercel Blob), non versionnées
```

## 6. Stack

Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · Framer Motion · PostgreSQL (Neon sur Vercel) · Vercel Blob · Zod.

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
