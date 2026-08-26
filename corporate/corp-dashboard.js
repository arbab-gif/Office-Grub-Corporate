// Corporate dashboard — waffle adoption chart and the ordering leaderboard.
// One square per person, per the design: a department's row is its own headcount.
(function () {
  var DEPTS = [
    { name:'Engineering',  on:232, of:258 },
    { name:'Operations',   on:152, of:190 },
    { name:'Marketing',    on:118, of:140 },
    { name:'Finance',      on:90,  of:118 },
    { name:'Legal',        on:72,  of:95  },
    { name:'Compliance',   on:62,  of:85  },
    { name:'People & HR',  on:50,  of:70  },
    { name:'Facilities',   on:20,  of:34  }
  ];

  var PLACES = [
    { name:"Anna's Taqueria",         orders:612, pct:19.5, logo:'🌮', cat:'Mexican' },
    { name:'Bon Me',                  orders:528, pct:16.8, logo:'🥪', cat:'Vietnamese' },
    { name:'Clover Food Lab',         orders:447, pct:14.2, logo:'🍀', cat:'Vegetarian' },
    { name:'Life Alive Organic Cafe', orders:391, pct:12.4, logo:'🥗', cat:'Healthy bowls' },
    { name:'Zaftigs Delicatessen',    orders:336, pct:10.7, logo:'🥯', cat:'Deli' },
    { name:'El Pelon Taqueria',       orders:288, pct:9.2,  logo:'🌯', cat:'Mexican' }
  ];

  function pct(on, of){ return Math.round(on / of * 100); }

  // ----- Perk adoption ring: one colour per department, the muted arc is "not yet" -----
  var COMBINED = { name:'Combined (below 5)', on:4, of:10 };   // below-threshold, unnamed
  var COL  = ['#fe2c11','#ff8a1f','#f4b81e','#28a56f','#2f9bd6','#6c63e0','#e0559b','#9b8f7d'];
  var GREY = '#c9c2b4';
  var NS = 'http://www.w3.org/2000/svg';
  var CX = 110, R = 84, C = 2 * Math.PI * R, GAP = 2.4;

  var deptOn    = DEPTS.reduce(function(s, d){ return s + d.on; }, 0);
  var deptOf    = DEPTS.reduce(function(s, d){ return s + d.of; }, 0);
  var enrolled  = deptOn + COMBINED.on;
  var headcount = deptOf + COMBINED.of;
  var notYet    = headcount - enrolled;
  var overall   = Math.round(enrolled / headcount * 100);
  var lead      = DEPTS.slice().sort(function(a, b){ return pct(b.on, b.of) - pct(a.on, a.of); })[0];
  var above60   = DEPTS.filter(function(d){ return pct(d.on, d.of) >= 60; }).length;

  document.getElementById('cxRingBig').innerHTML = overall + '<span>%</span>';
  document.getElementById('cxRingSub').textContent =
    enrolled.toLocaleString('en-US') + ' / ' + headcount.toLocaleString('en-US') + ' enrolled';

  var g = document.getElementById('ringSegs');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function seg(stroke){
    var el = document.createElementNS(NS, 'circle');
    el.setAttribute('cx', CX); el.setAttribute('cy', CX); el.setAttribute('r', R);
    el.setAttribute('class', 'cx-seg'); el.setAttribute('stroke', stroke);
    return el;
  }
  var track = seg('var(--neutral-200,#e5e5e5)');
  track.setAttribute('stroke-linecap', 'butt');
  track.style.strokeDasharray = C + ' 0';
  g.appendChild(track);

  var RING = DEPTS.concat([COMBINED]);
  var RCOL = COL.concat([GREY]);
  var cumFrac = 0;
  RING.forEach(function(d, i){
    var frac = d.on / headcount, len = Math.max(0, frac * C - GAP), start = cumFrac * 360 - 90;
    var el = seg(RCOL[i]);
    el.setAttribute('transform', 'rotate(' + start + ' ' + CX + ' ' + CX + ')');
    el.style.strokeDasharray = len + ' ' + (C - len);
    el.style.strokeDashoffset = reduce ? 0 : len;
    g.appendChild(el);
    requestAnimationFrame(function(){
      el.style.transitionDelay = (reduce ? 0 : 0.06 * i) + 's';
      el.style.strokeDashoffset = 0;
    });
    cumFrac += frac;
  });

  document.getElementById('ringStats').innerHTML =
      '<div class="cx-kv"><span class="k">Enrolled employees</span><span class="v accent">'
        + enrolled.toLocaleString('en-US') + ' <small>/ ' + headcount.toLocaleString('en-US') + '</small></span></div>'
    + '<div class="cx-kv"><span class="k">Not yet enrolled</span><span class="v">' + notYet.toLocaleString('en-US') + '</span></div>'
    + '<div class="cx-kv"><span class="k">Leading team</span><span class="v">' + lead.name + ' <small>' + pct(lead.on, lead.of) + '%</small></span></div>'
    + '<div class="cx-kv"><span class="k">Teams above 60% target</span><span class="v">' + above60 + ' <small>of ' + DEPTS.length + '</small></span></div>';

  document.getElementById('ringLegend').innerHTML = DEPTS.map(function(d, i){
    var p = pct(d.on, d.of);
    return '<div class="cx-li">'
      + '<span class="dot" style="background:' + COL[i] + '"></span>'
      + '<span class="nm">' + d.name + '</span>'
      + '<span class="pc">' + p + '%</span>'
      + '<span class="mb"><i style="width:' + p + '%;background:' + COL[i] + '"></i></span>'
      + '<span class="cnt">' + d.on + ' of ' + d.of + '</span>'
      + '</div>';
  }).join('');

  document.getElementById('rank').innerHTML = PLACES.slice(0, 5).map(function(p, i){
    return '<div class="cx-ord-r">'
      + '<div class="cx-ord-thumb">' + p.logo + '</div>'
      + '<div class="cx-ord-main">'
        + '<div class="cx-ord-n">' + p.name + '</div>'
        + '<div class="cx-ord-cat">in ' + p.cat + '</div>'
      + '</div>'
      + '<div class="cx-ord-val">' + p.orders.toLocaleString('en-US') + ' <small>orders</small></div>'
      + '<div class="cx-ord-rank">#' + (i + 1) + '</div>'
      + '</div>';
  }).join('');

  // range tabs are presentational until the dataset is wired
  var range = document.getElementById('cxRange');
  if (range) range.addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b) return;
    range.querySelectorAll('button').forEach(function(x){ x.classList.remove('on'); });
    b.classList.add('on');
  });
})();
