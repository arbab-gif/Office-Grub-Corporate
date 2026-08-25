// Office Grubb — shared Figma side nav. Replaces any existing .rail/#rail with the white Figma sidebar.
(function () {
  var ICONS = {
    dashboard:'<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
    orders:'<path d="M9 4h6v3H9z"/><path d="M15 5h2a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h2"/><path d="M9 12h6M9 16h4"/>',
    reservations:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/>',
    calendar:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
    label:'<path d="M20 12l-8 8-9-9V4h7z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
    menus:'<path d="M8 3v18M6 3v5a2 2 0 004 0V3M16 3c-2 0-3 3-3 6s1 4 3 4v8"/>',
    offers:'<circle cx="12" cy="12" r="9"/><path d="M9 15l6-6M9.5 9.5h.01M14.5 14.5h.01"/>',
    live:'<path d="M12 3a4 4 0 00-3.8 2.8A3.5 3.5 0 006 12a3 3 0 003 3h6a3 3 0 003-3 3.5 3.5 0 00-2.2-6.2A4 4 0 0012 3z"/><path d="M8 15v4a1 1 0 001 1h6a1 1 0 001-1v-4"/>',
    financial:'<path d="M12 2v20M17 6.5c0-2-2.2-3.5-5-3.5S7 4.5 7 6.5 9 9.5 12 10s5 1.5 5 4-2.2 3.5-5 3.5-5-1.5-5-3.5"/>',
    feedback:'<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    custfeedback:'<path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.5 8.5 0 018 8z"/><path d="M12 8.2l1 2 2.2.2-1.7 1.5.5 2.1-2-1.1-2 1.1.5-2.1L8.8 10.4l2.2-.2z"/>',
    closetimes:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 00-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 00-1.7-1L14.6 3H9.4l-.3 2.6a7 7 0 00-1.7 1l-2.3-1-2 3.4L5 11a7 7 0 000 2l-2 1.5 2 3.4 2.3-1a7 7 0 001.7 1l.3 2.6h5.2l.3-2.6a7 7 0 001.7-1l2.3 1 2-3.4-2-1.5a7 7 0 00.1-1z"/>'
  };
  var ITEMS = [
    {k:'dashboard', label:'Dashboard', href:'dashboard.html'},
    {k:'orders', label:'Orders', href:'index.html'},
    {k:'reservations', label:'Reservations', href:'reservations.html'},
    {k:'calendar', label:'Calendar', href:'calendar.html'},
    {k:'label', label:'Label', href:'labels.html'},
    {k:'menus', label:'Menus', href:'menu.html'},
    {k:'closetimes', label:'Menu Close Times', href:'menu-close-times.html'},
    {k:'offers', label:'Special Offers', href:'offers.html'},
    {k:'live', label:'Live Kitchen', href:'live.html'},
    {k:'financial', label:'Financial', href:'financial.html'},
    {k:'feedback', label:'Feedback', href:'#'},
    {k:'custfeedback', label:'Customer Feedback', href:'customer-feedback.html'}
  ];
  var MAP = {
    'dashboard.html':'dashboard',
    'index.html':'orders','orders.html':'orders','order.html':'orders','order-detail.html':'orders',
    'reservations.html':'reservations',
    'calendar.html':'calendar',
    'labels.html':'label','label-sheet.html':'label',
    'menu.html':'menus','menu-create.html':'menus',
    'menu-close-times.html':'closetimes',
    'offers.html':'offers','offer-detail.html':'offers','offer-edit.html':'offers',
    'live.html':'live','live-event.html':'live',
    'financial.html':'financial',
    'customer-feedback.html':'custfeedback',
    'settings.html':'settings'
  };
  var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var active = document.body.getAttribute('data-nav') || MAP[file] || '';
  function icon(p){ return '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>'; }
  function itemHTML(it){ return '<a class="fnav-item'+(it.k===active?' active':'')+'" href="'+it.href+'">'+icon(ICONS[it.k])+'<span>'+it.label+'</span></a>'; }

  var html = '<div class="fside-inner">'
    + '<div class="fbrand"><span class="fbrand-mark"></span><span class="fbrand-word">Office Grubb</span></div>'
    + '<nav class="fnav">' + ITEMS.map(itemHTML).join('') + '</nav>'
    + '<div class="fnav-foot"><div class="fdiv"></div>'
    + '<a class="fnav-item'+(active==='settings'?' active':'')+'" href="settings.html">'+icon(ICONS.settings)+'<span>Settings</span></a></div>'
    + '</div>';

  var BELL = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/></svg>';
  var BURGER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';

  // apply persisted collapse state
  try { if (localStorage.getItem('og_nav_collapsed') === '1') document.documentElement.classList.add('nav-collapsed'); } catch(e){}

  function mountSidebar(){
    var rail = document.querySelector('.rail') || document.getElementById('rail');
    if (!rail) return;
    var aside = document.createElement('aside');
    aside.className = 'fside';
    aside.innerHTML = html;
    rail.parentNode.replaceChild(aside, rail);
  }
  function ensureToggle(bar){
    if (bar.querySelector('.fnav-toggle')) return;
    var b = document.createElement('button');
    b.className = 'fnav-toggle'; b.setAttribute('aria-label','Toggle sidebar'); b.innerHTML = BURGER;
    b.onclick = function(){
      var on = document.documentElement.classList.toggle('nav-collapsed');
      try { localStorage.setItem('og_nav_collapsed', on ? '1' : '0'); } catch(e){}
    };
    bar.insertBefore(b, bar.firstChild);
  }
  function mountTop(){
    var existing = document.querySelector('.ftop, .ftopbar');
    if (existing){ ensureToggle(existing); return; }
    var main = document.querySelector('.main');
    if (!main) return;
    var bar = document.createElement('header');
    bar.className = 'ftopbar';
    bar.innerHTML = '<div style="margin-left:auto;display:flex;align-items:center;gap:10px;">'
      + '<a class="ficon-btn fbell" href="notifications.html" aria-label="Notifications">' + BELL + '<span class="fbell-badge">3</span></a>'
      + '<div class="fuser"><img src="assets/figma/avatar-user.png" alt=""><span>Foods In</span></div></div>';
    main.insertBefore(bar, main.firstChild);
    ensureToggle(bar);
  }
  function run(){ mountSidebar(); mountTop(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
