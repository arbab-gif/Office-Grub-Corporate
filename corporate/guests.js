// Corporate → Guests.
// A guest pass is issued by an employee and valid for one service day. Guest credit
// is billed separately under GL 6410-GST and never appears inside a department
// figure — which is why guests are their own screen rather than a filter on the roster.
(function () {
  // The corporation sets a company-wide standard and may raise it for one visitor —
  // a VIP guest gets more without moving everyone else. null means "follow the standard".
  var ACCOUNT_GUEST_SUBSIDY = 15.00;

  // A guest is a user on the account, like an employee — they are added, they order
  // from the same menu, and they carry their own budget. There is no host.
  var GUESTS = [
    { id:1, name:'Rebecca Osei',   email:'r.osei@northgatelegal.com',      org:'Northgate Legal',
      drop:'Floor 3',   visit:'Today — Aug 31', status:'Active',  credit:15.00, subsidy:null },
    { id:2, name:'Daniel Fitzroy', email:'d.fitzroy@meridianaudit.com',    org:'Meridian Audit',
      drop:'Floor 6',   visit:'Today — Aug 31', status:'Active',  credit:15.00, subsidy:null },
    { id:3, name:'Ana Beltrán',    email:'ana@cortezdesign.com',           org:'Cortez Design',
      drop:'Floor 3',   visit:'Sep 2',          status:'Active',  credit:0,     subsidy:50.00 },
    { id:4, name:'Ken Nakamura',   email:'k.nakamura@harborline.com',      org:'Harborline Capital',
      drop:'Floor 6',   visit:'Sep 3',          status:'Active',  credit:0,     subsidy:null },
    { id:5, name:'Marta Silva',    email:'m.silva@northgatelegal.com',     org:'Northgate Legal',
      drop:'Floor 3',   visit:'Aug 26',         status:'Expired', credit:15.00, subsidy:null },
    { id:6, name:'Tobias Lund',    email:'t.lund@meridianaudit.com',       org:'Meridian Audit',
      drop:'Braintree', visit:'Aug 21',         status:'Expired', credit:15.00, subsidy:null }
  ];
  function subsidyOf(g){ return g.subsidy == null ? ACCOUNT_GUEST_SUBSIDY : g.subsidy; }
  function isVip(g){ return g.subsidy != null; }

  // ?empty=1 shows the before-anyone-exists state without deleting the sample data
  if (/[?&]empty=1/.test(location.search)) GUESTS.length = 0;

  var KEBAB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">'
    + '<circle cx="12" cy="6" r=".6"/><circle cx="12" cy="12" r=".6"/><circle cx="12" cy="18" r=".6"/></svg>';

  var filter = 'all', term = '';
  var rows  = document.getElementById('gxRows');
  var empty = document.getElementById('gxEmpty');
  var count = document.getElementById('gxCount');
  var host  = document.getElementById('gxHost');
  var kpis  = document.getElementById('gxKpis');

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function usd(n){ return '$' + Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }

  function matches(g){
    if (filter !== 'all' && g.status.toLowerCase() !== filter) return false;
    if (!term) return true;
    return (g.name + ' ' + g.org + ' ' + g.email + ' ' + g.drop).toLowerCase().indexOf(term) > -1;
  }

  function renderKpis(){
    var active = GUESTS.filter(function(g){ return g.status === 'Active'; }).length;
    var spent  = GUESTS.reduce(function(a, g){ return a + g.credit; }, 0);
    kpis.innerHTML =
        kpi('Active guests', String(active), 'Passes valid for an upcoming service day')
      + kpi('Guest credit this period', usd(spent), 'Billed separately, under GL 6410-GST')
      + kpi('On a raised budget', String(GUESTS.filter(isVip).length),
            'Guests given more than the ' + usd(ACCOUNT_GUEST_SUBSIDY) + ' standard');
  }
  function kpi(k, v, m){
    return '<div class="cx-kpi col-4"><div class="cx-k">' + k + '</div>'
      + '<div class="cx-v">' + v + '</div><div class="cx-m">' + m + '</div></div>';
  }

  function renderBlank(){
    document.querySelector('.cx-toolbar').hidden = true;
    document.querySelector('.cx-privacy').hidden = true;
    count.hidden = true; kpis.hidden = true;
    host.className = 'cx-blank';
    host.innerHTML =
        '<div class="cx-blank-mark"><svg viewBox="0 0 24 24">'
      + '<circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/></svg></div>'
      + '<h2>No guests yet</h2>'
      + '<p>No visitors have been added to this account. A guest is a user like an '
      + 'employee — they order from the same menu, on their own budget.</p>'
      + '<button class="cx-btn" id="gxInviteBlank">'
        + '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Add a guest</button>'
      + '<div class="cx-blank-steps">'
        + step(1,'You add them','Name, work email and the building they are visiting.')
        + step(2,'They order','From the same menu as your team, on the day of their visit.')
        + step(3,'Billed separately','Guest credit sits on its own invoice line, never inside a department total.')
      + '</div>';
  }
  function step(n, t, d){
    return '<div class="cx-blank-step"><i>' + n + '</i><span><b>' + t + '</b><em>' + d + '</em></span></div>';
  }

  function render(){
    if (!GUESTS.length) return renderBlank();
    renderKpis();
    var list = GUESTS.filter(matches);
    rows.innerHTML = list.map(function(g){
      return '<tr' + (g.status === 'Expired' ? ' class="off"' : '') + '>'
        + '<th scope="row" class="cx-emp"><b>' + esc(g.name) + '</b><em>' + esc(g.email) + '</em></th>'
        + '<td>' + esc(g.org) + '</td>'
        + '<td>' + esc(g.drop) + '</td>'
        + '<td class="mono">' + esc(g.visit) + '</td>'
        + '<td><i class="cx-status ' + g.status.toLowerCase() + '">' + g.status + '</i></td>'
        + '<td class="ta-r cx-subs"><b class="mono">' + usd(subsidyOf(g)) + '</b>'
          + '<em class="' + (isVip(g) ? 'over' : '') + '">' + (isVip(g) ? 'VIP' : 'Standard') + '</em></td>'
        + '<td class="ta-r mono">' + (g.credit ? usd(g.credit) : '—') + '</td>'
        + '<td class="ta-r"><button class="cx-row-act" data-budget="' + g.id + '"'
          + ' aria-label="Set budget for ' + esc(g.name) + '">' + KEBAB + '</button></td>'
        + '</tr>';
    }).join('');
    empty.hidden = list.length > 0;
    count.textContent = list.length === GUESTS.length
      ? GUESTS.length + ' guests'
      : 'Showing ' + list.length + ' of ' + GUESTS.length + ' guests';
  }

  document.getElementById('gxTabs').addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b) return;
    this.querySelectorAll('button').forEach(function(x){
      x.classList.remove('on'); x.setAttribute('aria-selected','false'); });
    b.classList.add('on'); b.setAttribute('aria-selected','true');
    filter = b.dataset.f; render();
  });
  document.getElementById('gxSearch').addEventListener('input', function(){
    term = this.value.trim().toLowerCase(); render();
  });
  /* ------------------------------------------------- per-guest budget */
  var scrim  = document.getElementById('gxScrim');
  var dialog = document.getElementById('gxDialog');
  var EDIT = null;

  function openBudget(id){
    EDIT = { id:id, vip:isVip(byId(id)), amount:String(subsidyOf(byId(id)).toFixed(2)) };
    renderBudget();
  }
  function byId(id){ return GUESTS.filter(function(g){ return g.id === +id; })[0]; }

  function renderBudget(){
    var g = byId(EDIT.id);
    dialog.innerHTML = '<div class="cx-dialog">'
      + '<button class="cx-d-x cx-dialog-x" data-gclose="1" aria-label="Cancel">✕</button>'
      + '<h3>Guest budget</h3>'
      + '<p>What the company covers for <b>' + esc(g.name) + '</b> of ' + esc(g.org) + ', per visit.</p>'
      + '<div class="stack" style="margin:18px 0 4px">'
        + gchoice(false, 'Company standard',
            usd(ACCOUNT_GUEST_SUBSIDY) + ' per guest — the amount set for the whole account.')
        + gchoice(true, 'Set an amount for this guest',
            'Raise it for a VIP visitor without changing the standard for everyone else.')
      + '</div>'
      + (EDIT.vip
          ? '<div class="cx-d-f" style="margin-top:14px"><label>Amount per visit</label>'
            + '<div class="cx-money"><span>$</span><input id="gxAmt" type="number" step="5" min="0" value="'
            + esc(EDIT.amount) + '"></div>'
            + '<div class="cx-d-help">Applies to this visitor only. Still billed under GL 6410-GST, '
            + 'outside any department total.</div></div>'
          : '')
      + '<div class="cx-dialog-foot">'
        + '<button class="cx-btn ghost" data-gclose="1">Cancel</button>'
        + '<button class="cx-btn" data-gsave="' + EDIT.id + '">Save budget</button>'
      + '</div></div>';
    dialog.hidden = false; scrim.hidden = false;
  }
  function gchoice(vip, title, desc){
    return '<div class="choice-lite' + (EDIT.vip === vip ? ' on' : '') + '" data-gvip="' + vip + '">'
      + '<span class="radio"></span><span><b>' + title + '</b><em>' + desc + '</em></span></div>';
  }
  function closeBudget(){ dialog.hidden = true; scrim.hidden = true; EDIT = null; }

  document.addEventListener('click', function(e){
    var el;
    if (e.target.closest('#gxInvite, #gxInviteBlank')){
      CorpActions.toast('Adding a guest is not wired up in this prototype.');
      return;
    }
    if ((el = e.target.closest('[data-budget]'))) return openBudget(el.dataset.budget);
    if ((el = e.target.closest('[data-gvip]'))){
      if (!EDIT) return;
      EDIT.vip = el.dataset.gvip === 'true';
      var f = document.getElementById('gxAmt'); if (f) EDIT.amount = f.value;
      return renderBudget();
    }
    if (e.target.closest('[data-gclose]')) return closeBudget();
    if ((el = e.target.closest('[data-gsave]'))){
      if (!EDIT) return;
      var g = byId(el.dataset.gsave);
      var f2 = document.getElementById('gxAmt');
      g.subsidy = EDIT.vip ? (parseFloat(f2 && f2.value) || 0) : null;
      closeBudget(); render();
      CorpActions.toast(g.name + ' — ' + (g.subsidy == null
        ? 'back on the company standard, ' + usd(ACCOUNT_GUEST_SUBSIDY) + '.'
        : 'budget set to ' + usd(g.subsidy) + ' for this visit.'));
      return;
    }
  });
  scrim.addEventListener('click', closeBudget);
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeBudget(); });

  render();
})();
