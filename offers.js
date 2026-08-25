// Office Grubb — Special Offers + 9-step creation flow (free to publish)
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s){ return String(s).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];}); }
  function svgP(p){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'+p+'</svg>'; }
  function money(n){ return "$" + Number(n).toFixed(2); }

  var RESTAURANT = "Sofia's Kitchen";

  // ---- offer types (step 2) ----
  var TYPES = {
    percent:  { label:"Percentage Discount", cls:"t-percent", icon:'<path d="M19 5L5 19M6.5 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>', blurb:"A % off specific items, a category, or the whole order." },
    timed:    { label:"Limited-Time Deal", cls:"t-timed", icon:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', blurb:"Runs on set days and hours; stops automatically at the end time." },
    instore:  { label:"In-Store Promotion", cls:"t-instore", icon:'<path d="M3 10l9-7 9 7v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 21v-7h6v7"/>', blurb:"Redeemable only at your physical restaurant location." },
    bundle:   { label:"Bundle or Combo Offer", cls:"t-bundle", icon:'<path d="M4 8h16v11a1 1 0 01-1 1H5a1 1 0 01-1-1zM4 8l2-4h12l2 4M9 12h6"/>', blurb:"Group items together for one promotional bundle price." }
  };
  var TYPE_ORDER = ["percent","timed","instore","bundle"];
  // banner hue + decorative glyph per type (Figma card)
  var TYPE_SKIN = {
    percent: { h:"#E4611A", h2:"#F59E42", deco:"🏷️" },
    timed:   { h:"#7C3AED", h2:"#A970FF", deco:"⏱️" },
    instore: { h:"#0E9F6E", h2:"#3FC79A", deco:"🏪" },
    bundle:  { h:"#2563EB", h2:"#5B93F7", deco:"🍱" }
  };

  var MENU = [
    {n:"Chicken Shawarma Bowl",p:14.00,cat:"Bowls & Plates"},{n:"Lamb Gyro Plate",p:17.50,cat:"Bowls & Plates"},
    {n:"Beef Kofta Plate",p:16.00,cat:"Bowls & Plates"},{n:"Chicken Kebab Bowl",p:14.00,cat:"Bowls & Plates"},
    {n:"Falafel Wrap",p:11.00,cat:"Wraps"},{n:"Chicken Souvlaki Wrap",p:12.00,cat:"Wraps"},
    {n:"Greek Salad",p:9.00,cat:"Salads"},{n:"Mediterranean Mezze Platter",p:18.00,cat:"Salads"},
    {n:"Hummus & Pita",p:3.50,cat:"Sides"},{n:"Spanakopita",p:10.50,cat:"Sides"},
    {n:"Iced Tea",p:2.00,cat:"Drinks"},{n:"Sparkling Water",p:1.00,cat:"Drinks"},{n:"Baklava",p:4.50,cat:"Sweets"}
  ];
  var CATS = ["Bowls & Plates","Wraps","Salads","Sides","Drinks","Sweets"];
  var DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  // where the offer applies (step 4) — options depend on type
  var APPLY_MODES = {
    item:     "A specific menu item",
    items:    "Multiple menu items",
    category: "An entire menu category",
    order:    "The entire order",
    location: "Physical restaurant location only",
    bundle:   "Custom bundle / combo items"
  };
  function applyOptionsFor(type){
    if (type==="bundle") return ["bundle"];
    if (type==="instore") return ["location","item","items","category"];
    return ["item","items","category","order"];
  }
  // discount modes (step 5)
  var DISCOUNT_MODES = { percent:"Percentage discount", fixed:"Fixed amount off", promo:"Promotional item price", bundlePrice:"Bundle price" };
  function discountOptionsFor(type){
    if (type==="bundle") return ["bundlePrice"];
    if (type==="percent") return ["percent"];
    return ["percent","fixed","promo"];
  }

  var STATUS = { Active:"st-active", Scheduled:"st-scheduled", Draft:"st-paused", Expired:"st-expired" };
  var TABS = ["All","Active","Scheduled","Drafts","Expired","Archived"];

  // ---- seeded offers ----
  var offers = [
    { id:1, type:"percent", title:"20% off all Bowls & Plates", value:"20% off", desc:"Every bowl and plate on the lunch menu, all week.",
      applies:"Bowls & Plates", items:["Chicken Shawarma Bowl","Lamb Gyro Plate","Beef Kofta Plate","Chicken Kebab Bowl"],
      days:["Mon","Tue","Wed","Thu","Fri"], hours:"11:00 AM – 2:00 PM", window:"Jul 1 – Aug 31", minOrder:12, maxRedemptions:20000,
      status:"Active", views:1240, redemptions:86, terms:"Cannot be combined with other offers." },
    { id:2, type:"timed", title:"Happy Hour Mezze", value:"30% off", desc:"Mezze platters and sides discounted during the afternoon lull.",
      applies:"Sides", items:["Mediterranean Mezze Platter","Hummus & Pita","Spanakopita"],
      days:["Mon","Tue","Wed","Thu","Fri"], hours:"3:00 PM – 5:00 PM", window:"Ongoing", minOrder:1, maxRedemptions:500,
      status:"Active", views:864, redemptions:52, terms:"" },
    { id:3, type:"bundle", title:"Lunch Combo — wrap + side + drink", value:"$15.00", desc:"Any wrap with a side and a drink for one flat price.",
      applies:"3 bundled items", items:["Falafel Wrap","Hummus & Pita","Iced Tea"],
      days:["Mon","Tue","Wed","Thu","Fri"], hours:"11:00 AM – 2:00 PM", window:"Ongoing", minOrder:1, maxRedemptions:1000,
      status:"Active", views:2010, redemptions:173, terms:"" },
    { id:4, type:"instore", title:"Show the app, get free baklava", value:"Free side", desc:"Employees who show their Office Grubb profile in-store get a free baklava with any main.",
      applies:"In-store only", items:["Baklava"],
      days:DAYS.slice(), hours:"All day", window:"Jul 8 – Jul 31", minOrder:1, maxRedemptions:300,
      status:"Active", views:521, redemptions:38, terms:"One per employee, per visit." },
    { id:5, type:"timed", title:"Early Bird — order before 10 AM", value:"15% off", desc:"Beat the rush: discount on next-day orders placed before 10 AM.",
      applies:"Entire order", items:["Entire order"],
      days:["Mon","Tue","Wed","Thu","Fri"], hours:"Before 10:00 AM", window:"Starts Jul 22", minOrder:10, maxRedemptions:2000,
      status:"Scheduled", views:0, redemptions:0, terms:"" },
    { id:6, type:"percent", title:"Salad season — 10% off", value:"10% off", desc:"Light lunches for the summer months.",
      applies:"Salads", items:["Greek Salad","Mediterranean Mezze Platter"],
      days:DAYS.slice(), hours:"All day", window:"Not published", minOrder:1, maxRedemptions:1000,
      status:"Draft", views:0, redemptions:0, terms:"" },
    { id:7, type:"percent", title:"Summer kickoff — 25% off first order", value:"25% off", desc:"Introductory discount for new corporate accounts.",
      applies:"Entire order", items:["Entire order"],
      days:DAYS.slice(), hours:"All day", window:"Ended Jun 30", minOrder:1, maxRedemptions:5000,
      status:"Expired", views:1890, redemptions:240, terms:"" }
  ];
  var nextId = 8, filter = "All", query = "";

  // ---- persistence overlay (shared with detail + edit screens) ----
  var OVR_KEY = "og_offer_overrides", ARCH_KEY = "og_offer_archived";
  function readJSON(k,f){ try{ return JSON.parse(localStorage.getItem(k)) || f; }catch(e){ return f; } }
  function writeJSON(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
  (function applyStore(){
    var ov = readJSON(OVR_KEY,{}), arch = readJSON(ARCH_KEY,[]);
    for (var i=0;i<offers.length;i++){
      if (ov[offers[i].id]) for (var k in ov[offers[i].id]) offers[i][k] = ov[offers[i].id][k];
      offers[i].archived = arch.indexOf(offers[i].id) >= 0;
    }
  })();

  function stats(){
    $("#stActive").textContent = offers.filter(function(o){return o.status==="Active";}).length;
    $("#stSched").textContent = offers.filter(function(o){return o.status==="Scheduled";}).length;
    $("#stViews").textContent = offers.reduce(function(s,o){return s+o.views;},0).toLocaleString();
    $("#stRedeem").textContent = offers.reduce(function(s,o){return s+o.redemptions;},0);
  }
  function tabCount(t){
    if (t==="Archived") return offers.filter(function(o){return o.archived;}).length;
    var live = offers.filter(function(o){return !o.archived;});
    if (t==="All") return live.length;
    if (t==="Drafts") return live.filter(function(o){return o.status==="Draft";}).length;
    return live.filter(function(o){return o.status===t;}).length;
  }
  function renderTabs(){
    $("#tabs").innerHTML = TABS.map(function(t){
      return '<div class="of-tab'+(filter===t?" on":"")+'" data-t="'+t+'">'+t+' <span class="cnt tnum">'+tabCount(t)+'</span></div>';
    }).join("");
    Array.prototype.forEach.call($("#tabs").children, function(el){ el.onclick=function(){ filter=el.getAttribute("data-t"); render(); }; });
  }

  // ---- Figma-style offer card ----
  var MI_TAG   = '<path d="M4 3h16v4H4zM6 7v13h12V7"/>';
  var MI_CLOCK = '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>';
  var MI_CAL   = '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>';
  var MI_CART  = '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 12.4a1.6 1.6 0 001.6 1.3h8.2a1.6 1.6 0 001.6-1.2L22 7H6"/>';
  var MI_USERS = '<path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.9"/>';
  var MI_ARCH  = '<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8M10 12h4"/>';
  var MI_RESTORE = '<path d="M3 12a9 9 0 109-9 9 9 0 00-6.7 3M3 3v4h4"/>';

  function metaCell(icon,label,val){
    return '<div class="om">'+svgP(icon)+'<div><div class="ml">'+esc(label)+'</div><div class="mv">'+val+'</div></div></div>';
  }
  function offerCard(o){
    var live = o.status==="Active";
    var cls = (o.status==="Draft") ? " paused" : (o.status==="Expired" ? " expired" : "");
    if (o.archived) cls += " arch";
    var skin = TYPE_SKIN[o.type] || TYPE_SKIN.percent, t = TYPES[o.type];
    var dispStatus = o.archived ? "Archived" : o.status;
    var dotColor = o.archived ? "var(--ink-3)" : ({ Active:"var(--s-ready)", Scheduled:"var(--s-new)", Draft:"var(--ink-3)", Expired:"var(--s-cancel,#c0392b)" }[o.status] || "var(--s-ready)");
    var items = o.items || [];
    var MAXI = 3;
    var chips = items.slice(0,MAXI).map(function(n){ return '<span class="ochip">'+esc(n)+'</span>'; }).join("");
    if (items.length>MAXI) chips += '<span class="ochip more" data-items="'+o.id+'">+'+(items.length-MAXI)+' more</span>';
    var dayTxt = o.days.length===7 ? "Every day" : o.days.join(" · ");

    return '<div class="ocard'+cls+'" data-id="'+o.id+'" data-open="'+o.id+'">'
      + '<div class="ocard-banner" style="--h:'+skin.h+';--h2:'+skin.h2+';--deco:\''+skin.deco+'\';background:linear-gradient(135deg,'+skin.h+','+skin.h2+')">'
        + '<span class="ocard-type">'+svgP(t.icon)+t.label+'</span>'
        + '<span class="ocard-status" style="--hs:'+dotColor+'"><i></i>'+dispStatus+'</span>'
        + '<div class="ocard-val">'+esc(o.value)+'</div>'
      + '</div>'
      + '<div class="ocard-body">'
        + '<div><h3>'+esc(o.title)+'</h3><div class="odesc">'+esc(o.desc)+'</div></div>'
        + '<div class="osec"><span class="ol">Applies to</span><div class="ochips">'+(chips||'<span class="ochip">'+esc(o.applies)+'</span>')+'</div></div>'
        + '<div class="osec"><span class="ol">Available days</span><div class="ochips">'+o.days.map(function(d){return '<span class="ochip more">'+d+'</span>';}).join("")+'</div></div>'
        + '<div class="ometa">'
          + metaCell(MI_CAL,"Offer Valid", esc(o.window))
          + metaCell(MI_CLOCK,"Time", esc(o.hours))
          + metaCell(MI_CART,"Min Order", esc(String(o.minOrder||1)))
          + metaCell(MI_USERS,"Max Redemptions", Number(o.maxRedemptions||0).toLocaleString())
        + '</div>'
      + '</div>'
      + '<div class="ocard-foot">'
        + (o.archived
            ? '<span class="pub arch-label">'+svgP(MI_ARCH)+'Archived</span>'
            : '<span class="pub"><span class="toggle'+(live?" on":"")+'" data-pub="'+o.id+'"></span>'+(live?"Live":(o.status==="Draft"?"Draft":o.status))+'</span>')
        + '<span class="perf tnum">'+o.views.toLocaleString()+' views · <b>'+o.redemptions+'</b> redeemed</span>'
        + '<span class="acts">'
        + (o.archived
            ? '<button class="mini-btn" data-restore="'+o.id+'" title="Restore offer">'+svgP(MI_RESTORE)+'</button>'
            : '<button class="mini-btn" data-edit="'+o.id+'" title="Edit">'+svgP('<path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>')+'</button>'
              + '<button class="mini-btn" data-arch="'+o.id+'" title="Archive">'+svgP(MI_ARCH)+'</button>')
        + '</span>'
      + '</div></div>';
  }

  function renderGrid(){
    var q = query.trim().toLowerCase();
    var list = offers.filter(function(o){
      if (filter==="Archived"){ if (!o.archived) return false; }
      else {
        if (o.archived) return false;
        if (filter==="Drafts" && o.status!=="Draft") return false;
        if (filter!=="All" && filter!=="Drafts" && o.status!==filter) return false;
      }
      if (q && (o.title+" "+o.desc+" "+o.applies).toLowerCase().indexOf(q)<0) return false;
      return true;
    });
    if (!list.length){
      var msg = filter==="Archived"
        ? 'No archived offers. Archived offers are hidden from your profile but can be restored any time.'
        : 'Nothing here yet. Click <b>Create Special Offer</b> — publishing is free.';
      $("#grid").innerHTML = '<div style="grid-column:1/-1;padding:44px;text-align:center;color:var(--ink-3);background:var(--surface);border:1px solid var(--border);border-radius:16px">'+msg+'</div>'; return;
    }
    $("#grid").innerHTML = list.map(offerCard).join("");
    Array.prototype.forEach.call($("#grid").querySelectorAll("[data-pub]"),function(t){ t.onclick=function(){ togglePublish(byId(+t.getAttribute("data-pub"))); }; });
    Array.prototype.forEach.call($("#grid").querySelectorAll("[data-edit]"),function(b){ b.onclick=function(){ location.href="offer-edit.html?id="+b.getAttribute("data-edit"); }; });
    Array.prototype.forEach.call($("#grid").querySelectorAll("[data-arch]"),function(b){ b.onclick=function(){ askArchive(byId(+b.getAttribute("data-arch"))); }; });
    Array.prototype.forEach.call($("#grid").querySelectorAll("[data-restore]"),function(b){ b.onclick=function(){ restoreOffer(byId(+b.getAttribute("data-restore"))); }; });
    Array.prototype.forEach.call($("#grid").querySelectorAll("[data-items]"),function(b){ b.onclick=function(e){ e.stopPropagation(); openItems(byId(+b.getAttribute("data-items"))); }; });
    Array.prototype.forEach.call($("#grid").querySelectorAll("[data-open]"),function(c){ c.onclick=function(e){
      if (e.target.closest("[data-pub],[data-edit],[data-arch],[data-restore],[data-items],.toggle,.mini-btn")) return;
      location.href = "offer-detail.html?id=" + c.getAttribute("data-open");
    }; });
  }
  function openItems(o){
    if (!o) return;
    var rows = (o.items||[]).map(function(n){
      var m = null; for (var i=0;i<MENU.length;i++){ if (MENU[i].n===n){ m=MENU[i]; break; } }
      var price = m ? money(m.p) : "";
      return '<div class="oi-row"><div class="oi-thumb">'+(n.charAt(0))+'</div><div class="oi-name">'+esc(n)+'</div><div class="oi-price tnum">'+price+'</div></div>';
    }).join("");
    var ov = document.createElement("div");
    ov.className = "modal-ov on"; ov.id = "itemsOv";
    ov.innerHTML = '<div class="modal-av" style="width:460px">'
      + '<div class="mh"><div><h3>Selected items</h3><p>'+esc(o.title)+'</p></div><button class="mclose" aria-label="Close">×</button></div>'
      + '<div class="mb oi-list">'+rows+'</div>'
      + '<div class="mf"><button class="btn primary" data-close>Done</button></div></div>';
    document.body.appendChild(ov);
    function close(){ ov.remove(); }
    ov.addEventListener("click",function(e){ if (e.target===ov || e.target.closest(".mclose") || e.target.closest("[data-close]")) close(); });
  }
  function byId(id){ for (var i=0;i<offers.length;i++) if (offers[i].id===id) return offers[i]; return null; }
  function togglePublish(o){
    if (o.status==="Expired"){ toast("Expired offers can't be re-published — duplicate it instead"); return; }
    o.status = (o.status==="Active") ? "Draft" : "Active";
    if (o.status==="Active" && o.window==="Not published") o.window = "Ongoing";
    var ov=readJSON(OVR_KEY,{}); ov[o.id]=ov[o.id]||{}; ov[o.id].status=o.status; ov[o.id].window=o.window; writeJSON(OVR_KEY,ov);
    toast(o.status==="Active" ? '"'+o.title+'" is live on your profile' : '"'+o.title+'" moved to drafts');
    render();
  }
  function archiveOffer(o){
    if(!o) return;
    o.archived = true;
    var arch=readJSON(ARCH_KEY,[]); if(arch.indexOf(o.id)<0) arch.push(o.id); writeJSON(ARCH_KEY,arch);
    toast('"'+o.title+'" archived — restore any time'); render();
  }
  function restoreOffer(o){
    if(!o) return;
    o.archived = false;
    var arch=readJSON(ARCH_KEY,[]); var i=arch.indexOf(o.id); if(i>=0){ arch.splice(i,1); writeJSON(ARCH_KEY,arch); }
    toast('"'+o.title+'" restored'); render();
  }
  // ---- archive confirmation modal ----
  var pendingArch = null;
  function askArchive(o){
    if(!o) return; pendingArch=o;
    $("#archTitle").textContent = 'Archive "'+o.title+'"?';
    $("#archSub").textContent = 'Archiving hides this '+(TYPES[o.type]?TYPES[o.type].label.toLowerCase():"offer")+' from Office Grubb — nothing is deleted.';
    $("#archModal").classList.add("on");
  }
  function closeArch(){ $("#archModal").classList.remove("on"); pendingArch=null; }
  $("#archCancel").onclick = closeArch;
  $("#archModal").onclick = function(e){ if(e.target===$("#archModal")) closeArch(); };
  $("#archConfirm").onclick = function(){ if(pendingArch){ var o=pendingArch; closeArch(); archiveOffer(o); } };
  document.addEventListener("keydown", function(e){ if(e.key==="Escape") closeArch(); });

  // ================= WIZARD =================
  var WSTEPS = ["Type","Details","Applies to","Discount","Availability","Conditions","Preview"];
  var step = 0, d = null, editingId = null, published = false;

  function blankDraft(){
    return { type:"percent", title:"", desc:"", image:"", terms:"",
      applyMode:"category", item:MENU[0].n, items:[], category:CATS[0], bundleItems:[],
      discMode:"percent", percent:20, fixed:5, promoPrice:14, bundlePrice:15,
      start:"2026-07-22", end:"2026-08-31", days:["Mon","Tue","Wed","Thu","Fri"], startTime:"11:00", endTime:"14:00", allDay:true,
      minOrder:"", maxRedemptions:"", onePerEmployee:true, audience:"all", inStoreOnly:false };
  }

  function openWizard(existing){
    editingId = existing ? existing.id : null;
    published = false;
    d = blankDraft();
    if (existing){ d.type = existing.type; d.title = existing.title; d.desc = existing.desc; d.terms = existing.terms||""; d.days = existing.days.slice(); }
    step = 0;
    $("#wizDraft").textContent = "Save as draft";
    $("#wizTitle").textContent = existing ? "Edit Special Offer" : "Create Special Offer";
    $("#wizModal").classList.add("show");
    renderWizard();
  }
  function closeWizard(){ $("#wizModal").classList.remove("show"); d=null; }

  function renderSteps(){
    $("#wizSteps").innerHTML = WSTEPS.map(function(s,i){
      return '<div class="ws'+(i===step?" on":"")+(i<step?" done":"")+'"><div class="bar"></div><div class="lb">'+s+'</div></div>';
    }).join("");
    $("#wizSub").textContent = "Step "+(step+1)+" of "+WSTEPS.length+" · "+WSTEPS[step];
  }

  function selectedItems(){
    if (d.applyMode==="item") return MENU.filter(function(m){return m.n===d.item;});
    if (d.applyMode==="items") return MENU.filter(function(m){return d.items.indexOf(m.n)>=0;});
    if (d.applyMode==="bundle") return MENU.filter(function(m){return d.bundleItems.indexOf(m.n)>=0;});
    if (d.applyMode==="category") return MENU.filter(function(m){return m.cat===d.category;});
    return [];
  }
  function originalPrice(){ var s=selectedItems(); return s.reduce(function(a,m){return a+m.p;},0); }
  function offerPrice(){
    var orig = originalPrice();
    if (d.discMode==="percent") return orig * (1 - (+d.percent||0)/100);
    if (d.discMode==="fixed") return Math.max(0, orig - (+d.fixed||0));
    if (d.discMode==="promo") return +d.promoPrice||0;
    if (d.discMode==="bundlePrice") return +d.bundlePrice||0;
    return orig;
  }
  function valueLabel(){
    if (d.discMode==="percent") return (+d.percent||0)+"% off";
    if (d.discMode==="fixed") return money(+d.fixed||0)+" off";
    if (d.discMode==="promo") return money(+d.promoPrice||0);
    return money(+d.bundlePrice||0);
  }
  function appliesLabel(){
    if (d.applyMode==="item") return d.item;
    if (d.applyMode==="items") return d.items.length+" menu items";
    if (d.applyMode==="category") return d.category;
    if (d.applyMode==="order") return "Entire order";
    if (d.applyMode==="location") return "In-store only";
    return d.bundleItems.length+" bundled items";
  }
  function hoursLabel(){ return d.allDay ? "All day" : (fmtTime(d.startTime)+" – "+fmtTime(d.endTime)); }
  function fmtTime(t){ var p=(t||"").split(":"); if(p.length<2) return t; var h=+p[0], ap=h>=12?"PM":"AM", hh=h%12; if(hh===0)hh=12; return hh+":"+p[1]+" "+ap; }
  function fmtDate(s){ if(!s) return ""; var p=s.split("-"); var M=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; return M[(+p[1])-1]+" "+(+p[2]); }
  function windowLabel(){ return fmtDate(d.start)+" – "+fmtDate(d.end); }

  function renderWizard(){
    renderSteps();
    var b = $("#wizBody"), h = "";

    if (published){
      var pv = valueLabel(), pa = appliesLabel();
      b.innerHTML = '<div class="wiz-done"><div class="dic">'+svgP('<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>')+'</div>'
        + '<h3>Special offer published successfully.</h3>'
        + '<p>“'+esc(d.title)+'” is now live on your Office Grubb profile — employees browsing your menu can see it straight away.</p>'
        + '<div class="done-summary">'
          + '<div class="ds-row"><span class="k">Offer</span><span class="v">'+esc(d.title)+'</span></div>'
          + '<div class="ds-row"><span class="k">Type</span><span class="v">'+TYPES[d.type].label+'</span></div>'
          + '<div class="ds-row"><span class="k">Value</span><span class="v accent">'+esc(pv)+'</span></div>'
          + '<div class="ds-row"><span class="k">Applies to</span><span class="v">'+esc(pa)+'</span></div>'
          + '<div class="ds-row"><span class="k">Available</span><span class="v">'+esc(d.days.length===7?"Every day":d.days.join(", "))+' · '+esc(hoursLabel())+'</span></div>'
          + '<div class="ds-row"><span class="k">Valid</span><span class="v">'+esc(windowLabel())+'</span></div>'
        + '</div>'
        + '<div class="freenote">✓ You were not charged — publishing offers is always free</div></div>';
      $("#wizBack").style.display="none";
      $("#wizDraft").style.display=""; $("#wizDraft").textContent="Create another offer";
      $("#wizNext").textContent="Done";
      return;
    }
    $("#wizBack").style.display=""; $("#wizDraft").style.display="";
    $("#wizBack").disabled = step===0;
    $("#wizNext").textContent = step===WSTEPS.length-1 ? "Publish Offer" : "Continue";

    // STEP 1 — type
    if (step===0){
      h = '<div><div class="eyebrow" style="margin-bottom:9px">Choose one offer type — this controls the fields that follow</div>'
        + '<div class="opt-grid">'+TYPE_ORDER.map(function(k){var t=TYPES[k];
            return '<div class="opt-card'+(d.type===k?" on":"")+'" data-type="'+k+'"><div class="oc-t">'+svgP(t.icon)+t.label+'</div><div class="oc-d">'+t.blurb+'</div></div>';
          }).join("")+'</div></div>';
    }
    // STEP 2 — details
    else if (step===1){
      h = '<div class="fld"><label>Offer title</label><input id="wTitle" value="'+esc(d.title)+'" placeholder="e.g. 20% Off Lunch Bowls"></div>'
        + '<div class="fld"><label>Offer description</label><textarea id="wDesc" placeholder="e.g. Save 20% on selected lunch bowls this Friday.">'+esc(d.desc)+'</textarea></div>'
        + '<div class="fld"><label>Offer image <span style="text-transform:none;letter-spacing:0;color:var(--ink-3)">— optional</span></label><input id="wImage" value="'+esc(d.image)+'" placeholder="Paste an image URL, or leave blank"></div>'
        + '<div class="fld"><label>Terms &amp; conditions <span style="text-transform:none;letter-spacing:0;color:var(--ink-3)">— optional</span></label><textarea id="wTerms" placeholder="e.g. Cannot be combined with other offers.">'+esc(d.terms)+'</textarea></div>';
    }
    // STEP 3 — applies to
    else if (step===2){
      var modes = applyOptionsFor(d.type);
      if (modes.indexOf(d.applyMode)<0) d.applyMode = modes[0];
      h = '<div><div class="eyebrow" style="margin-bottom:9px">Where does this offer apply?</div><div class="radio-list">'
        + modes.map(function(m){ return '<div class="radio-row'+(d.applyMode===m?" on":"")+'" data-mode="'+m+'"><span class="rd"></span>'+APPLY_MODES[m]+'</div>'; }).join("")
        + '</div></div>';
      if (d.applyMode==="item"){
        h += '<div class="fld"><label>Menu item</label><select id="wItem">'+MENU.map(function(m){return '<option'+(m.n===d.item?" selected":"")+'>'+esc(m.n)+'</option>';}).join("")+'</select></div>';
      } else if (d.applyMode==="items" || d.applyMode==="bundle"){
        var key = d.applyMode==="bundle" ? "bundleItems" : "items";
        h += '<div class="fld"><label>'+(d.applyMode==="bundle"?"Bundle items":"Select items")+'</label><div class="itemlist" id="wItems">'
          + MENU.map(function(m){ var on=d[key].indexOf(m.n)>=0;
              return '<div class="itemrow'+(on?" on":"")+'" data-i="'+esc(m.n)+'"><span class="cbx">'+svgP('<path d="M20 6L9 17l-5-5"/>')+'</span>'+esc(m.n)+'<span class="ip">'+money(m.p)+'</span></div>';
            }).join("")+'</div></div>';
        if (d.applyMode==="bundle"){
          h += '<div class="fld"><label>Bundle price</label><input id="wBundlePrice" type="number" step="0.50" min="0" value="'+d.bundlePrice+'"></div>';
        }
      } else if (d.applyMode==="category"){
        h += '<div class="fld"><label>Menu category</label><select id="wCat">'+CATS.map(function(c){return '<option'+(c===d.category?" selected":"")+'>'+esc(c)+'</option>';}).join("")+'</select></div>';
      } else if (d.applyMode==="order"){
        h += '<div class="note-soft">'+svgP('<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>')+'<span>Applies to the employee\'s whole order at checkout.</span></div>';
      } else if (d.applyMode==="location"){
        h += '<div class="note-soft">'+svgP('<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>')+'<span>Redeemable only at your physical restaurant — not on platform delivery orders.</span></div>';
      }
    }
    // STEP 4 — discount
    else if (step===3){
      var dm = discountOptionsFor(d.type);
      if (dm.indexOf(d.discMode)<0) d.discMode = dm[0];
      h = '<div><div class="eyebrow" style="margin-bottom:9px">Set the offer value</div><div class="radio-list">'
        + dm.map(function(m){ return '<div class="radio-row'+(d.discMode===m?" on":"")+'" data-disc="'+m+'"><span class="rd"></span>'+DISCOUNT_MODES[m]+'</div>'; }).join("")
        + '</div></div>';
      if (d.discMode==="percent") h += '<div class="fld"><label>Percentage off</label><input id="wPercent" type="number" min="1" max="100" value="'+d.percent+'"></div>';
      if (d.discMode==="fixed") h += '<div class="fld"><label>Amount off ($)</label><input id="wFixed" type="number" step="0.50" min="0" value="'+d.fixed+'"></div>';
      if (d.discMode==="promo") h += '<div class="fld"><label>Promotional item price ($)</label><input id="wPromo" type="number" step="0.50" min="0" value="'+d.promoPrice+'"></div>';
      if (d.discMode==="bundlePrice") h += '<div class="fld"><label>Bundle price ($)</label><input id="wBundle2" type="number" step="0.50" min="0" value="'+d.bundlePrice+'"></div>';
      var orig = originalPrice(), off = offerPrice();
      if (orig>0){
        h += '<div class="pricebox"><div class="pb"><span class="pl">Original price</span><span class="pv old">'+money(orig)+'</span></div>'
          + '<span class="arw">→</span><div class="pb"><span class="pl">Offer price</span><span class="pv new">'+money(off)+'</span></div>'
          + '<span class="save">Save '+money(Math.max(0,orig-off))+'</span></div>';
      }
    }
    // STEP 5 — availability
    else if (step===4){
      h = '<div class="fld-row"><div class="fld"><label>Start date</label><input id="wStart" type="date" value="'+d.start+'"></div>'
        + '<div class="fld"><label>End date</label><input id="wEnd" type="date" value="'+d.end+'"></div></div>'
        + '<div class="fld"><label>Available days</label><div class="daychips" id="wDays">'
        + DAYS.map(function(x){return '<span class="daychip'+(d.days.indexOf(x)>=0?" on":"")+'" data-d="'+x+'">'+x+'</span>';}).join("")+'</div></div>'
        + '<div class="switchrow"><div><div class="st">Available all day</div><div class="sd">Turn off to set a start and end time.</div></div><span class="toggle'+(d.allDay?" on":"")+'" id="wAllDay"></span></div>'
        + (d.allDay ? '' : '<div class="fld-row"><div class="fld"><label>Start time</label><input id="wStartT" type="time" value="'+d.startTime+'"></div><div class="fld"><label>End time</label><input id="wEndT" type="time" value="'+d.endTime+'"></div></div>')
        + '<div class="note-soft">'+svgP('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')+'<span>The offer stops displaying automatically once the end date/time is reached — no manual action needed.</span></div>';
    }
    // STEP 6 — usage conditions
    else if (step===5){
      h = '<div class="fld-row"><div class="fld"><label>Minimum order value ($)</label><input id="wMin" type="number" step="1" min="0" value="'+esc(d.minOrder)+'" placeholder="No minimum"></div>'
        + '<div class="fld"><label>Maximum redemptions</label><input id="wMax" type="number" step="1" min="0" value="'+esc(d.maxRedemptions)+'" placeholder="Unlimited"></div></div>'
        + '<div class="fld"><label>Who can redeem</label><div class="radio-list">'
          + '<div class="radio-row'+(d.audience==="all"?" on":"")+'" data-aud="all"><span class="rd"></span>Available to all employees</div>'
          + '<div class="radio-row'+(d.audience==="specific"?" on":"")+'" data-aud="specific"><span class="rd"></span>Specific corporate clients <span class="sub">Acme · Northline · Vantage</span></div>'
        + '</div></div>'
        + '<div><div class="switchrow"><div><div class="st">One redemption per employee</div><div class="sd">Each employee can use it once.</div></div><span class="toggle'+(d.onePerEmployee?" on":"")+'" id="wOnce"></span></div>'
        + '<div class="switchrow"><div><div class="st">In-store redemption only</div><div class="sd">Not applied to delivery orders.</div></div><span class="toggle'+(d.inStoreOnly?" on":"")+'" id="wInStore"></span></div></div>'
        + '<div class="note-soft">'+svgP('<path d="M10.3 3.9L2 18a2 2 0 002 3h16a2 2 0 002-3L13.7 3.9a2 2 0 00-3.4 0z"/><path d="M12 9v4M12 17h.01"/>')+'<span><b>To confirm with Office Grubb:</b> these advanced usage rules aren\'t defined in the current addendum. They\'re built here as optional controls pending client sign-off.</span></div>';
    }
    // STEP 7 — preview
    else {
      var items = selectedItems(), orig2 = originalPrice(), off2 = offerPrice();
      var itemsLine = d.applyMode==="order" ? "Entire order" : (d.applyMode==="location" ? "In-store only" : items.map(function(m){return m.n;}).slice(0,4).join(", ") + (items.length>4?" +"+(items.length-4)+" more":""));
      h = '<div class="eyebrow">How employees will see it</div>'
        + '<div class="offer '+TYPES[d.type].cls+'" style="box-shadow:none">'
          + '<div class="of-head"><div class="of-typerow"><span class="of-type">'+svgP(TYPES[d.type].icon)+TYPES[d.type].label+'</span></div>'
          + '<h3>'+esc(d.title||"Untitled offer")+'</h3><div class="of-val">'+esc(valueLabel())+'</div>'
          + '<div class="of-desc">'+esc(d.desc||"No description")+'</div></div>'
          + '<div class="of-meta">'
            + '<span class="of-chip">'+svgP('<path d="M3 10l9-7 9 7v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>')+'<b>'+RESTAURANT+'</b></span>'
            + '<span class="of-chip">'+svgP('<path d="M4 3h16v4H4zM6 7v13h12V7"/>')+esc(itemsLine||"—")+'</span>'
            + '<span class="of-chip">'+svgP('<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>')+esc(d.days.length===7?"Every day":d.days.join(", "))+' · '+esc(hoursLabel())+'</span>'
            + '<span class="of-chip">'+svgP('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')+'Valid '+esc(windowLabel())+'</span>'
            + (d.terms ? '<span class="of-chip">'+svgP('<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h5"/>')+esc(d.terms)+'</span>' : '')
          + '</div>'
          + (orig2>0 ? '<div class="of-perf"><span>Original <b>'+money(orig2)+'</b></span><span>Offer <b>'+money(off2)+'</b></span><span>Save <b>'+money(Math.max(0,orig2-off2))+'</b></span></div>' : '')
        + '</div>'
        + '<div class="note-soft" style="background:var(--good-bg,#DCF0E1);border-color:color-mix(in srgb,var(--good,#1F7A47) 28%,var(--surface));color:var(--good,#1F7A47)">'
          + svgP('<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>')+'<span>Publishing is free — Office Grubb never charges to list a special offer.</span></div>';
    }

    b.innerHTML = h;
    wire();
  }

  function wire(){
    // step 1
    Array.prototype.forEach.call($("#wizBody").querySelectorAll("[data-type]"), function(el){
      el.onclick=function(){ d.type=el.getAttribute("data-type"); renderWizard(); };
    });
    // step 3 modes / items
    Array.prototype.forEach.call($("#wizBody").querySelectorAll("[data-mode]"), function(el){
      el.onclick=function(){ d.applyMode=el.getAttribute("data-mode"); renderWizard(); };
    });
    Array.prototype.forEach.call($("#wizBody").querySelectorAll("#wItems .itemrow"), function(el){
      el.onclick=function(){ var key=d.applyMode==="bundle"?"bundleItems":"items"; var n=el.getAttribute("data-i");
        var i=d[key].indexOf(n); if(i>=0) d[key].splice(i,1); else d[key].push(n); renderWizard(); };
    });
    bind("wItem","change",function(v){ d.item=v; renderWizard(); });
    bind("wCat","change",function(v){ d.category=v; renderWizard(); });
    bind("wBundlePrice","input",function(v){ d.bundlePrice=v; });
    // step 4
    Array.prototype.forEach.call($("#wizBody").querySelectorAll("[data-disc]"), function(el){
      el.onclick=function(){ d.discMode=el.getAttribute("data-disc"); renderWizard(); };
    });
    bind("wPercent","input",function(v){ d.percent=v; renderWizard(); });
    bind("wFixed","input",function(v){ d.fixed=v; renderWizard(); });
    bind("wPromo","input",function(v){ d.promoPrice=v; renderWizard(); });
    bind("wBundle2","input",function(v){ d.bundlePrice=v; renderWizard(); });
    // step 5
    bind("wStart","change",function(v){ d.start=v; });
    bind("wEnd","change",function(v){ d.end=v; });
    bind("wStartT","change",function(v){ d.startTime=v; });
    bind("wEndT","change",function(v){ d.endTime=v; });
    Array.prototype.forEach.call($("#wizBody").querySelectorAll("#wDays .daychip"), function(el){
      el.onclick=function(){ var x=el.getAttribute("data-d"); var i=d.days.indexOf(x); if(i>=0)d.days.splice(i,1); else d.days.push(x); el.classList.toggle("on"); };
    });
    var ad=$("#wAllDay"); if(ad) ad.onclick=function(){ d.allDay=!d.allDay; renderWizard(); };
    // step 6
    bind("wMin","input",function(v){ d.minOrder=v; });
    bind("wMax","input",function(v){ d.maxRedemptions=v; });
    Array.prototype.forEach.call($("#wizBody").querySelectorAll("[data-aud]"), function(el){
      el.onclick=function(){ d.audience=el.getAttribute("data-aud"); renderWizard(); };
    });
    var on1=$("#wOnce"); if(on1) on1.onclick=function(){ d.onePerEmployee=!d.onePerEmployee; on1.classList.toggle("on"); };
    var ins=$("#wInStore"); if(ins) ins.onclick=function(){ d.inStoreOnly=!d.inStoreOnly; ins.classList.toggle("on"); };
  }
  function bind(id, ev, fn){ var el=$("#"+id); if(!el) return; el.addEventListener(ev, function(){ fn(this.value); }); }
  function grabDetails(){
    if ($("#wTitle")) d.title=$("#wTitle").value;
    if ($("#wDesc")) d.desc=$("#wDesc").value;
    if ($("#wImage")) d.image=$("#wImage").value;
    if ($("#wTerms")) d.terms=$("#wTerms").value;
  }

  function commit(status){
    var o = editingId ? byId(editingId) : { id:nextId, views:0, redemptions:0 };
    o.type=d.type; o.title=d.title.trim()||"Untitled offer"; o.desc=d.desc.trim(); o.terms=d.terms.trim();
    o.value=valueLabel(); o.applies=appliesLabel(); o.days=d.days.slice(); o.hours=hoursLabel();
    o.window = status==="Draft" ? "Not published" : windowLabel();
    var sel = selectedItems().map(function(m){return m.n;});
    o.items = sel.length ? sel : (d.applyMode==="order" ? ["Entire order"] : (d.applyMode==="location" ? ["In-store only"] : [appliesLabel()]));
    o.minOrder = d.minOrder ? +d.minOrder : 1;
    o.maxRedemptions = d.maxRedemptions ? +d.maxRedemptions : 0;
    o.status=status;
    if (!editingId){ offers.unshift(o); nextId++; }
    return o;
  }

  $("#wizNext").onclick = function(){
    if (published){ closeWizard(); render(); return; }
    grabDetails();
    if (step===1 && !d.title.trim()){ toast("Give the offer a title"); $("#wTitle") && $("#wTitle").focus(); return; }
    if (step===2 && d.applyMode==="items" && !d.items.length){ toast("Select at least one menu item"); return; }
    if (step===2 && d.applyMode==="bundle" && d.bundleItems.length<2){ toast("A bundle needs at least two items"); return; }
    if (step===4 && !d.days.length){ toast("Pick at least one available day"); return; }
    if (step < WSTEPS.length-1){ step++; renderWizard(); return; }
    // publish
    commit("Active"); published = true; renderWizard(); render();
  };
  $("#wizBack").onclick = function(){ if(step>0){ grabDetails(); step--; renderWizard(); } };
  $("#wizDraft").onclick = function(){
    if (published){ openWizard(null); return; }   // "Create another offer"
    grabDetails();
    if (!d.title.trim()){ toast("Give the offer a title before saving a draft"); return; }
    commit("Draft"); closeWizard(); render(); toast('Saved to drafts — not visible to employees yet');
  };
  $("#wizClose").onclick = function(){ closeWizard(); if(published) render(); };
  $("#wizModal").onclick = function(e){ if (e.target===$("#wizModal")){ closeWizard(); if(published) render(); } };

  var toastT;
  function toast(msg){ var t=$("#toast"); $("#toastMsg").textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(function(){t.classList.remove("show");},2200); }
  function render(){ renderTabs(); renderGrid(); stats(); }

  $("#newOffer").onclick = function(){ openWizard(null); };
  $("#search").addEventListener("input", function(){ query=this.value; renderGrid(); });
  $("#themeBtn").onclick = function(){ var r=document.documentElement,c=r.getAttribute("data-theme"); if(!c)c=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"; r.setAttribute("data-theme",c==="dark"?"light":"dark"); };

  render();
})();
