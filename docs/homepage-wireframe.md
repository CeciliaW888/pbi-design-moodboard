# Homepage Wireframe - Refined HomeDashboard

## Overview
Refine existing HomeDashboard.jsx to guide users through 3 clear starting paths.

---

## Desktop Layout (1280px+)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  [Ditto Logo]                    [My Themes] [Gallery] [Settings] [@User▾] │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│   Welcome back, Ceci                                          (fade in)    │
│   What do you want to start with?                                         │
│                                                                            │
│   ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────┐  │
│   │  🎨                 │  │  📐                 │  │  ⚡             │  │
│   │                     │  │                     │  │                 │  │
│   │  I Have             │  │  I Want a           │  │  Start Blank    │  │
│   │  Inspiration        │  │  Template           │  │                 │  │
│   │                     │  │                     │  │                 │  │
│   │  Upload image or    │  │  Browse 12 curated  │  │  Create from    │  │
│   │  paste URL to       │  │  dashboard themes   │  │  scratch with   │  │
│   │  extract colors,    │  │  and customize      │  │  AI or manual   │  │
│   │  fonts, and style   │  │  for your brand     │  │  design         │  │
│   │                     │  │                     │  │                 │  │
│   │  ┌───────────────┐  │  │  ┌───────────────┐  │  │  ┌───────────┐  │  │
│   │  │ Upload Image  │  │  │  │Browse Templates│ │  │  │  Create   │  │  │
│   │  └───────────────┘  │  │  └───────────────┘  │  │  └───────────┘  │  │
│   │                     │  │                     │  │                 │  │
│   └─────────────────────┘  └─────────────────────┘  └─────────────────┘  │
│   (hover: lift + glow)     (hover: lift + glow)     (hover: lift + glow) │
│                                                                            │
│   ────────────────────────── or continue ──────────────────────────────    │
│                                                                            │
│   Recent Projects                                      [View All →]       │
│                                                                            │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │ [Thumb]  │  │ [Thumb]  │  │ [Thumb]  │  │ [Thumb]  │  │ [Thumb]  │  │
│   │          │  │          │  │          │  │          │  │          │  │
│   │Client ABC│  │Sales Dash│  │Dark UI   │  │Finance   │  │Marketing │  │
│   │2 days ago│  │1 week ago│  │3 days ago│  │Yesterday │  │4 days ago│  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│   (grid, max 6)                                                            │
│                                                                            │
│   [Empty state if no projects: "No projects yet. Start one above!"]       │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Card Breakdown

### Card 1: "I Have Inspiration" 🎨

**Visual:**
- Card background: White/Dark surface
- Icon: 🎨 Large Palette icon (gradient primary → secondary)
- Border: Subtle, glows on hover (primary color)
- Shadow: Soft, increases on hover (lift effect)

**Content:**
- **Heading:** "I Have Inspiration" (bold, 20px)
- **Description:** "Upload image or paste URL to extract colors, fonts, and style" (14px, muted)
- **CTA Button:** "Upload Image" (primary blue, full width)

**Interaction:**
- Hover: Card lifts (-translate-y-1), border glows, shadow deepens
- Click button → Navigate to Moodboard view with upload zone open
- Alternative: Click anywhere on card → Same action

**Flow:**
```
Click → Moodboard View
      → Upload zone auto-focused
      → User uploads image
      → Extract colors/fonts
      → "Save as Theme" appears
```

---

### Card 2: "I Want a Template" 📐

**Visual:**
- Card background: White/Dark surface  
- Icon: 📐 Large LayoutTemplate icon (gradient accent)
- Border: Subtle, glows on hover (secondary color)
- Shadow: Soft, increases on hover

**Content:**
- **Heading:** "I Want a Template" (bold, 20px)
- **Description:** "Browse 12 curated dashboard themes and customize for your brand" (14px, muted)
- **CTA Button:** "Browse Templates" (secondary/outline, full width)

**Interaction:**
- Hover: Card lifts, border glows
- Click button → Open Template Gallery modal (or navigate to Gallery view)
- Shows all 12 templates with search/filter
- User clicks template → Loads in Prototype view

