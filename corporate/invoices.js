// Corporate → Invoices and chargeback.
// Credits (refunds, carried-forward notes) render in teal and negative, so money
// coming back is never mistaken for money owed.
(function () {
  var PERIOD = [
    { label:'Platform subscription',      sub:'200+ employees',    amount:699.00 },
    { label:'Assigned drivers',           sub:'2 × $95.00',        amount:190.00 },
    { label:'Employee credit applied',    sub:'2,602 orders',      amount:39030.00 },
    { label:'Guest credit applied',       sub:'4 active visitors', amount:1290.00 },
    { label:'Refunded before billing',    sub:'Clover Food Lab, Jul 20 — lines removed, never charged',
      amount:-510.00, credit:true },
    { label:'Credit note carried forward', sub:'Zaftigs short delivery, May 28 — refunded after billing',
      amount:-135.00, credit:true },
    { label:'MA meals tax (6.25%)',       sub:null,                amount:2535.25 }
  ];
  var TOTAL = { label:'Estimated total', sub:'Net 15 from issue', amount:43099.25 };

  var HISTORY = [
    { no:'OG-2026-0714', period:'Jun 1 – Jun 30, 2026', due:'Jul 16, 2026', amount:47912.00, status:'Paid' },
    { no:'OG-2026-0612', period:'May 1 – May 31, 2026', due:'Jun 16, 2026', amount:45188.50, status:'Paid' },
    { no:'OG-2026-0511', period:'Apr 1 – Apr 30, 2026', due:'May 16, 2026', amount:43442.00, status:'Paid' },
    { no:'OG-2026-0409', period:'Mar 1 – Mar 31, 2026', due:'Apr 16, 2026', amount:41910.75, status:'Paid' }
  ];

  var CHARGEBACK = [
    { dept:'Engineering', gl:'6410-ENG', orders:1042, credit:15630.00 },
    { dept:'Operations',  gl:'6410-OPS', orders:631,  credit:9465.00 },
    { dept:'Marketing',   gl:'6410-MKT', orders:604,  credit:9060.00 },
    { dept:'Finance',     gl:'6410-FIN', orders:336,  credit:5040.00 },
    { dept:'Legal',       gl:'6410-LEG', orders:251,  credit:3765.00 },
    { dept:'Compliance',  gl:'6410-CMP', orders:224,  credit:3360.00 },
    { dept:'People & HR', gl:'6410-HRS', orders:145,  credit:2175.00 },
    { dept:'Guests',      gl:'6410-GST', orders:86,   credit:1290.00 }
  ];

  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" '
    + 'stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function usd(n){
    var s = '$' + Math.abs(n).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
    return n < 0 ? '-' + s : s;
  }

  document.getElementById('periodRows').innerHTML = PERIOD.map(function(r){
    return '<div class="cx-line' + (r.credit ? ' credit' : '') + '">'
      + '<div class="cx-line-b"><div class="cx-line-t">' + esc(r.label) + '</div>'
      + (r.sub ? '<div class="cx-line-s">' + esc(r.sub) + '</div>' : '') + '</div>'
      + '<div class="cx-line-a mono">' + usd(r.amount) + '</div>'
      + '</div>';
  }).join('')
  + '<div class="cx-line total">'
    + '<div class="cx-line-b"><div class="cx-line-t">' + TOTAL.label + '</div>'
    + '<div class="cx-line-s">' + TOTAL.sub + '</div></div>'
    + '<div class="cx-line-a mono">' + usd(TOTAL.amount) + '</div>'
  + '</div>';

  document.getElementById('histRows').innerHTML = HISTORY.map(function(h){
    return '<tr>'
      + '<th scope="row"><span class="cx-code">' + esc(h.no) + '</span></th>'
      + '<td class="tealtxt">' + esc(h.period) + '</td>'
      + '<td class="tealtxt">' + esc(h.due) + '</td>'
      + '<td class="ta-r mono strong">' + usd(h.amount) + '</td>'
      + '<td><i class="cx-status paid">' + CHECK + h.status + '</i></td>'
      + '</tr>';
  }).join('');

  document.getElementById('cbRows').innerHTML = CHARGEBACK.map(function(c){
    return '<tr>'
      + '<th scope="row">' + esc(c.dept) + '</th>'
      + '<td><span class="cx-code">' + esc(c.gl) + '</span></td>'
      + '<td class="ta-r mono">' + c.orders.toLocaleString('en-US') + '</td>'
      + '<td class="ta-r mono strong">' + usd(c.credit) + '</td>'
      + '</tr>';
  }).join('');

  // a chargeback table that does not foot to a total is not usable for allocation
  var tOrders = CHARGEBACK.reduce(function(a, c){ return a + c.orders; }, 0);
  var tCredit = CHARGEBACK.reduce(function(a, c){ return a + c.credit; }, 0);
  document.getElementById('cbFoot').innerHTML =
    '<tr><th scope="row">Total</th><td></td>'
    + '<td class="ta-r mono">' + tOrders.toLocaleString('en-US') + '</td>'
    + '<td class="ta-r mono strong">' + usd(tCredit) + '</td></tr>';
})();
