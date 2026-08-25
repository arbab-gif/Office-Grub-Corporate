# Dev Note — Commission Stage Hex Stepper

The horizontal 5-badge hexagon stepper in the **Commission & Fees** card (`dashboard.html` → `.cs-stepper`, styles in `dashboard.css`). Visualizes the restaurant's position on the commission ladder Q1 → Q2 → Q3 → Q4 → $15000.

Design reference: amber checks for completed stages, a coral hex with a glowing white dot for the current stage, faint outline hexes for upcoming stages.

---

## 1. Markup anatomy

One `.cs-hexwrap` per stage. Each holds the hex, a caption, and a hover tooltip:

```html
<div class="cs-hexwrap done">           <!-- state class: done | now | next -->
  <div class="cs-hex">
    <span class="bg"></span>              <!-- outer hexagon (acts as border) -->
    <span class="face">Q1</span>          <!-- inner hexagon (fill); holds check / label / dot -->
  </div>
  <div class="cs-cap">Q1</div>            <!-- label under the badge -->
  <div class="cs-tip"><b>Q1 · 25% total</b>…rate breakdown…</div>
</div>
```

- `.bg` and `.face` are two stacked hexagons. `.bg` fills the box (`inset:0`); `.face` is inset `2px`, which produces the visible ~2px border ring. Both share the same `clip-path`.
- Stepper container: `display:flex; justify-content:space-between;` — 5 wraps, `flex:1` each.

## 2. Hexagon shape

**Flat-top** hexagon (flat top & bottom edges, points on left/right):

```css
clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%);
```

Hex box: `width:50px; height:46px`. (The previous pointy-top polygon `50% 0,100% 25%…` was replaced to match the design.)

## 3. State styles (exact values)

| State | Class | `.bg` / `.face` fill | Inside face | Caption |
|---|---|---|---|---|
| **Completed** | `.done` | `linear-gradient(160deg,#FFCF5E,#F7A927)` (amber/gold) | check svg, `stroke:#2d2d2d` (dark) | dark `--neutral-900` |
| **Current** | `.now` | `var(--brand-400)` (#ff4f2f coral) | white dot + red glow | coral `--brand-400` |
| **Upcoming** | `.next` | `.bg` = `--neutral-200`, `.face` = `#fff` | short label, `--neutral-400` | dark `--neutral-900` |

Base `.face` text: Inter 800 / 12px. Check svg: `19px, stroke-width 3.2`.

### Current-stage dot + glow
The dot is CSS-only, so **any** hex given `.now` gets it automatically (no per-stage markup):

```css
.cs-hexwrap.now .cs-hex .face{font-size:0;color:transparent;}          /* hide the label */
.cs-hexwrap.now .cs-hex .face::after{content:"";width:14px;height:14px;border-radius:50%;background:#fff;}
.cs-hexwrap.now .cs-hex{filter:
  drop-shadow(0 0 9px  color-mix(in srgb,var(--brand-400) 75%,transparent))
  drop-shadow(0 6px 12px color-mix(in srgb,var(--brand-400) 45%,transparent));}
```

Because `.face` is `display:grid; place-items:center`, the `::after` dot centers itself. The label text stays in the DOM (for the tooltip/caption reference) but is hidden via `font-size:0`.

## 4. Captions

Match the design labels exactly: `Q1  Q2  Q3  Q4  $15000` (Inter 800 / 13px). Current stage caption turns coral via `.cs-hexwrap.now .cs-cap`.

## 5. Hover tooltip

`.cs-tip` — dark navy bubble above the badge with the stage's **total rate + trigger condition**. Shown on `.cs-hexwrap:hover`. Edge wraps are anchored so tips never clip:
- `:first-child` → left-aligned, arrow shifted left.
- `:last-child` → right-aligned, arrow shifted right.
- Tips are `pointer-events:none` and disabled while the card is greyed (`.cs.cs-onprob .cs-stepper{pointer-events:none}`).

## 6. Changing the active stage (demo)

The stepper is **static HTML** in the demo — to move the restaurant to a different stage, shift the state classes:
1. Set every stage before the current one to `.done` (amber check).
2. Set the current stage to `.now` (coral dot — auto-applied by CSS).
3. Set every later stage to `.next` (outline).
4. Update `.cs-progress` (`Stage N of 5`), the `.cs-rate` hero (total %), `.cs-split`, and the **Payout Summary** + **$15k Threshold** cards to match — these are not yet auto-linked (see `commission-notes.md` §7).

Example at Q4: Q1/Q2/Q3 = `.done`, Q4 = `.now`, $15000 = `.next`, and the threshold bar flips from "Not started" to accumulating.

## 7. Notes / follow-ups

- **Rounded corners:** the design's hex corners look slightly rounded; `clip-path` can't round — accepted as sharp. If needed, swap to an inline SVG hexagon with `stroke-linejoin:round`.
- **Reuse:** the same `.bg`/`.face` two-layer + `clip-path` pattern also drives the Performance Rating card's factor bars styling language — keep the amber/coral/neutral roles consistent if reused elsewhere.
- **A11y:** hover tooltips are mouse-only. If this ships, add `tabindex`/`aria-label` on `.cs-hex` and a focus-visible state so keyboard users get the stage info.
- **Data-driven build:** when wired to real data, render the wraps in a loop from the stage list and assign `done/now/next` by comparing each stage's index to the restaurant's current stage index.

See also: `commission-notes.md` (billing rules + backend contract), [[officegrubb-canonical-rules]] (memory).
