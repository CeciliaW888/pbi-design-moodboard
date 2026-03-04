# Homepage Visual Mock

## Clean Visual Representation

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  DITTO                         My Themes  Gallery  Settings  👤 Ceci ▾    ║
╚═══════════════════════════════════════════════════════════════════════════╝


    Welcome back, Ceci
    What do you want to start with?


    ┏━━━━━━━━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━━━━━━┓
    ┃                    ┃  ┃                  ┃  ┃                  ┃
    ┃        🎨          ┃  ┃       📐         ┃  ┃       ⚡         ┃
    ┃                    ┃  ┃                  ┃  ┃                  ┃
    ┃  I Have            ┃  ┃  I Want a        ┃  ┃  Start Blank     ┃
    ┃  Inspiration       ┃  ┃  Template        ┃  ┃                  ┃
    ┃                    ┃  ┃                  ┃  ┃                  ┃
    ┃  Upload image or   ┃  ┃  Browse 12       ┃  ┃  Create from     ┃
    ┃  paste URL to      ┃  ┃  curated themes  ┃  ┃  scratch with    ┃
    ┃  extract colors,   ┃  ┃  and customize   ┃  ┃  AI or manual    ┃
    ┃  fonts, and style  ┃  ┃  for your brand  ┃  ┃  design          ┃
    ┃                    ┃  ┃                  ┃  ┃                  ┃
    ┃  ╭──────────────╮  ┃  ┃  ╭────────────╮  ┃  ┃  ╭────────────╮  ┃
    ┃  │Upload Image  │  ┃  ┃  │Browse      │  ┃  ┃  │  Create    │  ┃
    ┃  │              │  ┃  ┃  │Templates   │  ┃  ┃  │            │  ┃
    ┃  ╰──────────────╯  ┃  ┃  ╰────────────╯  ┃  ┃  ╰────────────╯  ┃
    ┃                    ┃  ┃                  ┃  ┃                  ┃
    ┗━━━━━━━━━━━━━━━━━━━━┛  ┗━━━━━━━━━━━━━━━━━━┛  ┗━━━━━━━━━━━━━━━━━━┛


    ──────────────────────── or continue ────────────────────────


    Recent Projects                                      View All →

    ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
    │ ╔════════╗ │  │ ╔════════╗ │  │ ╔════════╗ │  │ ╔════════╗ │
    │ ║ [img]  ║ │  │ ║ [img]  ║ │  │ ║ [img]  ║ │  │ ║ [img]  ║ │
    │ ║        ║ │  │ ║        ║ │  │ ║        ║ │  │ ║        ║ │
    │ ╚════════╝ │  │ ╚════════╝ │  │ ╚════════╝ │  │ ╚════════╝ │
    │            │  │            │  │            │  │            │
    │ Client ABC │  │ Sales Dash │  │ Dark Theme │  │ Finance    │
    │ 2 days ago │  │ 1 week ago │  │ 3 days ago │  │ Yesterday  │
    └────────────┘  └────────────┘  └────────────┘  └────────────┘
```

---

## Hover States

### Card 1 (Hovered)
```
    ┏━━━━━━━━━━━━━━━━━━━━┓  ← Lifted (-2px)
    ┃  ╭╌╌╌╌╌╌╌╌╌╌╌╌╌╌╮  ┃  ← Subtle glow
    ┃  ┊              ┊  ┃
    ┃  ┊     🎨       ┊  ┃
    ┃  ┊              ┊  ┃
    ┃  ┊ I Have       ┊  ┃
    ┃  ┊ Inspiration  ┊  ┃
    ┃  ┊              ┊  ┃
    ┃  ┊ Upload...    ┊  ┃
    ┃  ┊              ┊  ┃
    ┃  ┊ ╭──────────╮ ┊  ┃
    ┃  ┊ │Upload    │ ┊  ┃  ← Button darker
    ┃  ┊ │Image     │ ┊  ┃
    ┃  ┊ ╰──────────╯ ┊  ┃
    ┃  ╰╌╌╌╌╌╌╌╌╌╌╌╌╌╌╯  ┃
    ┗━━━━━━━━━━━━━━━━━━━━┛
    └─ Shadow deeper ──┘
```

---

## Color Guide

**Card Backgrounds:**
- Light mode: `#ffffff`
- Dark mode: `#14142c`

**Card Borders:**
- Default: `rgba(255,255,255,0.05)` dark / `rgba(0,0,0,0.1)` light
- Hover Card 1: `rgba(0,120,212,0.3)` (primary blue glow)
- Hover Card 2: `rgba(124,58,237,0.3)` (purple glow)
- Hover Card 3: `rgba(242,200,17,0.3)` (yellow glow)

**Icons:**
- Card 1: Gradient `#0078D4 → #00BCF2` (blue)
- Card 2: Gradient `#7c3aed → #a78bfa` (purple)
- Card 3: Gradient `#F2C811 → #fbbf24` (yellow)

