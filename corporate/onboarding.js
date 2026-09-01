/* Office Grubb — Corporate Onboarding flow.
   Mirrors the Restaurant "Profile Setup" pattern: step rail → one card per step → Back / Next.

   Rules encoded here come from the v3 master spec:
   · Subscription tier is driven by headcount (1–50 / 50–200 / 200+) and auto-upgrades.
   · Delivery is $95 per driver per day; drivers per day = tier (1 / 2 / 3).
   · Billing is 3 invoices a month — subscription on the 1st, delivery on the 15th and the 30th.
   · Ordering cutoff is set by Office Grubb (it drives driver dispatch), never by the corporation.
   · Live Kitchen is included in the subscription; the only corporate-side charge is the
     $800/day minimum shortfall, added to the next delivery invoice.
*/
(function () {
  'use strict';

  /* ----------------------------------------------------------- state */
  var S = {
    step: 0,
    company: { name:'', website:'', industry:'', headcount:'', address:'', locationCount:'1' },
    contact: { name:'', email:'', phone:'', title:'' },
    locations: [ blankLocation('Headquarters') ],
    program: { service:'12:00', cutoffAuto:true, sameAll:true },
    employees: { method:'later', file:'', departments:['Engineering','Marketing','Sales','HR'] },
    cuisines: ['Mediterranean','Asian','Healthy Options'],  // account-level: every location shares one rotation
    live: { join:'', agreed:false, events:'2', attendance:'' },
    payment: { model:'employee', subsidyType:'fixed', subsidy:'15', pct:'75',
               guests:true, guestSubsidy:'15' },
    plan: { tier:0, rate:0 },
    billing: { email:'', contact:'', method:'', invoice:'consolidated', po:'', exempt:false }
  };

  // A location is a drop-off point on the master account, never a separate account.
  // `tracker` is the optional lightweight per-building permission: order tracking and
  // manifests for that building only, no settings access.
  function blankLocation(name){
    return { name:name||'', address:'', floor:'', contact:'', phone:'', instructions:'',
             headcount:'', service:'12:00',
             trackerOn:false, trackerName:'', trackerEmail:'' };
  }

  /* ----------------------------------------------------------- steps */
  var ICONS = {
    company:'<path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 21v-5h6v5"/><path d="M9 10h.01M15 10h.01"/>',
    locations:'<path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
    program:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
    employees:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M16 5.2a3.2 3.2 0 010 5.6M18.5 20c0-2.4-1-4.2-2.6-5.2"/>',
    cuisine:'<path d="M8 3v18M6 3v5a2 2 0 004 0V3M16 3c-2 0-3 3-3 6s1 4 3 4v8"/>',
    live:'<path d="M12 3a4 4 0 00-3.8 2.8A3.5 3.5 0 006 12a3 3 0 003 3h6a3 3 0 003-3 3.5 3.5 0 00-2.2-6.2A4 4 0 0012 3z"/><path d="M8 15v4a1 1 0 001 1h6a1 1 0 001-1v-4"/>',
    payment:'<path d="M12 2v20"/><path d="M17 6.5c0-2-2.2-3.5-5-3.5S7 4.5 7 6.5 9 9.5 12 10s5 1.5 5 4-2.2 3.5-5 3.5-5-1.5-5-3.5"/>',
    plan:'<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M6 15h4"/>',
    review:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h6M9 16h4"/>'
  };
  var STEPS = [
    { k:'company',   cap:'Company' },
    { k:'locations', cap:'Locations' },
    { k:'program',   cap:'Meal Program' },
    { k:'employees', cap:'Employees' },
    { k:'cuisine',   cap:'Preferences' },
    { k:'live',      cap:'Live Kitchen' },
    { k:'payment',   cap:'Meal Payment' },
    { k:'plan',      cap:'Plan & Billing' },
    { k:'review',    cap:'Review' }
  ];

  var CUISINES = [
    ['Mexican','🌮'],['Mediterranean','🥙'],['Asian','🍜'],['Italian','🍝'],
    ['Indian','🍛'],['American','🍔'],['Healthy Options','🥗'],['Japanese','🍱'],
    ['BBQ','🍖'],['Bakery & Desserts','🧁'],['Vegetarian','🥦'],['Halal','🍗']
  ];
  var INDUSTRIES = ['Technology','Financial Services','Healthcare','Legal','Consulting','Media & Advertising','Manufacturing','Education','Real Estate','Non-profit','Other'];

  /* ----------------------------------------------------------- helpers */
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  // Personalisation. Once the company name is known the copy uses it; until then it
  // falls back to neutral wording so no screen ever reads "every  location".
  // Long legal names get trimmed — "Zenkoders Pvt Ltd" reads better as "Zenkoders" mid-sentence.
  function co(fallback){
    var n = (S.company.name || '').trim();
    if (!n) return arguments.length ? fallback : 'your company';
    n = n.replace(/[,]?\s+(inc|llc|ltd|limited|corp|corporation|gmbh|plc|pvt\.? ?ltd|co)\.?$/i, '').trim();
    return esc(n);
  }
  // "Zenkoders " when known, "" when not — for slotting mid-sentence.
  function coWord(){ var n = co(''); return n ? n + ' ' : ''; }
  function coPossessive(){
    var n = co('');
    if (!n) return 'your company’s';
    return n + (/s$/i.test(n) ? '’' : '’s');
  }
  function icon(p,cls){ return '<svg class="'+(cls||'')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>'; }
  function money(n){ return '$' + Number(n||0).toLocaleString('en-US'); }
  function usd(n){ return '$' + Number(n||0).toFixed(2); }

  // Tier is derived from headcount — never picked freely. Ranges per spec 2A.
  var TIERS = [
    { n:1, label:'Tier 1', range:'1–50 employees',   min:1,   max:50,   lo:99,  hi:149, drivers:1 },
    { n:2, label:'Tier 2', range:'50–200 employees', min:50,  max:200,  lo:299, hi:399, drivers:2 },
    { n:3, label:'Tier 3', range:'200+ employees',   min:200, max:1e9,  lo:599, hi:799, drivers:3 }
  ];
  function tierFor(headcount){
    var h = parseInt(headcount,10) || 0;
    if (h > 200) return TIERS[2];
    if (h > 50)  return TIERS[1];
    if (h > 0)   return TIERS[0];
    return null;
  }
  // Ordering cutoff is Office Grubb's to set — 90 minutes before service is the default it applies.
  function cutoffFor(service){
    var p = String(service||'12:00').split(':');
    var m = (parseInt(p[0],10)||12) * 60 + (parseInt(p[1],10)||0) - 90;
    if (m < 0) m += 1440;
    return fmt12(Math.floor(m/60), m%60);
  }
  function fmt12(h,m){
    var ap = h >= 12 ? 'PM' : 'AM', hh = h % 12; if (hh === 0) hh = 12;
    return hh + ':' + String(m).padStart(2,'0') + ' ' + ap;
  }
  function time12(v){ var p=String(v||'').split(':'); return fmt12(parseInt(p[0],10)||0, parseInt(p[1],10)||0); }

  function totalHeadcount(){
    var sum = 0, any = false;
    S.locations.forEach(function(l){ var n = parseInt(l.headcount,10); if (n) { sum += n; any = true; } });
    return any ? sum : (parseInt(S.company.headcount,10) || 0);
  }
  function multiLocation(){ return S.locations.length > 1; }

  /* ----------------------------------------------------------- step rail */
  function railHTML(){
    var h = '<div class="rail">';
    STEPS.forEach(function(st,i){
      if (i) h += '<div class="conn'+(i <= S.step-1 ? ' done' : '')+'"></div>';
      var cls = i === S.step - 1 ? 'active' : (i < S.step - 1 ? 'done' : '');
      var inner = cls === 'done'
        ? icon('<path d="M20 6L9 17l-5-5"/>')
        : (cls === 'active' ? '<span class="dot"></span>' : icon(ICONS[st.k]));
      h += '<div class="step '+cls+'"><div class="bubble">'+inner+'</div><div class="cap">'+st.cap+'</div></div>';
    });
    return h + '</div>';
  }

  /* ----------------------------------------------------------- screens */

  function welcome(){
    return '<div class="hero">'
      + '<div class="illus">🏢</div>'
      + '<h1>Set Up Your Corporate Meal Program</h1>'
      + '<p>Configure your company account, employee access, and meal preferences to launch your workplace dining experience.</p>'
      + '<button class="btn primary" data-go="1">Start Setup</button>'
      + '<div class="whatnext"><h3>What we\'ll cover — about 10 minutes</h3><ol>'
      + '<li><b>Company &amp; locations</b> — who you are and where lunch lands.</li>'
      + '<li><b>Meal program</b> — your lunch service time. Office Grubb sets the ordering cutoff from it.</li>'
      + '<li><b>Employees &amp; departments</b> — access codes now or later; departments power your spend analytics.</li>'
      + '<li><b>Preferences</b> — cuisines your team likes, plus Live Kitchen.</li>'
      + '<li><b>Plan &amp; billing</b> — your tier follows your headcount.</li>'
      + '</ol></div></div>';
  }

  function stepCompany(){
    return card('🏢','Company Information','Create your corporate account. This is the profile your employees and assigned restaurants will see.',
        '<div class="field"><label>Company Name</label>'
      + inp('company.name','Northwind Analytics')+'</div>'
      + '<div class="two">'
        + '<div class="field"><label class="lbl">Company Website <span class="opt">(optional)</span></label>'+inp('company.website','www.northwind.com')+'</div>'
        + '<div class="field"><label>Industry</label>'+sel('company.industry',INDUSTRIES,'Select industry')+'</div>'
      + '</div>'
      + '<div class="two">'
        + '<div class="field"><label>Number of Employees</label>'+inp('company.headcount','138','number')
          + '<div class="help">Sets your subscription tier. The tier auto-upgrades if you cross a threshold later.</div></div>'
        + '<div class="field"><label>Number of Office Locations</label>'+sel('company.locationCount',['1','2','3','4','5+'])+'</div>'
      + '</div>'
      + '<div class="field"><label>Company Address</label>'+inp('company.address','100 Federal St, Boston, MA 02110')
        + '<div class="help">Your registered/billing address. Delivery addresses are set per location in the next step.</div></div>'
      + '<div class="divider"></div>'
      + '<div class="sec-label">Primary Contact</div>'
      + '<div class="two">'
        + '<div class="field"><label>Full Name</label>'+inp('contact.name','Dana Reyes')+'</div>'
        + '<div class="field"><label>Job Title</label>'+inp('contact.title','Office Manager')+'</div>'
      + '</div>'
      + '<div class="two">'
        + '<div class="field"><label>Work Email</label>'+inp('contact.email','dana@northwind.com','email')+'</div>'
        + '<div class="field"><label>Phone Number</label>'
          + '<div class="phone"><span class="cc">+1</span>'+inp('contact.phone','(617) 555-0142','tel')+'</div></div>'
      + '</div>'
    );
  }

  function stepLocations(){
    var body = '';
    S.locations.forEach(function(l,i){
      body += '<div class="rowcard"><div class="rc-head"><span class="n">'+(i+1)+'</span>'
        + '<span class="ttl">'+esc(l.name || 'Location '+(i+1))+'</span>'
        + (S.locations.length > 1 ? '<button class="del" data-delloc="'+i+'">Remove</button>' : '')
        + '</div>'
        + '<div class="field"><label>Location Name</label>'+inpLoc(i,'name','Boston Headquarters')+'</div>'
        + '<div class="field"><label>Office Address</label>'+inpLoc(i,'address','100 Federal St, Boston, MA 02110')+'</div>'
        + '<div class="two">'
          + '<div class="field"><label>Building / Floor</label>'+inpLoc(i,'floor','Tower B, 3rd floor')+'</div>'
          + '<div class="field"><label>Employees at this location</label>'+inpLoc(i,'headcount','138','number')+'</div>'
        + '</div>'
        + '<div class="two">'
          + '<div class="field"><label>Delivery Contact Person</label>'+inpLoc(i,'contact','Dana Reyes')+'</div>'
          + '<div class="field"><label>Contact Phone</label>'+inpLoc(i,'phone','(617) 555-0142','tel')+'</div>'
        + '</div>'
        + '<div class="field"><label>Delivery Instructions</label>'
          + '<textarea class="inp" data-loc="'+i+'" data-lk="instructions" placeholder="Deliver to the reception desk on the 3rd floor. Ask for Dana.">'+esc(l.instructions)+'</textarea>'
          + '<div class="help">Shown to the driver on Manifest B and used for the drop-off photo.</div></div>'
        + '<div class="divider"></div>'
        + '<div class="stack">'
          + checkRowLoc(i, 'trackerOn', l.trackerOn,
              'Let someone at this building track its orders',
              'View-only access to this building\'s manifests and delivery status. They cannot change any account setting, see other buildings, or view billing. Optional — you can add this later.')
        + '</div>'
        + (l.trackerOn
            ? '<div class="two">'
              + '<div class="field"><label>Name</label>'+inpLoc(i,'trackerName','Priya Nair')+'</div>'
              + '<div class="field"><label>Work Email</label>'+inpLoc(i,'trackerEmail','priya@northwind.com','email')+'</div>'
              + '</div>'
            : '')
        + '</div>';
    });
    body += '<button class="addbtn" data-addloc="1">+ Add another location</button>';

    if (multiLocation()) {
      body += note('info','Every location is a <b>drop-off point on this one account</b> — not a separate account. You manage all settings and all employees centrally, on one contract, one subscription and one bill based on your total headcount.');
    }

    return card('📍', multiLocation() ? (coWord() || 'Your ') + 'Delivery Locations' : 'Add Your Office Location',
      multiLocation()
        ? 'Add every building we deliver to. Each one gets its own address, service time and manifest, all managed from this account.'
        : 'Where we deliver. You can add more buildings to this account at any time.',
      body, true);
  }

  function stepProgram(){
    var body = '';
    if (multiLocation()) {
      body += '<div class="stack">'
        + checkRow('program.sameAll', S.program.sameAll,
            'Use the same lunch service time at every ' + coWord() + 'location',
            'Uncheck to set a different service time per location.')
        + '</div><div class="divider"></div>';
    }
    if (!multiLocation() || S.program.sameAll) {
      body += '<div class="field"><label>What time should employees receive lunch?</label>'
        + '<input class="inp" type="time" data-bind="program.service" value="'+esc(S.program.service)+'">'
        + '<div class="help">Launch supports lunch only. Breakfast and dinner come in a later phase.</div></div>'
        + '<div class="calc">'
          + '<div class="r"><span class="k">Lunch service</span><span class="v">'+time12(S.program.service)+'</span></div>'
          + '<div class="r em"><span class="k">Order cutoff <em style="font-style:normal;color:#a3a3a3">— set by Office Grubb</em></span><span class="v">'+cutoffFor(S.program.service)+'</span></div>'
        + '</div>';
    } else {
      S.locations.forEach(function(l,i){
        body += '<div class="rowcard"><div class="rc-head"><span class="n">'+(i+1)+'</span><span class="ttl">'+esc(l.name||('Location '+(i+1)))+'</span></div>'
          + '<div class="field"><label>Lunch service time</label>'
          + '<input class="inp" type="time" data-loc="'+i+'" data-lk="service" value="'+esc(l.service)+'"></div>'
          + '<div class="calc"><div class="r em"><span class="k">Order cutoff — set by Office Grubb</span><span class="v">'+cutoffFor(l.service)+'</span></div></div>'
          + '</div>';
      });
    }
    body += note('lock','<b>Office Grubb configures your ordering window.</b> The cutoff shown is the default we apply once your profile is created — normally 90 minutes before service. Your account manager can change it at any time. Corporations can\'t edit it directly, because the cutoff drives restaurant prep and driver dispatch.', 'lockicon');
    body += note('info','Employees can order up to <b>5 days ahead within the same working week</b>, and only from the Calendar tab. Orders can be edited or cancelled up to <b>2 hours before</b> the cutoff.');
    return card('🕛','Configure Your Lunch Program',
      'Tell us when ' + (co('') ? 'the ' + co('') + ' team' : 'your team')
      + ' eats. We build the ordering, prep and dispatch schedule backwards from that.', body);
  }

  function stepEmployees(){
    var body = '<div class="stack">'
      + choice('employees.method','upload','Upload employee list',
          'Bulk-add now with a CSV. Everyone gets an access code by email as soon as your account is approved.',
          '<b>CSV columns:</b> First Name · Last Name · Work Email · Department')
      + choice('employees.method','later','Invite employees later',
          'Skip for now and add people from the Employees tab once your account is live. You can still finish setup.','')
      + '</div>';

    if (S.employees.method === 'upload') {
      body += '<div class="field"><label>Employee CSV</label>'
        + '<input class="inp" type="file" accept=".csv" data-file="employees.file" style="padding:11px 12px;height:auto">'
        + (S.employees.file ? '<div class="help" style="color:#16a34a;font-weight:600">Selected: '+esc(S.employees.file)+'</div>'
                            : '<div class="help">Need the format? <b>Download the CSV template</b> — First Name, Last Name, Work Email, Department'
                              + (multiLocation() ? ', Building.' : '.') + '</div>')
        + '</div>';
    }

    body += '<div class="divider"></div><div class="sec-label">Departments</div>'
      + '<div class="help" style="margin-top:-6px">Departments drive spend-by-department reporting, ordering patterns and subsidy ROI on your analytics dashboard.</div>'
      + '<div class="chips">'
      + S.employees.departments.map(function(d,i){
          return '<span class="chip">'+esc(d)+'<button data-deldept="'+i+'" aria-label="Remove">×</button></span>';
        }).join('')
      + '</div>'
      + '<div class="field"><div style="display:flex;gap:8px">'
        + '<input class="inp" id="deptInput" placeholder="Add a department — e.g. Operations">'
        + '<button class="btn primary" style="height:48px;padding:0 22px;font-size:14px" data-adddept="1">Add</button>'
      + '</div></div>';

    if (multiLocation()) {
      body += note('info','All employees live on this one account. Each person is identified by <b>the building their invite was sent from</b>, which is how orders reach the right manifest.');
    }

    return card('👥','Add Your Employees',
      'Employees register with an access code tied to ' + (co('') ? 'the ' + co('') + ' account' : 'your company account') + '.', body);
  }

  function stepCuisine(){
    // Account-level by design: every location on the account receives the same rotation.
    var sel = S.cuisines, multi = multiLocation();
    var body = '<div class="tiles">'
      + CUISINES.map(function(c){
          var on = sel.indexOf(c[0]) > -1;
          return '<div class="tile'+(on?' on':'')+'" data-cuisine="'+esc(c[0])+'"><span>'+esc(c[0])+'</span><span class="em">'+c[1]+'</span></div>';
        }).join('')
      + '</div>';

    body += '<div class="help" style="text-align:center">'+sel.length+' selected · pick as many as you like</div>'
      + note('info', multi
        ? 'These preferences apply to the whole account. <b>All ' + S.locations.length + ' locations receive the same restaurant rotation</b>, so this is one answer for the company, not per building.'
        : 'Preferences help Office Grubb plan your restaurant rotation. Everyone on the account sees the same lineup, so this is a company-level answer, not a personal one.');

    return card('🍽️', 'Tell Us What ' + (co('') ? 'the ' + co('') + ' Team' : 'Your Team') + ' Likes',
      'We use this to curate ' + coPossessive() + ' restaurant rotation. You can change it any time from your dashboard.',
      body);
  }

  function stepLive(){
    var body = '<div class="stack">'
      + choice('live.join','yes','Yes — include Live Kitchen','A restaurant sets up on-site and cooks for your team. We schedule a different restaurant each event for cuisine variety.','')
      + choice('live.join','later','Maybe later','Skip for now. You can opt in from the Live Kitchen tab whenever you\'re ready.','')
      + '</div>';
    // Opting in exposes the corporation to the $800/day minimum, so the terms are
    // an explicit gate: agree first, then the event details unlock.
    if (S.live.join === 'yes') {
      body += '<div class="divider"></div>'
        + '<div class="agreement">'
          + '<div class="ag-head"><span class="ag-badge">Agreement</span>'
            + '<span class="ag-title">Live Kitchen Terms</span>'
            + '<span class="ag-meta">v1.2 · e-signed via DocuSign after approval</span></div>'
          + '<div class="ag-body">'
            + agTerm('1','No charge to participate','Live Kitchen is included in your subscription. There is no setup fee and no per-event fee charged to your company.')
            + agTerm('2','$800 per-day minimum','Each event carries an $800/day minimum. If the restaurant\'s on-site sales fall short of it, the shortfall is added to your next delivery invoice. It is never charged to the restaurant.')
            + agTerm('3','Employees pay on site','Employees pay the restaurant directly at the event. Office Grubb does not process Live Kitchen payments.')
            + agTerm('4','Headcount drives prep','The estimated attendance you give is passed to the assigned restaurant. You confirm the final number before each event; repeated large shortfalls may affect the $800 minimum.')
            + agTerm('5','Scheduling and cancellation','Office Grubb assigns a different restaurant per event for cuisine variety. Cancellations inside 72 hours of an event are billed at the $800 minimum.')
            + agTerm('6','Branding is optional','Corporate branding at events is an optional add-on, quoted and billed separately at cost.')
          + '</div>'
        + '</div>'
        + '<div class="stack">'
        + checkRow('live.agreed', S.live.agreed,
            'I have read and accept the Live Kitchen Terms on behalf of ' + (co('') || 'my company'),
            'Your account manager sends this for e-signature once your account is approved. Nothing is charged today.')
        + '</div>';

      if (S.live.agreed){
        body += '<div class="divider"></div>'
          + '<div class="sec-label">Your Live Kitchen plan</div>'
          + '<div class="two">'
          + '<div class="field"><label>Events per month</label>'+sel('live.events',['1','2','3','4'])+'</div>'
          + '<div class="field"><label>Estimated attendance per event</label>'+inp('live.attendance','120','number')+'</div>'
          + '</div>'
          + '<div class="help">Headcount is passed to the assigned restaurant so they can prep. You confirm the exact number before each event.</div>'
          + '<div class="calc">'
            + '<div class="r"><span class="k">Live Kitchen access</span><span class="v">Included in your subscription</span></div>'
            + '<div class="r"><span class="k">Setup fee</span><span class="v">$0</span></div>'
            + '<div class="r"><span class="k">Events per month</span><span class="v">'+esc(S.live.events)+'</span></div>'
            + '<div class="r em"><span class="k">Per-event minimum</span><span class="v">$800/day</span></div>'
          + '</div>';
      } else {
        body += note('lock','Accept the terms above to set your events per month and estimated attendance.');
      }
    } else if (S.live.join === 'later'){
      body += note('info','No terms to accept today. When you opt in from the Live Kitchen tab you\'ll be asked to accept the Live Kitchen Terms first.');
    } else {
      body += '<div class="calc">'
        + '<div class="r"><span class="k">Live Kitchen access</span><span class="v">Included in your subscription</span></div>'
        + '<div class="r"><span class="k">Setup fee</span><span class="v">$0</span></div>'
        + '<div class="r"><span class="k">Employees pay</span><span class="v">The restaurant directly, on-site</span></div>'
        + '</div>';
    }
    return card('👨‍🍳','Add the Live Kitchen Experience','A chef-on-site lunch service, included with your plan at no extra charge.', body);
  }

  // Checkout mode is account-wide (spec 8.3) and changeable later in Settings.
  // Option B supports either a percentage of the meal or a fixed dollar cap.
  function subsidyOn(meal){
    if (S.payment.model !== 'subsidy') return 0;
    return S.payment.subsidyType === 'percent'
      ? meal * (Math.min(100, Math.max(0, parseFloat(S.payment.pct) || 0)) / 100)
      : Math.min(meal, parseFloat(S.payment.subsidy) || 0);
  }
  function paymentSummary(){
    if (S.payment.model !== 'subsidy') return 'Employee pays in full';
    return S.payment.subsidyType === 'percent'
      ? 'Company subsidised — ' + (parseFloat(S.payment.pct)||0) + '% of each meal'
      : 'Company subsidised — $' + (parseFloat(S.payment.subsidy)||0).toFixed(2) + ' per meal';
  }

  function stepPayment(){
    var meal = 18, isPct = S.payment.subsidyType === 'percent';
    var sub = subsidyOn(meal), emp = Math.max(0, meal - sub);
    var body = '<div class="stack">'
      + choice('payment.model','employee','Option A — Employee pays in full',
          'Each employee pays the full cost of their meal at checkout. Your company covers the delivery fees and the subscription only.',
          '<b>Example</b><br>Meal $15.00 → employee pays <b>$15.00</b> · company pays $0.00 toward the meal')
      + choice('payment.model','subsidy','Option B — Company subsidises',
          'Your company contributes toward every meal — a percentage of the bill or a fixed amount. The employee covers the remainder.',
          '<b>Example</b><br>Meal $18.00 − subsidy $15.00 → employee pays <b>$3.00</b>')
      + '</div>';

    if (S.payment.model === 'subsidy') {
      body += '<div class="divider"></div>'
        + '<div class="sec-label">How the subsidy is calculated</div>'
        + '<div class="stack">'
        + choice('payment.subsidyType','percent','Percentage of each meal',
            'The company pays a share of whatever the meal costs. Scales automatically with price.','')
        + choice('payment.subsidyType','fixed','Fixed amount per meal',
            'The company pays up to a set amount. Anything above it is the employee\'s.','')
        + '</div>';

      body += isPct
        ? '<div class="field"><label>Company pays</label>'
          + '<div class="phone" style="grid-template-columns:1fr 52px">'+inp('payment.pct','75','number')
          + '<span class="cc" style="border-left:0;border-right:1px solid var(--line);border-radius:0 var(--radius-field) var(--radius-field) 0">%</span></div>'
          + '<div class="help">Of every meal, before tax and any delivery charge. The employee pays the rest at checkout.</div></div>'
        : '<div class="field"><label>Company pays up to</label>'
          + '<div class="phone"><span class="cc">$</span>'+inp('payment.subsidy','15.00')+'</div>'
          + '<div class="help">Set the budget per employee, per order. Any amount above this limit is paid '
          + 'by the employee at checkout. Adjustable at any time in Settings.</div></div>';

      body += '<div class="calc">'
          + '<div class="r"><span class="k">Sample meal</span><span class="v">$18.00</span></div>'
          + '<div class="r"><span class="k">Company subsidy'+(isPct ? ' — ' + (parseFloat(S.payment.pct)||0) + '%' : '')+'</span>'
            + '<span class="v">−$'+sub.toFixed(2)+'</span></div>'
          + '<div class="r em"><span class="k">Employee pays</span><span class="v">$'+emp.toFixed(2)+'</span></div>'
        + '</div>';

      if (isPct && (parseFloat(S.payment.pct)||0) >= 100){
        body += note('warn','At 100% the company covers every meal in full, whatever it costs. There is no per-meal ceiling — consider a fixed amount if you need a predictable spend cap.');
      } else if (!isPct && (parseFloat(S.payment.subsidy)||0) > meal){
        body += note('warn','Your subsidy is higher than a typical $18 meal, so most orders will be fully covered. Unused subsidy is not carried over or refunded.');
      }
    }

    // Guests are budgeted separately because they are billed separately — guest credit
    // sits on its own invoice line and never inside a department figure.
    body += '<div class="divider"></div>'
      + '<div class="sec-label">Guests</div>'
      + '<div class="stack">'
      + checkRow('payment.guests', S.payment.guests,
          'Do you have guests coming into the office you want to subsidise?',
          'A guest is a user on your account, like an employee — they order from the same menu. Turn this on to give them a budget.')
      + '</div>';

    if (S.payment.guests){
      var g = parseFloat(S.payment.guestSubsidy) || 0;
      // Kept compact on purpose — guests are a minor part of this decision, so this is
      // one inline amount rather than a second worked example competing with the main choice.
      body += '<div class="guestline">'
        + '<label for="guestAmt">Standard guest budget</label>'
        + '<div class="phone"><span class="cc">$</span>'
        + '<input class="inp" id="guestAmt" data-bind="payment.guestSubsidy" value="'+esc(S.payment.guestSubsidy)+'"></div>'
        + '<span class="guestline-out">Guest pays ' + usd(Math.max(0, 18 - g)) + ' on an $18 meal</span>'
        + '</div>'
        + '<div class="help">Per guest, per visit — the company-wide standard. You can raise it for an '
        + 'individual visitor later, so a <b>VIP guest</b> can be given more without changing everyone else. '
        + 'Billed on its own line under GL <b>6410-GST</b>, never inside a department total.</div>';

      // Option A means employees buy their own lunch — so say why a guest still costs the company
      if (S.payment.model === 'employee'){
        body += note('info','Your employees pay for their own meals, but a <b>guest\'s meal is the company\'s cost</b> — a visitor is not going to be asked to pay at your office.');
      }
      if (S.payment.model === 'subsidy' && S.payment.subsidyType === 'fixed'
          && g > (parseFloat(S.payment.subsidy) || 0)){
        body += note('warn','Your guest budget is higher than the employee budget. Visitors would be better covered than your own staff — check that is intended.');
      }
    }

    body += note('info','This applies to the <b>whole account</b>, every location included. You can change it at any time from Settings — it takes effect on new orders, never on orders already placed.');
    return card('💳','Choose How Meals Are Paid','Set the checkout model your employees will see.', body);
  }

  function stepPlan(){
    var head = totalHeadcount(), fit = tierFor(head);
    var body = '';

    if (!head) {
      body += note('warn','Add your employee headcount on the Company step so we can work out your tier.');
    } else {
      body += '<div class="calc"><div class="r em"><span class="k">Total headcount</span><span class="v">'+head+' employees</span></div>'
        + '<div class="r"><span class="k">Delivery locations</span><span class="v">'+S.locations.length+' on one account</span></div></div>';
    }

    body += '<div class="plans">' + TIERS.map(function(t){
      var isFit = fit && fit.n === t.n;
      return '<div class="plan'+(S.plan.tier===t.n?' on':'')+(fit && !isFit ? ' dim':'')+'" data-tier="'+t.n+'">'
        + '<span class="radio"></span><span class="grow"><span class="t">'+t.label
        + (isFit ? '<span class="tagfit">Your headcount</span>' : '')
        + '</span><div class="d">'+t.range+' · '+t.drivers+' driver'+(t.drivers>1?'s':'')+'/day included</div></span>'
        + '<span class="price">'+money(t.lo)+'–'+money(t.hi)+'<span style="font-weight:500;color:#737373">/mo</span></span></div>';
    }).join('') + '</div>';

    var sel_ = TIERS.filter(function(t){ return t.n === S.plan.tier; })[0];
    if (sel_) {
      var rate = S.plan.rate || sel_.lo;
      var delivery = sel_.drivers * 95;
      body += '<div class="field"><label>Monthly rate</label>'
        + '<select class="inp" data-bind="plan.rate">'
        + rateOptions(sel_, rate)
        + '</select><div class="help">Your rate is chosen at signup from within the tier range and auto-renews monthly.</div></div>'
        + '<div class="divider"></div><div class="sec-label">What you\'ll be invoiced</div>'
        + '<div class="calc">'
          + '<div class="r"><span class="k">Subscription — 1st of the month</span><span class="v">'+money(rate)+'/mo</span></div>'
          + '<div class="r"><span class="k">Delivery — days 1–15, invoiced the 15th</span><span class="v">'+money(delivery)+'/day</span></div>'
          + '<div class="r"><span class="k">Delivery — days 16–30, invoiced the 30th</span><span class="v">'+money(delivery)+'/day</span></div>'
          + '<div class="r em"><span class="k">Delivery rate</span><span class="v">'+sel_.drivers+' driver'+(sel_.drivers>1?'s':'')+' × $95/day</span></div>'
        + '</div>'
        + note('info','Delivery is charged <b>per driver dispatched, per day</b> — not per restaurant or per order. You receive <b>three invoices a month</b>: subscription on the 1st, delivery on the 15th and the 30th.');
      if (fit && S.plan.tier !== fit.n) {
        body += note('warn','You\'ve selected '+sel_.label+' but your headcount of '+head+' falls in '+fit.label+'. Tiers auto-upgrade when headcount crosses a threshold, so this will move to '+fit.label+' on your next billing cycle.');
      }
    }

    body += '<div class="divider"></div><div class="sec-label">Billing Details</div>'
      + '<div class="two">'
        + '<div class="field"><label>Billing email</label>'+inp('billing.email','ap@northwind.com','email')+'</div>'
        + '<div class="field"><label>Billing contact</label>'+inp('billing.contact','Alex Chen, Finance')+'</div>'
      + '</div>'
      + '<div class="field"><label>Payment method</label>'+sel('billing.method',['Credit card','ACH bank transfer','Invoice / Net terms'],'Select a payment method')
      + '<div class="help">Card and bank details are collected securely by Stripe after your account is approved — never in this form.</div></div>';

    if (multiLocation()) {
      body += note('info','<b>One contract, one subscription, one bill.</b> Your tier is set by total headcount across all '
        + S.locations.length + ' locations, and delivery is itemised per location on the same invoice.');
    }
    body += '<div class="field"><label class="lbl">PO number <span class="opt">(optional)</span></label>'+inp('billing.po','PO-2026-4417')+'</div>'
      + '<div class="stack">'
      + checkRow('billing.exempt', S.billing.exempt, 'We are a tax-exempt organisation',
          'You\'ll be asked to upload your exemption certificate after approval. Tax is set to $0.00 until it expires.')
      + '</div>';

    return card('🧾','Select Your Plan','Your tier follows your headcount and upgrades automatically as your team grows.', body, true);
  }

  function stepReview(){
    var head = totalHeadcount(), t = TIERS.filter(function(x){ return x.n===S.plan.tier; })[0] || tierFor(head);
    var rate = S.plan.rate || (t ? t.lo : 0);
    var body = ''
      + rev('Company', 0, [
          ['Company', S.company.name || '—'],
          ['Industry', S.company.industry || '—'],
          ['Primary contact', (S.contact.name||'—') + (S.contact.title ? ' · '+S.contact.title : '')],
          ['Work email', S.contact.email || '—']
        ])
      + rev('Locations', 1, [
          ['Account', 'One account · ' + S.locations.length + ' delivery location' + (S.locations.length>1?'s':'')],
          ['Sites', S.locations.map(function(l){ return (l.name||'Unnamed') + (l.headcount ? ' ('+l.headcount+')' : ''); }).join(' · ')],
          ['Building trackers', (function(){
              var t = S.locations.filter(function(l){ return l.trackerOn; });
              return t.length ? t.map(function(l){ return (l.trackerName || 'Unnamed') + ' — ' + (l.name || 'location'); }).join(' · ') : 'None';
            })()]
        ])
      + rev('Meal Program', 2, [
          ['Program', 'Lunch'],
          ['Service time', (!multiLocation()||S.program.sameAll) ? time12(S.program.service) : 'Per location'],
          ['Order cutoff', ((!multiLocation()||S.program.sameAll) ? cutoffFor(S.program.service) : 'Per location') + ' — set by Office Grubb']
        ])
      + rev('Employees', 3, [
          ['Headcount', head ? head + ' employees' : '—'],
          ['Onboarding', S.employees.method === 'upload' ? ('CSV upload' + (S.employees.file ? ' — '+S.employees.file : ' — no file selected')) : 'Invite later'],
          ['Departments', S.employees.departments.length ? S.employees.departments.join(', ') : 'None']
        ])
      + rev('Preferences', 4,
          [['Cuisines' + (multiLocation() ? ' — all locations' : ''),
            S.cuisines.length ? S.cuisines.join(', ') : 'No preference set']].concat([
            ['Live Kitchen', S.live.join !== 'yes' ? 'Not now'
                : !S.live.agreed ? 'Opted in — terms not yet accepted'
                : (S.live.events + ' event' + (S.live.events!=='1'?'s':'') + '/month · ~' + (S.live.attendance||'—') + ' attending')],
            ['Live Kitchen Terms', S.live.join !== 'yes' ? 'Not applicable'
                : S.live.agreed ? 'Accepted v1.2 — e-signature sent after approval' : 'Not accepted']
          ]))
      + rev('Payment & Plan', 6, [
          ['Checkout mode', paymentSummary() + ' · account-wide'],
          ['Guests', S.payment.guests
              ? 'Allowed — ' + usd(parseFloat(S.payment.guestSubsidy) || 0)
                + ' standard per guest, raisable per visitor'
              : 'Not allowed on this account'],
          ['Plan', t ? (t.label + ' · ' + t.range) : 'Not selected'],
          ['Subscription', rate ? money(rate)+'/month, billed the 1st' : '—'],
          ['Delivery', t ? (t.drivers+' driver'+(t.drivers>1?'s':'')+' × $95/day, invoiced the 15th and the 30th') : '—'],
          ['Billing email', S.billing.email || '—']
        ]);

    var miss = missing();
    if (miss.length) {
      body += note('warn','<b>Still needed:</b> ' + miss.join(' · ') + '. You can submit without these, but your account manager will follow up before activation.');
    }
    body += note('info','Submitting sends your setup to the Office Grubb team. We configure your ordering window, assign your restaurant rotation and drivers, then notify you at <b>'+esc(S.contact.email||'your work email')+'</b> when the account goes live.');
    return card('📋','Review & Submit','Check everything over. You can jump back to any step to make changes.', body, true);
  }

  function submitted(){
    return '<div class="done-card">'
      + '<div class="illus">✅</div>'
      + '<h2>' + (co('') ? 'The ' + co('') + ' account is being reviewed' : 'Your corporate account is being reviewed') + '</h2>'
      + '<p>Our Office Grubb team is reviewing your setup and will configure your meal program — including your ordering window, restaurant rotation and driver assignment.</p>'
      + '<p>We\'ll notify you at <b>'+esc(S.contact.email || 'your work email')+'</b> once your account is ready.</p>'
      + '<p style="margin-top:16px">Estimated review time: <b>2–3 business days</b></p>'
      + '<div class="contact">Have questions? contact us at <a href="mailto:corporate@officegrub.com">corporate@officegrub.com</a></div>'
      + '<div style="margin-top:22px"><button class="btn ghost" data-dash="1">Go to Dashboard</button></div>'
      + '</div>';
  }

  /* ----------------------------------------------------------- fragments */
  function card(emoji,title,lede,body,wide){
    return '<div class="card'+(wide?' wide':'')+'">'
      + '<div class="card-head"><div class="illus">'+emoji+'</div><h1>'+title+'</h1><p class="lede">'+lede+'</p></div>'
      + '<div class="card-body">'+body+'</div></div>';
  }
  function get(path){ return path.split('.').reduce(function(o,k){ return o ? o[k] : ''; }, S); }
  function set(path,val){
    var parts = path.split('.'), o = S;
    for (var i=0;i<parts.length-1;i++) o = o[parts[i]];
    o[parts[parts.length-1]] = val;
  }
  function inp(path,ph,type){
    return '<input class="inp" type="'+(type||'text')+'" data-bind="'+path+'" placeholder="'+esc(ph)+'" value="'+esc(get(path))+'">';
  }
  function inpLoc(i,key,ph,type){
    return '<input class="inp" type="'+(type||'text')+'" data-loc="'+i+'" data-lk="'+key+'" placeholder="'+esc(ph)+'" value="'+esc(S.locations[i][key])+'">';
  }
  function sel(path,opts,ph){
    var v = get(path);
    return '<select class="inp" data-bind="'+path+'">'
      + (ph ? '<option value=""'+(v?'':' selected')+'>'+esc(ph)+'</option>' : '')
      + opts.map(function(o){ return '<option'+(String(v)===String(o)?' selected':'')+'>'+esc(o)+'</option>'; }).join('')
      + '</select>';
  }
  function rateOptions(t,cur){
    var out = '', step = Math.round((t.hi - t.lo) / 5);
    for (var v = t.lo; v <= t.hi; v += step) out += '<option value="'+v+'"'+(Number(cur)===v?' selected':'')+'>'+money(v)+' / month</option>';
    return out;
  }
  function choice(path,val,title,desc,eg){
    var on = String(get(path)) === val;
    return '<div class="choice'+(on?' on':'')+'" data-choice="'+path+'" data-val="'+val+'">'
      + '<span class="radio"></span><span style="flex:1"><span class="t">'+title+'</span><div class="d">'+desc+'</div>'
      + (eg ? '<div class="eg">'+eg+'</div>' : '') + '</span></div>';
  }
  function checkRowLoc(i,key,on,title,desc){
    return '<div class="check'+(on?' on':'')+'" data-checkloc="'+i+'" data-lk="'+key+'"><span class="box">'
      + '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></span>'
      + '<span><span class="t">'+title+'</span>'+(desc?'<div class="d">'+desc+'</div>':'')+'</span></div>';
  }
  function checkRow(path,on,title,desc){
    return '<div class="check'+(on?' on':'')+'" data-check="'+path+'"><span class="box">'
      + '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></span>'
      + '<span><span class="t">'+title+'</span>'+(desc?'<div class="d">'+desc+'</div>':'')+'</span></div>';
  }
  function agTerm(n,title,body){
    return '<div class="ag-term"><span class="ag-n">'+n+'</span>'
      + '<span><b>'+title+'</b><span class="ag-d">'+body+'</span></span></div>';
  }
  function note(kind,html){
    var ic = kind === 'lock' ? '<rect x="4.5" y="10" width="15" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/>'
           : kind === 'warn' ? '<path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/>'
           : '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>';
    return '<div class="note '+kind+'">'+icon(ic)+'<div>'+html+'</div></div>';
  }
  function rev(title,stepIdx,rows){
    return '<div class="rev-sec"><div style="display:flex;align-items:center"><p class="rev-h" style="flex:1">'+title+'</p>'
      + '<button class="rev-edit" data-go="'+(stepIdx+1)+'">Edit</button></div>'
      + '<div class="rev-card">'
      + rows.map(function(r){ return '<div class="rev-row"><span class="k">'+r[0]+'</span><span class="v">'+esc(r[1])+'</span></div>'; }).join('')
      + '</div></div>';
  }
  function missing(){
    var m = [];
    if (!S.company.name) m.push('company name');
    if (!S.contact.email) m.push('work email');
    if (!totalHeadcount()) m.push('employee headcount');
    S.locations.forEach(function(l){
      if (l.trackerOn && !l.trackerEmail) m.push('tracker email for ' + (l.name || 'a location'));
    });
    if (S.live.join === 'yes' && !S.live.agreed) m.push('Live Kitchen terms acceptance');
    if (!S.plan.tier) m.push('subscription plan');
    if (!S.billing.email) m.push('billing email');
    return m;
  }

  /* ----------------------------------------------------------- footer */
  function footHTML(){
    if (S.step === 0 || S.step > STEPS.length) return '';
    var last = S.step === STEPS.length;
    return '<div class="foot">'
      + '<button class="btn ghost" data-go="'+(S.step-1)+'">Back</button>'
      + '<span class="sp"></span>'
      + (last ? '<button class="btn primary" data-submit="1">Submit for Approval</button>'
              : '<button class="btn primary" data-go="'+(S.step+1)+'">Next</button>')
      + '</div>';
  }

  /* ----------------------------------------------------------- render */
  var VIEW = { company:stepCompany, locations:stepLocations, program:stepProgram, employees:stepEmployees,
               cuisine:stepCuisine, live:stepLive, payment:stepPayment, plan:stepPlan, review:stepReview };

  function render(){
    var root = document.getElementById('app'), html = '';
    if (S.step === 0)               html = '<div class="stage">'+welcome()+'</div>';
    else if (S.step > STEPS.length) html = '<div class="stage" style="display:block">'+submitted()+'</div>';
    else html = '<div class="rail-wrap">'+railHTML()+'</div><div class="stage">'+VIEW[STEPS[S.step-1].k]()+'</div>';
    root.innerHTML = html + footHTML();
    window.scrollTo(0,0);
    // keep the active step visible when the rail has to scroll on narrow screens
    var act = root.querySelector('.step.active'), wrap = root.querySelector('.rail-wrap');
    if (act && wrap) wrap.scrollLeft = act.offsetLeft - (wrap.clientWidth - act.offsetWidth) / 2;
    document.title = 'Office Grubb — Corporate Onboarding'
      + (S.step>0 && S.step<=STEPS.length ? ' · '+STEPS[S.step-1].cap : '');
  }

  function go(n){
    n = Math.max(0, Math.min(STEPS.length + 1, n));
    // Tier defaults to the headcount fit the first time the plan step is opened.
    if (STEPS[n-1] && STEPS[n-1].k === 'plan' && !S.plan.tier) {
      var f = tierFor(totalHeadcount());
      if (f) { S.plan.tier = f.n; S.plan.rate = f.lo; }
    }
    S.step = n; render();
  }

  /* ----------------------------------------------------------- events */
  document.addEventListener('input', function(e){
    var t = e.target;
    if (t.dataset.bind){
      set(t.dataset.bind, t.value);
      // live-updating steps re-render; plain text fields don't, to keep focus
      if (/^(program\.service|payment\.subsidy|payment\.pct|payment\.guestSubsidy|plan\.rate|company\.headcount|live\.events)$/.test(t.dataset.bind)) softRefresh(t);
    } else if (t.dataset.loc !== undefined && t.dataset.lk){
      S.locations[+t.dataset.loc][t.dataset.lk] = t.value;
      if (t.dataset.lk === 'service' || t.dataset.lk === 'headcount') softRefresh(t);
    } else if (t.dataset.file){
      set(t.dataset.file, t.files && t.files[0] ? t.files[0].name : ''); render();
    }
  });
  document.addEventListener('change', function(e){
    var t = e.target;
    if (t.dataset.bind && t.tagName === 'SELECT'){ set(t.dataset.bind, t.value); render(); }
  });

  // Re-render without stealing focus from the field being edited.
  function softRefresh(src){
    var key = src.dataset.bind || (src.dataset.loc + ':' + src.dataset.lk);
    var pos = src.selectionStart;
    render();
    var next = src.dataset.bind
      ? document.querySelector('[data-bind="'+src.dataset.bind+'"]')
      : document.querySelector('[data-loc="'+src.dataset.loc+'"][data-lk="'+src.dataset.lk+'"]');
    if (next){ next.focus(); try { next.setSelectionRange(pos,pos); } catch(err){} }
  }

  document.addEventListener('click', function(e){
    var el;
    if ((el = e.target.closest('[data-go]')))       return go(+el.dataset.go);
    if ((el = e.target.closest('[data-submit]')))   return go(STEPS.length + 1);
    if ((el = e.target.closest('[data-dash]')))     return (location.href = 'index.html');
    if ((el = e.target.closest('[data-choice]'))){ set(el.dataset.choice, el.dataset.val); return render(); }
    if ((el = e.target.closest('[data-check]'))){ set(el.dataset.check, !get(el.dataset.check)); return render(); }
    if ((el = e.target.closest('[data-tier]'))){
      var t = TIERS[+el.dataset.tier - 1];
      S.plan.tier = t.n; S.plan.rate = t.lo; return render();
    }
    if ((el = e.target.closest('[data-cuisine]'))){
      var c = el.dataset.cuisine, i = S.cuisines.indexOf(c);
      if (i > -1) S.cuisines.splice(i,1); else S.cuisines.push(c);
      return render();
    }
    if ((el = e.target.closest('[data-checkloc]'))){
      var L = S.locations[+el.dataset.checkloc];
      L[el.dataset.lk] = !L[el.dataset.lk];
      return render();
    }
    if ((el = e.target.closest('[data-addloc]'))){ S.locations.push(blankLocation('')); return render(); }
    if ((el = e.target.closest('[data-delloc]'))){ S.locations.splice(+el.dataset.delloc,1); return render(); }
    if ((el = e.target.closest('[data-deldept]'))){ S.employees.departments.splice(+el.dataset.deldept,1); return render(); }
    if ((el = e.target.closest('[data-adddept]'))){
      var box = document.getElementById('deptInput'), v = box && box.value.trim();
      if (v && S.employees.departments.indexOf(v) === -1) S.employees.departments.push(v);
      return render();
    }
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Enter' && e.target.id === 'deptInput'){ e.preventDefault();
      var v = e.target.value.trim();
      if (v && S.employees.departments.indexOf(v) === -1){ S.employees.departments.push(v); render(); }
    }
  });

  render();
})();
