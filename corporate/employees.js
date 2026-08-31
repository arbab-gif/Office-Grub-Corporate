// Corporate → Employees. Roster with status filter, search, and per-row actions:
// view profile, edit details, deactivate / reactivate.
//
// The work email is deliberately read-only everywhere. Employees self-register with
// an address on a registered domain, so the email IS the identity that ties a person
// to this account — editing it would orphan their orders and access rather than
// rename them. Correcting one means deactivating and re-inviting.
(function () {
  var DEPTS = ['Engineering','Operations','Marketing','Finance','Legal','Compliance','People & HR','Facilities'];
  var DROPS = ['Floor 3','Floor 6','Braintree'];

  // The subsidy is set once at onboarding and applies to the whole account.
  // A person's `subsidy` is null when they simply inherit it; a number is an
  // explicit override for that one person.
  var ACCOUNT_SUBSIDY = 15.00;

  // Scheduled orders carry their own lock state. An order locks at the cancellation
  // cutoff — once the kitchen is preparing it, it is going to be made and delivered
  // whatever happens to the account it was placed on.
  // Locked means past the cancellation cutoff — which in practice is today's order,
  // not simply the earliest one. Someone whose next order is Sep 1 has nothing locked.
  function sched(dates){
    return dates.map(function(d){ return { date:d, locked:/^Today/.test(d) }; });
  }

  var PEOPLE = [
    { id:1, name:'Dana Whitfield',    email:'dwhitfield@beaconyards.com',   dept:'Marketing',   drop:'Floor 3',   status:'Active',      enrolled:'Feb 3, 2026',  orders:84,  credit:1260.00, last:'Aug 18, 2026', orders_sched:sched(['Today — Aug 31','Sep 1','Sep 2','Sep 3']), subsidy:null },
    { id:2, name:'Marcus Oyelaran',   email:'moyelaran@beaconyards.com',    dept:'Engineering', drop:'Floor 6',   status:'Active',      enrolled:'Jan 12, 2026', orders:122, credit:1830.00, last:'Aug 19, 2026', orders_sched:sched(['Today — Aug 31','Sep 1','Sep 2','Sep 3','Sep 4']), subsidy:null },
    { id:3, name:'Priya Raghunathan', email:'praghunathan@beaconyards.com', dept:'Legal',       drop:'Floor 3',   status:'Active',      enrolled:'Mar 21, 2026', orders:47,  credit:705.00,  last:'Aug 15, 2026', orders_sched:[], subsidy:null },
    { id:4, name:'Tom Beaulieu',      email:'tbeaulieu@beaconyards.com',    dept:'Operations',  drop:'Floor 3',   status:'Invited',     enrolled:null,           orders:null, credit:0,      last:null,           orders_sched:[], subsidy:null },
    { id:5, name:'Aisha Nkemdirim',   email:'ankemdirim@beaconyards.com',   dept:'Compliance',  drop:'Braintree', status:'Active',      enrolled:'Feb 28, 2026', orders:63,  credit:945.00,  last:'Aug 19, 2026', orders_sched:sched(['Today — Aug 31','Sep 2','Sep 3']), subsidy:null },
    { id:6, name:'Grant Sollazzo',    email:'gsollazzo@byf-capital.com',    dept:'Finance',     drop:'Floor 6',   status:'Deactivated', enrolled:'Nov 4, 2025',  orders:210, credit:3150.00, last:'Jun 30, 2026', orders_sched:[], subsidy:20.00 },
    { id:7, name:'Yuki Tanabe',       email:'ytanabe@beaconyards.com',      dept:'Engineering', drop:'Floor 6',   status:'Active',      enrolled:'Apr 9, 2026',  orders:38,  credit:570.00,  last:'Aug 19, 2026', orders_sched:sched(['Today — Aug 31','Sep 1']), subsidy:null },
    { id:8, name:'Rosalind Achebe',   email:'rachebe@beaconyards.com',      dept:'People & HR', drop:'Floor 3',   status:'Active',      enrolled:'Jan 8, 2026',  orders:91,  credit:1365.00, last:'Aug 18, 2026', orders_sched:sched(['Sep 1','Sep 2']), subsidy:10.00 }
  ];

  var KEBAB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">'
    + '<circle cx="12" cy="6" r=".6"/><circle cx="12" cy="12" r=".6"/><circle cx="12" cy="18" r=".6"/></svg>';
  var LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10" width="15" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>';

  var filter = 'all', term = '', openId = null;
  var rows   = document.getElementById('empRows');
  var empty  = document.getElementById('empEmpty');
  var count  = document.getElementById('empCount');
  var menuEl = document.getElementById('empMenu');
  var scrim  = document.getElementById('empScrim');
  var drawer = document.getElementById('empDrawer');
  var dialog = document.getElementById('empDialog');
  var toast  = document.getElementById('empToast');

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function byId(id){ return PEOPLE.filter(function(p){ return p.id === +id; })[0]; }
  function initials(n){ return n.split(/\s+/).map(function(w){ return w[0]; }).join('').slice(0,2).toUpperCase(); }
  function usd(n){ return '$' + Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function subsidyOf(p){ return p.subsidy == null ? ACCOUNT_SUBSIDY : p.subsidy; }
  function isOverride(p){ return p.subsidy != null; }

  /* ------------------------------------------------------------- table */
  function matches(p){
    if (filter !== 'all' && p.status.toLowerCase() !== filter) return false;
    if (!term) return true;
    return (p.name + ' ' + p.email + ' ' + p.dept + ' ' + p.drop).toLowerCase().indexOf(term) > -1;
  }

  // ?empty=1 shows the before-anyone-exists state without deleting the sample roster
  if (/[?&]empty=1/.test(location.search)) PEOPLE.length = 0;

  function renderBlank(){
    document.querySelector('.cx-toolbar').hidden = true;
    document.querySelector('.cx-privacy').hidden = true;
    document.querySelector('.cx-warn').hidden = true;
    count.hidden = true;
    var host = document.querySelector('.cx-table');
    host.className = 'cx-blank';
    host.innerHTML =
        '<div class="cx-blank-mark"><svg viewBox="0 0 24 24">'
      + '<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/>'
      + '<path d="M18 8v6M21 11h-6"/></svg></div>'
      + '<h2>No employees yet</h2>'
      + '<p>Nobody has been added to Beacon Yards Financial. Invite people and they '
      + 'register themselves — you never set a password for them.</p>'
      + '<button class="cx-btn" id="empInviteBlank">'
        + '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Invite employees</button>'
      + '<div class="cx-blank-steps">'
        + step(1,'You invite','Send work emails on a registered domain — beaconyards.com or byf-capital.com.')
        + step(2,'They register','Each person completes their own sign-up with the company code.')
        + step(3,'They order','Credit applies from their first order. Nothing is billed until then.')
      + '</div>';
  }
  function step(n, t, d){
    return '<div class="cx-blank-step"><i>' + n + '</i><span><b>' + t + '</b><em>' + d + '</em></span></div>';
  }

  function render(){
    if (!PEOPLE.length) return renderBlank();
    var list = PEOPLE.filter(matches);
    rows.innerHTML = list.map(function(p){
      return '<tr' + (p.status === 'Deactivated' ? ' class="off"' : '') + '>'
        + '<th scope="row" class="cx-emp"><b>' + esc(p.name) + '</b><em>' + esc(p.email) + '</em></th>'
        + '<td>' + esc(p.dept) + '</td>'
        + '<td>' + esc(p.drop) + '</td>'
        + '<td><i class="cx-status ' + p.status.toLowerCase() + '">' + p.status + '</i></td>'
        + '<td class="ta-r cx-subs">' + '<b class="mono">' + usd(subsidyOf(p)) + '</b>'
          + '<em class="' + (isOverride(p) ? 'over' : '') + '">'
          + (isOverride(p) ? 'Custom' : 'Default') + '</em></td>'
        + '<td class="mono">' + (p.enrolled || '—') + '</td>'
        + '<td class="ta-r mono">' + (p.orders == null ? '–' : p.orders) + '</td>'
        + '<td class="ta-r"><button class="cx-row-act" data-menu="' + p.id + '"'
          + ' aria-haspopup="menu" aria-label="Actions for ' + esc(p.name) + '">' + KEBAB + '</button></td>'
        + '</tr>';
    }).join('');
    empty.hidden = list.length > 0;
    count.textContent = list.length === PEOPLE.length
      ? PEOPLE.length + ' employees'
      : 'Showing ' + list.length + ' of ' + PEOPLE.length + ' employees';
  }

  /* -------------------------------------------------------- row menu */
  function openMenu(id, anchor){
    var p = byId(id);
    var off = p.status === 'Deactivated';
    menuEl.innerHTML =
        '<button data-act="profile" data-id="' + id + '">View profile</button>'
      + '<button data-act="edit" data-id="' + id + '">Edit details</button>'
      + '<div class="cx-menu-div"></div>'
      + (off
          ? '<button data-act="reactivate" data-id="' + id + '">Reactivate access</button>'
          : '<button class="danger" data-act="deactivate" data-id="' + id + '">Deactivate access</button>');
    menuEl.hidden = false;
    var r = anchor.getBoundingClientRect();
    var top = r.bottom + window.scrollY + 6;
    var left = r.right + window.scrollX - menuEl.offsetWidth;
    // flip above when there is no room below
    if (r.bottom + menuEl.offsetHeight + 12 > window.innerHeight)
      top = r.top + window.scrollY - menuEl.offsetHeight - 6;
    menuEl.style.top = top + 'px';
    menuEl.style.left = Math.max(12, left) + 'px';
  }
  function closeMenu(){ menuEl.hidden = true; }

  /* --------------------------------------------------------- drawer */
  function field(label, value, opts){
    opts = opts || {};
    return '<div class="cx-d-f"><label>' + label + (opts.lock ? ' <i class="cx-lockchip">' + LOCK + 'Locked</i>' : '') + '</label>'
      + (opts.select
          ? '<select data-fld="' + opts.key + '">' + opts.options.map(function(o){
              return '<option' + (o === value ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>'
          : '<input data-fld="' + (opts.key || '') + '" value="' + esc(value) + '"'
            + (opts.lock ? ' readonly aria-readonly="true"' : '') + '>')
      + (opts.help ? '<div class="cx-d-help">' + opts.help + '</div>' : '')
      + '</div>';
  }

  function openDrawer(id, mode){
    hideDialog();
    var p = byId(id); openId = id;
    var head = '<div class="cx-d-head">'
      + '<div class="cx-avatar">' + initials(p.name) + '</div>'
      + '<div class="cx-d-who"><b>' + esc(p.name) + '</b><em>' + esc(p.email) + '</em>'
        + '<i class="cx-status ' + p.status.toLowerCase() + '">' + p.status + '</i></div>'
      + '<button class="cx-d-x" data-close="1" aria-label="Close">✕</button>'
      + '</div>';

    var body;
    if (mode === 'edit'){
      body = '<div class="cx-d-body">'
        + '<div class="cx-d-label">Edit details</div>'
        + field('Full name', p.name, { key:'name' })
        + field('Work email', p.email, { key:'email', lock:true,
            help:'The work email is how this person is identified on the account — it cannot be changed here. '
               + 'To correct it, deactivate this record and re-invite them on the right address.' })
        + field('Department', p.dept, { key:'dept', select:true, options:DEPTS,
            help:'Drives spend-by-department reporting.' })
        + field('Drop point', p.drop, { key:'drop', select:true, options:DROPS,
            help:'Where this person\'s order is delivered. Changing it moves them to that building\'s manifest from the next order.' })
        + '<div class="divider" style="margin:4px 0 16px"></div>'
        + '<div class="cx-d-label">Daily subsidy</div>'
        + '<div class="stack">'
          + subsChoice(p, false, 'Use the account default',
              usd(ACCOUNT_SUBSIDY) + ' per service day, set when the account was onboarded.')
          + subsChoice(p, true, 'Set an amount for this person',
              'Overrides the account default for ' + esc(p.name.split(' ')[0]) + ' only.')
        + '</div>'
        + (isOverride(p)
            ? '<div class="cx-d-f" style="margin-top:14px"><label>Amount per service day</label>'
              + '<div class="cx-money"><span>$</span>'
              + '<input data-fld="subsidy" type="number" step="0.50" min="0" value="'
              + Number(p.subsidy).toFixed(2) + '"></div>'
              + '<div class="cx-d-help">Applies from their next order. Orders already placed keep the '
              + 'amount they were made under.</div></div>'
            : '')
        + '</div>'
        + '<div class="cx-d-foot">'
          + '<button class="cx-btn ghost" data-close="1">Cancel</button>'
          + '<button class="cx-btn" data-save="' + id + '">Save changes</button>'
        + '</div>';
    } else {
      body = '<div class="cx-d-body">'
        + '<div class="cx-d-label">Profile</div>'
        + '<div class="cx-mf-rows">'
          + row('Department', p.dept)
          + row('Drop point', p.drop)
          + row('Subsidy', usd(subsidyOf(p)) + ' / day · '
              + (isOverride(p) ? 'set for this person' : 'account default'))
          + row('Status', p.status)
          + row('Enrolled', p.enrolled || 'Not yet — invitation outstanding')
        + '</div>'
        + '<div class="cx-d-label">Activity</div>'
        + '<div class="cx-d-stats">'
          + stat(p.orders == null ? '–' : p.orders, 'Orders')
          + stat(usd(p.credit), 'Credit used')
          + stat(p.last || '—', 'Last order')
        + '</div>'
        + '<div class="cx-privacy" style="margin-top:18px">'
          + '<svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>'
          + '<span>You see totals only. What this person ordered, and any allergies or dietary needs, are never shared with your organization.</span>'
        + '</div>'
        + '</div>'
        + '<div class="cx-d-foot">'
          + '<button class="cx-btn ghost" data-close="1">Close</button>'
          + '<button class="cx-btn" data-edit="' + id + '">Edit details</button>'
        + '</div>';
    }
    drawer.innerHTML = head + body;
    drawer.hidden = false; scrim.hidden = false;
    requestAnimationFrame(function(){ drawer.classList.add('in'); });
  }
  function row(k, v){ return '<div class="cx-mf-r"><span>' + k + '</span><b>' + esc(v) + '</b></div>'; }
  function subsChoice(p, custom, title, desc){
    var on = isOverride(p) === custom;
    return '<div class="choice-lite' + (on ? ' on' : '') + '" data-subs="' + (custom ? 'custom' : 'default') + '">'
      + '<span class="radio"></span><span><b>' + title + '</b><em>' + desc + '</em></span></div>';
  }
  function stat(v, l){ return '<div class="cx-d-stat"><b>' + esc(v) + '</b><em>' + l + '</em></div>'; }

  function closeDrawer(){
    hideDrawer();
    if (dialog.hidden) scrim.hidden = true;
  }

  /* -------------------------------------------------- deactivation */
  // Two steps, not one confirm. Offboarding almost always happens mid-day, when the
  // person has already ordered lunch — so what happens to their in-flight order is a
  // real decision, not a footnote. Defaults follow the intent: immediate cut-off
  // cancels everything, end-of-day lets today's lunch arrive.
  var DEA = null;

  // The drawer and the dialog are both modal, so only one may be open at a time —
  // otherwise the dialog lands on top of a still-open drawer.
  function startDeactivate(id){
    hideDrawer();
    DEA = { id:id };
    renderDeactivate();
  }
  function hideDrawer(){
    drawer.classList.remove('in');
    drawer.hidden = true;
    openId = null; INV = null;
  }
  function hideDialog(){ dialog.hidden = true; DEA = null; }

  // No choice is offered here. The order lock already decides each order's fate, so
  // the modal states the outcome rather than asking the admin to reason it out.
  function renderDeactivate(){
    var p = byId(DEA.id);
    var list = p.orders_sched || [];
    var willCancel = list.filter(function(o){ return !o.locked; });

    var body = '<h3>Deactivate Employee?</h3>'
      + '<p>' + esc(p.name) + ' will no longer have access to Office Grubb.</p>';

    if (list.length){
      body += '<div class="cx-d-label" style="margin:20px 0 10px">Scheduled orders</div>'
        + '<p class="cx-dialog-note" style="margin-bottom:12px">This employee has '
        + list.length + ' scheduled order' + (list.length > 1 ? 's' : '')
        + '. Based on their current order status:</p>'
        + '<div class="cx-orders">' + list.map(function(o){
            return '<div class="cx-order' + (o.locked ? ' locked' : '') + '">'
              + '<span class="cx-order-d">' + esc(o.date) + '</span>'
              + '<span class="cx-order-s"><i></i>'
                + (o.locked ? 'Order locked' : 'Will be cancelled') + '</span>'
              + '<span class="cx-order-n">' + (o.locked
                  ? 'This order will remain active and be delivered.'
                  : 'This order is still within the cancellation window.') + '</span>'
              + '</div>';
          }).join('') + '</div>'
        + '<p class="cx-dialog-note" style="margin-top:12px">Any order that has passed the '
        + 'cancellation lock will remain active. Future unlocked orders will be cancelled and '
        + 'refunded if eligible.</p>';
    } else {
      body += '<div class="cx-d-label" style="margin:20px 0 10px">Scheduled orders</div>'
        + '<p class="cx-dialog-note">This employee has no scheduled orders. '
        + 'Nothing will be cancelled or refunded.</p>';
    }

    body += '<div class="cx-dialog-foot">'
        + '<button class="cx-btn ghost" data-dclose="1">Cancel</button>'
        + '<button class="cx-btn danger" data-confirm="' + DEA.id + '">Deactivate Employee</button>'
      + '</div>';

    dialog.innerHTML = '<div class="cx-dialog wide">'
      + '<button class="cx-d-x cx-dialog-x" data-dclose="1" aria-label="Cancel">✕</button>'
      + body + '</div>';
    dialog.hidden = false; scrim.hidden = false;
  }

  // Reactivation is not the inverse of deactivation: access does not simply resume.
  // The person must register again, so the modal says so rather than implying a toggle.
  function startReactivate(id){
    hideDrawer();
    DEA = { id:id, mode:'reactivate' };
    renderReactivate();
  }

  function renderReactivate(){
    var p = byId(DEA.id);
    dialog.innerHTML = '<div class="cx-dialog wide">'
      + '<button class="cx-d-x cx-dialog-x" data-dclose="1" aria-label="Cancel">✕</button>'
      + '<h3>Reactivate Employee?</h3>'
      + '<p>' + esc(p.name) + ' will be invited back to Office Grubb. They stay <b>Invited</b> '
        + 'until they complete registration — access does not resume on its own.</p>'

      + '<div class="cx-d-label" style="margin:20px 0 10px">What comes back</div>'
      + '<div class="cx-mf-rows">'
        + '<div class="cx-mf-r"><span>Invitation sent to</span><b>' + esc(p.email) + '</b></div>'
        + '<div class="cx-mf-r"><span>Department</span><b>' + esc(p.dept) + '</b></div>'
        + '<div class="cx-mf-r"><span>Drop point</span><b>' + esc(p.drop) + '</b></div>'
        + '<div class="cx-mf-r"><span>Subsidy</span><b>' + usd(subsidyOf(p)) + ' / day · '
          + (isOverride(p) ? 'their own amount' : 'account default') + '</b></div>'
      + '</div>'

      + '<div class="cx-d-label" style="margin:20px 0 10px">What does not</div>'
      + '<div class="cx-mf-rows">'
        + '<div class="cx-mf-r"><span>Cancelled orders</span><b>Not restored — they order again themselves</b></div>'
        + '<div class="cx-mf-r"><span>Order history</span><b>' + (p.orders || 0)
          + ' past orders stay on the account</b></div>'
      + '</div>'

      + '<p class="cx-dialog-note" style="margin-top:14px">The company code starts working for them '
      + 'again once they accept. Logged with who did it and when.</p>'

      + '<div class="cx-dialog-foot">'
        + '<button class="cx-btn ghost" data-dclose="1">Cancel</button>'
        + '<button class="cx-btn" data-reconfirm="' + DEA.id + '">Reactivate Employee</button>'
      + '</div></div>';
    dialog.hidden = false; scrim.hidden = false;
  }

  function closeDialog(){ hideDialog(); if (drawer.hidden) scrim.hidden = true; }

  function say(msg){
    toast.textContent = msg; toast.hidden = false;
    clearTimeout(say._t);
    say._t = setTimeout(function(){ toast.hidden = true; }, 4000);
  }

  /* --------------------------------------------------- invite flow */
  // Two rules from the account model drive this whole screen:
  //   1. an invite is only valid to an address on a registered domain
  //   2. a person is identified by the building their invite was sent FROM,
  //      so the drop point is part of the invitation, not an afterthought
  var DOMAINS = ['beaconyards.com', 'byf-capital.com'];
  var INV = null;

  var ISTEPS = ['How', 'Who', 'Review'];
  function blankInvite(){
    return { step:1, method:'', emails:[], draft:'', dept:'Engineering', drop:'Floor 3', file:'' };
  }
  function domainOf(e){ var m = /@(.+)$/.exec(e.trim()); return m ? m[1].toLowerCase() : ''; }
  function validEmail(e){ return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e.trim()); }
  function okEmail(e){ return validEmail(e) && DOMAINS.indexOf(domainOf(e)) > -1; }
  function alreadyOn(e){ return PEOPLE.some(function(p){ return p.email.toLowerCase() === e.trim().toLowerCase(); }); }
  function goodEmails(){ return INV.emails.filter(function(e){ return okEmail(e) && !alreadyOn(e); }); }

  function renderInvite(){
    var bad = INV.emails.filter(function(e){ return !okEmail(e) || alreadyOn(e); });
    var good = goodEmails();

    var head = '<div class="cx-d-head">'
      + '<div class="cx-avatar">+</div>'
      + '<div class="cx-d-who"><b>Invite employees</b>'
        + '<em>Step ' + INV.step + ' of 3 · ' + ISTEPS[INV.step - 1] + '</em></div>'
      + '<button class="cx-d-x" data-iclose="1" aria-label="Close">✕</button></div>'
      + '<div class="cx-istrip">' + ISTEPS.map(function(s, i){
          return '<i class="' + (i < INV.step ? 'on' : '') + '"></i>'; }).join('') + '</div>';

    var body;
    if (INV.step === 1){
      // How first: pasting five addresses and importing two hundred are different jobs
      body = '<div class="cx-d-body">'
        + '<div class="cx-d-label">How are you adding people?</div>'
        + '<div class="stack">'
          + imethod('email', 'Enter addresses', 'Type or paste work emails. Best for a handful of people.')
          + imethod('csv', 'Upload a CSV', 'Bulk import. Columns: First name, Last name, Work email, Department.')
        + '</div>'
        + (INV.method === 'csv'
            ? '<div class="cx-d-f" style="margin-top:18px"><label>CSV file</label>'
              + '<input type="file" accept=".csv" data-icsv="1" style="height:auto;padding:11px 12px">'
              + '<div class="cx-d-help">' + (INV.file
                  ? '<b style="color:#186a3b">' + esc(INV.file) + '</b> — addresses are validated against your registered domains on the next step.'
                  : 'Every row is checked against your registered domains before anything is sent.') + '</div></div>'
            : '')
        + '<div class="cx-privacy" style="margin-top:18px">'
          + '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/></svg>'
          + '<span>Whichever route you take, people finish registration themselves with the company code. '
          + 'You never set a password for them.</span></div>'
        + '</div>'
        + '<div class="cx-d-foot">'
          + '<button class="cx-btn ghost" data-iclose="1">Cancel</button>'
          + '<button class="cx-btn" data-istep="2"' + (INV.method ? '' : ' disabled') + '>Continue</button>'
        + '</div>';
    } else if (INV.step === 2){
      body = '<div class="cx-d-body">'
        + '<div class="cx-d-label">Work emails</div>'
        + '<div class="cx-inv-emails" id="invBox">'
          + INV.emails.map(function(e, i){
              var problem = !okEmail(e) ? (validEmail(e) ? 'Not a registered domain' : 'Not a valid email')
                          : alreadyOn(e) ? 'Already on the account' : '';
              return '<span class="cx-echip' + (problem ? ' bad' : '') + '"'
                + (problem ? ' title="' + problem + '"' : '') + '>'
                + '<span>' + esc(e) + '</span><button data-remail="' + i + '" aria-label="Remove">×</button></span>';
            }).join('')
          + '<input id="invInput" placeholder="' + (INV.emails.length ? 'Add another…' : 'name@beaconyards.com')
            + '" value="' + esc(INV.draft) + '">'
        + '</div>'
        + '<div class="cx-d-help">Type or paste addresses, separated by comma, space or Enter. '
          + 'Only <b>' + DOMAINS.join('</b> and <b>') + '</b> are registered on this account — '
          + 'anything else cannot self-register and is rejected here.</div>'
        + (bad.length ? '<div class="cx-warn" style="margin-top:14px"><svg viewBox="0 0 24 24">'
            + '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg><span><b>'
            + bad.length + ' address' + (bad.length > 1 ? 'es' : '') + ' cannot be invited.</b> '
            + 'Hover a red chip to see why. They will be skipped.</span></div>' : '')
        + '<div class="cx-d-label" style="margin-top:22px">Assign</div>'
        + field('Department', INV.dept, { key:'idept', select:true, options:DEPTS,
            help:'Applies to everyone in this batch. You can correct it per person afterwards.' })
        + field('Drop point', INV.drop, { key:'idrop', select:true, options:DROPS,
            help:'The building the invitation is sent from. This is how each person is identified on the account, '
               + 'and where their order is delivered.' })
        + '</div>'
        + '<div class="cx-d-foot">'
          + '<button class="cx-btn ghost" data-istep="1">Back</button>'
          + '<button class="cx-btn" data-istep="3"' + (good.length ? '' : ' disabled') + '>'
            + (good.length ? 'Review ' + good.length : 'Review') + '</button>'
        + '</div>';
    } else {
      body = '<div class="cx-d-body">'
        + '<div class="cx-d-label">Review</div>'
        + '<div class="cx-mf-rows">'
          + row('Invitations', good.length + ' ' + (good.length === 1 ? 'person' : 'people'))
          + row('Department', INV.dept)
          + row('Drop point', INV.drop)
          + (bad.length ? row('Skipped', bad.length + ' invalid or already on the account') : '')
        + '</div>'
        + '<div class="cx-d-label" style="margin-top:22px">Receiving</div>'
        + '<div class="cx-inv-emails" style="min-height:0">'
          + good.map(function(e){ return '<span class="cx-echip"><span>' + esc(e) + '</span></span>'; }).join('')
        + '</div>'
        // show the actual invitation — nobody should send 200 of something unseen
        + '<div class="cx-d-label" style="margin-top:22px">What they receive</div>'
        + '<div class="cx-mail">'
          + '<div class="cx-mail-h"><span class="cx-mail-from">Office Grubb</span>'
            + '<span class="cx-mail-sub">Lunch is on Beacon Yards Financial</span></div>'
          + '<div class="cx-mail-b">'
            + '<p>You have been added to the Office Grubb meal programme at '
            + '<b>' + esc(INV.drop) + '</b>.</p>'
            + '<p><b>$15.00</b> of credit each service day — Mon, Tue, Wed and Thu. '
            + 'Order by <b>10:30&nbsp;AM</b>, lunch arrives at <b>12:00&nbsp;PM</b>.</p>'
            + '<div class="cx-mail-code">Company code <b>OG-BLFB-6KKM-BBUL</b></div>'
            + '<span class="cx-mail-btn">Set up my account</span>'
          + '</div>'
        + '</div>'
        + '<div class="cx-privacy" style="margin-top:18px">'
          + '<svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>'
          + '<span>They appear as <b>Invited</b> until they register — no credit is used and nothing is billed until they order.</span>'
        + '</div>'
        + '</div>'
        + '<div class="cx-d-foot">'
          + '<button class="cx-btn ghost" data-istep="2">Back</button>'
          + '<button class="cx-btn" data-isend="1">Send ' + good.length + ' invitation'
            + (good.length === 1 ? '' : 's') + '</button>'
        + '</div>';
    }
    drawer.innerHTML = head + body;
    drawer.hidden = false; scrim.hidden = false;
    requestAnimationFrame(function(){ drawer.classList.add('in'); });
    var inp = document.getElementById('invInput');
    if (inp){ inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
  }

  function imethod(val, title, desc){
    var on = INV.method === val;
    return '<div class="choice-lite' + (on ? ' on' : '') + '" data-imethod="' + val + '">'
      + '<span class="radio"></span><span><b>' + title + '</b><em>' + desc + '</em></span></div>';
  }

  function commitDraft(){
    if (!INV.draft.trim()) return;
    INV.draft.split(/[,\s;]+/).forEach(function(e){
      if (e.trim() && INV.emails.indexOf(e.trim()) === -1) INV.emails.push(e.trim());
    });
    INV.draft = '';
  }

  document.addEventListener('click', function(e){
    if (!e.target.closest('#empInvite, #empInviteBlank')) return;
    hideDialog();
    INV = blankInvite(); renderInvite();
  });

  drawer.addEventListener('change', function(e){
    if (!INV || !e.target.dataset || !e.target.dataset.icsv) return;
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    INV.file = f.name;
    // parse the CSV client-side so the validation step sees real addresses
    var r = new FileReader();
    r.onload = function(){
      String(r.result).split(/\r?\n/).forEach(function(line, i){
        if (!line.trim()) return;
        var cols = line.split(',').map(function(c){ return c.trim().replace(/^"|"$/g,''); });
        var addr = cols.filter(function(c){ return c.indexOf('@') > -1; })[0];
        if (!addr) return;                                  // header row or junk
        if (INV.emails.indexOf(addr) === -1) INV.emails.push(addr);
      });
      renderInvite();
    };
    r.readAsText(f);
    renderInvite();
  });

  drawer.addEventListener('input', function(e){
    if (!INV) return;
    if (e.target.id === 'invInput'){
      var v = e.target.value;
      if (/[,\s;]$/.test(v)){ INV.draft = v; commitDraft(); renderInvite(); }
      else INV.draft = v;
      return;
    }
    if (e.target.dataset.fld === 'idept') INV.dept = e.target.value;
    if (e.target.dataset.fld === 'idrop') INV.drop = e.target.value;
  });
  drawer.addEventListener('keydown', function(e){
    if (!INV || e.target.id !== 'invInput') return;
    if (e.key === 'Enter'){ e.preventDefault(); commitDraft(); renderInvite(); }
    if (e.key === 'Backspace' && !e.target.value && INV.emails.length){
      INV.emails.pop(); renderInvite();
    }
  });

  /* ------------------------------------------------------- events */
  document.getElementById('empTabs').addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b) return;
    this.querySelectorAll('button').forEach(function(x){
      x.classList.remove('on'); x.setAttribute('aria-selected','false'); });
    b.classList.add('on'); b.setAttribute('aria-selected','true');
    filter = b.dataset.f; render();
  });
  document.getElementById('empSearch').addEventListener('input', function(){
    term = this.value.trim().toLowerCase(); render();
  });

  document.addEventListener('click', function(e){
    var el;
    if ((el = e.target.closest('[data-menu]'))){
      var same = !menuEl.hidden && menuEl.dataset.for === el.dataset.menu;
      closeMenu();
      if (!same){ menuEl.dataset.for = el.dataset.menu; openMenu(el.dataset.menu, el); }
      return;
    }
    if ((el = e.target.closest('[data-act]'))){
      var id = el.dataset.id, act = el.dataset.act;
      closeMenu();
      if (act === 'profile') return openDrawer(id, 'view');
      if (act === 'edit')    return openDrawer(id, 'edit');
      if (act === 'deactivate') return startDeactivate(id);
      if (act === 'reactivate') return startReactivate(id);
    }
    if ((el = e.target.closest('[data-subs]'))){
      if (openId == null) return;
      var q = byId(openId);
      q.subsidy = el.dataset.subs === 'custom' ? subsidyOf(q) : null;
      return openDrawer(openId, 'edit');
    }
    if ((el = e.target.closest('[data-edit]')))  return openDrawer(el.dataset.edit, 'edit');
    if ((el = e.target.closest('[data-close]'))) return closeDrawer();
    if ((el = e.target.closest('[data-dclose]')))return closeDialog();
    // every handler below reads flow state that a close/Escape may have cleared
    if ((el = e.target.closest('[data-reconfirm]'))){
      if (!DEA) return;
      var r = byId(el.dataset.reconfirm);
      r.status = 'Invited';
      closeDialog(); render();
      say(r.name + ' reactivated — invitation sent to ' + r.email + '.');
      return;
    }
    if ((el = e.target.closest('[data-confirm]'))){
      if (!DEA) return;
      var p = byId(el.dataset.confirm);
      var list = p.orders_sched || [];
      var cancelled = list.filter(function(o){ return !o.locked; }).length;
      var kept = list.length - cancelled;

      // access ends immediately; locked orders survive because the kitchen is
      // already making them
      p.status = 'Deactivated';
      p.orders_sched = list.filter(function(o){ return o.locked; });

      closeDialog(); closeDrawer(); render();
      say(p.name + ' deactivated.'
        + (cancelled ? ' ' + cancelled + ' order' + (cancelled > 1 ? 's' : '') + ' cancelled and refunded.' : '')
        + (kept ? ' ' + kept + ' locked order will still be delivered.' : '')
        + (!cancelled && !kept ? ' No scheduled orders affected.' : ''));
      return;
    }
    if ((el = e.target.closest('[data-save]'))){
      var q = byId(el.dataset.save);
      drawer.querySelectorAll('[data-fld]').forEach(function(f){
        var k = f.dataset.fld;
        if (!k || f.hasAttribute('readonly')) return;   // email never written back
        q[k] = k === 'subsidy' ? (parseFloat(f.value) || 0) : f.value;
      });
      closeDrawer(); render(); say(q.name + '’s details updated.');
      return;
    }
    if ((el = e.target.closest('[data-remail]'))){
      if (!INV) return; INV.emails.splice(+el.dataset.remail, 1); return renderInvite();
    }
    if ((el = e.target.closest('[data-imethod]'))){
      if (!INV) return; INV.method = el.dataset.imethod; return renderInvite();
    }
    if ((el = e.target.closest('[data-istep]'))){
      if (!INV) return; commitDraft(); INV.step = +el.dataset.istep; return renderInvite();
    }
    if ((el = e.target.closest('[data-iclose]'))){ INV = null; return closeDrawer(); }
    if ((el = e.target.closest('[data-isend]'))){
      if (!INV) return;
      var sent = goodEmails();
      sent.forEach(function(addr){
        PEOPLE.push({ id: Date.now() + Math.floor(sent.indexOf(addr)),
          name: addr.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, function(c){ return c.toUpperCase(); }),
          email: addr, dept: INV.dept, drop: INV.drop, status:'Invited',
          enrolled:null, orders:null, credit:0, last:null });
      });
      INV = null; closeDrawer(); render();
      say(sent.length + ' invitation' + (sent.length === 1 ? '' : 's') + ' sent — they appear as Invited until they register.');
      return;
    }
    if (!e.target.closest('#empMenu')) closeMenu();
  });

  scrim.addEventListener('click', function(){ closeDialog(); closeDrawer(); });
  document.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;
    if (!dialog.hidden) return closeDialog();
    if (!drawer.hidden) return closeDrawer();
    closeMenu();
  });

  render();
})();
