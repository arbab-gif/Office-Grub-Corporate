// Corporate → Guests.
// A guest pass is issued by an employee and valid for one service day. Guest credit
// is billed separately under GL 6410-GST and never appears inside a department
// figure — which is why guests are their own screen rather than a filter on the roster.
(function () {
  var GUESTS = [
    { id:1, name:'Rebecca Osei',   org:'Northgate Legal',   host:'Priya Raghunathan', drop:'Floor 3',
      visit:'Today — Aug 31', status:'Active',  credit:15.00 },
    { id:2, name:'Daniel Fitzroy', org:'Meridian Audit',    host:'Grant Sollazzo',    drop:'Floor 6',
      visit:'Today — Aug 31', status:'Active',  credit:15.00 },
    { id:3, name:'Ana Beltrán',    org:'Cortez Design',     host:'Dana Whitfield',    drop:'Floor 3',
      visit:'Sep 2',          status:'Active',  credit:0 },
    { id:4, name:'Ken Nakamura',   org:'Harborline Capital',host:'Marcus Oyelaran',   drop:'Floor 6',
      visit:'Sep 3',          status:'Active',  credit:0 },
    { id:5, name:'Marta Silva',    org:'Northgate Legal',   host:'Rosalind Achebe',   drop:'Floor 3',
      visit:'Aug 26',         status:'Expired', credit:15.00 },
    { id:6, name:'Tobias Lund',    org:'Meridian Audit',    host:'Aisha Nkemdirim',   drop:'Braintree',
      visit:'Aug 21',         status:'Expired', credit:15.00 }
  ];

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
    return (g.name + ' ' + g.org + ' ' + g.host + ' ' + g.drop).toLowerCase().indexOf(term) > -1;
  }

  function renderKpis(){
    var active = GUESTS.filter(function(g){ return g.status === 'Active'; }).length;
    var spent  = GUESTS.reduce(function(a, g){ return a + g.credit; }, 0);
    kpis.innerHTML =
        kpi('Active guests', String(active), 'Passes valid for an upcoming service day')
      + kpi('Guest credit this period', usd(spent), 'Billed separately, under GL 6410-GST')
      + kpi('Hosts', String(new Set(GUESTS.map(function(g){ return g.host; })).size),
            'Employees who have issued a pass');
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
      + '<p>Nobody has hosted a visitor on this account. An employee issues a pass, '
      + 'and the guest orders on the day of their visit.</p>'
      + '<button class="cx-btn" id="gxInviteBlank">'
        + '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Issue guest pass</button>'
      + '<div class="cx-blank-steps">'
        + step(1,'An employee hosts','The pass is issued against the host, so every visit has someone accountable.')
        + step(2,'Valid for one day','A pass covers the service day of the visit and then expires on its own.')
        + step(3,'Billed separately','Guest credit sits on its own invoice line and never inside a department total.')
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
        + '<th scope="row" class="cx-emp"><b>' + esc(g.name) + '</b><em>' + esc(g.org) + '</em></th>'
        + '<td>' + esc(g.host) + '</td>'
        + '<td>' + esc(g.drop) + '</td>'
        + '<td class="mono">' + esc(g.visit) + '</td>'
        + '<td><i class="cx-status ' + g.status.toLowerCase() + '">' + g.status + '</i></td>'
        + '<td class="ta-r mono">' + (g.credit ? usd(g.credit) : '—') + '</td>'
        + '<td class="ta-r"><button class="cx-row-act" aria-label="Actions for ' + esc(g.name) + '">'
          + KEBAB + '</button></td>'
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
  document.addEventListener('click', function(e){
    if (!e.target.closest('#gxInvite, #gxInviteBlank')) return;
    CorpActions.toast('Guest passes are issued by an employee from their own account.');
  });

  render();
})();
