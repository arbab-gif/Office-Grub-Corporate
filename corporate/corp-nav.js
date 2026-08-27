// Office Grubb — Corporate side nav.
// Same component as the restaurant's figma-nav.js (.fside / .fnav-item / .ftopbar);
// the item list and grouping come from the corporation portal design.
(function () {
  var ICONS = {
    dashboard:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    employees:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M16 5.2a3.2 3.2 0 010 5.6M18.5 20c0-2.4-1-4.2-2.6-5.2"/>',
    guests:'<circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/>',
    benefit:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M3 12h18"/><path d="M12 7V5M9 5h6"/>',
    drops:'<path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
    live:'<path d="M12 3a4 4 0 00-3.8 2.8A3.5 3.5 0 006 12a3 3 0 003 3h6a3 3 0 003-3 3.5 3.5 0 00-2.2-6.2A4 4 0 0012 3z"/><path d="M8 15v4a1 1 0 001 1h6a1 1 0 001-1v-4"/>',
    integrations:'<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/><path d="M11 7h4a2 2 0 012 2v4"/>',
    plans:'<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
    onboard:'<path d="M12 3l8 4v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V7z"/><path d="M9 12l2 2 4-4"/>',
    schedule:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
    manifests:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h6M9 16h4"/>',
    issues:'<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>',
    announce:'<path d="M3 11v2a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 1z"/><path d="M16 9a4 4 0 010 6"/>',
    invoices:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 00-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 00-1.7-1L14.6 3H9.4l-.3 2.6a7 7 0 00-1.7 1l-2.3-1-2 3.4L5 11a7 7 0 000 2l-2 1.5 2 3.4 2.3-1a7 7 0 001.7 1l.3 2.6h5.2l.3-2.6a7 7 0 001.7-1l2.3 1 2-3.4-2-1.5a7 7 0 00.1-1z"/>'
  };
  var LOCK = '<svg class="fnav-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>';

  var GROUPS = [
    { label:'Overview', items:[ {k:'dashboard', label:'Dashboard', href:'index.html'} ] },
    { label:'People',   items:[ {k:'employees', label:'Employees', href:'employees.html'},
                                {k:'guests',    label:'Guests',    href:'guests.html'} ] },
    { label:'Program',  items:[ {k:'benefit',      label:'Meal benefit',  href:'meal-benefit.html', lock:true},
                                {k:'drops',        label:'Drop points',   href:'drop-points.html'},
                                {k:'live',         label:'Live Kitchen',  href:'live-kitchen.html'},
                                {k:'integrations', label:'Integrations',  href:'integrations.html'} ] },
    { label:'Service',  items:[ {k:'schedule',  label:'Schedule',       href:'schedule.html'},
                                {k:'manifests', label:'Manifests',      href:'manifests.html'},
                                {k:'issues',    label:'Service issues', href:'service-issues.html'},
                                {k:'announce',  label:'Announcements',  href:'announcements.html'} ] },
    { label:'Billing',  items:[ {k:'invoices', label:'Invoices',    href:'invoices.html'},
                                {k:'plans',    label:'Plan & pricing', href:'plans.html'} ] },
    { label:'Setup',    items:[ {k:'onboard',  label:'Onboarding',  href:'onboarding.html'} ] }
  ];
  var MAP = { 'index.html':'dashboard', 'employees.html':'employees',
              'manifests.html':'manifests', 'announcements.html':'announce',
              'invoices.html':'invoices', 'plans.html':'plans',
              'onboarding.html':'onboard' };

  var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var active = document.body.getAttribute('data-nav') || MAP[file] || '';
  function icon(p){ return '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>'; }
  function itemHTML(it){
    return '<a class="fnav-item'+(it.k===active?' active':'')+'" href="'+it.href+'">'
      + icon(ICONS[it.k]) + '<span>'+it.label+'</span>' + (it.lock ? LOCK : '') + '</a>';
  }

  var html = '<div class="fside-inner">'
    + '<div class="fbrand"><span class="fbrand-mark"></span>'
      + '<span class="fbrand-word">Office Grubb<em>Corporation</em></span></div>'
    + GROUPS.map(function(g){
        return '<nav class="fnav"><div class="fnav-label">'+g.label+'</div>'
          + g.items.map(itemHTML).join('') + '</nav>';
      }).join('')
    + '<div class="fnav-foot"><div class="fdiv"></div>'
    + '<a class="fnav-item'+(active==='settings'?' active':'')+'" href="settings.html">'
      +icon(ICONS.settings)+'<span>Settings</span></a></div>'
    + '</div>';

  var BELL = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/></svg>';
  var BURGER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';

  try { if (localStorage.getItem('og_nav_collapsed') === '1') document.documentElement.classList.add('nav-collapsed'); } catch(e){}

  function mountSidebar(){
    var rail = document.querySelector('.rail') || document.getElementById('rail');
    if (!rail) return;
    var aside = document.createElement('aside');
    aside.className = 'fside';
    aside.innerHTML = html;
    rail.parentNode.replaceChild(aside, rail);
  }
  function mountTop(){
    var main = document.querySelector('.main');
    if (!main || document.querySelector('.ftopbar')) return;
    var bar = document.createElement('header');
    bar.className = 'ftopbar';
    var b = document.createElement('button');
    b.className = 'fnav-toggle'; b.setAttribute('aria-label','Toggle sidebar'); b.innerHTML = BURGER;
    b.onclick = function(){
      var on = document.documentElement.classList.toggle('nav-collapsed');
      try { localStorage.setItem('og_nav_collapsed', on ? '1' : '0'); } catch(e){}
    };
    bar.appendChild(b);
    var right = document.createElement('div');
    right.style.cssText = 'margin-left:auto;display:flex;align-items:center;gap:10px;';
    right.innerHTML = '<a class="ficon-btn fbell" href="#">'+BELL+'<span class="fbell-badge">3</span></a>'
      + '<div class="fuser"><img src="../assets/figma/avatar-user.png" alt=""><span>Dana Reyes</span></div>';
    bar.appendChild(right);
    main.insertBefore(bar, main.firstChild);
  }
  function boot(){ mountSidebar(); mountTop(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
