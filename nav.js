// Office Grubb — shared restaurant sidebar
(function () {
  var ICON = {
    dashboard:'<path d="M3 12l9-9 9 9M5 10v10h14V10"/>',
    menu:'<path d="M4 3h16v4H4zM6 7v13h12V7"/><path d="M9 11h6"/>',
    orders:'<path d="M3 6h18M3 12h18M3 18h12"/>',
    reservations:'<path d="M4 5h16v6H4z"/><path d="M4 11c0 5 4 8 8 8s8-3 8-8"/>',
    live:'<path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.5 7.1 18l.9-5.5-4-3.9L9.5 8z"/>',
    calendar:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
    offers:'<path d="M20 12l-8 8-9-9V4h7z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
    payouts:'<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 00-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 00-1.7-1l-.3-2.5H9.4l-.3 2.5a7 7 0 00-1.7 1l-2.3-1-2 3.4L5 11a7 7 0 000 2l-2 1.5 2 3.4 2.3-1a7 7 0 001.7 1l.3 2.5h4.9l.3-2.5a7 7 0 001.7-1l2.3 1 2-3.4-2-1.5a7 7 0 00.1-1z"/>'
  };
  var ITEMS = [
    {k:"dashboard", label:"Dashboard", href:"dashboard.html", grp:"Overview"},
    {k:"menu", label:"Menu", href:"#"},
    {k:"orders", label:"Orders", href:"orders.html", badge:"7"},
    {k:"reservations", label:"Reservations", href:"#"},
    {k:"live", label:"Live Kitchen", href:"live.html"},
    {k:"calendar", label:"Calendar", href:"#"},
    {k:"offers", label:"Special Offers", href:"offers.html", grp:"Growth"},
    {k:"payouts", label:"Payouts", href:"#", grp:"Business"},
    {k:"settings", label:"Settings", href:"#"}
  ];
  var active = (document.body.getAttribute("data-nav") || "orders");

  var html = '<div class="brand"><div class="brand-mark">🍽️</div><div><div class="brand-name">Office Grubb</div><div class="brand-sub">Restaurant</div></div></div>';
  ITEMS.forEach(function (it) {
    if (it.grp) html += '<div class="nav-label">' + it.grp + '</div>';
    var on = it.k === active ? " active" : "";
    var badge = it.badge ? '<span class="badge tnum">' + it.badge + '</span>' : "";
    html += '<a class="nav-item' + on + '" href="' + it.href + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + ICON[it.k] + '</svg>' + it.label + badge + '</a>';
  });
  html += '<div class="rail-foot"><div class="avatar">SK</div><div><div class="who">Sofia\'s Kitchen</div><div class="role">Owner · Boston, MA</div></div></div>';

  var rail = document.getElementById("rail");
  if (rail) rail.innerHTML = html;

  var tb = document.getElementById("themeBtn");
  if (tb) tb.onclick = function () {
    var r = document.documentElement, cur = r.getAttribute("data-theme");
    if (!cur) cur = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    r.setAttribute("data-theme", cur === "dark" ? "light" : "dark");
  };
})();
