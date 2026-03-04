# Implementation Roadmap
**Based on Market Research Competitive Analysis**

## Top 5 Priority Features

### #1: Community Template Gallery ⭐
**Timeline:** 4-6 weeks | **Impact:** Very High | **Effort:** Medium

**Why:** Creates network effects, solves "starting from scratch" pain, differentiates from ALL competitors

**Implementation Plan:**
```
Phase 1 (Week 1-2): Data Structure & Basic UI
- [ ] Create templates.json schema (palette, fonts, sentinels, preview metadata)
- [ ] Build gallery page with grid layout
- [ ] Template card component (preview, title, category, author, popularity)
- [ ] One-click "Use this template" import

Phase 2 (Week 3-4): Categorization & Search
- [ ] Category filters (industry, style, mood)
- [ ] Search/filter functionality
- [ ] Sort by: popular, newest, trending
- [ ] Tag system

Phase 3 (Week 5-6): Contribution & Curation
- [ ] "Publish your theme" flow (authenticated users)
- [ ] Moderation queue (Firebase + simple admin panel)
- [ ] Template preview generator (auto-screenshot)
- [ ] Upvote/favorite system
```

---

### #2: Multi-Page Report Layout Designer 📊
**Timeline:** 6-8 weeks | **Impact:** High | **Effort:** High

**Why:** Direct Mokkup.ai competitor, transforms tool from "theme generator" to "dashboard prototyper"

**Implementation Plan:**
```
Phase 1 (Week 1-2): Page Canvas Foundation
- [ ] 1280x720 page canvas component
- [ ] Grid overlay (10px/20px snap-to-grid)
- [ ] Page navigation (tabs/sidebar)
- [ ] Multiple pages per project

Phase 2 (Week 3-4): Visual Placement
- [ ] "Add Visual" button → Gemini prompt modal
- [ ] Place generated visual on canvas
- [ ] Drag-and-resize (already have react-rnd)
- [ ] Visual alignment guides
- [ ] Z-index/layering controls

Phase 3 (Week 5-6): Page Settings & Export
- [ ] Page-level settings (background, name, wallpaper)
- [ ] Export full PBIP page definitions (page.json + visuals/)
- [ ] Export page as PNG/PDF for presentations
- [ ] Page templates (blank, 2-column, 3-column, executive)

Phase 4 (Week 7-8): Polish
- [ ] Copy/paste visuals between pages
- [ ] Duplicate page
- [ ] Page reordering
- [ ] Keyboard shortcuts (arrow keys for fine-tuning)
```

---

### #3: Brand Kit Import (URL + PDF) 🎨
**Timeline:** 3-5 weeks | **Impact:** High | **Effort:** Medium

**Why:** Ultimate "wow demo" — paste `apple.com`, get Apple's PBI theme in 10 seconds

**Implementation Plan:**
```
Phase 1 (Week 1-2): URL Color Extraction
- [ ] URL input field in color extraction panel
- [ ] Serverless function (Vercel Edge) to fetch page + extract colors
- [ ] CSS variable extraction (--brand-*, background-color, etc.)
- [ ] Image dominant color extraction (ColorThief on screenshots)
- [ ] Preview extracted palette before applying

Phase 2 (Week 3): PDF Color Extraction
- [ ] PDF upload input
- [ ] Parse PDF for hex codes in text
- [ ] Extract dominant colors from PDF images
- [ ] Brand guidelines PDF detection (auto-find color swatches)

Phase 3 (Week 4-5): Smart Classification
- [ ] Auto-classify colors: primary, secondary, accent, background, text
- [ ] Confidence scoring for each classification
- [ ] Manual override (drag to reassign roles)
- [ ] "Import from Figma" (future: parse Figma tokens JSON)
```

---

### #4: Accessibility Checker & Colorblind Sim ♿
**Timeline:** 2-3 weeks | **Impact:** Medium-High | **Effort:** Low-Medium

**Why:** Enterprise compliance requirement, zero competitors have this, relatively easy

**Implementation Plan:**
```
Phase 1 (Week 1): Contrast Ratio Checker
- [ ] WCAG 2.1 contrast ratio calculation (4.5:1 normal, 3:1 large)
- [ ] Check each palette color against background
- [ ] Visual indicators (green check / red warning on color cards)
- [ ] Auto-suggest accessible alternatives (adjust lightness)

Phase 2 (Week 2): Colorblind Simulation
- [ ] Deuteranopia filter (red-green, most common)
- [ ] Protanopia filter (red-weak)
- [ ] Tritanopia filter (blue-yellow)
- [ ] Toggle to view palette + preview through filters
- [ ] Warning if colors become indistinguishable

Phase 3 (Week 3): Accessibility Score
- [ ] Overall design system accessibility score (X/10)
- [ ] Breakdown by color pair
- [ ] Export score as metadata in theme JSON
- [ ] "Fix all accessibility issues" bulk action
```

