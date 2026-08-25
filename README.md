# Office Grubb — Portal Prototypes

Static HTML/CSS/JS prototypes for the Office Grubb platform. No build step, no
dependencies — two zero-dependency Node servers serve the files.

```bash
node server.js            # Restaurant portal  → http://localhost:3000
node server-corporate.js  # Corporate portal   → http://localhost:3001
```

Both are registered in `.claude/launch.json`.

---

## Layout

| Path | What it is |
|---|---|
| `/` (repo root) | **Restaurant portal** — orders, menu, labels, Live Kitchen, financial, calendar |
| `/corporate` | **Corporate portal** — dashboard, employees, manifests, announcements, invoices, onboarding |
| `/assets/figma` | Shared logo and avatar assets |
| `OfficeGrubb-Master-Requirements.md` | Consolidated requirements (see caveat below) |

### Shared design system

The corporate portal deliberately loads the **restaurant portal's own stylesheets**
rather than duplicating them:

- `styles.css` — layout, `.app` shell
- `figma-tokens.css` — colour/spacing tokens
- `figma-nav.css` — the `.fside` sidebar and `.ftopbar` components
- `dashboard.css` — `.db-grid`, `.db-card`, `.db-kpi`, chart primitives

`corporate/corp-dashboard.css` holds **additions only**. `corporate/corp-nav.js`
mirrors `figma-nav.js` exactly — same markup, same classes, same collapse state key —
and differs only in its item list.

Typeface is Inter throughout. Brand is `#ff4f2f` / `#fe2c11`.

---

## Corporate portal screens

| Screen | File | Source |
|---|---|---|
| Dashboard | `corporate/index.html` | Built from the Claude artifact design |
| Employees | `corporate/employees.html` | Built from the supplied design |
| Delivery manifests | `corporate/manifests.html` | Built from the supplied design |
| Invoices and chargeback | `corporate/invoices.html` | Built from the supplied design |
| Announcements | `corporate/announcements.html` | Designed here — **not** from a supplied design |
| Onboarding (12 steps) | `corporate/onboarding.html` | Designed here, from the PRD |
| Plan chooser | `corporate/plans.html` | Designed here, from the tier spec |

All data is **placeholder**. Nothing is wired to an API; "send", "print" and "export"
controls are presentational.

---

## Open decisions

These are unresolved contradictions between source documents. They affect billing and
should be settled before implementation.

### 1. Two pricing models are in play

The **billable-headcount model** (latest doc) prices per served site:

| Tier | Site headcount | Monthly |
|---|---|---|
| 1 | 0–75 | $119.99 |
| 2 | 76–180 | $299.99 |
| 3 | 181–499 | $499.99 |
| 4 | 500+ | Banded quote, $1.25/employee hard floor |

The **corporate-account model** (earlier PRD, and what `onboarding.html` implements)
prices per account on total headcount across all locations, at $99–$799/month plus
$95/driver/day delivery.

The artifact dashboard uses a **third** vocabulary — daily credit, enrolment, guests,
drop points. Same product, three descriptions.

### 2. Band boundaries invert the price

Under the Tier 4 bands, growing costs less:

| Badged | Band | Monthly |
|---|---|---|
| 999 | 4A | $1,498.50 |
| **1,000** | **4B** | **$1,400.00** — cheaper for one more person |
| 2,499 | 4B | $3,498.60 |
| **2,500** | **4C** | **$3,250.00** |

Floors are set at band-minimum × band-rate, which produces the inversion at every
boundary.

### 3. Tier bands overlap at the edges

Earlier tiers read "1–50", "50–200", "200+". Exactly 50 and exactly 200 are ambiguous.
Current code treats the upper bound as inclusive.

### 4. Chargeback does not reconcile

On `invoices.html`, department chargeback totals **3,319 orders / $49,785.00**, while
the current-period statement above it says **2,602 orders / $40,320.00**. The
statement's own arithmetic is exact (subtotal $40,564 × 6.25% = $2,535.25 tax =
$43,099.25 total). The chargeback figures came from the supplied design and were
reproduced verbatim rather than corrected.

### 5. "Employees pay nothing at every tier"

Read here as *nothing toward the subscription*. Under the other reading, meals are free
to employees and the entire checkout-configuration step (employee-pays vs
company-subsidised) disappears.

### 6. Account structure

Confirmed: there is no separate "independent account" type. Every account is a master
account; a location is a drop-off point on it, never its own account. All settings and
all employees live at the master level, and every location receives the same restaurant
rotation. `onboarding.html` reflects this.

---

## Caveat on the requirements doc

`OfficeGrubb-Master-Requirements.md` predates reconciliation against
`OfficeGrubb_Master_Platform_Spec_v3`. Where they disagree, **v3 wins**. Two known
errors in the consolidated doc:

- It says Live Kitchen sales count toward the restaurant's $15,000 threshold. They do
  not — the two fee tracks are separate.
- It describes the old flat $300/event Live Kitchen fee. The current model is 20% of
  gross event revenue with an $800/day minimum.

---

## Figma

Restaurant portal file: `XppHVHyLCJPkAryGa3BNhj`. A **Corporate Onboarding** section
(12 frames, auto-layout, bound to the file's Inter type ramp and colour variables) was
pushed to that file and sits below the existing sections on the Restaurant page.

It is currently **three revisions behind** this repo — it predates the Zenkoders
personalisation, the Live Kitchen agreement gate, and the account-structure rework.
