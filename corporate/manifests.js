// Corporate → Delivery manifests.
// Manifest B is the corporation's receiving document. The close-out timestamp is what
// settles the delivery on the invoice, so it gets its own column rather than hiding
// inside the status.
(function () {
  var MANIFESTS = [
    { id:'MB-0724-0112', date:'Jul 24, 2026', drop:'BYF-03',  items:187, driver:'R. Delacroix', status:'Open',       closed:null },
    { id:'MB-0723-0104', date:'Jul 23, 2026', drop:'BYF-03',  items:174, driver:'R. Delacroix', status:'Closed out', closed:'11:58 AM' },
    { id:'MB-0722-0098', date:'Jul 22, 2026', drop:'BYF-06',  items:121, driver:'M. Okonkwo',   status:'Closed out', closed:'12:04 PM' },
    { id:'MB-0721-0091', date:'Jul 21, 2026', drop:'BYF-03',  items:166, driver:'R. Delacroix', status:'Closed out', closed:'11:51 AM' },
    { id:'MB-0720-0085', date:'Jul 20, 2026', drop:'BYF-BT2', items:88,  driver:'M. Okonkwo',   status:'Exception',  closed:'12:22 PM' }
  ];

  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" '
    + 'stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
  var PRINT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '
    + 'stroke-linecap="round" stroke-linejoin="round"><path d="M7 9V4h10v5M7 18H5v-6h14v6h-2M8 15h8v6H8z"/></svg>';

  var term = '';
  var rows = document.getElementById('mfRows');
  var empty = document.getElementById('mfEmpty');

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function slug(s){ return s.toLowerCase().replace(/\s+/g, '-'); }

  function matches(m){
    if (!term) return true;
    return (m.id + ' ' + m.date + ' ' + m.drop + ' ' + m.driver).toLowerCase().indexOf(term) > -1;
  }

  function render(){
    var list = MANIFESTS.filter(matches);
    rows.innerHTML = list.map(function(m){
      return '<tr>'
        + '<th scope="row"><span class="cx-code">' + esc(m.id) + '</span></th>'
        + '<td>' + esc(m.date) + '</td>'
        + '<td><span class="cx-code">' + esc(m.drop) + '</span></td>'
        + '<td class="ta-r mono">' + m.items + '</td>'
        + '<td>' + esc(m.driver) + '</td>'
        + '<td><i class="cx-status ' + slug(m.status) + '">'
          + (m.status === 'Closed out' ? CHECK : '') + m.status + '</i></td>'
        + '<td class="mono">' + (m.closed || '—') + '</td>'
        + '<td class="ta-r"><button class="cx-print" data-print="' + esc(m.id) + '"'
          + ' aria-label="Print manifest ' + esc(m.id) + '">' + PRINT + 'Print</button></td>'
        + '</tr>';
    }).join('');
    empty.hidden = list.length > 0;
  }

  document.getElementById('mfSearch').addEventListener('input', function(){
    term = this.value.trim().toLowerCase();
    render();
  });

  /* -------------------------------------------------- real actions */
  // Export reads the rendered table, so what downloads always matches what is
  // on screen — search filter included.
  document.getElementById('mfExport').addEventListener('click', function(){
    CorpActions.exportTable('manifests-' + CorpActions.stamp() + '.csv',
      document.querySelector('.cx-table table'));
  });

  // "Print today's manifest" prints only the open manifest — today's is the one
  // still Open, since a closed batch is already settled.
  document.getElementById('mfPrintToday').addEventListener('click', function(){
    var open = MANIFESTS.filter(function(m){ return m.status === 'Open'; })[0];
    if (!open){ CorpActions.toast('No open manifest today — every batch is closed out.'); return; }
    printOne(open);
  });

  document.getElementById('mfRows').addEventListener('click', function(e){
    var b = e.target.closest('[data-print]'); if (!b) return;
    printOne(MANIFESTS.filter(function(m){ return m.id === b.dataset.print; })[0]);
  });

  function printOne(m){
    var host = document.getElementById('mfPrint');
    host.innerHTML =
        '<div class="cx-band">Manifest B · Corporation</div>'
      + '<div class="cx-pr-body">'
        + '<div class="cx-pr-h"><div><div class="cx-pr-id">' + esc(m.id) + '</div>'
          + '<div class="cx-pr-sub">Beacon Yards Financial · OG-BLFB-6KKM-BBUL</div></div>'
          + '<div class="cx-pr-date">' + esc(m.date) + '</div></div>'
        + '<table class="cx-pr-t"><tbody>'
          + pr('Drop point', m.drop) + pr('Items', m.items)
          + pr('Driver', m.driver) + pr('Status', m.status)
          + pr('Closed out', m.closed || 'Not yet closed')
        + '</tbody></table>'
        + '<div class="cx-pr-sign"><div class="cx-pr-line"></div>'
          + '<span>Received by — print name, sign and date</span></div>'
        + '<p class="cx-pr-note">Scan the close-out QR once every item is accounted for. '
          + 'That timestamp is what settles this delivery on your invoice.</p>'
      + '</div>';
    CorpActions.printRegion(host, 'Manifest ' + m.id);
  }
  function pr(k, v){ return '<tr><th>' + k + '</th><td>' + esc(v) + '</td></tr>'; }

  render();
})();