**Buttons:**
- Card 1: Solid `#0078D4` white text
- Card 2: Outline `#7c3aed` border, purple text
- Card 3: Outline `#F2C811` border, yellow text

---

## Interaction Flows (Diagram)

```
Homepage
   │
   ├─→ [Card 1: Upload Image]
   │      │
   │      └─→ Moodboard View
   │            └─→ Upload zone open
   │                  └─→ Extract colors
   │                        └─→ Save Theme
   │                              └─→ Prototype
   │
   ├─→ [Card 2: Browse Templates]
   │      │
   │      └─→ Template Gallery Modal
   │            └─→ Pick template
   │                  └─→ Prototype (loaded)
   │
   ├─→ [Card 3: Create]
   │      │
   │      └─→ Prototype View (blank)
   │            └─→ AI prompt or manual
   │
   └─→ [Recent Project Card]
          │
          └─→ Open project (moodboard/prototype)
```

---

## Responsive Breakpoints

**Desktop (1280px+):**
- 3 cards side-by-side
- Recent projects: 5 columns

**Tablet (768px - 1279px):**
- 3 cards side-by-side (narrower)
- Recent projects: 3 columns

**Mobile (< 768px):**
- Cards stacked vertically
- Recent projects: 2 columns

---

## Empty State (No Projects)

```
    Recent Projects


    ┌──────────────────────────────────────┐
    │                                      │
    │            📂                        │
    │                                      │
    │        No projects yet               │
    │                                      │
    │   Start creating above to see        │
    │   your work here                     │
    │                                      │
    └──────────────────────────────────────┘
```

---

## First-Time User Tooltip

```
    ┌────────────────────────────────┐
    │ 💡 Tip: Upload a logo to       │
    │    extract your brand colors   │
    └───────────┬────────────────────┘
                ↓
    ┏━━━━━━━━━━━━━━━━━━━━┓
    ┃       🎨           ┃
    ┃  I Have            ┃
    ┃  Inspiration       ┃
    ┃  ...               ┃
```

**Appears on:**
- First visit only (localStorage: `ditto_homepage_tooltip_seen`)
- Dismissed on: Click anywhere, after 5 seconds, or X button

---

## Accessibility Notes

**Keyboard Navigation:**
1. Tab order: Card 1 → Card 2 → Card 3 → Recent projects
2. Enter/Space on card = Click action
3. Arrow keys in recent projects grid

**Screen Reader:**
- Card 1: "I Have Inspiration. Upload image or paste URL to extract colors, fonts, and style. Button: Upload Image"
- Card 2: "I Want a Template. Browse 12 curated themes. Button: Browse Templates"
- Card 3: "Start Blank. Create from scratch. Button: Create"

**Focus States:**
- Cards: Blue outline (2px) on focus
- Buttons: Darker outline on focus

---

## Animation Timeline

```
0ms    → Welcome text fades in
50ms   → Subtitle fades in
100ms  → Card 1 fades in + slides up
150ms  → Card 2 fades in + slides up
200ms  → Card 3 fades in + slides up
250ms  → Divider line fades in
300ms  → Recent Projects heading fades in
350ms  → Project cards stagger in (50ms each)
```

**Duration:** ~600ms total for full page load

---

## Mobile View (< 768px)

```
╔═══════════════════════════╗
║ ☰  DITTO       👤 Ceci ▾  ║
╚═══════════════════════════╝


 Welcome back, Ceci
 What do you want to
 start with?


 ┏━━━━━━━━━━━━━━━━━━━━━━━┓
 ┃                       ┃
 ┃        🎨             ┃
 ┃                       ┃
 ┃  I Have Inspiration   ┃
 ┃                       ┃
 ┃  Upload image or      ┃
 ┃  paste URL to extract ┃
 ┃  colors, fonts, and   ┃
 ┃  style                ┃
 ┃                       ┃
 ┃  ╭─────────────────╮  ┃
 ┃  │  Upload Image   │  ┃
 ┃  ╰─────────────────╯  ┃
 ┃                       ┃
 ┗━━━━━━━━━━━━━━━━━━━━━━━┛


 ┏━━━━━━━━━━━━━━━━━━━━━━━┓
 ┃        📐             ┃
 ┃  I Want a Template    ┃
 ┃  ...                  ┃
 ┗━━━━━━━━━━━━━━━━━━━━━━━┛


 ┏━━━━━━━━━━━━━━━━━━━━━━━┓
 ┃        ⚡             ┃
 ┃  Start Blank          ┃
 ┃  ...                  ┃
 ┗━━━━━━━━━━━━━━━━━━━━━━━┛


 ─── or continue ───


 Recent Projects
 View All →

 ┌─────────┐ ┌─────────┐
 │ [image] │ │ [image] │
 │ Client  │ │ Sales   │
 │ 2d ago  │ │ 1w ago  │
 └─────────┘ └─────────┘
```