---

### #5: Shareable Read-Only Links 🔗
**Timeline:** 3-4 weeks | **Impact:** Medium-High | **Effort:** Medium

**Why:** Pro tier monetization driver, solves "presenting to clients" pain

**Implementation Plan:**
```
Phase 1 (Week 1-2): Share Infrastructure
- [ ] Generate unique share URLs (/share/abc123)
- [ ] Store shared state in Firebase (palette, fonts, visuals, layout)
- [ ] Read-only viewer page (no editing controls)
- [ ] Full-screen presentation mode

Phase 2 (Week 3): Viewer Features
- [ ] Clean UI (hide sidebar, show only page canvas)
- [ ] Navigation between pages (if multi-page)
- [ ] Optional: password protection
- [ ] View count tracking

Phase 3 (Week 4): Comments & Analytics
- [ ] Click-to-comment on visuals (no account required)
- [ ] View analytics (who viewed, when, duration)
- [ ] Link expiration (7 days free, permanent Pro)
- [ ] "This link is a preview only" watermark (removable in Pro)
```

---

## Quick Wins (Can Ship in 1 Week Each)

### Week 1: Dark Mode Templates
- [ ] Create 3-5 dark mode theme templates
- [ ] Add to template gallery
- [ ] "Generate dark variant" button for existing themes

### Week 2: Additional AI Visual Types
- [ ] Gauge chart generation
- [ ] Matrix/table generation
- [ ] Map visualization (basic)
- [ ] Update Gemini prompts

### Week 3: Design Token Export
- [ ] Export as CSS variables
- [ ] Export as Figma tokens JSON
- [ ] Export as SCSS variables
- [ ] Copy to clipboard button

---

## Competitive Positioning Implementation

### vs. Mokkup.ai
**Messaging to implement in UI/landing page:**
- "Unlike wireframing tools with static placeholders, we generate realistic visuals with AI"
- "Free forever. No subscription. No lock-in."
- "Export to native Power BI formats (theme JSON + PBIP)"

### vs. PowerBI.tips Theme Generator
**Differentiators to highlight:**
- "See your theme applied to real charts before exporting"
- "Extract colors from screenshots automatically"
- "AI-powered visual generation"

### vs. Power UI
**Messaging:**
- "No Figma required — design directly in the browser"
- "Export to Power BI formats, not Figma files"
- "Free and open-source"

---

## Brand Positioning

**Core message:** 
> "The free, AI-powered design studio for Power BI. Extract palettes from screenshots, generate realistic visuals with AI, and export production-ready themes — all in your browser."

**Key differentiators (vs. ALL competitors):**
1. ✅ Free & open-source (MIT)
2. ✅ AI-powered visual generation (Gemini)
3. ✅ Screenshot → palette extraction
4. ✅ Export to native PBI formats (theme JSON + PBIP)
5. ✅ Live preview with realistic data
6. ✅ No account required (local-first)

---

## Go-to-Market Alignment

Based on Section 4 recommendations, implement these marketing hooks into the product:

### In-App CTAs
- [ ] "Share on Twitter" after generating a great palette
- [ ] "Post to LinkedIn" after completing a design
- [ ] "Submit to gallery" encourages UGC
- [ ] Export includes subtle "Made with [tool name]" watermark (removable)

### Demo Content
- [ ] Pre-loaded example project on first launch
- [ ] Tutorial overlay highlighting key features
- [ ] "Try these workflows" sidebar (screenshot extraction, AI generation, export)

### Community Triggers
- [ ] "Join our Discord" link for feedback
- [ ] "Star us on GitHub" reminder
- [ ] Built-in feature voting/request form

---

## Technical Debt to Address First

Before building new features, clean up:
- [ ] Commit current ImageCard changes
- [ ] Push unpushed commits to origin
- [ ] Add market-research.md to repo
- [ ] Set up proper environment variables (.env.example)
- [ ] Add comprehensive README with setup instructions
- [ ] Create CONTRIBUTING.md for open-source contributors

---

## Next Actions (This Week)

**Option A: Quick Win Sprint** (build momentum)
1. Commit + push current changes
2. Implement dark mode templates (1 day)
3. Add 2-3 additional AI visual types (2 days)
4. Ship accessibility checker MVP (2 days)

**Option B: Big Bet Sprint** (differentiation)
1. Start Community Template Gallery (Phase 1)
2. Build foundation for multi-page layout designer
3. Set up shareable links infrastructure

**Recommendation:** Start with Option A to build momentum + GitHub stars, then tackle Option B for competitive moat.

---

**Want me to start implementing any of these features?** 🚀
