# PBI Design Moodboard 🎨

Build beautiful Power BI themes from dashboard screenshots. No sign-up required.

**Drop → Extract → Design → Export**

## Features

- **Instant canvas** — Drag/drop/paste PBI screenshots immediately
- **Color extraction** — Click any screenshot to pull its palette
- **Live preview** — See a mini PBI dashboard with your design system
- **Typography control** — Set heading/body fonts with PBI-compatible options
- **Export 3 formats** — PBI Theme JSON, Format Spec (Markdown), PBIP Visual Config
- **Works offline** — Everything saves to localStorage
- **Firebase sync** — Sign in to save your library across devices

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 and start dropping screenshots!

## Firebase Setup (Optional — for cloud sync)

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** → Sign-in methods → Google + Email/Password
3. Create **Firestore Database** (production mode)
4. Enable **Storage**
5. Copy your config to `.env`:

```bash
cp .env.example .env
# Fill in your Firebase config values
```

6. Deploy Firestore/Storage rules:

```bash
npx firebase-tools deploy --only firestore:rules,storage
```

7. Deploy to Firebase Hosting:

```bash
npm run build
npx firebase-tools deploy --only hosting
```

## Tech Stack

- React 19 + Vite
- Tailwind CSS v4
- Framer Motion
- Firebase (Auth, Firestore, Storage, Hosting)
- Pure canvas color extraction (no heavy dependencies)

## Architecture

```
src/
├── App.jsx              # Main app state & layout
├── firebase.js          # Firebase config & operations
├── lib/
│   ├── colorExtractor.js  # k-means color extraction
│   ├── themeExporter.js   # PBI theme/spec/PBIP export
│   └── storage.js         # localStorage persistence
└── components/
    ├── Header.jsx         # Top bar with theme name + auth
    ├── DropZone.jsx       # Drag/drop/paste upload
    ├── ScreenshotGrid.jsx # Masonry grid of screenshots
    ├── ColorPalette.jsx   # Extracted colors with copy/remove
    ├── DesignPanel.jsx    # Typography + background + rules
    ├── LivePreview.jsx    # Mini PBI dashboard mockup
    ├── ExportPanel.jsx    # Download/copy all export formats
    └── AuthModal.jsx      # Firebase auth (Google + Email)
```

## Firestore Structure

```
users/
  {userId}/
    moodboards/
      {moodboardId}/
        name, colors[], fonts{}, background, formatRules[], createdAt, updatedAt
```
