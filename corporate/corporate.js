// Office Grubb — Corporate Portal shell. Sidebar + view router.
// Dashboard is built out; the remaining tabs render their spec scope so the
// nav is walkable while the screens get designed.
(function () {
  var ICONS = {
    dashboard:'<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
    orders:'<path d="M9 4h6v3H9z"/><path d="M15 5h2a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h2"/><path d="M9 12h6M9 16h4"/>',
    calendar:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
    live:'<path d="M12 3a4 4 0 00-3.8 2.8A3.5 3.5 0 006 12a3 3 0 003 3h6a3 3 0 003-3 3.5 3.5 0 00-2.2-6.2A4 4 0 0012 3z"/><path d="M8 15v4a1 1 0 001 1h6a1 1 0 001-1v-4"/>',
    feed:'<path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    reservations:'<path d="M4 5h16v6H4z"/><path d="M4 11c0 5 4 8 8 8s8-3 8-8"/>',
    employees:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M16 5.2a3.2 3.2 0 010 5.6M18 20c0-2.4-1-4.2-2.6-5.2"/>',
    billing:'<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M6 15h4"/>',
    analytics:'<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
    pantry:'<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 016 0v2"/>',
    manifest:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h5"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 00-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 00-1.7-1L14.6 3H9.4l-.3 2.6a7 7 0 00-1.7 1l-2.3-1-2 3.4L5 11a7 7 0 000 2l-2 1.5 2 3.4 2.3-1a7 7 0 001.7 1l.3 2.6h5.2l.3-2.6a7 7 0 001.7-1l2.3 1 2-3.4-2-1.5a7 7 0 00.1-1z"/>'
  };

  // Scope text below comes from the master requirements, Part 7 (Corporate Portal Features).
  var VIEWS = {
    dashboard: { label:'Dashboard', group:'Overview', title:'Dashboard', sub:'Northwind Analytics · Tier 2 · 138 employees' },
    orders: { label:'Orders', group:'Overview', title:'Orders', sub:'All employee orders across the account',
      lead:'Every employee order placed against the corporate account, grouped by day and restaurant.',
      items:['Order history with live delivery status per batch.',
             'Delivery confirmation the moment the driver scans the <b>close-out QR</b> (Manifest B).',
             'Wrong / incomplete order flagging routed to the refund workflow.',
             'Checkout model per order — <b>employee-pay</b> vs <b>company-subsidized</b>.'] },
    calendar: { label:'Calendar', group:'Overview', title:'Calendar', sub:'Mirror of the employee + restaurant views',
      lead:'The corporate mirror of the platform calendar.',
      items:['All employee <b>advance orders</b> — up to 5 days ahead, within the same working week.',
             'Advance ordering is locked to the calendar tab only, enforced at the system level.',
             'Upcoming Live Kitchen events for the office.'] },
    live: { label:'Live Kitchen', group:'Programs', title:'Live Kitchen', sub:'Included in the subscription — no extra charge',
      lead:'Opt in and choose how many events per month. OG schedules a different restaurant per day for cuisine variety, informed by employee preference and order data.',
      items:['Enter <b>estimated headcount</b> per event — passed straight to the restaurant.',
             'Upcoming dates with assigned restaurant, cuisine and menu per day.',
             'Full past-event history.',
             '<b>$0 setup fee</b> to the corporation; corporate branding add-on billed separately at cost.',
             'The only LK charge that can reach a corporate invoice is the <b>$800/day minimum shortfall</b>, added to the next delivery invoice.'],
      note:'Live Kitchen sales do NOT count toward the restaurant $15k threshold — two separate fee tracks.' },
    feed: { label:'Office Feed', group:'Programs', title:'Office Feed', sub:'Company-level social bulletin board',
      lead:'Employees post food announcements, recommendations, event planning and commentary.',
      items:['Menu-item recommendations must be <b>clickable links</b> to that restaurant’s menu page with the item visible.',
             'Visible to all employees on the account.',
             'Corporate-admin moderation.',
             'Personal reservations never appear here unless the employee posts them.'] },
    reservations: { label:'Reservations', group:'Programs', title:'Corporate Reservations', sub:'Company events, team lunches, client dinners',
      lead:'Corporate event reservations are tracked separately from individual employee bookings.',
      items:['Company events / team lunches / client dinners surface on this dashboard.',
             'Personal employee reservations save to the individual account only — <b>never</b> shown here.',
             'Billed to the restaurant at $0.95/person, Net-30 — no charge to the corporation.'],
      note:'Reservations are DESIGN ONLY in Phase 1 — no backend.', warn:true },
    employees: { label:'Employees', group:'Account', title:'Employees', sub:'138 active · Tier 2 (50–200)',
      lead:'Account structure supports both a single master account and independent employee accounts.',
      items:['Employee onboarding via <b>access-code distribution</b> + registration.',
             'Approve / restrict menu access per employee or department.',
             'Checkout configuration — employee-pay vs company-subsidized.',
             'Headcount drives the subscription tier; the tier <b>auto-upgrades</b> when the ceiling is crossed.'] },
    billing: { label:'Billing', group:'Account', title:'Billing', sub:'3 invoices per month',
      lead:'Invoices, due dates and payment-method management for the account.',
      items:['<b>Subscription</b> — billed the 1st of the month, due on receipt. Tier 1 $99–$149 · Tier 2 $299–$399 · Tier 3 $599–$799.',
             '<b>Delivery days 1–15</b> — invoiced on the 15th.',
             '<b>Delivery days 16–30</b> — invoiced on the 30th.',
             'Delivery is <b>$95 per driver per day</b>, per driver dispatched — not per restaurant. Tier 1/2/3 = 1/2/3 drivers.',
             'Tax shown as a separate line with rate + jurisdiction; tax-exempt certificate stored per account with an expiry.'] },
    analytics: { label:'Analytics', group:'Account', title:'Analytics', sub:'Spend, patterns and participation',
      lead:'Corporate Manager reporting.',
      items:['Spend by month / employee / restaurant, and by department.',
             'Ordering patterns and dietary trends.',
             'Subsidy ROI and employee participation rate.',
             'Live Kitchen history + upcoming; subscription status and next billing date.'] },
    manifest: { label:'Manifest B', group:'Account', title:'Manifest B', sub:'Corporate delivery manifest',
      lead:'The corporation prints Manifest B and receives delivery confirmation the instant the close-out code is scanned.',
      items:['Manifest B carries the <b>close-out QR</b> that closes the batch.',
             'Only the <b>assigned driver</b> can scan it — restaurant and corporate scans are rejected and logged.',
             'Teal identity band is mandatory (dark = restaurant, teal = corporate).',
             'Corporate sees manifest stages 3–5 of the five recorded events.'] },
    pantry: { label:'Pantry', group:'Account', title:'Pantry Replenishment', sub:'Phase 2', badge:'Phase 2',
      lead:'Office managers order packaged food and beverages to restock the office pantry on a schedule.',
      items:['Phase 1 builds the <b>data structure + routing logic only</b> so it can be switched on later without a rebuild.',
             'No UI this phase.'],
      note:'Phase 2 — scaffold only. Do not build the UI yet.', warn:true },
    settings: { label:'Settings', group:'', title:'Settings', sub:'Account, payment methods, notifications',
      lead:'Account-level configuration for the corporate manager.',
      items:['Payment-method management.',
             'Notification routing for order and delivery alerts (Twilio SMS at launch; Slack / MS Teams in Phase 2).',
             'DocuSign corporate agreement stored per account.',
             'Building address validation via Google Maps.'] }
  };

  var ORDER = ['dashboard','orders','calendar','live','feed','reservations','employees','billing','analytics','manifest','pantry'];

  function icon(k){ return '<svg viewBox="0 0 24 24">'+ICONS[k]+'</svg>'; }

  function navHTML(active){
    var html = '<div class="cside-inner">'
      + '<div class="cbrand"><div class="cbrand-mark">OG</div><div>'
      + '<div class="cbrand-name">Office Grubb</div><div class="cbrand-sub">Corporate</div></div></div>'
      + '<nav class="cnav">';
    var group = null;
    ORDER.forEach(function(k){
      var v = VIEWS[k];
      if (v.group !== group){ group = v.group; html += '<div class="cnav-label">'+group+'</div>'; }
      html += '<button class="cnav-item'+(k===active?' active':'')+'" data-view="'+k+'">'+icon(k)
        + '<span>'+v.label+'</span>'+(v.badge?'<em class="pill">'+v.badge+'</em>':'')+'</button>';
    });
    html += '</nav><div class="cnav" style="margin-top:auto">'
      + '<a class="cnav-item" href="onboarding.html">'+icon('manifest')+'<span>Onboarding</span></a>'
      + '<button class="cnav-item'+(active==='settings'?' active':'')+'" data-view="settings">'+icon('settings')+'<span>Settings</span></button>'
      + '</div>'
      + '<div class="cside-foot"><div class="cavatar">DR</div><div><div class="cwho">Dana Reyes</div>'
      + '<div class="crole">Corporate Manager</div></div></div>'
      + '</div>';
    return html;
  }

  function dashboardHTML(){
    return ''
    + '<div class="grid g4">'
      + stat('Subscription', '$349<span style="font-size:14px;font-weight:600;color:#737373">/mo</span>', 'Tier 2 · 50–200 employees · billed the 1st')
      + stat('Drivers per day', '2', 'Tier 2 · $190/day delivery')
      + stat('Spend this month', '$12,480', '138 employees · 61% participation')
      + stat('Next invoice', 'Aug 30', 'Delivery, days 16–30')
    + '</div>'
    + '<div class="grid g2">'
      + '<div class="card"><h2>Billing</h2><div class="hint">Three invoices per month — subscription on the 1st, delivery on the 15th and the 30th.</div>'
        + '<div class="rows">'
        + row('Subscription — August', 'Billed Aug 1 · due on receipt', '$349.00', 'paid', 'Paid')
        + row('Delivery — Aug 1–15', '15 days × 2 drivers × $95', '$2,850.00', 'due', 'Due')
        + row('Delivery — Aug 16–30', 'Invoices Aug 30', '$2,850.00', 'next', 'Scheduled')
        + '</div></div>'
      + '<div class="card"><h2>Upcoming Live Kitchen</h2><div class="hint">Included in the subscription — no extra charge.</div>'
        + '<div class="rows">'
        + row('Sofia’s Kitchen', 'Wed Aug 20 · Mediterranean · 120 headcount', '', 'next', 'Confirmed')
        + row('Ginger &amp; Co.', 'Wed Aug 27 · Thai · headcount pending', '', 'due', 'Needs headcount')
        + '</div>'
        + '<div class="note">$800/day minimum — any shortfall is added to this account’s next delivery invoice, never charged to the restaurant.</div>'
        + '</div>'
    + '</div>'
    + '<div class="grid g2">'
      + '<div class="card"><h2>Today’s delivery</h2><div class="hint">Manifest B closes when the assigned driver scans the close-out QR.</div>'
        + '<div class="rows">'
        + row('Batch #4192 · Sofia’s Kitchen', '34 orders · driver Marcus T. · departed 11:14', '', 'due', 'In transit')
        + row('Batch #4193 · Ginger &amp; Co.', '22 orders · driver Priya N. · closed 11:41', '', 'paid', 'Delivered')
        + '</div></div>'
      + '<div class="card"><h2>Employee participation</h2><div class="hint">Rolling 30 days · 84 of 138 employees ordering.</div>'
        + '<div class="bar"><i style="width:61%"></i></div>'
        + '<div class="rows">'
        + row('Advance orders placed', 'Up to 5 days ahead, same working week', '46', 'next', '')
        + row('Office Feed posts', 'Last 7 days · 2 awaiting moderation', '19', 'next', '')
        + '</div></div>'
    + '</div>'
    + '<div class="card"><div class="note warn">Placeholder data — this shell wires up navigation and layout only. No backend is connected yet.</div></div>';
  }

  function stat(k, v, m){
    return '<div class="card stat"><div class="k">'+k+'</div><div class="v">'+v+'</div><div class="m">'+m+'</div></div>';
  }
  function row(t, s, amt, tagClass, tagText){
    return '<div class="row"><div class="grow"><div class="t">'+t+'</div><div class="s">'+s+'</div></div>'
      + (amt?'<div class="amt">'+amt+'</div>':'')
      + (tagText?'<span class="tag '+tagClass+'">'+tagText+'</span>':'')
      + '</div>';
  }

  function stubHTML(v){
    return '<div class="card stub"><h2>'+v.title+'</h2>'
      + '<p class="lead">'+v.lead+'</p>'
      + '<ul>'+v.items.map(function(i){return '<li>'+i+'</li>';}).join('')+'</ul>'
      + (v.note?'<div class="note'+(v.warn?' warn':'')+'">'+v.note+'</div>':'')
      + '</div>';
  }

  function render(key){
    if (!VIEWS[key]) key = 'dashboard';
    var v = VIEWS[key];
    document.querySelector('.cside').innerHTML = navHTML(key);
    document.getElementById('pageTitle').textContent = v.title;
    document.getElementById('pageSub').textContent = v.sub;
    document.getElementById('view').innerHTML = key === 'dashboard' ? dashboardHTML() : stubHTML(v);
    document.title = 'Office Grubb — Corporate · ' + v.title;
    try { location.hash = key; } catch(e){}
    wire();
  }

  function wire(){
    // only the view buttons route — the Onboarding entry is a real link
    document.querySelectorAll('.cnav-item[data-view]').forEach(function(b){
      b.addEventListener('click', function(){ render(b.getAttribute('data-view')); });
    });
  }

  function start(){
    var key = (location.hash || '').replace('#','');
    render(VIEWS[key] ? key : 'dashboard');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
