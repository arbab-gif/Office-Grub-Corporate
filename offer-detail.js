// Office Grubb — Offer detail screen
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s){ return String(s).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];}); }
  function svgP(p){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'+p+'</svg>'; }
  function money(n){ return "$" + Number(n).toFixed(2); }

  var TYPES = {
    percent:  { label:"Percentage Discount", icon:'<path d="M19 5L5 19M6.5 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>' },
    timed:    { label:"Limited-Time Deal", icon:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
    instore:  { label:"In-Store Promotion", icon:'<path d="M3 10l9-7 9 7v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 21v-7h6v7"/>' },
    bundle:   { label:"Bundle or Combo Offer", icon:'<path d="M4 8h16v11a1 1 0 01-1 1H5a1 1 0 01-1-1zM4 8l2-4h12l2 4M9 12h6"/>' }
  };
  var TYPE_SKIN = {
    percent: { h:"#E4611A", h2:"#F59E42", deco:"🏷️" },
    timed:   { h:"#7C3AED", h2:"#A970FF", deco:"⏱️" },
    instore: { h:"#0E9F6E", h2:"#3FC79A", deco:"🏪" },
    bundle:  { h:"#2563EB", h2:"#5B93F7", deco:"🍱" }
  };
  var STATUS_DOT = { Active:"var(--s-ready)", Scheduled:"var(--s-new)", Draft:"var(--ink-3)", Expired:"var(--s-cancel,#c0392b)" };

  var MENU = [
    {n:"Chicken Shawarma Bowl",p:14.00,cat:"Bowls & Plates"},{n:"Lamb Gyro Plate",p:17.50,cat:"Bowls & Plates"},
    {n:"Beef Kofta Plate",p:16.00,cat:"Bowls & Plates"},{n:"Chicken Kebab Bowl",p:14.00,cat:"Bowls & Plates"},
    {n:"Falafel Wrap",p:11.00,cat:"Wraps"},{n:"Chicken Souvlaki Wrap",p:12.00,cat:"Wraps"},
    {n:"Greek Salad",p:9.00,cat:"Salads"},{n:"Mediterranean Mezze Platter",p:18.00,cat:"Salads"},
    {n:"Hummus & Pita",p:3.50,cat:"Sides"},{n:"Spanakopita",p:10.50,cat:"Sides"},
    {n:"Iced Tea",p:2.00,cat:"Drinks"},{n:"Sparkling Water",p:1.00,cat:"Drinks"},{n:"Baklava",p:4.50,cat:"Sweets"}
  ];
  var DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  function menuBy(n){ for (var i=0;i<MENU.length;i++) if (MENU[i].n===n) return MENU[i]; return null; }

  // ---- seed offers (mirrors offers.js) ----
  var OFFERS = [
    { id:1, type:"percent", title:"20% off all Bowls & Plates", value:"20% off", desc:"Every bowl and plate on the lunch menu, all week.",
      applies:"Bowls & Plates", items:["Chicken Shawarma Bowl","Lamb Gyro Plate","Beef Kofta Plate","Chicken Kebab Bowl"],
      days:["Mon","Tue","Wed","Thu","Fri"], hours:"11:00 AM – 2:00 PM", window:"Jul 1 – Aug 31", minOrder:12, maxRedemptions:20000,
      status:"Active", views:1240, redemptions:86, audience:"all", onePerEmployee:true, terms:"Cannot be combined with other offers." },
    { id:2, type:"timed", title:"Happy Hour Mezze", value:"30% off", desc:"Mezze platters and sides discounted during the afternoon lull.",
      applies:"Sides", items:["Mediterranean Mezze Platter","Hummus & Pita","Spanakopita"],
      days:["Mon","Tue","Wed","Thu","Fri"], hours:"3:00 PM – 5:00 PM", window:"Ongoing", minOrder:1, maxRedemptions:500,
      status:"Active", views:864, redemptions:52, audience:"all", onePerEmployee:false, terms:"" },
    { id:3, type:"bundle", title:"Lunch Combo — wrap + side + drink", value:"$15.00", desc:"Any wrap with a side and a drink for one flat price.",
      applies:"3 bundled items", items:["Falafel Wrap","Hummus & Pita","Iced Tea"],
      days:["Mon","Tue","Wed","Thu","Fri"], hours:"11:00 AM – 2:00 PM", window:"Ongoing", minOrder:1, maxRedemptions:1000,
      status:"Active", views:2010, redemptions:173, audience:"all", onePerEmployee:false, bundlePrice:15.00, terms:"" },
    { id:4, type:"instore", title:"Show the app, get free baklava", value:"Free side", desc:"Employees who show their Office Grubb profile in-store get a free baklava with any main.",
      applies:"In-store only", items:["Baklava"],
      days:DAYS.slice(), hours:"All day", window:"Jul 8 – Jul 31", minOrder:1, maxRedemptions:300,
      status:"Active", views:521, redemptions:38, audience:"all", onePerEmployee:true, terms:"One per employee, per visit." },
    { id:5, type:"timed", title:"Early Bird — order before 10 AM", value:"15% off", desc:"Beat the rush: discount on next-day orders placed before 10 AM.",
      applies:"Entire order", items:["Entire order"],
      days:["Mon","Tue","Wed","Thu","Fri"], hours:"Before 10:00 AM", window:"Starts Jul 22", minOrder:10, maxRedemptions:2000,
      status:"Scheduled", views:0, redemptions:0, audience:"all", onePerEmployee:false, terms:"" },
    { id:6, type:"percent", title:"Salad season — 10% off", value:"10% off", desc:"Light lunches for the summer months.",
      applies:"Salads", items:["Greek Salad","Mediterranean Mezze Platter"],
      days:DAYS.slice(), hours:"All day", window:"Not published", minOrder:1, maxRedemptions:1000,
      status:"Draft", views:0, redemptions:0, audience:"all", onePerEmployee:false, terms:"" },
    { id:7, type:"percent", title:"Summer kickoff — 25% off first order", value:"25% off", desc:"Introductory discount for new corporate accounts.",
      applies:"Entire order", items:["Entire order"],
      days:DAYS.slice(), hours:"All day", window:"Ended Jun 30", minOrder:1, maxRedemptions:5000,
      status:"Expired", views:1890, redemptions:240, audience:"new", onePerEmployee:false, terms:"New corporate accounts only." }
  ];

  // ---- persistence overlay (shared with list + edit) ----
  var OVR_KEY = "og_offer_overrides", ARCH_KEY = "og_offer_archived";
  function readJSON(k,f){ try{ return JSON.parse(localStorage.getItem(k)) || f; }catch(e){ return f; } }
  (function applyStore(){
    var ov = readJSON(OVR_KEY,{}), arch = readJSON(ARCH_KEY,[]);
    for (var i=0;i<OFFERS.length;i++){
      if (ov[OFFERS[i].id]) for (var k in ov[OFFERS[i].id]) OFFERS[i][k] = ov[OFFERS[i].id][k];
      OFFERS[i].archived = arch.indexOf(OFFERS[i].id) >= 0;
    }
  })();

  function getId(){ var m = /[?&]id=(\d+)/.exec(location.search); return m ? +m[1] : (OFFERS[0]&&OFFERS[0].id); }
  function byId(id){ for (var i=0;i<OFFERS.length;i++) if (OFFERS[i].id===id) return OFFERS[i]; return null; }

  var current = byId(getId());

  // discount math -------------------------------------------------------------
  function pct(o){ var m=/(\d+(?:\.\d+)?)\s*%/.exec(o.value); return m ? +m[1] : 0; }
  function itemNow(o, price){
    if (o.type==="instore" && /free/i.test(o.value)) return 0;
    var p = pct(o); if (p) return price * (1 - p/100);
    return price; // bundle / fixed handled at total level
  }
  function realItems(o){
    return (o.items||[]).map(menuBy).filter(Boolean);
  }

  // renderers -----------------------------------------------------------------
  function defRow(icon,label,val,full){
    return '<div class="od-def'+(full?" full":"")+'">'+svgP(icon)+'<div><div class="dl">'+esc(label)+'</div><div class="dv">'+val+'</div></div></div>';
  }

  var I = {
    tag:'<path d="M4 3h16v4H4zM6 7v13h12V7"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    cal:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
    cart:'<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 12.4a1.6 1.6 0 001.6 1.3h8.2a1.6 1.6 0 001.6-1.2L22 7H6"/>',
    users:'<path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.9"/>',
    check:'<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
    box:'<path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8"/>',
    doc:'<path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9zM14 3v6h6"/>',
    eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>'
  };

  function render(){
    var o = current;
    if (!o){ $("#wrap").innerHTML = '<div class="od-missing">Offer not found. <a href="offers.html">Back to Special Offers</a></div>'; return; }
    document.title = "Office Grubb — " + o.title;
    var skin = TYPE_SKIN[o.type], t = TYPES[o.type];
    var dispStatus = o.archived ? "Archived" : o.status;
    var dot = o.archived ? "var(--ink-3)" : (STATUS_DOT[o.status] || "var(--s-ready)");
    var live = o.status==="Active" && !o.archived;

    // hero
    var hero = '<div class="od-hero'+(o.archived?" od-hero-arch":"")+'" style="--deco:\''+skin.deco+'\';--hs:'+dot+';background:linear-gradient(135deg,'+skin.h+','+skin.h2+')">'
      + '<div class="od-hero-top"><span class="od-htype">'+svgP(t.icon)+t.label+'</span>'
        + '<span class="od-hstatus"><i></i>'+dispStatus+'</span></div>'
      + '<div><div class="od-hval">'+esc(o.value)+'</div>'
        + '<div class="od-htitle">'+esc(o.title)+'</div>'
        + '<div class="od-hdesc">'+esc(o.desc)+'</div></div></div>';

    // included items
    var ri = realItems(o), rows="", origTotal=0, newTotal=0, computable=true;
    if (ri.length){
      rows = ri.map(function(m){
        var now = itemNow(o, m.p); origTotal+=m.p; newTotal+=now;
        var pr = (now===m.p) ? '<div class="plain">'+money(m.p)+'</div>'
               : '<div class="was">'+money(m.p)+'</div><div class="now">'+money(now)+'</div>';
        return '<div class="od-item" style="--h:'+skin.h+';--h2:'+skin.h2+'"><div class="th">'+esc(m.n.charAt(0))+'</div>'
          + '<div><div class="nm">'+esc(m.n)+'</div><div class="ct">'+esc(m.cat)+'</div></div>'
          + '<div class="pr">'+pr+'</div></div>';
      }).join("");
    } else {
      computable=false;
      rows = '<div class="od-item"><div class="th" style="--h:'+skin.h+';--h2:'+skin.h2+'">✦</div><div><div class="nm">'+esc(o.applies)+'</div><div class="ct">Applies to the whole order</div></div></div>';
    }
    if (o.type==="bundle" && o.bundlePrice){ newTotal=o.bundlePrice; computable=true; }
    var totalBlock = "";
    if (computable && origTotal>0){
      var saved = origTotal-newTotal, savePct = Math.round(saved/origTotal*100);
      totalBlock = '<div class="od-total"><div><div class="tl">'+(o.type==="bundle"?"Bundle price":"Employee pays")+'</div>'
        + '<span class="od-save">Save '+money(saved)+' ('+savePct+'%)</span></div>'
        + '<div class="tr"><span class="was">'+money(origTotal)+'</span><span class="now">'+money(newTotal)+'</span></div></div>';
    }
    var itemsPanel = '<div class="od-panel"><div class="od-ph">'+svgP(I.tag)+'<h2>Included items</h2>'
      + '<span class="ph-note">'+(ri.length?ri.length+' item'+(ri.length>1?"s":""):"Order-wide")+'</span></div>'
      + '<div class="od-pb"><div class="od-items">'+rows+'</div>'+totalBlock+'</div></div>';

    // availability
    var dayPills = DAYS.map(function(d){ return '<span class="od-day'+(o.days.indexOf(d)>=0?" on":"")+'">'+d+'</span>'; }).join("");
    var availPanel = '<div class="od-panel"><div class="od-ph">'+svgP(I.cal)+'<h2>Availability</h2></div><div class="od-pb">'
      + '<div class="od-defs">'
        + defRow(I.cal,"Offer valid", esc(o.window))
        + defRow(I.clock,"Time window", esc(o.hours))
      + '</div>'
      + '<div class="od-def full" style="margin-top:15px"><div style="width:100%"><div class="dl">Available days</div><div class="od-days">'+dayPills+'</div></div></div>'
      + '</div></div>';

    // conditions
    var audLabel = o.audience==="new" ? "New corporate accounts only" : "All eligible employees";
    var condPanel = '<div class="od-panel"><div class="od-ph">'+svgP(I.check)+'<h2>Conditions</h2></div><div class="od-pb">'
      + '<div class="od-defs">'
        + defRow(I.cart,"Minimum order", esc(String(o.minOrder||1)))
        + defRow(I.users,"Max redemptions", Number(o.maxRedemptions||0).toLocaleString())
        + defRow(I.check,"Per employee", o.onePerEmployee?"One redemption each":"No per-person limit")
        + defRow(I.target,"Audience", esc(audLabel))
      + '</div>'
      + '<div class="od-def full" style="margin-top:16px">'+svgP(I.doc)+'<div style="width:100%"><div class="dl">Terms</div>'
        + '<div class="od-terms'+(o.terms?"":" empty")+'" style="margin-top:4px">'+esc(o.terms||"No additional terms — standard Office Grubb offer rules apply.")+'</div></div></div>'
      + '</div></div>';

    // ---- sidebar ----
    var rate = o.views ? Math.round(o.redemptions/o.views*100) : 0;
    var cap = o.maxRedemptions||0, used = o.redemptions, remaining = Math.max(0, cap-used);
    var meterPct = cap ? Math.min(100, Math.round(used/cap*100)) : 0;
    var perfPanel = '<div class="od-panel"><div class="od-ph">'+svgP(I.eye)+'<h2>Performance</h2><span class="ph-note">this month</span></div><div class="od-pb">'
      + '<div class="od-kpis">'
        + '<div class="od-kpi"><div class="kl">Views</div><div class="kv tnum">'+o.views.toLocaleString()+'</div><div class="kd">employee views</div></div>'
        + '<div class="od-kpi"><div class="kl">Redeemed</div><div class="kv tnum">'+o.redemptions+'</div><div class="kd">claimed</div></div>'
        + '<div class="od-kpi wide"><div class="kl">Redemption rate</div><div class="kv tnum">'+rate+'%</div>'
          + '<div class="od-meter"><i style="width:'+meterPct+'%"></i></div>'
          + '<div class="od-meter-row"><span><b>'+used.toLocaleString()+'</b> used</span><span><b>'+remaining.toLocaleString()+'</b> left of '+cap.toLocaleString()+'</span></div>'
        + '</div>'
      + '</div></div></div>';

    // employee preview
    var pvRows = '<div class="pvr">'+svgP(I.cal)+esc(o.window)+'</div>'
      + '<div class="pvr">'+svgP(I.clock)+esc(o.days.length===7?"Every day":o.days.join(" · "))+' · '+esc(o.hours)+'</div>'
      + '<div class="pvr">'+svgP(I.tag)+'Applies to '+esc(o.applies)+'</div>';
    var prevPanel = '<div class="od-panel od-preview"><div class="od-ph">'+svgP(I.eye)+'<h2>How employees see it</h2></div><div class="od-pb">'
      + '<div class="pv-card"><div class="pv-band" style="--h:'+skin.h+';--h2:'+skin.h2+'"><div class="pvv">'+esc(o.value)+'</div><div class="pvt">'+esc(o.title)+'</div></div>'
      + '<div class="pv-body">'+pvRows+'<div class="pv-cta">Redeem offer</div></div></div>'
      + '<div style="font-size:11px;color:var(--ink-3);margin-top:10px;text-align:center">Shown on your restaurant profile · Listing is free</div>'
      + '</div></div>';

    $("#wrap").innerHTML = '<div class="od-grid">'
      + hero
      + '<div class="od-main">'+itemsPanel+availPanel+condPanel+'</div>'
      + '<div class="od-side">'+perfPanel+prevPanel+'</div>'
      + '</div>';

    syncToolbar();
  }

  // ---- toolbar state (Archive vs Restore) ----
  var ARCH_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8M10 12h4"/></svg>';
  var RESTORE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 109-9 9 9 0 00-6.7 3M3 3v4h4"/></svg>';
  function syncToolbar(){
    var o = current; if (!o) return;
    var pb = $("#pubBtn"), ab = $("#archBtn");
    if (o.archived){
      pb.style.display = "none";
      ab.className = "btn primary";
      ab.innerHTML = RESTORE_SVG + "Restore offer";
      ab.onclick = doRestore;
    } else {
      pb.style.display = "";
      ab.className = "btn";
      ab.innerHTML = ARCH_SVG + "Archive";
      ab.onclick = openArchive;
      var live = o.status==="Active";
      $("#pubToggle").className = "toggle" + (live?" on":"");
      $("#pubLabel").textContent = live ? "Live" : (o.status==="Draft"?"Draft":o.status);
    }
  }

  function toast(msg){ var t=$("#toast"); $("#toastMsg").textContent=msg; t.classList.add("show"); clearTimeout(toast._t); toast._t=setTimeout(function(){t.classList.remove("show");},2200); }

  // ---- actions ----
  $("#editBtn").onclick = function(){ if(current) location.href = "offer-edit.html?id=" + current.id; };

  // archive via confirmation modal
  function openArchive(){
    if (!current || current.archived) return;
    $("#archTitle").textContent = 'Archive "'+current.title+'"?';
    $("#archSub").textContent = 'Archiving hides this '+(TYPES[current.type]?TYPES[current.type].label.toLowerCase():"offer")+' from Office Grubb — nothing is deleted.';
    $("#archModal").classList.add("on");
  }
  function closeArch(){ $("#archModal").classList.remove("on"); }
  $("#archCancel").onclick = closeArch;
  $("#archModal").onclick = function(e){ if(e.target===$("#archModal")) closeArch(); };
  document.addEventListener("keydown", function(e){ if(e.key==="Escape") closeArch(); });
  $("#archConfirm").onclick = function(){
    if (!current) return;
    current.archived = true;
    var arch = readJSON(ARCH_KEY,[]); if (arch.indexOf(current.id)<0) arch.push(current.id);
    try{ localStorage.setItem(ARCH_KEY, JSON.stringify(arch)); }catch(e){}
    closeArch(); toast("Offer archived — restore any time from the Archived tab");
    render();
  };
  function doRestore(){
    if (!current) return;
    current.archived = false;
    var arch = readJSON(ARCH_KEY,[]); var i=arch.indexOf(current.id); if(i>=0){ arch.splice(i,1); try{ localStorage.setItem(ARCH_KEY, JSON.stringify(arch)); }catch(e){} }
    toast("Offer restored — live on your profile again"); render();
  }

  $("#pubBtn").onclick = function(){
    if (!current) return;
    if (current.status==="Active"){ current.status="Draft"; toast("Offer paused — hidden from employees"); }
    else if (current.status==="Draft" || current.status==="Scheduled"){ current.status="Active"; toast("Offer is live on your profile"); }
    else { toast("Expired offers can't be relaunched — duplicate it instead"); return; }
    var ov=readJSON(OVR_KEY,{}); ov[current.id]=ov[current.id]||{}; ov[current.id].status=current.status;
    try{ localStorage.setItem(OVR_KEY, JSON.stringify(ov)); }catch(e){}
    render();
  };
  $("#themeBtn").onclick = function(){ var r=document.documentElement,c=r.getAttribute("data-theme"); if(!c)c=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"; r.setAttribute("data-theme",c==="dark"?"light":"dark"); };

  render();
})();