**Flow:**
```
Click → Template Gallery Modal
      → User picks template
      → Loads in Prototype view
      → Can customize or generate directly
```

---

### Card 3: "Start Blank" ⚡

**Visual:**
- Card background: White/Dark surface
- Icon: ⚡ Large Zap icon (gradient tertiary)
- Border: Subtle, glows on hover (tertiary color)
- Shadow: Soft, increases on hover

**Content:**
- **Heading:** "Start Blank" (bold, 20px)
- **Description:** "Create from scratch with AI or manual design" (14px, muted)
- **CTA Button:** "Create" (outline, full width)

**Interaction:**
- Hover: Card lifts, border glows
- Click button → Navigate to Prototype view (blank canvas)
- Shows: AI prompt bar + manual design tools
- User can describe dashboard or build manually

**Flow:**
```
Click → Prototype View (blank)
      → AI prompt visible
      → OR manual design tools
      → Generate or build from scratch
```

---

## Recent Projects Section

**Layout:**
- Heading: "Recent Projects" (18px bold) + "View All →" link (right-aligned)
- Grid: 5 columns on desktop, 3 on tablet, 2 on mobile
- Max 6 projects shown
- If no projects: Empty state with encouragement

**Project Card:**
```
┌──────────────┐
│  Thumbnail   │  ← Screenshot or placeholder
│  (16:9)      │
├──────────────┤
│ Project Name │  ← Truncated if long
│ 2 days ago   │  ← Relative time
└──────────────┘
(hover: lift + shadow)
```

**Interaction:**
- Click → Open project in appropriate view (moodboard/prototype based on type)
- Right-click/long-press → Context menu (Rename, Duplicate, Delete)

**Empty State:**
```
┌─────────────────────────────────────────┐
│                                         │
│      📂 No projects yet                 │
│                                         │
│   Start creating above to see           │
│   your work here                        │
│                                         │
└─────────────────────────────────────────┘
```

---

## Mobile Layout (< 768px)

```
┌─────────────────────────┐
│ [☰] Ditto      [@User▾] │
└─────────────────────────┘

┌─────────────────────────┐
│ Welcome back, Ceci      │
│ What do you want to     │
│ start with?             │
│                         │
│ ┌─────────────────────┐ │
│ │  🎨                 │ │
│ │  I Have             │ │
│ │  Inspiration        │ │
│ │                     │ │
│ │  Upload image...    │ │
│ │  [Upload Image]     │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │  📐                 │ │
│ │  I Want a Template  │ │
│ │                     │ │
│ │  Browse 12...       │ │
│ │  [Browse Templates] │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │  ⚡                 │ │
│ │  Start Blank        │ │
│ │                     │ │
│ │  Create from...     │ │
│ │  [Create]           │ │
│ └─────────────────────┘ │
│                         │
│ Recent Projects         │
│ [View All →]            │
│                         │
│ ┌─────────┐ ┌─────────┐│
│ │ [Thumb] │ │ [Thumb] ││
│ │Client   │ │Sales    ││
│ │ABC      │ │Dash     ││
│ └─────────┘ └─────────┘│
│ (grid 2 cols, max 6)    │
└─────────────────────────┘
```

---

## Visual Specs

### Spacing
- Container: max-width 1200px, centered
- Padding: px-6 py-8
- Card grid gap: gap-6
- Between sections: mb-12

### Cards
- Background: bg-white dark:bg-surface-light
- Border: 1px solid border-color
- Border radius: rounded-2xl (16px)
- Padding: p-8
- Aspect ratio: Auto height based on content

### Typography
- Welcome heading: text-2xl font-bold
- Subtitle: text-text-muted
- Card heading: text-xl font-bold
- Card description: text-sm text-text-muted
- Button: text-sm font-medium

### Icons
- Size: 48px (large, prominent)
- Style: Gradient fill or duotone
- Colors: Primary gradient for card 1, secondary for card 2, tertiary for card 3

### Buttons
- Full width in cards
- Height: h-11 (44px)
- Border radius: rounded-lg
- Primary button: bg-primary text-white
- Secondary button: border border-primary text-primary hover:bg-primary/5

