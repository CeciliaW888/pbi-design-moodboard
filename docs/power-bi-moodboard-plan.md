# Power BI Design Moodboard — Research & Implementation Plan

## 1. Existing Moodboard Project Analysis

**Repo:** github.com/CeciliaW888/moodboard

**Architecture:**
- **Client:** React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Server:** Express 5 + Drizzle ORM + PostgreSQL (Docker) + Multer (uploads)
- **AI:** Google GenAI (`@google/genai`) — likely auto-tagging uploaded images
- **Key libs:** react-rnd (drag/resize), lucide-react (icons), date-fns

**How it works:**
- Weekly calendar layout (Mon–Sun columns)
- Upload/paste/drag images into day columns
- Auto-generates tags via AI (Google Gemini)
- Resizable notes area per week
- Dark mode, bilingual (zh/en)
- Images grouped by day, stored with week identifier (e.g. `2026-W08`)

**Strengths to reuse:** The upload + paste + drag UX, tag system, week-based organization, client/server split, Drizzle ORM pattern.

---

## 2. Competitive Landscape

### Existing Power BI Design Tools

| Tool | What It Does | Price | Gap |
|------|-------------|-------|-----|
| **Numerro** (numerro.io) | Full toolkit: 250+ templates, visual themes, canvas grids, component kits. Drag & drop in Power BI. | Paid subscription | Heavyweight; not a moodboard/inspiration tool |
| **Power UI** (powerui.com) | AI theme generator, JSON theme export, 1500+ dynamic icons, live PBI preview, Figma kit | Free tier + paid | Focused on theme JSON generation, not design exploration |
| **PowerBIGraphs** (powerbigraphs.com) | Figma UI Kit V2, templates, visual themes | Paid | Figma-based, not standalone web tool |
| **Nudge BI** (nudgebi.com) | Figma Power BI UI Kit for prototyping | Paid | Requires Figma |
| **Vision Analytics** (visionanalytics.io) | Plug-and-play chart/KPI/gauge components | Paid | Component library, not design inspiration |
| **Dashboard-Design GitHub** | Free .pbix design files and examples | Free | Static files, no interactive exploration |
| **Figma Community** | Multiple free PBI dashboard kits, 150+ icons, 50+ palettes | Free | Scattered across Figma, no unified tool |

### The Gap 🎯

**Nobody has built a dedicated Power BI design moodboard.** The market has:
- ✅ Theme generators (Power UI)
- ✅ Component libraries (Numerro, Vision Analytics)
- ✅ Figma prototyping kits (PowerBIGraphs, Nudge BI)
- ✅ Template galleries (Numerro, Windsor.ai)
- ❌ **NO interactive moodboard for collecting, organizing, and exploring Power BI design inspiration**
- ❌ **NO tool that combines color palettes + chart patterns + layout ideas + reference screenshots in one place**
- ❌ **NO AI-powered design suggestion tool specific to PBI dashboards**

This is a genuine white space.

---

## 3. Proposed Tool: Power BI Design Moodboard

### Core Concept
A web app where Power BI designers collect, organize, and explore dashboard design inspiration — colors, layouts, chart styles, typography — then export actionable assets (theme JSON, color palettes, layout guides).

### Key Features

**Phase 1 — MVP (Moodboard Core)**
1. **Board Organization** — Projects/boards instead of weeks (e.g. "Sales Dashboard Redesign")
2. **Image Upload** — Same paste/drag/upload UX from existing moodboard
3. **AI Auto-Tagging** — Detect: chart types, color schemes, layout patterns, industry
4. **Color Palette Extraction** — Auto-extract dominant colors from uploaded screenshots
5. **Smart Categories:** Dashboard layouts | Chart styles | Color schemes | Typography | Icons/decorations | KPI cards | Navigation patterns
6. **Tag Filtering** — Filter by chart type, color mood, industry, complexity

**Phase 2 — Power BI Specific**
7. **Theme JSON Generator** — Select colors from moodboard → generate valid Power BI theme JSON
8. **Built-in Inspiration Library** — Pre-loaded gallery of excellent PBI dashboard designs (curated)
9. **Layout Grid Templates** — Common PBI dashboard layouts as draggable wireframes
10. **Chart Type Reference** — Visual guide to every PBI native visual with best-use-cases
11. **Color Harmony Tools** — Generate complementary palettes, check accessibility (WCAG contrast)

**Phase 3 — Pro Features**
12. **AI Design Assistant** — "I need a financial dashboard with dark theme" → suggests layout + palette + chart types
13. **Export Pack** — Download theme JSON + background image + icon set as a starter kit
14. **Collaboration** — Share boards with team, collect votes on design directions
15. **Version History** — Track design evolution across iterations

### User Workflow

```
1. Create Project → "Q3 Sales Dashboard"
2. Collect Inspiration → Upload screenshots, paste from web, browse built-in gallery
3. AI processes → Auto-tags, extracts colors, identifies patterns
4. Organize → Drag into categories, star favorites, add notes
5. Refine → Use color tools to build palette from favorites
6. Export → Download PBI theme JSON + design guide
7. Build → Open Power BI with theme applied, reference moodboard
```

---

## 4. Technical Approach

### Reuse from Existing Codebase
- **Client foundation:** React + Vite + Tailwind (keep as-is)
- **Upload pipeline:** Multer + paste/drag handlers (adapt)
- **Database layer:** Drizzle ORM (extend schema)
- **AI integration:** Google GenAI for tagging (enhance prompts for PBI context)

### New/Modified Components

