# Office Grubb — Master Requirements

**Single source of truth.** This document consolidates every Office Grubb requirement scattered across the developer brief, the two feature addenda, the order-status-bar brief, the manifest spec, the design-scope document, and the V2/V3 change order into one reference for build, maintenance, and future updates.

**Prepared:** July 27, 2026 · **Status:** Consolidated / living document
**Owner naming note:** the platform is **Office Grubb** (three-sided marketplace). One early design-scope doc uses the older name "Office Grub" and describes it as two-sided — treat "Office Grubb / three-sided" as current.

### Source documents consolidated here
| # | Document | Contributes |
|---|---|---|
| 1 | Office-Grubb-Developer-Brief-v2 | Platform overview, roles, full fee/billing engine, order flow, features, tax engine, integrations, dashboards |
| 2 | OfficeGrubb Feature Addendum (I) | Features 1–4: Reservations, Special Offers, Office Feed, Order Edit/Cancel window |
| 3 | OfficeGrubb LiveKitchen Addendum (II) | Features 5–7: Live Kitchen, OG Perks, Platform Calendar |
| 4 | Office Grubb Order Status Bar Brief | Two-timer status bar (Edit Lock / Menu Close), states, notifications |
| 5 | Office-Grubb-Manifest-Spec | Dual manifest system + three-tier QR chain |
| 6 | OfficeGrub documentation (design scope) | Design-system scope across portals/apps |
| 7 | internal v2 Combined_OfficeGrubb_ChangeOrder_V2_V3 | 30-item V2 addition register + V3 (driver/dispatch) scope |

> ⚠️ **Conflicts exist between sources** (Live Kitchen fee, Reservation fee). All conflicts are collected in **Part 13 — Open Items to Reconcile**. Do not build the affected billing lines until resolved.

---

## Part 1 — Platform Overview

Office Grubb is a **three-sided marketplace** connecting corporations, their employees, and local restaurants for **scheduled workplace meal delivery** across Greater Boston / Cambridge. Competes with Fooda and ezCater; the differentiator is **next-day advance ordering**.

### Portals & apps
| Portal / App | Primary users & purpose |
|---|---|
| **Admin Portal** | Office Grubb internal team. Full control over accounts, restaurants, drivers, orders, billing, commissions, settings. |
| **Corporate Portal** | Corporate managers + employees. Schedule orders, manage Live Kitchen, book reservations, spending dashboards, subscription. |
| **Restaurant Portal** | Restaurant owners + staff. Receive/manage orders, performance ratings, $15k threshold progress, menu, payouts. |
| **Driver App** | W-2 drivers. Daily routes, confirm pickups, scan order counts, confirm deliveries, report issues. (V3 scope.) |

All portals share a **single data layer with real-time sync**.

### Ordering model (fundamental constraint)
- **Next-day scheduled ordering only** — employees order the day before for next-business-day delivery at a set time.
- **No same-day ordering. No on-demand dispatch.**
- The **Platform Calendar is the only place** advance ordering across multiple days is permitted.

### User roles & permissions
| Role | Permissions |
|---|---|
| OG Super Admin | Full platform access — all accounts, restaurants, drivers, orders, billing, commissions, settings, reports. |
| OG Account Manager | Manage assigned corporate accounts. **Cannot** edit commission rates or billing rules. |
| Corporate Manager | Manage company account, view all employee orders, manage Live Kitchen, spending dashboard, approve/restrict menu access, manage subscription. |
| Employee | Place personal orders, view own history, book personal reservations, earn/redeem OG Perks, access Office Feed. |
| Restaurant Owner | Manage menu, view orders, performance ratings, payout history, commission tier progress, threshold accumulation. |
| Restaurant Staff | View/confirm incoming orders, print labels, mark orders ready for pickup. |
| Driver | View route, confirm pickups, scan order count, confirm deliveries, report issues. |

---

## Part 2 — Fee Structure & Billing Engine

> The billing engine is the most critical component. Every rule must be implemented **exactly** as written; deviation produces incorrect payouts/invoices.

