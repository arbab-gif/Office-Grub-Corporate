// Office Grubb — Orders list
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s){ return String(s).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];}); }

  var STATUS = {
    "New":{cls:"st-new",h:"--s-new"}, "Confirmed":{cls:"st-accepted",h:"--s-accepted"},
    "Preparing":{cls:"st-prep",h:"--s-prep"}, "Ready for Pickup":{cls:"st-ready",h:"--s-ready"},
    "Picked Up":{cls:"st-picked",h:"--s-out"}, "Delivered":{cls:"st-delivered",h:"--s-delivered"},
    "Completed":{cls:"st-completed",h:"--s-done"}
  };
  var TAB_ORDER = ["All","New","Confirmed","Preparing","Ready for Pickup","Picked Up","Delivered","Completed"];

  var ORDERS = [
    {id:"OG-10482", co:"Acme Corp", mgr:"Sarah Lee", role:"Office Manager", date:"Fri, Jul 11", time:"12:00–12:30 PM", addr:"200 State St, Boston, MA", menu:"Mediterranean — Sofia's", emp:28, items:52, total:456.50, status:"New", primary:true},
    {id:"OG-10479", co:"Northline Labs", mgr:"Priya Nair", role:"Ops Lead", date:"Fri, Jul 11", time:"12:30–1:00 PM", addr:"1 Kendall Sq, Cambridge, MA", menu:"Mediterranean — Sofia's", emp:16, items:31, total:288.75, status:"Confirmed"},
    {id:"OG-10476", co:"Vantage Group", mgr:"James Wu", role:"People Ops", date:"Fri, Jul 11", time:"1:00–1:30 PM", addr:"88 Seaport Blvd, Boston, MA", menu:"Mediterranean — Sofia's", emp:34, items:63, total:612.40, status:"Preparing"},
    {id:"OG-10471", co:"Bright Digital", mgr:"Chloe Martin", role:"HR Manager", date:"Fri, Jul 11", time:"11:30–12:00 PM", addr:"12 Farnsworth St, Boston, MA", menu:"Mediterranean — Sofia's", emp:12, items:22, total:206.00, status:"Ready for Pickup"},
    {id:"OG-10465", co:"Summit Partners", mgr:"Ethan Brooks", role:"Admin", date:"Thu, Jul 10", time:"12:00–12:30 PM", addr:"101 Federal St, Boston, MA", menu:"Mediterranean — Sofia's", emp:21, items:40, total:394.25, status:"Picked Up"},
    {id:"OG-10460", co:"Cobalt Systems", mgr:"Maya Singh", role:"Office Manager", date:"Thu, Jul 10", time:"12:30–1:00 PM", addr:"5 Wormwood St, Boston, MA", menu:"Mediterranean — Sofia's", emp:18, items:33, total:321.50, status:"Delivered"},
    {id:"OG-10455", co:"Meridian Co", mgr:"Noah Bennett", role:"Facilities", date:"Wed, Jul 9", time:"12:00–12:30 PM", addr:"60 State St, Boston, MA", menu:"Mediterranean — Sofia's", emp:25, items:47, total:451.80, status:"Completed"}
  ];

  var filter = "All", query = "";

  function initials(n){ return n.split(" ").map(function(w){return w[0];}).join(""); }
  function money(n){ return "$" + n.toFixed(2); }

  function renderTabs(){
    $("#tabs").innerHTML = TAB_ORDER.map(function(t){
      var cnt = t==="All" ? ORDERS.length : ORDERS.filter(function(o){return o.status===t;}).length;
      return '<div class="ord-tab'+(filter===t?' active':'')+'" data-t="'+esc(t)+'">'+esc(t)+' <span class="cnt tnum">'+cnt+'</span></div>';
    }).join("");
    Array.prototype.forEach.call($("#tabs").children, function(el){
      el.onclick = function(){ filter = el.getAttribute("data-t"); renderTabs(); renderList(); };
    });
  }

  function icon(p){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'+p+'</svg>'; }

  function renderList(){
    var q = query.trim().toLowerCase();
    var list = ORDERS.filter(function(o){
      if (filter!=="All" && o.status!==filter) return false;
      if (q && (o.id+" "+o.co+" "+o.mgr).toLowerCase().indexOf(q)<0) return false;
      return true;
    });
    if (!list.length){ $("#list").innerHTML = '<div style="padding:44px;text-align:center;color:var(--ink-3);background:var(--surface);border:1px solid var(--border);border-radius:16px">No orders match this view.</div>'; return; }
    $("#list").innerHTML = list.map(function(o){
      var st = STATUS[o.status];
      return '<a class="order-card" href="order.html" style="--h:var('+st.h+')">'
        + '<div class="oc-company">'
          + '<span class="oid tnum">#'+o.id+'</span>'
          + '<span class="cn">'+esc(o.co)+'</span>'
          + '<span class="mgr"><span class="mav">'+esc(initials(o.mgr))+'</span>'+esc(o.mgr)+' · '+esc(o.role)+'</span>'
          + '<span class="pill '+st.cls+'"><i></i>'+esc(o.status)+'</span>'
        + '</div>'
        + '<div class="oc-meta">'
          + '<div class="mfield">'+icon('<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>')+'<div><div class="ml">Delivery</div><div class="mv">'+esc(o.date)+' · '+esc(o.time)+'</div></div></div>'
          + '<div class="mfield">'+icon('<path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>')+'<div><div class="ml">Address</div><div class="mv">'+esc(o.addr)+'</div></div></div>'
          + '<div class="mfield">'+icon('<path d="M4 3h16v4H4zM6 7v13h12V7"/>')+'<div><div class="ml">Assigned Menu</div><div class="mv">'+esc(o.menu)+'</div></div></div>'
          + '<div class="mfield">'+icon('<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5"/><path d="M17 8h5"/>')+'<div><div class="ml">Employees · Items</div><div class="mv tnum">'+o.emp+' employees · '+o.items+' items</div></div></div>'
        + '</div>'
        + '<div class="oc-right">'
          + '<div><div class="gt tnum">'+money(o.total)+'</div><div class="gtl">gross order total</div></div>'
          + '<span class="go">Manage order '+icon('<path d="M9 6l6 6-6 6"/>')+'</span>'
        + '</div>'
      + '</a>';
    }).join("");
  }

  var toastT;
  function toast(msg){ var t=$("#toast"); $("#toastMsg").textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(function(){t.classList.remove("show");},2000); }

  $("#search").addEventListener("input", function(){ query = this.value; renderList(); });
  $("#filterBtn").onclick = function(){ toast("Filter by date, menu, headcount or status"); };

  renderTabs();
  renderList();
})();
