# Dev Note — Commission & Fees + $15,000 Lifetime Threshold

Scope: the two billing widgets on the restaurant **Dashboard** (`dashboard.html` · `dashboard.css`). Implements v3 spec §3C–3F. This note is the source of truth for how the UI encodes the billing rules and what the backend must feed it.

> ⚠️ The current build is a **front-end demo** — all figures are hard-coded / simulated in the inline `<script>` at the bottom of `dashboard.html`. Nothing here calculates real money. Backend must own every number below and pass it in; the UI only renders + styles state.

---

## 1. The two charges are SEPARATE (never merge them)

Every payout/invoice has **two independent charges**:

| Charge | Rate | Notes |
|---|---|---|
| **Platform fee** | **10%, permanent** | Never changes, never goes away. Applies in every stage incl. probation & post-threshold. |
| **Performance commission** | **variable** (15→10→5→0→9%) | Scales with quarterly performance. Separate line item. |

Hard rules (§3C):
- **Platform fee is calculated FIRST**, before any other deduction.
- Platform fee is shown as its **own line** on every payout statement (see Payout Summary card: Gross → Platform fee → Commission → Net).
- Platform fee **does NOT count** toward the $15,000 threshold.

There is **NO** "Gold/Platinum" tier and **NO** 8% rate. An earlier build shipped a fabricated "Gold 8% / 420-of-500-orders → Platinum" model — that was **wrong** and has been removed. Do not reintroduce order-count tiers.

---

## 2. Commission scale (§3D) — the hex stepper

The `.cs-stepper` renders 5 stages as hexagon badges. Total = platform (10%) + commission.

| Stage | Perf. comm | Platform | **Total** | Trigger |
|---|---|---|---|---|
| Q1 | 15% | 10% | **25%** | Default for all new partners. |
| Q2 | 10% | 10% | **20%** | 95%+ on all 3 factors at end of Q1. |
| Q3 | 5% | 10% | **15%** | 95%+ on all 3 factors at end of Q2. |
| Q4+ | 0% | 10% | **10%** | 95%+ on all 3 factors at end of Q3. **$15k accumulation starts here.** |
| $15k+ | 9% | 10% | **19%** | Lifetime gross crosses $15,000. Permanent from then on. |
| PROBATION | 15% | 10% | **25%** | A factor <95% and grace not met (see §5). |

Badge states (CSS classes on `.cs-hexwrap`):
- `.done` — solid navy + white check (completed stage).
- `.now` — solid coral (current stage). Caption `Qx · now`, `.cs-progress` shows `Stage N of 5`.
- `.next` — outlined grey (upcoming stage).
- **Hover** any badge → `.cs-tip` tooltip with that stage's rate breakdown + trigger. Edge badges anchor left/right so the tip never clips off-card.

To change the restaurant's stage in the demo: edit `.cs-rate-big`, `.cs-split`, `.cs-progress b`, and move the `.now`/`.next` classes in the markup. Payout Summary + Threshold card must be updated to match (they are NOT auto-linked yet — see §7).

---

## 3. $15,000 Lifetime Threshold card (§3E)

A running **lifetime** counter, per restaurant. Element: `.thr` (bar `.thr-track i`, figure `.thr-fig .cur`).

- **Counts:** gross food sales only (the $ value of food sold), before any fee.
- **Excludes:** the 10% platform fee. Also excludes **Live Kitchen** gross (separate fee track — see canonical rules).
- **Accumulation starts ONLY at Q4+** (0% commission stage). Q1/Q2/Q3 sales do **not** count. → At Q1–Q3 the bar shows **$0 / $15,000, "Not started"**.
- **Crossed once**, at exactly $15,000 cumulative. → restaurant moves to **19% total (10% + 9%)** permanently.
- **NEVER resets** — not for probation, performance drops, or any calendar reason.
- **Probation pauses** accumulation; it **resumes from where it left off** on exit.
- **Display requirement:** the progress bar must be visible on the dashboard at all times.

Bar width = `min(100, lifetimeGross / 15000 * 100)%`. Marks row shows `$0` / `N% reached` (or `Not started`) / `$15,000`.

---

## 4. Performance rating (§3F) drives everything