### 2A. Corporate subscription fees (billed 1st of month, due on receipt)
| Tier | Headcount | Monthly range | Rule |
|---|---|---|---|
| Tier 1 | 1–50 | $99–$149 | Corp selects rate at signup. Auto-renews. |
| Tier 2 | 50–200 | $299–$399 | Auto-upgrades when headcount exceeds threshold. |
| Tier 3 | 200+ | $599–$799 | Auto-upgrades when headcount exceeds threshold. |

**Auto-upgrade:** tier increases automatically when employee headcount crosses the current tier ceiling (V2 change-order item 4).

### 2B. Corporate delivery fees — $95 / driver / day, Net-15 split billing
Charged **per driver dispatched**, not per restaurant. Driver count is set by tier.

| Tier | Drivers/day | Daily fee |
|---|---|---|
| Tier 1 | 1 | $95 |
| Tier 2 | 2 | $190 |
| Tier 3 | 3 | $285 |

**Two auto-generated invoices per month per corporate account:** one on the **15th** (days 1–15), one on the **30th** (days 16–30). Each line item: date, driver count, daily rate, total.

### 2C. Restaurant platform fee — 10% permanent
- Flat **10% on all gross food sales**, always — regardless of commission tier, probation, or phase.
- Calculated **first**, before any other deduction; shown as a **separate line** on every payout statement.
- **Does NOT count** toward the $15,000 threshold.
- Platform fee and performance commission are **two separate charges**, always displayed separately.

### 2D. Restaurant performance commission scale (separate variable charge)
| Stage | Perf. comm. | Platform fee | Total | Trigger |
|---|---|---|---|---|
| Q1 | 15% | 10% | **25%** | Default for all new partners. |
| Q2 | 10% | 10% | **20%** | 95%+ on all 3 factors at end of Q1. |
| Q3 | 5% | 10% | **15%** | 95%+ on all 3 factors at end of Q2. |
| Q4+ | 0% | 10% | **10%** | 95%+ on all 3 factors at end of Q3. **Threshold accumulation starts here.** |
| Post-threshold | 9% | 10% | **19%** | Lifetime gross food sales cross $15,000. Permanent thereafter. |
| Probation | 15% | 10% | **25%** | Performance <95% and grace period not met. Threshold accumulation paused (never reset). |

### 2E. The $15,000 lifetime gross food sales threshold
- **Counts:** gross food sales only (pre-fee value of food sold through OG).
- **Excludes:** the 10% platform fee.
- **Accumulation starts only at Q4** (0% commission stage). Q1–Q3 sales do not count.
- **Value:** $15,000 cumulative lifetime — a one-time milestone, crossed once.
- **On crossing:** restaurant moves permanently to the **19%** long-term rate.
- **Never resets** — not for probation, performance drops, or any calendar reason.
- **Probation:** accumulation pauses, resumes on exit from where it left off.
- **Display:** real-time progress bar (current lifetime gross vs. $15,000) on the restaurant dashboard at all times.
- **Live Kitchen** gross food sales **DO** count toward the threshold.

### 2F. Performance rating — 3-factor system
| Factor | Definition | Measured by |
|---|---|---|
| Order Accuracy | Correct items, quantities, customizations. | Employee report at delivery confirmation (auto-flag on missing/wrong item). |
| Timeliness | Order ready when driver arrives at confirmed pickup time. | Driver app: actual vs. scheduled pickup time. |
| Quality | Food leaves properly packaged, correct temperature, presentation intact. | Driver **mandatory photo upload** at pickup before leaving. |

Scored per order; **monthly aggregate** per factor drives tier eligibility. Must hit **95%+ on all three simultaneously** to advance/maintain. Missing one holds the current tier until recovered.

### 2G. Grace period & probation logic
| Scenario | Behavior |
|---|---|
| 1 factor <95% | 30-day grace timer for that factor; rate unchanged. Recover → timer resets. Else → probation. |
| 2 factors drop together | One shared 30-day grace period; both must recover or probation begins. |
| Factors drop sequentially | Each gets its own independent 30-day timer, running concurrently. |
| Grace expires unresolved | Probation auto-triggers → 25% total. Portal + email notification. |
| Recovers during probation | 95%+ on all 3 → probation ends, rate returns to earned rate (19% if threshold crossed, else 10%-only). Accumulation resumes. |
| All 3 factors <70% | Flag for immediate OG Admin review + notification; portal shows warning status. |

