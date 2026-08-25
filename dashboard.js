// Office Grubb — Dashboard charts (hand-built SVG, no libraries)
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var BRAND = "#ff4f2f", GREY = "#d4d4d4", AMBER = "#F5A623", GREEN = "#1F9E57";

  function svg(w, h, inner, defs) {
    return '<svg viewBox="0 0 ' + w + ' ' + h + '">' + (defs || "") + inner + '</svg>';
  }
  function txt(x, y, s, cls, anchor) {
    return '<text x="' + x + '" y="' + y + '" class="' + (cls || "lbl") + '" text-anchor="' + (anchor || "start") + '">' + s + '</text>';
  }

  /* ---- area line chart: this month vs last month ---- */
  function areaChart(el, cur, prev) {
    if (!el) return;
    var W = 620, H = 220, L = 40, R = 12, T = 12, B = 28;
    var iw = W - L - R, ih = H - T - B;
    var max = 12000;
    function X(i, n) { return L + iw * (i / (n - 1)); }
    function Y(v) { return T + ih * (1 - v / max); }
    var g = "";
    [0, 3000, 6000, 9000, 12000].forEach(function (v) {
      var y = Y(v);
      g += '<line class="gl" x1="' + L + '" y1="' + y + '" x2="' + (W - R) + '" y2="' + y + '"/>';
      g += txt(L - 8, y + 4, "$" + (v / 1000) + "K", "glx", "end");
    });
    var n = cur.length;
    function line(arr) { return arr.map(function (v, i) { return (i ? "L" : "M") + X(i, n).toFixed(1) + " " + Y(v).toFixed(1); }).join(" "); }
    var area = line(cur) + " L" + X(n - 1, n).toFixed(1) + " " + Y(0) + " L" + X(0, n).toFixed(1) + " " + Y(0) + " Z";
    var defs = '<defs><linearGradient id="revg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + BRAND + '" stop-opacity=".26"/><stop offset="1" stop-color="' + BRAND + '" stop-opacity="0"/></linearGradient></defs>';
    var inner = g
      + '<path d="' + area + '" fill="url(#revg)"/>'
      + '<path d="' + line(prev) + '" fill="none" stroke="' + GREY + '" stroke-width="2.5" stroke-dasharray="2 6" stroke-linecap="round" vector-effect="non-scaling-stroke"/>'
      + '<path d="' + line(cur) + '" fill="none" stroke="' + BRAND + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>'
      + '<circle cx="' + X(n - 1, n) + '" cy="' + Y(cur[n - 1]) + '" r="4.5" fill="' + BRAND + '"/>';
    var days = ["Day 3", "Day 9", "Day 15", "Day 21", "Day 27"];
    days.forEach(function (d, k) { inner += txt(L + iw * (k / (days.length - 1)), H - 8, d, "lbl", k === 0 ? "start" : (k === days.length - 1 ? "end" : "middle")); });
    el.innerHTML = svg(W, H, inner, defs);
    el.querySelector("svg").style.height = "220px";
  }

  /* ---- vertical bars: orders by month ---- */
  function barChart(el, vals, labels) {
    if (!el) return;
    var W = 480, H = 220, L = 30, R = 8, T = 12, B = 26;
    var iw = W - L - R, ih = H - T - B, n = vals.length;
    var max = Math.max.apply(null, vals) * 1.15;
    var bw = iw / n * 0.56;
    var g = "";
    [0, max / 2, max].forEach(function (v) { var y = T + ih * (1 - v / max); g += '<line class="gl" x1="' + L + '" y1="' + y + '" x2="' + (W - R) + '" y2="' + y + '"/>'; });
    var defs = '<defs><linearGradient id="barg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + BRAND + '"/><stop offset="1" stop-color="#ff8a5f"/></linearGradient></defs>';
    var bars = "";
    vals.forEach(function (v, i) {
      var cx = L + iw * ((i + 0.5) / n), bh = ih * (v / max), y = T + ih - bh;
      bars += '<rect x="' + (cx - bw / 2).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(2, bh).toFixed(1) + '" rx="4" fill="url(#barg)"/>';
      if (i % 2 === 1) bars += txt(cx, H - 8, labels[i], "lbl", "middle");
    });
    el.innerHTML = svg(W, H, g + bars, defs);
    el.querySelector("svg").style.height = "220px";
  }

  /* ---- small line: rating trend ---- */
  function lineChart(el, vals) {
    if (!el) return;
    var W = 260, H = 130, L = 6, R = 6, T = 12, B = 10;
    var iw = W - L - R, ih = H - T - B, n = vals.length;
    var lo = 93, hi = 99;
    function X(i) { return L + iw * (i / (n - 1)); }
    function Y(v) { return T + ih * (1 - (v - lo) / (hi - lo)); }
    function path(close) {
      var p = vals.map(function (v, i) { return (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1); }).join(" ");
      return close ? p + " L" + X(n - 1) + " " + (T + ih) + " L" + X(0) + " " + (T + ih) + " Z" : p;
    }
    var defs = '<defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + BRAND + '" stop-opacity=".22"/><stop offset="1" stop-color="' + BRAND + '" stop-opacity="0"/></linearGradient></defs>';
    var inner = '<path d="' + path(true) + '" fill="url(#rg)"/>'
      + '<path d="' + path(false) + '" fill="none" stroke="' + BRAND + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>'
      + '<circle cx="' + X(n - 1) + '" cy="' + Y(vals[n - 1]) + '" r="4" fill="' + BRAND + '"/>';
    el.innerHTML = svg(W, H, inner, defs);
    el.querySelector("svg").style.height = "120px";
  }

  /* ---- stacked bars: gross → fee/commission/net ---- */
  function stackChart(el, months) {
    if (!el) return;
    var W = 560, H = 220, L = 34, R = 8, T = 12, B = 26;
    var iw = W - L - R, ih = H - T - B, n = months.length;
    var max = 12000, bw = iw / n * 0.5;
    var g = "";
    [0, 6000, 12000].forEach(function (v) { var y = T + ih * (1 - v / max); g += '<line class="gl" x1="' + L + '" y1="' + y + '" x2="' + (W - R) + '" y2="' + y + '"/>'; g += txt(L - 8, y + 4, "$" + (v / 1000) + "K", "glx", "end"); });
    var bars = "";
    months.forEach(function (m, i) {
      var cx = L + iw * ((i + 0.5) / n), x = cx - bw / 2;
      var segs = [[m.fee, AMBER], [m.comm, BRAND], [m.net, GREEN]];
      var acc = 0;
      segs.forEach(function (s) {
        var h = ih * (s[0] / max), y = T + ih - acc - h;
        bars += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(1, h).toFixed(1) + '" fill="' + s[1] + '"/>';
        acc += h;
      });
      if (i % 2 === 1) bars += txt(cx, H - 8, m.l, "lbl", "middle");
    });
    // round the top of each bar with a rect overlay is complex; keep square-ish, fine
    el.innerHTML = svg(W, H, g + bars);
    el.querySelector("svg").style.height = "220px";
  }

  // ---- data (Office Grubb, illustrative) ----
  var cur = [0, 1300, 2600, 3700, 4200, 4200, 5400, 6300, 7200, 7900, 8500, 8900, 9100, 9200, 9200];
  var prev = [0, 1100, 2200, 3000, 3600, 3900, 4600, 5300, 5900, 6400, 6900, 7300, 7700, 8000, 8100];
  var ordVals = [120, 138, 152, 149, 168, 176, 190, 184, 205, 214, 229, 246];
  var ordLbls = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  var ratings = [94.2, 94.8, 95.0, 95.4, 95.8, 96.1, 96.4, 96.7, 96.9, 96.8, 97.1, 97.4];
  var stack = ordLbls.map(function (l, i) {
    var gross = 6200 + i * 280;
    return { l: l, fee: gross * 0.1, comm: gross * 0.1, net: gross * 0.8 };
  });

  function render() {
    areaChart($("chRev"), cur, prev);
    barChart($("chOrders"), ordVals, ordLbls);
    lineChart($("chRating"), ratings);
    stackChart($("chStack"), stack);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();

  // date chips
  var chips = document.getElementById("chips");
  if (chips) Array.prototype.forEach.call(chips.children, function (c) {
    c.onclick = function () { Array.prototype.forEach.call(chips.children, function (x) { x.classList.remove("on"); }); c.classList.add("on"); };
  });
  var hide = document.querySelector(".db-hide");
  if (hide) hide.onclick = function () { var card = hide.closest(".db-card"); if (card) card.style.display = "none"; };
})();
