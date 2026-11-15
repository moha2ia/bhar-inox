# BHAR INOX — Site web & plateforme de devis

Site vitrine premium pour **STE BHAR INO MAR — SARL (BHAR INOX)**, menuiserie inox sur mesure : présentation des métiers, portfolio filtrable, demande de devis multi-étapes et espace d'administration sécurisé.

Conforme au **Cahier des Prescriptions Spéciales** (septembre 2026) et à la charte graphique BHAR INOX (logo officiel, bleu royal `#1716A5`, gris métallique `#5C6C6A`, blanc, neutre `#F5F6F7`, charbon `#17191B`).

---

## 1. Démarrage rapide (édition finale)

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000

- **Stockage persistant local** : contenus et demandes de devis enregistrés dans `.data/data.json` (hors dépôt git) — rien n'est perdu au redémarrage.
- **Administration** : http://localhost:3000/admin — identifiants définis dans `.env.local` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`). Changez-les avant toute mise en ligne.
- Sans configuration supplémentaire, l'application est complète et fonctionnelle ; Firebase est optionnel (voir §2).

> **Photographies** : les 20 visuels de réalisations fournis par BHAR INOX sont intégrés dans `public/photos/` (portfolio, services, hero, page À propos). Toute nouvelle photo peut être ajoutée au même endroit puis associée au projet correspondant depuis l'administration (`/admin/projets`).

## 2. Passage en production (Firebase)

1. **Créer un projet Firebase** : https://console.firebase.google.com → Ajouter un projet.
2. **Créer une base Firestore** : Firestore Database → Créer une base (mode production).
3. **Générer la clé de compte de service** : Paramètres du projet → Comptes de service → Générer une nouvelle clé privée (JSON).
4. **Renseigner `.env.local`** (voir `.env.example`) :

```
FIREBASE_PROJECT_ID=<id-du-projet>
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@<projet>.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
AUTH_SECRET=<openssl rand -base64 32>
ADMIN_EMAIL=admin@votredomaine.com
ADMIN_PASSWORD=<mot de passe fort>
NEXT_PUBLIC_SITE_URL=https://www.bhar-inox.ma
```

5. **Déployer les règles de sécurité** : `firebase/firestore.rules` (lecture publique des contenus publiés, tout le reste serveur uniquement) via la console Firebase → Firestore → Règles, ou `firebase deploy --only firestore:rules`.
6. Redémarrer (`npm run build && npm start`). La couche de données bascule automatiquement de `.data/data.json` vers Firestore. Les collections (`projects`, `services`, `site_settings`, `quote_requests`, `quote_files`, `counters`) sont créées à la première écriture ; les paramètres du site sont amorcés automatiquement.

### Sécurité appliquée

- Règles Firestore strictes (`firebase/firestore.rules`) : lecture publique des contenus **publiés uniquement** ; aucune écriture client — toutes les écritures passent par le SDK Admin côté serveur.
- Devis : créés et lus **exclusivement côté serveur** (`/api/quote`, `/admin/*`) ; jamais exposés au client.
- Clé de compte de service Firebase utilisée **exclusivement côté serveur** (`src/lib/data.ts`, import `server-only`).
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
| Projets | `/admin/projets` | Créer, modifier, publier/dépublier, ordonner, supprimer (avec confirmation) |
| Services | `/admin/services` | Créer, modifier, ordonner, publier, supprimer |
| Contenu & SEO | `/admin/parametres` | Hero, À propos, coordonnées, horaires, métadonnées SEO |

## 5. Structure du projet

```
src/
  app/
    (site)/            Pages publiques (accueil, services, réalisations, à-propos, devis, contact, légal)
    admin/             Tableau de bord protégé
    api/               Routes serveur (quote, contact, admin/*)
    sitemap.ts robots.ts
  components/          UI (Hero, Reveal, ProjectCard, header, footer)
  lib/                 data.ts (stockage local persistant ou Firebase/Firestore), schémas Zod, sessions, charte
firebase/             Règles de sécurité Firestore
public/brand/          Logo officiel (extrait du PDF fourni, non modifié)
public/photos/         Photographies authentiques des réalisations (20 visuels)
```

## 6. Stack

Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · Framer Motion · Firebase (Firestore) · Zod.

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