### 2H. Reservation fee
Separate from commission and threshold; does **not** count toward $15,000.

| Source rule | Detail |
|---|---|
| **Developer Brief v2 / V2 Change Order** | **$0.95 per person**, charged to restaurant, **Net-30**, aggregated monthly, separate invoice from commission statement. Personal + corporate team bookings. |
| **Feature Addendum I (older)** | Flat per confirmed reservation, triggered only after restaurant confirms attendance: **$10** (1–4 people), **$15–$20** (5+). Not percentage-based. |

> ⚠️ These two fee models conflict — see Part 13.

### 2I. Live Kitchen fee
| Source rule | Detail |
|---|---|
| **Developer Brief v2 / V2 Change Order** | **20% of gross event revenue.** **$800/day minimum** (shortfall added to corporation's next delivery invoice; OG still takes 20% of $800). **$0 setup fee** to corporation. Corporate branding add-on billed separately at cost. LK gross food sales count toward the $15k threshold. |
| **Feature Addendum II (older)** | Flat **$300 per event**, collected **after** the event, does not vary with headcount or sales. |

> ⚠️ These two fee models conflict — see Part 13. (The restaurant-portal Live Kitchen tab already built uses the $300 flat model.)

### 2J. Restaurant onboarding fee
**$99 one-time**, collected at activation **before the first order**. Covers platform setup, menu configuration, label integration, dashboard access. Non-negotiable.

---

## Part 3 — Order Lifecycle

| Step | Actor | Action |
|---|---|---|
| 1 | Employee | Places order (employee portal or Calendar) the day before. Selects restaurant, items, delivery time. |
| 2 | Platform | Logs order, assigns to corporate account, queues for restaurant, sends confirmation, calculates OG Perks. |
| 3 | Restaurant Portal | Receives order (portal + integrated POS); appears in fulfillment queue; restaurant confirms acceptance. |
| 4 | Restaurant | Prepares + packages in labeled containers. Prints OG label (company, employee, order #, ingredients). Marks ready. |
| 5 | Driver App | Receives route, arrives at pickup time, scans QR / confirms count, uploads packaged-food photo, marks pickup complete. |
| 6 | Driver | Loads carriers (Camdolly), drives route to corporate drop. |
| 7 | Corporate Portal | Office manager gets delivery notification; driver checks in, delivers; employee confirms receipt; issues flagged immediately. |
| 8 | Platform | Delivery confirmed; performance ratings updated; commission calc runs; restaurant payout updated. |
| 9 | Billing Engine | Platform fee + commission deducted; $15k counter updated with gross food sales; corporate delivery fee queued for next Net-15 invoice. |

### Wrong / incomplete order refund workflow (V2 item 29)
Employee documents the issue in-app (photos + description) → OG Admin reviews → refund issued (original method or platform credit) with fault attributed to **restaurant** or **driver**. Restaurant deducted for restaurant errors; for driver errors the employee is refunded **without restaurant penalty**. Company-subsidized orders refund to the **corporation**.

---

## Part 4 — Two-Timer Order Status Bar (restaurant-facing)

Sits atop the restaurant order-detail screen. Answers one question at a glance: **is it safe to start cooking?**

### The two-timer model (timers are always exactly 2 hours apart)
| Timer | Governs | At zero |
|---|---|---|
| **Timer 1 — Edit Lock** | Existing orders (edit/cancel). | Existing orders freeze. No further edits/cancellations on prior orders. |
| **Timer 2 — Menu Close** | New orders. | Menu closes. No new orders. Count is final. |

**Key insight:** between Timer 1 and Timer 2 the count can only go **UP**, never down — which is what makes it safe to start prepping at Timer 1.

### Bar states (color logic is deliberate — do NOT use grey→yellow→green)
| State | Trigger | Color | Copy | Timers shown |
|---|---|---|---|---|
| 1 — Pre-lock | now < Timer 1 | **Blue / informational** | "Quantities not final. Hold prep." | "Edits lock in 1:47 • Menu closes in 3:47" |
| 2 — Locked | Timer 1 elapsed, now < Timer 2 | **Yellow / caution** | "Locked orders confirmed — start prep. Late orders may still be added." | "Edits locked ✓ • Menu closes in 1:22" |
| 3 — Final | Timer 2 elapsed | **Green / confirmed** | "Menu closed. Final count confirmed — print manifest and prep for pickup." | Message replaces both timers; no countdown. |

Yellow must not be reused for errors/alerts elsewhere in the restaurant dashboard.

### Business rules
- Order placed **before** edit lock → editable/cancellable until edit lock.
- Order placed **after** edit lock (late window) → **final on placement**; no edit, no cancel, no grace period.
- Edit lock is always exactly 2 hours before menu close.
- Between edit lock and menu close, count may **increase only**.
- After menu close: no placing, editing, or cancelling by anyone.
- **Required employee-facing copy** on late-window orders (non-negotiable): *"This order is final and cannot be edited or cancelled."*

### Implementation & notifications
- Live countdown, re-renders in place without refresh. Green triggered by Timer 2 alone.
- Surface late orders distinctly during State 2 (e.g. **"+1 new order"** indicator).
- Show absolute clock time next to countdown where possible; responsive stacking on narrow viewports.
- **Both timers push a notification** at zero — **SMS and/or email (restaurant's choice, set per restaurant in settings) + non-opt-out in-system alert**. Notification copy references the order number.

---

## Part 5 — Delivery & Manifest System

Every delivery generates **two manifests off one batch**, printed by two parties, never merged. The split is the proof-of-delivery mechanism.

| Manifest | Printed by | Role | Carries |
|---|---|---|---|
| **A — Restaurant** | Restaurant portal | Travels with the driver | The **batch QR** that OPENS the batch |
| **B — Corporation** | Corporate portal | Stays at the drop point | The **close-out QR** that CLOSES the batch |

Both show identical order data (every employee, meal, modification, order #). Only difference: which QR lives on which sheet.

### Three-tier QR chain (enforced order)
| Code | Lives on | Scan does |
|---|---|---|
| **Batch QR** | Manifest A | Opens batch in Dispatch app, loads checklist, starts pickup timer, arms meal-label scanner. |
| **Meal-label QR** | Sticker on each meal/bag | Ticks that employee off. Rejected if not part of the open batch, already scanned, or cancelled. |
| **Close-out QR** | Manifest B | Closes batch, timestamps delivery, pushes confirmation to corporate portal. |

**Sequence:** scan batch QR at restaurant → scan every meal label (departure blocked until all cleared) → lay out meals + photograph table → scan close-out QR at drop point.

### Technical rules
- A meal label won't scan unless its parent batch is open. Error: *"Scan the batch code on the manifest first."*
- Every code carries a short **HMAC** over batch ID + order ID + service date (server-keyed) — kills photographed/reused labels. Close-out code additionally binds **company ID**.
- Only the **assigned driver** can scan the close-out code; restaurant/corporate scans are rejected and logged.
- Codes **expire end of service date**.
- **Offline:** cache batch on open, queue scans, sync on reconnect. Close scan syncs with its **captured** timestamp, not sync time.
- **Print spec:** error-correction level M; batch QR ≥0.95in, meal labels ≥0.75in, close-out QR ≥2.0in; 4-module quiet zone; black on white (no coral fill, no center logo).

### Manifest A (Restaurant) sections
Header (ready-by line + "Delivery Driver Must Take This Page", logo + print timestamp, repeats each page) → **dark identity band** "MANIFEST A — RESTAURANT" → scan strip (large batch QR + 4-step instructions + batch ID) → delivery statement → drop table (drop code, company, address/floor, loading dock, parking, layout, name-tag count) → orders checklist (line #, tick box, employee+company, meal + **modifications in coral**, order #, scan box) → **coral close-out notice** (there is no close-out code here; it's on Manifest B).

### Manifest B (Corporation) sections
Header (delivery window + "Office Contact Must Print and Keep This Page at the Drop Point") → **teal identity band** "MANIFEST B — CORPORATION" → scan strip (full-size close-out QR + office-contact instructions incl. *"The driver scans this code, not you."*) → same delivery statement / drop table / orders checklist but final column reads **"Received"** (office contact ticks anything missing/wrong before the driver's close-out scan) → **chain-of-custody table** (3 scan stages, who scans, what it proves, timestamp) → office-contact notes. **No loading dock / parking info** on B.

### Layout rules
- Nothing gets cut off: long lists flow to page 2 with repeated header + column headers; no row/table/block splits across a page break.
- Identity band mandatory on both (dark=restaurant, teal=corporate); the two must never be confused at a glance.
- Footer on every page: dispatch phone, contact email, batch ID, which copy, page X of Y.
- Letter size, portrait, B&W + brand coral/teal; legible on a cheap office laser printer.

### Data model (one batch renders both manifests — treat all as variables)
`batch_id, service_date, ready_by, printed_at` · `restaurant { id, name }` · `drop { drop_code, company, address, floor_detail, directions, parking, instructions, name_tag_count, drop_window }` · `expected_item_count, drop_count` · `orders[] { line, order_id, employee_name, item, mods, label_qr, scan_state }`

**Recorded events:** `batch.opened` (driver, restaurant, ts, geo) · `order.scanned` (order, batch, ts, sequence) · `batch.departed` (ts, count, exceptions) · `drop.photo` (image URL, ts) · `batch.closed` (driver, company, ts, geo). Restaurant sees stages 1–3; corporate sees 3–5; HQ sees all five.

### Ghost Kitchen identifier (V2 item 24)
Admin-only flag distinguishing multiple restaurants sharing one physical address. Overrides address-based routing for driver assignment; used in manifest QR verification to ensure the driver is at the correct kitchen.

---

## Part 6 — Restaurant Portal Features

- **Public storefront / gallery:** profile, branding, menu display, review summary, optional Google Review link. Gallery of food/environment/team/story photos, managed by the restaurant.
- **Menu management:** item management, pricing, availability, specials, closure scheduling.
- **Modifier group management (V2 item 16):** reusable modifier groups; Required/Optional; options with individual prices; attach to items via modal; modifier tab with group + per-group option management.
- **Order management:** sub-tabs per corporate client; employee order detail; **list view + drag-and-drop Kanban** (New Order → Confirmed → Preparing → Ready for Pickup → Delivered) with a toggle (V2 item 15); two-timer status bar (Part 4); printable Manifest A.
- **Label tab:** browser-printable Avery-compatible label sheets, dynamically filtered by company. **Dual Avery formats (94231 & 5164)** via a format-selector modal; restaurant stock preference saved in settings; allergen bar with wrap logic; **bag-level QR** (one order can be multiple bags); bounding-box print validation; **Print Test Sheet** button (V2 item 3).
- **Special Offers page (free):** percentage discounts (items/categories), limited-time day/hour deals, foot-traffic offers, bundles/combos. Add/edit/remove/archive in real time; prominently shown on the profile. Creation + scheduling tool.
- **Reservations tab:** view incoming bookings; accept or block at-capacity spots; auto-notification on each new booking; confirm attendance (triggers the reservation fee); table assignment; cancel-with-reason.
- **Live Kitchen tab:** per scheduled event — date/time, full corporate address, estimated headcount, confirmed menu, scheduling notification. Restaurant brings warmers/serving setup/POS; employees pay the restaurant directly on-site (OG does **not** process LK payments); OG on-site rep is the point of contact.
- **Calendar tab:** forward-looking weekly/monthly view — which corporations have menus open which days, incoming order days by company, upcoming Live Kitchen events. (Read-only visibility; no ordering.)
- **Accountant / payouts tab:** pie/bar/line charts for Top Corporate Clients, Most Popular Menu Items, Revenue Breakdown; monthly payout statement (gross food sales, platform fee, commission, net); reservation + Live Kitchen statements.
- **Notification tab:** timestamped alert feed with **visually distinct cancellation alerts**.
- **Dashboard:** current commission tier + all 3 performance factors (real time); **$15k threshold progress bar**; order history with per-order accuracy/timeliness/quality; reservation + Live Kitchen history.
- **8-step onboarding wizard (V2 item 14):** Restaurant Information → Cuisine Categories (photo-tile multi-select) → Location (+ store code) → Seating Capacity (indoor/outdoor/ADA) → Branding & Media (logo + cover + ≥2 photos + ≥2 food images) → Operating Hours (per-day toggles + split hours) → Documents (business license, health permit, menu PDF) → Review. Progress stepper (completed/active/upcoming).
- **Staff management + role/permission builder (V2 item 17):** add/deactivate staff with roles; custom role builder across permission modules (Dashboard, Orders, Reservations, Calendar, Label, Menus, Special Offers, Financial, Feedback, Settings); role deletion behind a typed-name confirmation guard.

### Menu discovery mechanics
- **Thumbs-up rating (V2 item 21):** per-item, thumbs-up only (no written reviews). High counts surface items higher; consistent negatives notify the restaurant + OG Admin.
- **Must-Try items (V2 item 22):** OG Admin designates items that pin to the top of the menu; driven by thumbs-up data + admin curation.

---

## Part 7 — Corporate Portal Features

- **Account setup:** both structures — single master account vs. independent accounts.
- **Employee onboarding:** access-code distribution + registration.
- **Checkout configuration:** employee-pay vs. company-subsidized models.
- **Billing dashboard:** invoices, Net-30 due dates, payment-method management.
- **Catering / recurring orders:** catering request submission; recurring order scheduling.
- **Analytics:** spend by department, ordering patterns, dietary trends, subsidy ROI, employee participation rate.
- **Live Kitchen tab:** opt in + pick events/month; OG schedules a different restaurant per day for cuisine variety (informed by employee preference/order data). Enter **estimated headcount** per event (passed to restaurant). Shows upcoming dates + assigned restaurants, cuisine + menu per day, headcount, full past-event history. Included in subscription — **no extra charge to the corporation**.
- **Office Feed (Feature 3 / V2 item 19):** company-level social bulletin board. Employees post food announcements, recommendations, event planning, commentary. **Menu-item recommendations must be clickable links** to that restaurant's menu page with the item visible. Visible to all employees in the account; corporate-admin moderation. Personal reservations don't appear unless the employee posts them.
- **Calendar tab:** mirror of employee view + restaurant view; all employee advance orders; upcoming Live Kitchen events for the office.
- **Corporate event reservations:** company events / team lunches / client dinners appear on the corporate admin dashboard, tracked separately from individual employee bookings.
- **Prints Manifest B** and receives delivery confirmation the moment the close-out code is scanned.

---

## Part 8 — Employee Features

- **Daily menu feed** with category filters (regular interface = current day only).
- **Item customization:** allergy notes, ingredient removals, add-ons.
- **Cart & checkout** reflecting both payment models.
- **Order history + cancellation** within the edit window (Part 4).
- **Order editing/cancellation window (Feature 4):** up to 2 hours before menu close, employees can switch item, remove items, or cancel entirely; synced to the restaurant in real time. After the window, prior orders lock; new orders still allowed until menu close.
- **Reservations (Feature 1):** book at participating restaurants; booker becomes **host**; invite employees/outside guests via unique links; invitees respond **Yes / No / Maybe**; host sees all RSVPs; anyone can add to personal calendar. Personal reservations save to the individual account only — **not** on the corporate admin dashboard. Deposits: 1–2 people none; 3+ people $25–$50 at booking; refundable if cancelled ≥36h before, nonrefundable same-day/<36h.
- **Post-delivery review:** Quality, Accuracy, Affordability ratings; plus per-item **thumbs up**.
- **OG Perks (Feature 6 / V2 item 18):** earn points per dollar spent; accumulate on profile; redeem at a threshold for discounts/free meals. **Earning rate + thresholds + redemption structure are TBD** — build the tab + tracking infra now with placeholders. Tab shows: current balance, earning history (date/order/points), points to next threshold (placeholder), redemption options (placeholder), any active rewards.
- **Notifications:** menu-open alerts, delivery alerts, OG Perks balance changes, new special offers.
- **Calendar tab:** the **only** place for advance ordering — full Mon–Fri week open simultaneously; click any day to browse that restaurant's menu and place a future-dated order; upcoming Live Kitchen events shown. Advance ordering must be **locked to this tab only**, enforced at the system level.

---

## Part 9 — Admin Portal Features

- Full account management (corporations, restaurants, drivers, dispatchers).
- Platform-wide Order tab; internal analytics dashboards.
- Advertising / portal management screens.
- **Quality / commission-cap dashboard** with trigger-alert UI (metric set: on-time delivery, order accuracy, employee survey ratings confirmed; packaging-quality metric under discussion — to be finalized).
- Must-Try designation; thumbs-down escalations.
- **Tax configuration panel** (Part 10) and **tax collection reports**.
- Full **platform-wide Calendar** (mirror of employee/restaurant/corporate views).
- Reporting (Part 11).

---

## Part 10 — Tax Calculation Engine (V2 item 5)

Built-in engine applying the correct rate per transaction based on the **delivery** jurisdiction; fully admin-configurable (no code change to adjust rates). Launch market: **Massachusetts only**.

### Core requirements
- Rates in a **configurable admin database** (not hardcoded); add/edit/deactivate from the admin portal.
- **Jurisdiction hierarchy State → County → City**, each level stacks (e.g. MA state + Suffolk County + Boston city).
- **Food-specific rules** — e.g. MA taxes prepared food (restaurant meals) at **6.25%** but exempts packaged groceries; distinguish categories.
- Tax tied to **delivery address**, not restaurant address.
- **Tax-exempt organizations:** upload + store exemption certificate per corporate account with expiry; tax auto-set to $0.00 until it expires.
- Tax always a **separate labeled line item** on every invoice/receipt — never embedded in price.

### Admin tax configuration panel
Add state (base + food rate, effective date) · add county/city override (auto-stacks) · edit rate (logged w/ timestamp + admin, effective on set date, not retroactive) · **deactivate** (not delete — preserve history) · food-category mapping per state · tax-exempt account management (certificate + expiry, auto re-apply on expiry) · full **audit log** per jurisdiction.

### Calculation order of operations (per taxable transaction)
1. Identify state/county/city of **delivery** address.
2. **Tax-exempt check** — if exempt and valid, tax = $0.00, stop.
3. Determine **food category** and its treatment in that jurisdiction.
4. **Stack** state + county + city rates = total rate.
5. Apply to taxable subtotal; round to 2 decimals.
6. Display as separate line on receipt/invoice/payout; **store rate + jurisdiction permanently** per order.

### Reporting & third-party
- Monthly **tax-collection report** by state/county/city for remittance.
- Restaurant payout statements show tax collected separately from platform fee + commission.
- Corporate invoices show tax as a separate line with rate + jurisdiction.
- Historical orders never retroactively recalculated.
- **Optional 3rd-party APIs:** TaxJar (recommended, Phase 2), Avalara AvaTax (Phase 3, at scale). Phase-1 internal DB is sufficient for MA-only.

---

## Part 11 — Integrations

| Integration | Purpose | Priority |
|---|---|---|
| **Toast POS** | Push OG orders directly into Toast; kitchen sees them as normal tickets. Dominant POS in Boston. | **Launch** |
| **Square POS** | Same direct order-push for Square users. | **Launch** |
| **Generic webhook / API fallback** | For restaurants without a supported POS; else email/portal notification. | **Launch** |
| Clover POS | Mid-size operations. | Phase 2 |
| Revel Systems | Enterprise chains. | Phase 2 |
| Lightspeed | Specialty/boutique. | Phase 3 |
| **Stripe** (incl. Connect) | Corporate subscription billing, delivery invoicing, marketplace restaurant payouts. | **Launch** |
| **ACH / Direct Deposit** | Restaurant net payouts, weekly/bi-weekly. | **Launch** |
| **Twilio SMS** | Alerts to drivers, restaurants, corporate managers. | **Launch** |
| **SendGrid Email** | Order confirmations, invoices, billing alerts, commission statements, timer + threshold notifications. | **Launch** |
| **Push notifications** | Employee order updates, OG Perks changes, new special offers. | **Launch** |
| **Google Maps API** | Multi-stop driver route optimization, real-time traffic, corporate building address validation. (Excluded in V1, now launch.) | **Launch** |
| Mapbox | Cost-optimized alternative to Google Maps at scale. | Optional |
| **DocuSign** | E-signature for restaurant + corporate agreements; stored per account in Admin. | **Launch** |
| QuickBooks Online / Xero | Sync invoices, payouts, commissions to accounting. | Phase 2 |
| Slack / MS Teams | Order + delivery notifications to corporate channels. | Phase 2 |
| Google Workspace / Calendar | Sync Live Kitchen + team lunches to Google Calendar. | Phase 2 |
| HubSpot CRM | Corporate pipeline, onboarding status, renewals; push new signups from Admin. | Phase 2 |

---

## Part 12 — Reporting & Dashboards

- **Admin:** revenue by stream (commission, delivery, subscription, Live Kitchen, reservation, onboarding) daily/weekly/monthly/YTD; restaurant performance ratings sortable by factor; commission-tier distribution; $15k progress per restaurant; corporate account activity; driver performance (on-time, completion, issues); outstanding/overdue invoices.
- **Corporate Manager:** spend by month/employee/restaurant; order history + delivery status; Live Kitchen history + upcoming; employee participation rate; subscription status + next billing date.
- **Restaurant:** current tier + 3 factors (real time); **$15k threshold progress bar**; monthly payout statement (gross → platform fee → commission → net); per-order accuracy/timeliness/quality; reservation history + fee invoices; Live Kitchen history + commission statements.

---

## Part 13 — Open Items to Reconcile ⚠️

These are the material contradictions across source documents. Resolve before building the affected billing/logic.

| # | Topic | Conflict | Recommended resolution |
|---|---|---|---|
| 1 | **Live Kitchen fee** | Addendum II: flat **$300/event** after event. Developer Brief 3I + Change Order item 11: **20% of gross + $800/day minimum**, $0 setup. | Developer Brief v2 + Change Order are the newer commercial source of truth → treat **20% + $800/day min** as canonical; update the built restaurant Live Kitchen tab (currently $300 flat) once confirmed with OG. |
| 2 | **Reservation fee** | Addendum I: **$10 (1–4) / $15–20 (5+)** per confirmed reservation, after attendance. Developer Brief 3H + Change Order item 12: **$0.95/person**, Net-30. | Confirm with OG which model is live. Newer docs favor **$0.95/person Net-30**. |
| 3 | **Naming / sidedness** | Design-scope doc: "Office Grub", two-sided. All others: "Office Grubb", three-sided. | Use **Office Grubb / three-sided** everywhere. |
| 4 | **Commission-cap packaging metric** | Design-scope doc lists packaging-quality as "under discussion"; Developer Brief uses Quality (driver photo) as the 3rd factor. | Confirm whether Quality (driver photo) == the packaging metric or a separate one is still pending. |
| 5 | **Order-edit window vs. two-timer bar** | Addendum I describes a single "2 hours before close" window; Status Bar Brief formalizes it as Timer 1 (edit lock) = 2h before Timer 2 (menu close). | Compatible — the Status Bar Brief is the authoritative refinement; build to the two-timer model. |

---

## Part 14 — Delivery Phasing

| Phase | Scope |
|---|---|
| **V1 (original)** | Core platform — Restaurant/Corporate/Admin portals, Employee app, Restaurant companion app, Stripe Connect, order cycle, rotation engine, review system. |
| **V2 (this scope)** | 30 itemized additions: Bucket A complexity increases (commission engine, 3-invoice billing, dual-Avery labels, subscription auto-upgrade) + Bucket B net-new (tax engine, Toast/Square/webhook, Google Maps, Twilio/SendGrid, DocuSign; Live Kitchen, Reservations, Calendar; onboarding wizard, Kanban, modifier groups, staff/roles; OG Perks, Office Feed, Special Offers, thumbs-up, Must-Try, gallery; ghost-kitchen ID, status bar, 3-factor ratings, dual manifest, three-tier QR, refund workflow, pantry scaffold). |
| **V3 (separate quote)** | **Driver Mobile App** (React Native — vehicle check-in with 6 mandatory live photos + odometer, route dashboard, QR scan flow A→labels→B, departure block, map hand-off, accident + 911 reporting, driver↔dispatch chat, stats, settings); **Dispatch Web Dashboard** (live driver-pin map, online/offline status, order assignment, modular draggable panels); **Admin/Coordinator Dashboard** (superset — account + vehicle management, full visibility); **Multi-driver batch sharing** (shared checklist, collective departure block); **Live GPS tracking infrastructure**. |

### Pantry Replenishment (Phase 2, scaffold only in Phase 1)
Corporate office managers order packaged food/beverages to restock the office pantry on a schedule. Build only the **data structure + routing logic** in Phase 1 so it can be activated later without a rebuild; **no UI** this phase.

---

*End of consolidated master requirements. Update this document (not the scattered source files) as the single point of maintenance going forward.*
