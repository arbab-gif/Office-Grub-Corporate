// Corporate dashboard — waffle adoption chart, ordering leaderboard, and a range
// control that actually re-reads the numbers. One square per person, per the design:
// a department's row is its own headcount.
(function () {
  var HEADCOUNT = 1000;

  var DEPTS = [
    { name:'Engineering',  on:158, of:258 },
    { name:'Operations',   on:96,  of:190 },
    { name:'Marketing',    on:92,  of:140 },
    { name:'Finance',      on:51,  of:118 },
    { name:'Legal',        on:38,  of:95  },
    { name:'Compliance',   on:34,  of:85  },
    { name:'People & HR',  on:22,  of:70  },
    { name:'Facilities',   on:5,   of:34  }
  ];

  var PLACES = [
    { name:"Anna's Taqueria",         share:19.5 },
    { name:'Bon Me',                  share:16.8 },
    { name:'Clover Food Lab',         share:14.2 },
    { name:'Life Alive Organic Cafe', share:12.4 },
    { name:'Zaftigs Delicatessen',    share:10.7 },
    { name:'El Pelon Taqueria',       share:9.2  }
  ];

  // Every figure that is period-dependent lives here, so switching range changes
  // the dashboard rather than just the button styling.
  var RANGES = {
    '7 days':  { orders:612,   guests:2,  guestCredit:315.00,    trend:'Up 4.1% on the prior 7 days',   label:'this week' },
    '30 days': { orders:2602,  guests:4,  guestCredit:1290.00,   trend:'Up 11.4% on the prior 30 days', label:'this period' },
    'Quarter': { orders:7806,  guests:9,  guestCredit:3870.00,   trend:'Up 8.7% on the prior quarter',  label:'this quarter' },
    'Year':    { orders:31224, guests:22, guestCredit:15480.00,  trend:'Up 21.3% on the prior year',    label:'this year' }
  };
  var CREDIT_PER_ORDER = 15;
  var current = '30 days';

  function usd(n){ return '$' + n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function pct(on, of){ return Math.round(on / of * 100); }

  var CHECK = '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';

  /* ---------------------------------------------------------- render */
  function paint(){
    var R = RANGES[current];
    var credit = R.orders * CREDIT_PER_ORDER;
    var enrolled = DEPTS.reduce(function(a,d){ return a + d.on; }, 0) + 4;   // + suppressed group

    set('kEnrolled', enrolled.toLocaleString('en-US'));
    set('kEnrolledSub', (enrolled / HEADCOUNT * 100).toFixed(1) + '% of ' + HEADCOUNT.toLocaleString('en-US') + ' headcount');
    set('kOrders', R.orders.toLocaleString('en-US'));
    set('kOrdersSub', R.trend);
    set('kOrdersLabel', 'Orders ' + R.label);
    set('kCredit', usd(credit));
    set('kGuests', String(R.guests));
    set('kGuestsSub', usd(R.guestCredit) + ' guest credit ' + R.label);
    set('fCovered', usd(486210.50));

    // exposure block reads from the same numbers
    set('expMax', usd(enrolled * CREDIT_PER_ORDER));
    set('expActual', usd(credit));
    set('expActualSub', R.orders.toLocaleString('en-US') + ' orders · credit does not roll over');
    set('expGuest', usd(R.guestCredit));

    document.getElementById('waffle').innerHTML = DEPTS.map(function(d){
      var cells = '';
      for (var i = 0; i < d.of; i++) cells += '<i class="' + (i < d.on ? 'on' : '') + '"></i>';
      return '<div class="cx-dept">'
        + '<div class="cx-dept-h"><span class="cx-dept-n">' + d.name + '</span>'
          + '<span class="cx-dept-f"><b>' + d.on + '/' + d.of + '</b> · '
          + '<span class="accent">' + pct(d.on, d.of) + '%</span></span></div>'
        + '<div class="cx-waffle">' + cells + '</div>'
        + '</div>';
    }).join('');
    set('adoptN', enrolled.toLocaleString('en-US'));
    set('adoptSub', (enrolled / HEADCOUNT * 100).toFixed(1) + '% enrolled · one square is one person');

    var counts = PLACES.map(function(p){ return Math.round(R.orders * p.share / 100); });
    var max = Math.max.apply(null, counts);
    document.getElementById('rank').innerHTML = '<div class="cx-rank">' + PLACES.map(function(p, i){
      return '<div class="cx-rank-r">'
        + '<div class="cx-rank-h"><span class="cx-rank-n">' + p.name + '</span>'
          + '<span class="cx-rank-f">' + counts[i].toLocaleString('en-US') + ' orders · ' + p.share + '%</span></div>'
        + '<div class="cx-rank-bar"><i class="' + (i === 0 ? 'lead' : '') + '" style="width:'
          + (counts[i] / max * 100).toFixed(1) + '%"></i></div>'
        + '</div>';
    }).join('') + '</div>';
    set('rankLabel', 'Aggregate · ' + (current === 'Year' ? 'last 12 months' : 'last ' + current.toLowerCase()));
  }

  function set(id, text){
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /* ---------------------------------------------------------- events */
  var range = document.getElementById('cxRange');
  if (range) range.addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b) return;
    range.querySelectorAll('button').forEach(function(x){
      x.classList.remove('on'); x.setAttribute('aria-pressed','false'); });
    b.classList.add('on'); b.setAttribute('aria-pressed','true');
    current = b.textContent.trim();
    paint();
    CorpActions.toast('Showing ' + current.toLowerCase());
  });

  var exp = document.getElementById('dashExport');
  if (exp) exp.addEventListener('click', function(){
    var R = RANGES[current];
    CorpActions.exportCSV(
      'perk-adoption-' + CorpActions.stamp() + '.csv',
      ['Department','Enrolled','Headcount','Adoption %'],
      DEPTS.map(function(d){ return [d.name, d.on, d.of, pct(d.on, d.of) + '%']; })
        .concat([['Below reporting threshold', 4, 10, '40%']])
    );
  });

  paint();
})();
