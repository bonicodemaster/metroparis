# Métro Paris — apprentissage interactif

Application web d'apprentissage du métro parisien, inspirée de **Seterra**, **GeoGuessr** et **Anki**.

## ⚡ Démarrage

```bash
npm install
cp .env.example .env.local   # puis renseigner les clés Supabase
npm run dev
```

Ouvrir http://localhost:3000

## 🌐 Multijoueur (Supabase Realtime)

Le multijoueur fonctionne entre appareils via **broadcast WebSocket** Supabase
(pas de table, pas de schéma — l'état est échangé en RAM via des événements).

### Setup (≈ 2 min)

1. Crée un projet gratuit sur https://supabase.com (Free tier suffit largement).
2. **Project Settings → API** : copie `Project URL` et `anon public` key.
3. Crée `.env.local` à la racine :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
4. **Realtime → Settings** : vérifier que *Broadcast* est activé (par défaut OUI).
5. Redémarrer `npm run dev`.

Pas de SQL ni de RLS à configurer — on n'utilise que le canal `broadcast`,
qui ne touche pas à la base de données.

### Production (Vercel)

Renseigne les mêmes variables dans **Project Settings → Environment Variables**
de Vercel, puis redéploie. Les URL `/multiplayer/room/CODE` se partagent telles
quelles, depuis n'importe quel appareil.

### Fallback local

Sans clés Supabase, l'app retombe automatiquement sur `BroadcastChannel` —
mode local entre onglets d'un même navigateur (utile pour le dev).

## 🧱 Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **TailwindCSS** + **Framer Motion**
- **Zustand** (persistance localStorage)
- **Supabase Realtime** (multijoueur cross-device)
- **SVG interactif** custom — pan/zoom, projection lat/lon → SVG

## 📦 Architecture

```
app/                       Pages Next.js (App Router)
├── page.tsx               Accueil
├── learn/                 Apprentissage par ligne (carte + liste)
├── quiz/
│   ├── name-to-position/  Nom → clic carte
│   ├── position-to-name/  Surbrillance → saisie nom
│   └── survival/          Survie chronométrée
└── progress/              Stats + stations faibles

components/
├── MetroMap.tsx           Carte SVG interactive (pan, zoom, click)
├── LineBadge.tsx          Pastille colorée de ligne (couleurs RATP)
├── Header.tsx             Navigation
├── ModeCard.tsx           Carte "mode" sur la home
└── QuizHUD.tsx            HUD (score, série, temps, vies)

lib/
├── data/                  Lignes, stations, types
├── map-engine/            Projection géographique
├── quiz-engine/           Sélection de stations, scoring
├── spaced-repetition/     Variante SM-2
├── store/                 Zustand store persisté
└── utils/                 normalize, matchAnswer, cn
```

## 🎮 Modes disponibles (MVP)

| Mode | Description | Statut |
|------|-------------|--------|
| Apprendre par ligne | Carte + liste ordonnée, correspondances | ✅ |
| Nom → Position | Clic carte, tolérance de distance | ✅ |
| Position → Nom | Saisie avec tolérance accents/fautes | ✅ |
| Mode Survie | 3 vies, timer qui accélère | ✅ |
| Carte vierge | Variante du mode apprentissage (labels=none) | ✅ |
| Quiz "ordre des stations" | Drag & drop | ⏳ Roadmap |
| Mode "Ligne complète" | Réciter toutes les stations | ⏳ Roadmap |
| Mode Examen | Évaluation complète multi-lignes | ⏳ Roadmap |
| Multijoueur | Course temps réel sur une ligne (Supabase Realtime) | ✅ |
| Mode Histoire | Anecdotes, dates, origines | ⏳ Roadmap |
| Audio | Prononciation | ⏳ Roadmap |
| IA Coach | Plans de révision personnalisés | ⏳ Roadmap |

## 🧠 Système de répétition espacée

Variante **SM-2** (`lib/spaced-repetition/srs.ts`) :
- Grade `0/1/2/3` selon précision et rapidité.
- `ease` ∈ [1.3, 3.0], `intervalDays` recalculé après chaque révision.
- Échec → revue dans 10 minutes, baisse de l'`ease`.
- Score de maîtrise (`masteryScore`) = combinaison historique récent + stabilité.

Le moteur de quiz (`pickQuizStations`) **biaise la sélection vers les stations dues**, en complétant avec un échantillon aléatoire si besoin.

## 🗺️ Données

- **16 lignes** modélisées (1, 2, 3, 3bis, 4, 5, 6, 7, 7bis, 8, 9, 10, 11, 12, 13, 14)
- **~330 stations** uniques avec coordonnées lat/lon
- Correspondances modélisées via `Station.lines: LineId[]`
- Branches secondaires (lignes 7 et 13) modélisées via `Line.branches`

### Simplifications honnêtes

- **Coordonnées approximées** (~50–150m de marge) — suffisant pour les modes pédagogiques avec tolérance de clic.
- **Ligne 14** : version 9 stations Saint-Lazare → Olympiades. L'extension nord-sud 2024 n'est pas intégrée.
- **Ligne 11** : version 13 stations Châtelet → Mairie des Lilas. L'extension à Rosny-Bois-Perrier n'est pas intégrée.

Pour passer en V2 sur les données : intégrer le dataset officiel **Île-de-France Mobilités** (https://data.iledefrance-mobilites.fr) — la structure `Station[] + Line[]` est compatible.

## 🎨 Design system

Couleurs RATP officielles dans `tailwind.config.ts` (`ratp-1` à `ratp-14`).
Palette neutre :
- `ink` (`#0B0F1A`) — texte principal
- `ink-muted` (`#5B6275`) — texte secondaire
- `cream` (`#FAF8F3`) — fond
- Accents : Magenta `#C04191` (ligne 4), Violet `#662483` (ligne 14)

Animations : Framer Motion. Toutes < 400ms (transitions, feedback quiz, pop-in).

## 📊 État global

Un seul store Zustand (`useProgress`), persisté en `localStorage` :
- `cards: Record<stationId, SrsCard>` — état SRS par station
- `stats` — précision globale, meilleure série, historique des sessions
- Actions : `answerStation(id, grade)`, `recordSession(...)`, `reset()`

## 🚀 Déploiement

Compatible **Vercel** out-of-the-box :
```bash
vercel
```

## 🗺️ Roadmap V2

1. **Auth + sync cloud** (Supabase) — partager la progression entre appareils
2. **Données complètes** depuis Île-de-France Mobilités (RER, Tramway, Transilien)
3. **PWA + offline-first** (déjà majoritairement le cas grâce au localStorage)
4. **Mode Histoire** — base de données d'anecdotes par station
5. **Audio** — prononciation des stations
6. **IA Coach** — analyse de faiblesses (faiblesses par ligne, par arrondissement)
7. **Mobile natif** (React Native ou Capacitor)

## 📜 Licence

Code MVP — adapter selon usage. Données métro : marques RATP/IDFM, couleurs et noms à usage informatif.
