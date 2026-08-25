// Corporate dashboard — waffle adoption chart and the ordering leaderboard.
// One square per person, per the design: a department's row is its own headcount.
(function () {
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
    { name:"Anna's Taqueria",        orders:612, pct:19.5 },
    { name:'Bon Me',                 orders:528, pct:16.8 },
    { name:'Clover Food Lab',        orders:447, pct:14.2 },
    { name:'Life Alive Organic Cafe',orders:391, pct:12.4 },
    { name:'Zaftigs Delicatessen',   orders:336, pct:10.7 },
    { name:'El Pelon Taqueria',      orders:288, pct:9.2  }
  ];

  function pct(on, of){ return Math.round(on / of * 100); }

  var waffle = DEPTS.map(function(d){
    var cells = '';
    for (var i = 0; i < d.of; i++) cells += '<i class="' + (i < d.on ? 'on' : '') + '"></i>';
    return '<div class="cx-dept">'
      + '<div class="cx-dept-h"><span class="cx-dept-n">' + d.name + '</span>'
        + '<span class="cx-dept-f"><b>' + d.on + '/' + d.of + '</b> · '
        + '<span class="accent">' + pct(d.on, d.of) + '%</span></span></div>'
      + '<div class="cx-waffle">' + cells + '</div>'
      + '</div>';
  }).join('');
  document.getElementById('waffle').innerHTML = waffle;

  var max = PLACES[0].orders;
  document.getElementById('rank').innerHTML = '<div class="cx-rank">' + PLACES.map(function(p, i){
    return '<div class="cx-rank-r">'
      + '<div class="cx-rank-h"><span class="cx-rank-n">' + p.name + '</span>'
        + '<span class="cx-rank-f">' + p.orders.toLocaleString('en-US') + ' orders · ' + p.pct + '%</span></div>'
      + '<div class="cx-rank-bar"><i class="' + (i === 0 ? 'lead' : '') + '" style="width:'
        + (p.orders / max * 100).toFixed(1) + '%"></i></div>'
      + '</div>';
  }).join('') + '</div>';

  // range tabs are presentational until the dataset is wired
  var range = document.getElementById('cxRange');
  if (range) range.addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b) return;
    range.querySelectorAll('button').forEach(function(x){ x.classList.remove('on'); });
    b.classList.add('on');
  });
})();