```
client/src/
├── App.tsx                    # Project-based layout (not weekly)
├── components/
│   ├── Board/
│   │   ├── BoardCanvas.tsx    # Main moodboard canvas (free-form or grid)
│   │   ├── ImageCard.tsx      # Enhanced: shows extracted colors, tags
│   │   └── CategoryLane.tsx   # Horizontal lanes by category
│   ├── Palette/
│   │   ├── ColorExtractor.tsx # Extract palette from image
│   │   ├── PaletteBuilder.tsx # Build & refine color palette
│   │   └── ThemeExporter.tsx  # Generate PBI theme JSON
│   ├── Library/
│   │   ├── InspirationGallery.tsx  # Built-in curated designs
│   │   ├── ChartReference.tsx      # Visual chart type guide
│   │   └── LayoutTemplates.tsx     # Common dashboard layouts
│   ├── AI/
│   │   └── DesignAssistant.tsx     # AI chat for suggestions
│   └── Common/
│       ├── TagFilter.tsx
│       ├── Sidebar.tsx
│       └── ExportPanel.tsx

server/src/
├── routes/
│   ├── boards.ts          # CRUD for projects/boards
│   ├── images.ts          # Upload + AI processing
│   ├── palettes.ts        # Color palette management
│   └── themes.ts          # PBI theme JSON generation
├── services/
│   ├── colorExtractor.ts  # Extract colors from images (sharp/canvas)
│   ├── aiTagger.ts        # Enhanced PBI-specific tagging
│   └── themeGenerator.ts  # Builds valid PBI JSON theme
└── db/
    └── schema.ts          # Extended schema
```

### New Dependencies
- **`sharp`** or **`node-vibrant`** — server-side color extraction from images
- **`chroma-js`** — color manipulation, harmony generation, contrast checking
- **`react-color`** or **`@uiw/react-color`** — client color picker
- **`html2canvas`** or **`@react-pdf/renderer`** — export design guides

### Database Schema (Drizzle)

```typescript
// boards table (replaces weeks)
boards: {
  id, name, description, createdAt, updatedAt
}

// images table (enhanced)
images: {
  id, boardId, url, thumbnailUrl,
  category, // 'layout' | 'chart' | 'color' | 'typography' | 'kpi' | 'navigation'
  dominantColors, // JSON array of hex colors
  aiDescription,
  positionX, positionY, width, height, // free-form positioning
  createdAt
}

// tags table (same pattern, PBI-specific vocabulary)
tags: { id, imageId, label, type }

// palettes table (new)
palettes: {
  id, boardId, name, colors, // JSON array
  isExported, themeJson
}
```

### Data Sources for Inspiration Library
1. **Numerro content hub** — study their examples for design patterns
2. **Power UI examples gallery** — reference high-quality themes
3. **Dashboard-Design GitHub** — open .pbix files
4. **Figma Community PBI kits** — screenshot best layouts
5. **r/PowerBI** — community-shared dashboards
6. **Microsoft Power BI gallery** — official showcase
7. **Dribbble/Behance** — search "Power BI dashboard" for professional designs
8. **Enterprise BI blogs** (SQLBI, Guy in a Cube, Curbal) — tutorial screenshots

---

## 5. Implementation Phases

### Phase 1: MVP (2–3 weeks)
- [ ] Fork moodboard repo, rename to `powerbi-moodboard`
- [ ] Replace week layout with project/board layout
- [ ] Add category lanes (layout, charts, colors, KPI, etc.)
- [ ] Implement color extraction from uploaded images
- [ ] Update AI prompts: tag for PBI chart types, layout patterns, color moods
- [ ] Basic palette builder (pick colors from extracted palettes)
- [ ] Simple PBI theme JSON export (dataColors + background)
- [ ] Deploy (Vercel + Railway/Supabase for DB)

### Phase 2: Design Intelligence (2–3 weeks)
- [ ] Curate and load 50+ inspiration images with pre-tagged metadata
- [ ] Chart type visual reference page
- [ ] Layout template wireframes (6–8 common PBI layouts)
- [ ] Color harmony tools (complementary, analogous, triadic generation)
- [ ] WCAG contrast checker for text on background colors
- [ ] Full PBI theme JSON export (all visual properties)

### Phase 3: AI & Polish (2–3 weeks)
- [ ] AI Design Assistant chat ("suggest a theme for...")
- [ ] Smart search across all boards/tags
- [ ] Export starter pack (theme JSON + design guide PDF)
- [ ] Collaboration features (share link, view-only mode)
- [ ] Mobile-responsive view for on-the-go inspiration browsing

---

## 6. Differentiation from Competitors

| Feature | This Tool | Power UI | Numerro | Figma Kits |
|---------|-----------|----------|---------|------------|
| Moodboard/inspiration collection | ✅ | ❌ | ❌ | ❌ |
| AI auto-tagging of designs | ✅ | ❌ | ❌ | ❌ |
| Color extraction from screenshots | ✅ | ❌ | ❌ | ❌ |
| Theme JSON export | ✅ | ✅ | ✅ | ❌ |
| Built-in inspiration gallery | ✅ | ✅ | ✅ | ❌ |
| Free/open source | ✅ | Freemium | Paid | Mostly free |
| Design process tool (collect → refine → export) | ✅ | ❌ | ❌ | ❌ |

**Unique value prop:** The only tool that covers the *entire design thinking process* for Power BI — from collecting inspiration to exporting production-ready themes. Not just a generator or a library, but a **design workflow tool**.

---

## 7. Quick Start Estimate

- **Effort:** ~6–8 weeks total (part-time), MVP in 2–3 weeks
- **Cost:** Minimal — reuses existing stack, free tier services
- **Risk:** Low — existing codebase provides 40–50% of the infrastructure
- **Portfolio value:** HIGH — unique tool in the PBI ecosystem, great for personal brand + RedNote content

---

*Ready to build. Fork the repo and start Phase 1 whenever you're ready.* 🚀
