# Calendar — Notes & Spec

Restaurant-portal **Calendar** tab (`calendar.html` · `calendar.css` · `calendar.js`). A forward-looking scheduling hub that gives the restaurant one view of everything committed on the Office Grubb platform. Built to the Figma design and the v3 spec (§7.6).

---

## 1. Purpose
Give Sofia's Kitchen a single place to see, at a glance:
- Which days have **incoming corporate orders** (and from which company).
- Which days have **dine-in reservations**.
- Which days they're scheduled for **Live Kitchen** on-site events.

Helps the kitchen understand upcoming workload, prep capacity, plan staffing, and avoid missed commitments.

---

## 2. Event types (3)
| Type | Colour | Chip / drawer shows |
|---|---|---|
| **Order** | 🟡 amber `--cal-order #F5A623` | company · order count · delivery time |
| **Reservation** | 🟣 purple `--cal-resv #7C3AED` | host · company · party size · table · time |
| **Live Kitchen** | 🔴 red `--cal-live #fe2c11` | company · time · headcount · location · menu |

> **Menu Availability is intentionally NOT shown** on the calendar (removed per the Figma design). Menu-type events are filtered out in `passes()`.

Legend sits top-right of the header: **Order · Reservation · Live Kitchen**.

---

## 3. Views
- **Month** (default) — 7-column grid, **week starts Monday** (Mon…Sun). Cream weekday header row. 6 weeks (42 cells); out-of-month days dimmed.
- **Weekly** — 7 day-columns (Mon-start) with full event cards; each column scrolls (max-height) so a busy day doesn't stretch the row.
- View toggle in the toolbar: **Weekly / Month** (Month active by default). (An Agenda renderer exists in code but isn't exposed in the toggle.)

---

## 4. Toolbar
Left → right: **Period label** (e.g. "July 2026", bold) · **‹ ›** nav arrows · **Today** button — then spacer — **Weekly/Month** toggle · **Filters** button (funnel icon + active-count badge).

- `‹ ›` move by month (Month) or by week (Weekly).
- **Today** jumps to `REF_TODAY` (demo "today" = **Thu, Jul 30, 2026**), highlighted with a coral circle on the date number.

---

## 5. Event chips (month cells)
White card with a **coloured left bar** (by type) + a small round **avatar** + **company name** + **time** on the right. Cancelled events are struck-through/dimmed.

Density handling:
- **≤ 3 events** on a day → individual chips.
- **> 3 events** → a **workload summary**: coloured **count pills** per type (e.g. `🟡3 🔴2 🟣25`) + "`N events · view day`". Keeps the grid readable no matter how busy.

---

## 6. Day drawer (dense days)
Clicking a day cell (or its summary) opens a right-side **Day drawer**:
- Header: weekday + full date + total event count.
- **Summary counts** by type (e.g. "3 Corporate Orders · 2 Live Kitchen · 25 Reservations").
- **Grouped, scrollable list** — one section per type, each row clickable.
- Clicking a row opens that event's detail drawer with a **‹ back to [date]** link that returns to the day drawer.

---

## 7. Event detail drawer
Right slide-in with a colour-matched hero; fields per type:
- **Order** — Corporation, Date, Delivery time, # orders, Status, **ordered-items** list. CTA **View orders** → `order-detail.html?company=…`. Upcoming also: Contact OG · Request cancellation.
- **Reservation** — Corporation, Host, Date, Reservation time, Party size, Table, Status. CTA **View reservation** → `reservations.html`. Upcoming also: Contact host · Cancel reservation.
- **Live Kitchen** — Corporation, Date, Event time, Location, Expected headcount, **Menu details** chips, Status. CTAs: View event → `live.html` · Contact OG · Request cancellation (upcoming).

Note: **Menu-availability days route through the Order CTA** (View orders → the corporation's order flow), since a menu-open day is that company's ordering day.

---

## 8. Filters (popover)
- **Event type** — All · Order · Reservation · Live Kitchen (multi-toggle).
- **Corporation** — search + multi-select of companies present in the data.
- **Status** — Upcoming · Completed · Cancelled.
- **Reset** clears all. The Filters button shows an **active-count badge**.

## 9. Empty state
When filters hide everything (or no events in range): a dashed card — **"No upcoming events. Your scheduled corporate orders and Live Kitchen events will appear here."**

---

## 10. Data model
`EVENTS[]` (seed) — each event:
```
{ id, type:'order'|'reservation'|'live'|'menu', company, date:'YYYY-MM-DD', status:'upcoming'|'completed'|'cancelled',
  // order:       orders, time
  // reservation: host, party, table, time
  // live:        time, headcount, location, menu[]
  // menu:        expected  (excluded from display)
}
```
- `REF_TODAY` is the fixed demo "today" so seeded events stay relevant.
- Two demo dense days are seeded: **Jul 16** (3 orders · 2 Live Kitchen · 25 reservations) and **Jul 9** (1 · 1 · 12) to exercise the summary + day drawer.
- Browser `Date` is used for grid math (Monday-start via `startOfWeek`).

---

## 11. Design tokens (Figma)
- Type colours: `--cal-order #F5A623`, `--cal-resv #7C3AED`, `--cal-live #fe2c11`.
- Today badge: `--accent` coral circle.
- Weekday header: cream (`--surface-2`).
- Chrome: shared white sidebar + top bar (`figma-nav.js/css`), Inter, light-only.

---

## 12. Open / possible follow-ups
- Dense-day **summary pills** still use the older calendar dot colours — could be re-tinted to the amber/purple/red set for exactness.
- **Agenda** view is coded but hidden from the toggle — expose if wanted.
- Wire chips/drawers to the same live seed data used by the Orders / Reservations / Live Kitchen tabs (currently the calendar has its own seed).
- Weekly view could gain the same dense-day summary treatment as Month.
