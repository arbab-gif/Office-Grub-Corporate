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

  var PEOPLE = [
    { id:1, name:'Dana Whitfield',    email:'dwhitfield@beaconyards.com',   dept:'Marketing',   drop:'Floor 3',   status:'Active',      enrolled:'Feb 3, 2026',  orders:84,  credit:1260.00, last:'Aug 18, 2026' },
    { id:2, name:'Marcus Oyelaran',   email:'moyelaran@beaconyards.com',    dept:'Engineering', drop:'Floor 6',   status:'Active',      enrolled:'Jan 12, 2026', orders:122, credit:1830.00, last:'Aug 19, 2026' },
    { id:3, name:'Priya Raghunathan', email:'praghunathan@beaconyards.com', dept:'Legal',       drop:'Floor 3',   status:'Active',      enrolled:'Mar 21, 2026', orders:47,  credit:705.00,  last:'Aug 15, 2026' },
    { id:4, name:'Tom Beaulieu',      email:'tbeaulieu@beaconyards.com',    dept:'Operations',  drop:'Floor 3',   status:'Invited',     enrolled:null,           orders:null, credit:0,      last:null },
    { id:5, name:'Aisha Nkemdirim',   email:'ankemdirim@beaconyards.com',   dept:'Compliance',  drop:'Braintree', status:'Active',      enrolled:'Feb 28, 2026', orders:63,  credit:945.00,  last:'Aug 19, 2026' },
    { id:6, name:'Grant Sollazzo',    email:'gsollazzo@byf-capital.com',    dept:'Finance',     drop:'Floor 6',   status:'Deactivated', enrolled:'Nov 4, 2025',  orders:210, credit:3150.00, last:'Jun 30, 2026' },
    { id:7, name:'Yuki Tanabe',       email:'ytanabe@beaconyards.com',      dept:'Engineering', drop:'Floor 6',   status:'Active',      enrolled:'Apr 9, 2026',  orders:38,  credit:570.00,  last:'Aug 19, 2026' },
    { id:8, name:'Rosalind Achebe',   email:'rachebe@beaconyards.com',      dept:'People & HR', drop:'Floor 3',   status:'Active',      enrolled:'Jan 8, 2026',  orders:91,  credit:1365.00, last:'Aug 18, 2026' }
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

  /* ------------------------------------------------------------- table */
  function matches(p){
    if (filter !== 'all' && p.status.toLowerCase() !== filter) return false;
    if (!term) return true;
    return (p.name + ' ' + p.email + ' ' + p.dept + ' ' + p.drop).toLowerCase().indexOf(term) > -1;
  }

  function render(){
    var list = PEOPLE.filter(matches);
    rows.innerHTML = list.map(function(p){
      return '<tr' + (p.status === 'Deactivated' ? ' class="off"' : '') + '>'
        + '<th scope="row" class="cx-emp"><b>' + esc(p.name) + '</b><em>' + esc(p.email) + '</em></th>'
        + '<td>' + esc(p.dept) + '</td>'
        + '<td>' + esc(p.drop) + '</td>'
        + '<td><i class="cx-status ' + p.status.toLowerCase() + '">' + p.status + '</i></td>'
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
  function stat(v, l){ return '<div class="cx-d-stat"><b>' + esc(v) + '</b><em>' + l + '</em></div>'; }

  function closeDrawer(){
    drawer.classList.remove('in');
    drawer.hidden = true; scrim.hidden = true; openId = null;
  }

  /* ------------------------------------------------------ confirm */
  function confirmDeactivate(id){
    var p = byId(id);
    dialog.innerHTML = '<div class="cx-dialog">'
      + '<h3>Deactivate ' + esc(p.name) + '?</h3>'
      + '<p>They are detached immediately — no menu, no credit. Any scheduled orders are '
      + 'cancelled and refunded, and the company code stops working for them, so they cannot '
      + 'simply re-enter it.</p>'
      + '<p class="cx-dialog-note">This is logged with who did it and when. You can reactivate them later, '
      + 'but they will need a fresh invitation.</p>'
      + '<div class="cx-dialog-foot">'
        + '<button class="cx-btn ghost" data-dclose="1">Keep active</button>'
        + '<button class="cx-btn danger" data-confirm="' + id + '">Deactivate access</button>'
      + '</div></div>';
    dialog.hidden = false; scrim.hidden = false;
  }
  function closeDialog(){ dialog.hidden = true; if (drawer.hidden) scrim.hidden = true; }

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

  function blankInvite(){
    return { step:1, emails:[], draft:'', dept:'Engineering', drop:'Floor 3', method:'email', file:'' };
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
        + '<em>Step ' + INV.step + ' of 2 · ' + (INV.step === 1 ? 'Who and where' : 'Review and send') + '</em></div>'
      + '<button class="cx-d-x" data-iclose="1" aria-label="Close">✕</button></div>';

    var body;
    if (INV.step === 1){
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
          + '<button class="cx-btn ghost" data-iclose="1">Cancel</button>'
          + '<button class="cx-btn" data-istep="2"' + (good.length ? '' : ' disabled') + '>'
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
        + '<div class="cx-privacy" style="margin-top:18px">'
          + '<svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>'
          + '<span>Each person receives the company code and completes their own registration. '
          + 'They appear as <b>Invited</b> until they do — no credit is used and nothing is billed until they order.</span>'
        + '</div>'
        + '</div>'
        + '<div class="cx-d-foot">'
          + '<button class="cx-btn ghost" data-istep="1">Back</button>'
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

  function commitDraft(){
    if (!INV.draft.trim()) return;
    INV.draft.split(/[,\s;]+/).forEach(function(e){
      if (e.trim() && INV.emails.indexOf(e.trim()) === -1) INV.emails.push(e.trim());
    });
    INV.draft = '';
  }

  var inviteBtn = document.getElementById('empInvite');
  if (inviteBtn) inviteBtn.addEventListener('click', function(){
    INV = blankInvite(); renderInvite();
  });

  drawer.addEventListener('input', function(e){
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
    if (e.target.id !== 'invInput') return;
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
      if (act === 'deactivate') return confirmDeactivate(id);
      if (act === 'reactivate'){
        byId(id).status = 'Invited';
        render(); say(byId(id).name + ' reactivated — a fresh invitation has been sent.');
        return;
      }
    }
    if ((el = e.target.closest('[data-edit]')))  return openDrawer(el.dataset.edit, 'edit');
    if ((el = e.target.closest('[data-close]'))) return closeDrawer();
    if ((el = e.target.closest('[data-dclose]')))return closeDialog();
    if ((el = e.target.closest('[data-confirm]'))){
      var p = byId(el.dataset.confirm);
      p.status = 'Deactivated';
      closeDialog(); closeDrawer(); render();
      say(p.name + ' deactivated. Scheduled orders cancelled and refunded.');
      return;
    }
    if ((el = e.target.closest('[data-save]'))){
      var q = byId(el.dataset.save);
      drawer.querySelectorAll('[data-fld]').forEach(function(f){
        var k = f.dataset.fld;
        if (!k || f.hasAttribute('readonly')) return;   // email never written back
        q[k] = f.value;
      });
      closeDrawer(); render(); say(q.name + '’s details updated.');
      return;
    }
    if ((el = e.target.closest('[data-remail]'))){
      INV.emails.splice(+el.dataset.remail, 1); return renderInvite();
    }
    if ((el = e.target.closest('[data-istep]'))){
      commitDraft(); INV.step = +el.dataset.istep; return renderInvite();
    }
    if ((el = e.target.closest('[data-iclose]'))){ INV = null; return closeDrawer(); }
    if ((el = e.target.closest('[data-isend]'))){
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
