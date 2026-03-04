# User Journey - Theme Workflow

## Path A: Moodboard → Prototype (Primary Flow)

```
1. DISCOVER INSPIRATION
   User finds beautiful dashboard/website/design
   ↓
2. EXTRACT THEME (Moodboard)
   - Upload image or paste URL
   - AI extracts: colors, fonts, spacing, sentiment
   - User reviews/tweaks extracted values
   ↓
3. SAVE AS THEME
   - Click "Save as Theme" button
   - Name it: "Client ABC Brand" or "Dark Minimal"
   - Optional description
   - Save to Library (requires auth)
   ↓
4. START PROTOTYPING
   - Click "Create Prototype with This Theme"
   - OR go to Prototype tab → "Load Theme"
   ↓
5. GENERATE DASHBOARD
   - Describe dashboard purpose
   - AI generates using saved theme
   - Colors, fonts, style all match extraction
   ↓
6. ITERATE & EXPORT
   - Tweak in prototype editor
   - Override individual values if needed
   - Export to Power BI
```

## Path B: Template → Customize → Prototype

```
1. BROWSE TEMPLATES
   Template Gallery → Find close match
   ↓
2. CUSTOMIZE IN MOODBOARD
   - Load template into moodboard
   - Upload client logo → Extract brand colors
   - Merge template + brand colors
   ↓
3. SAVE & PROTOTYPE
   (same as Path A steps 3-6)
```

## Path C: Direct Prototype (Skip Moodboard)

```
1. USE COMMUNITY TEMPLATE
   Gallery → "Use This Template" → Prototype
   (Already working!)
```

## UI Flow

```
┌─────────────────────────────────────┐
│  MOODBOARD                          │
│  [Upload Image] [Paste URL]         │
│                                     │
│  Extracted:                         │
│  🎨 5 colors                        │
│  📝 2 fonts                         │
│  ✨ Sentiment: Modern Minimal       │
│                                     │
│  [Save as Theme] ← NEW BUTTON       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Save Theme Dialog                  │
│  Name: [Client ABC Brand___]        │
│  Description: [Optional___]         │
│                                     │
│  [Cancel] [Save to Library]         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  MY THEMES (New Tab)                │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │ ABC  │ │ Dark │ │ Corp │        │
│  │ 🎨   │ │ 🎨   │ │ 🎨   │        │
│  └──────┘ └──────┘ └──────┘        │
│   [Apply] [Edit] [Duplicate] [Delete] [Export]
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  PROTOTYPE EDITOR                   │
│  Theme: Client ABC Brand ✓          │
│                                     │
│  [Generated dashboard preview]      │
│                                     │
│  [Change Theme] [Export]            │
└─────────────────────────────────────┘
```

## Technical Architecture

### Data Structure

**Theme Object:**
```javascript
{
  id: "theme_abc123",
  workspaceId: "ws_xyz",
  name: "Client ABC Brand",
  description: "Corporate brand colors and fonts",
  
  // Extracted/selected values
  colors: {
    primary: "#2563eb",
    secondary: "#7c3aed",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#1e293b",
    // ... palette
  },
  
  fonts: {
    heading: "Inter",
    body: "Inter",
    mono: "JetBrains Mono"
  },
  
  sentiment: "Modern Minimal",
  spacing: "comfortable",
  
  // Metadata
  createdFrom: "moodboard", // or "template" or "manual"
  sourceImage: "https://...", // optional
  createdAt: timestamp,
  updatedAt: timestamp,
  version: 1
}
```

### Firestore Structure
```
workspaces/{wsId}/
  ├── themes/{themeId}
  └── projects/{projectId}
      └── theme: themeId (reference)
```

## Implementation Phases

### Phase 1: Core Workflow (MVP)

**1. Moodboard → Save Theme**
- "Save as Theme" button after extraction
- Modal: name + description fields
- Save to Firestore: `workspaces/{wsId}/themes/{themeId}`

**2. Theme Library Storage**
- Editable (user can modify colors/fonts later)
- Versionable (duplicate creates new version)
- Exportable (JSON download)

**3. Prototype → Load Theme**
- "Load Theme" button in Prototype editor
- Modal shows: My Themes + Community Templates
- Select → Apply to current prototype
- User can override individual values after applying

**4. Apply to AI Generation**
- When generating dashboard, inject theme values into prompt
- Colors, fonts, sentiment all from saved theme

### Phase 2: Theme Management

**5. My Themes Library View**
- New nav tab "My Themes"
- Grid of saved themes with palette previews
- Actions: Apply, Edit, Duplicate, Delete, Export JSON

**6. Import Theme**
- Upload JSON file → Import to library
- Enables sharing across teams

**7. Share via Link**
- Share project URL → Includes theme
- Recipient can clone + save theme

## Skipped for MVP
- AI theme suggestions (future enhancement)