Three factors, scored **per order**, aggregated monthly. Gate = **95% on ALL THREE simultaneously** to advance/hold tier. Missing one holds the restaurant at its current stage.

| Factor | Measured by |
|---|---|
| **Order Accuracy** | Employee confirms correct items/qty/customizations at delivery. |
| **Timeliness** (On-Time Delivery) | Driver-confirmed actual pickup time vs scheduled. |
| **Quality** | Driver mandatory photo of food condition at pickup. |

UI: the **Performance Rating** card renders these from a `factors` array (`[{name, value}]`, `GATE = 95`). The same array feeds the probation/grace logic below — keep them reading one source so the two cards never disagree.

---

## 5. Grace / Probation states (the badge)

Element `#csProb`, rendered by `window.OGrenderProbation(factors)`. `GRACE_DAYS` = days left in the 30-day grace window (`0` = expired → on probation).

Decision logic:
```
failing = factors.filter(f => f.value < 95)
if failing.length === 0   → badge hidden, card full color
else if GRACE_DAYS > 0     → GRACE state   (amber, ladder full color, accumulation still on)
else                       → PROBATION state (red,  ladder GREYED, rate 25%, accumulation paused)
```

| State | Badge | Class | Ladder | Copy subject |
|---|---|---|---|---|
| Healthy | *(hidden)* | — | full color | — |
| Grace | `⚠ Grace period · N days left` | `.cs-prob.grace` | **full color** (still progressing) | "This/These/All three score(s)" |
| Probation | `● On probation · 25%` | `.cs-prob.active` + `.cs.cs-onprob` | **greyed + `Stage · Paused`** | same |
| All 3 low | label → `⚠ All scores low` (grace) | `+ .all` | — | "All three scores" |

- Each failing factor renders one `.cs-prob-f` row (name + score pill). Pill is amber in grace, red in probation. Works for 1, 2, or 3 rows.
- **Grey-out** (`.cs.cs-onprob`) desaturates + dims `.cs-rate` and `.cs-stepper`, disables stepper hover, and appends red `· Paused` to `.cs-progress`. Applied in the **probation** branch only — grace never greys.
- Copy is plain-language and auto-fills the failing factor name(s) + `GRACE_DAYS`. No jargon ("threshold accumulation", "recover to 95%+").

---

## 6. Worked example (demo default = Q3, healthy)

Gross this period **$9,200**:
- Platform fee (10%) = **−$920.00** (always, first)
- Performance commission (Q3 = 5%) = **−$460.00**
- **Net payout = $7,820.00**
- Threshold: **$0 / $15,000, Not started** (accumulation begins at Q4+)

At Q4+ the same gross → commission 0% → Net **$8,280**, and the threshold bar begins filling.

---

## 7. Backend contract / TODO

The UI needs one payload per restaurant per period:
```jsonc
{
  "stage": "Q3",                 // Q1|Q2|Q3|Q4|POST_THRESHOLD|PROBATION
  "platformFeePct": 10,          // always 10
  "commissionPct": 5,            // 15|10|5|0|9|15(probation)
  "grossFoodSales": 9200.00,     // this period, pre-fee
  "lifetimeGross": 0,            // counts only Q4+ sales, LK excluded, never resets
  "thresholdReached": false,
  "factors": [                   // rolling 30-day aggregates
    { "name": "Order Accuracy",   "value": 97.0 },
    { "name": "On-Time Delivery", "value": 95.5 },
    { "name": "Food Quality",     "value": 96.8 }
  ],
  "graceDaysLeft": null          // null=healthy, >0=grace, 0=on probation
}
```

Open items:
- **Wire the cards to real data** — Commission stepper, Payout Summary, and Threshold currently hold independent hard-coded values; a stage change must update all three together. Fold them into one render fn like `OGrenderProbation`.
- **Confirm grace length** — spec says 30-day grace before probation; `GRACE_DAYS` is a demo countdown, not a real clock.
- **Post-threshold display** — no dedicated demo state yet for the 19% permanent stage (badge/stepper handle it, but Payout/Threshold copy for "crossed" isn't built).
- **Live Kitchen exclusion** — threshold must subtract LK gross; enforced in backend, surfaced in the card's sub-label.

See also: [[officegrubb-canonical-rules]] (memory) for the authoritative rule set, and `calendar-notes.md` for the sibling notes format.
