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
        + '<td class="ta-r"><button class="cx-print" aria-label="Print manifest ' + esc(m.id) + '">'
          + PRINT + 'Print</button></td>'
        + '</tr>';
    }).join('');
    empty.hidden = list.length > 0;
  }

  document.getElementById('mfSearch').addEventListener('input', function(){
    term = this.value.trim().toLowerCase();
    render();
  });

  render();
})();
