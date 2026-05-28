---
name: Neo-Analytic Narrative
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#434653'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#1c57ca'
  primary: '#1754c7'
  on-primary: '#ffffff'
  primary-container: '#3c6ee1'
  on-primary-container: '#fefcff'
  inverse-primary: '#b3c5ff'
  secondary: '#7a5900'
  on-secondary: '#ffffff'
  secondary-container: '#fdbc13'
  on-secondary-container: '#6b4d00'
  tertiary: '#a4371a'
  on-tertiary: '#ffffff'
  tertiary-container: '#c54f2f'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#001849'
  on-primary-fixed-variant: '#003fa3'
  secondary-fixed: '#ffdea3'
  secondary-fixed-dim: '#fdbc13'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4200'
  tertiary-fixed: '#ffdbd2'
  tertiary-fixed-dim: '#ffb4a1'
  on-tertiary-fixed: '#3c0800'
  on-tertiary-fixed-variant: '#862205'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display:
    fontFamily: Anton
    fontSize: 80px
    fontWeight: '400'
    lineHeight: 80px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Anton
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 48px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Anton
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 32px
  headline-md:
    fontFamily: Anton
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 28px
  body-lg:
    fontFamily: Chivo
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Chivo
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
spacing:
  unit: 4px
  gutter: 24px
  margin-edge: 32px
  shadow-offset: 8px
  border-weight: 4px
---

## Brand & Style
This design system embraces a **Premium Neo-Brutalist** aesthetic, specifically tailored for a high-end GitHub repository analysis dashboard. The brand personality is authoritative yet irreverent—transforming dry technical data into a vibrant, editorial experience. It targets sophisticated developers and engineering managers who value both precision and personality.

The style is characterized by "Ink and Paper" foundations contrasted with high-energy digital accents. It utilizes heavy 4px strokes, zero-radius hard shadows, and flat color blocking to create a tactile, physical UI that feels like a modern technical zine. The emotional response is one of clarity, confidence, and playful engagement.

## Colors
The palette is built on a warm, archival base to reduce eye strain while maintaining a "premium paper" feel. 

- **Foundations:** The `#F6F1E8` background and `#FFFDF8` surface create a subtle parchment-like layering. All structural elements, borders, and text use the `#111111` Ink for maximum "bite."
- **Accents:** We use a high-contrast spectrum for data visualization and state indication. 
    - **Primary (Blue):** Core actions and repository identity.
    - **Secondary (Gold):** Stars, highlights, and warnings.
    - **Tertiary (Coral):** Deletions, alerts, and critical metrics.
    - **Pastels (Mint, Lavender, Pink):** Used for category tagging, language distributions, and decorative geometric flourishes.

## Typography
Typography is the primary driver of the editorial-tech feel. 

- **Headlines:** We use **Anton** for its aggressive, condensed, and impactful presence. It should be treated as a graphic element. Display sizes use tight leading and negative tracking to feel "locked in."
- **Body:** **Chivo** provides a sharp, contemporary sans-serif balance that remains legible in dense data environments.
- **Data & Metadata:** **JetBrains Mono** is used for all technical strings, commit SHAs, and stats to maintain the developer-centric utility of the dashboard. 

All headings should be set in Uppercase when used for UI labels or section titles to reinforce the Neo-Brutalist structure.

## Layout & Spacing
The layout follows a rigid **12-column fixed grid** on desktop, emphasizing clear vertical and horizontal "gutters" that act like print columns. 

- **The 8px Rule:** All depth is created through a consistent 8px hard offset. Elements do not "float"; they are "propped up" by their shadows.
- **Rhythm:** Spacing follows a 4px baseline, but internal padding is generous (24px+) to prevent the heavy borders from feeling claustrophobic.
- **Adaptation:** On mobile, the grid collapses to a single column. The 8px shadows are maintained, but margins are reduced to 16px to maximize the "content ink" area.

## Elevation & Depth
This design system rejects all gradients, blurs, and soft lighting. Depth is strictly binary and structural.

1.  **Level 0 (Floor):** The `#F6F1E8` background.
2.  **Level 1 (Surface):** The `#FFFDF8` cards. These feature a 4px black border and a solid 8px black shadow offset to the bottom-right (X: 8px, Y: 8px).
3.  **Interaction Depth:** When an element is hovered, the shadow offset reduces to 4px and the element translates 4px towards the shadow. On active (click), the shadow offset becomes 0px, and the element "bottoms out" against the background.

Geometric decorations like "stars" or "zig-zags" are used as floating Level 2 elements to break the grid and add quirkiness to empty states or header sections.

## Shapes
The shape language is strictly **Sharp (0px)**. Every corner is a crisp 90-degree angle. This reinforces the architectural and brutalist nature of the design. 

The only exceptions are decorative elements: 
- **Z-Patterns:** Used for section dividers.
- **8-Point Stars:** Used for "Starring" repositories or highlighting "Trending" metrics.
- **Circles:** Used exclusively for user avatars or language-color indicators, creating a high-contrast visual break from the otherwise rectangular UI.

## Components

- **Buttons:** Large, rectangular, with 4px borders. Primary buttons use `#4C7CF0` with white text. On hover, the button physically shifts 4px down-right to partially "cover" its own 8px shadow.
- **Cards:** White surfaces (`#FFFDF8`) with 4px black borders. Header areas within cards should be separated by a 4px horizontal rule.
- **Segmented Tabs:** Chunky blocks that look like physical toggles. The "Selected" state uses a solid `#111111` fill with white text, while unselected states remain transparent with a 4px border.
- **Input Fields:** Thick borders that thicken even further (to 6px or 8px) or change to a bright accent color when focused. Use JetBrains Mono for placeholder text.
- **Chips/Tags:** Small, rectangular boxes with flat color fills (Mint, Lavender, Pink). These do not have shadows to distinguish them from actionable buttons.
- **Repository List:** Each item is a "slab" with a 4px bottom-border only, creating a stacked-paper effect.
- **Metric Tiles:** Square cards featuring a large "Display" size number in the center and a small Mono label in the top-left corner.