### Hover States
- Card: -translate-y-1, border glow (border-primary/50), shadow-lg
- Button: Slightly darker bg, scale-[0.98] on active

### Animations
- Initial: Fade in with stagger (0.05s delay between cards)
- Hover: Duration 300ms ease-out
- Click: Quick scale bounce (scale-[0.98])

---

## User Flow Examples

### Scenario 1: Design student with inspiration screenshot
1. Lands on homepage
2. Sees "I Have Inspiration" card
3. Clicks "Upload Image"
4. Moodboard opens with upload zone
5. Drags screenshot
6. AI extracts colors/fonts
7. Clicks "Save as Theme"
8. Goes to Prototype → "Load Theme" → Generates dashboard

### Scenario 2: Consultant needing quick dashboard
1. Lands on homepage
2. Sees "I Want a Template" card
3. Clicks "Browse Templates"
4. Template Gallery modal opens
5. Picks "Corporate Financial"
6. Loads in Prototype view
7. Tweaks colors, exports

### Scenario 3: Experienced user starting fresh
1. Lands on homepage
2. Sees "Start Blank" card
3. Clicks "Create"
4. Prototype view opens (blank)
5. Types AI prompt: "Modern sales dashboard dark theme"
6. AI generates
7. Refines and exports

### Scenario 4: Returning user
1. Lands on homepage
2. Scrolls to "Recent Projects"
3. Clicks "Client ABC" thumbnail
4. Project opens in appropriate view
5. Continues work

---

## First-Time User Experience

**If user.projectCount === 0:**

Show tooltip on first card:
```
┌─────────────────────────────┐
│ 💡 Tip: Upload a logo to    │
│    extract your brand colors│
└─────────────────────────────┘
     ↓
[Card 1: I Have Inspiration]
```

**Alternative:** Welcome modal on first visit
```
┌────────────────────────────────┐
│  Welcome to Ditto!             │
│                                │
│  Choose your starting point:   │
│  • Got inspiration? Extract it │
│  • Need a template? Browse     │
│  • Start from scratch? Create  │
│                                │
│  [Got It]                      │
└────────────────────────────────┘
```

---

## Remove / Replace

### Remove:
- ❌ AI prompt bar at top (confusing, unclear where it generates)
- ❌ Template chips (redundant with card 2)

### Replace with:
- ✅ 3 clear path cards
- ✅ Better visual hierarchy
- ✅ Clearer CTAs

### Keep:
- ✅ Welcome message
- ✅ Recent Projects section
- ✅ Overall layout structure
- ✅ User avatar/settings in header

---

## Implementation Notes

**Components to create:**
1. `PathCard.jsx` - Reusable card for each path
2. Update `HomeDashboard.jsx` - New layout structure

**Props for PathCard:**
```jsx
<PathCard
  icon={Palette}
  iconGradient="from-primary to-secondary"
  title="I Have Inspiration"
  description="Upload image or paste URL to extract colors, fonts, and style"
  buttonText="Upload Image"
  buttonVariant="primary"
  onClick={handleGoToMoodboard}
  delay={0}
/>
```

**State to track:**
- No new state needed (uses existing navigation)
- Maybe: tooltip dismissed state for first-time users

**Analytics opportunities:**
- Track which path users choose most
- Measure conversion from homepage → first action
- A/B test card copy/order

---

## Questions for Review

1. **Card order:** Inspiration → Template → Blank (current) or different priority?
2. **Template modal vs page:** Open gallery as modal or navigate to full page?
3. **Empty state CTA:** Should "No projects" state have quick action button?
4. **First-time tooltip:** Show on every visit or once per user?
5. **Mobile stack order:** Keep same order on mobile or prioritize differently?

---

## Next Steps

1. ✅ Review wireframe
2. ⏳ Get approval on structure
3. ⏳ Build PathCard component
4. ⏳ Update HomeDashboard layout
5. ⏳ Test flows (all 3 paths + recent projects)
6. ⏳ Polish animations/interactions
7. ⏳ Deploy to staging for user testing
