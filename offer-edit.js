// Office Grubb — Edit offer screen (+ delete confirmation)
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
  function svgP(p){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'+p+'</svg>'; }
  function money(n){ return "$" + Number(n).toFixed(2); }

  var TYPES = {
    percent:  { label:"Percentage Discount", blurb:"A % off items or the order", icon:'<path d="M19 5L5 19M6.5 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>' },
    timed:    { label:"Limited-Time Deal", blurb:"Runs on set days & hours", icon:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
    instore:  { label:"In-Store Promotion", blurb:"Redeem at your location", icon:'<path d="M3 10l9-7 9 7v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 21v-7h6v7"/>' },
    bundle:   { label:"Bundle / Combo", blurb:"Group items for one price", icon:'<path d="M4 8h16v11a1 1 0 01-1 1H5a1 1 0 01-1-1zM4 8l2-4h12l2 4M9 12h6"/>' }
  };
  var TYPE_ORDER = ["percent","timed","instore","bundle"];
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
  var CATS = ["Bowls & Plates","Wraps","Salads","Sides","Drinks","Sweets"];
  var DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  var AUDIENCE = { all:"All eligible employees", new:"New corporate accounts only" };

  // ---- seed (mirrors offers.js) ----
  var SEED = [
    { id:1, type:"percent", title:"20% off all Bowls & Plates", value:"20% off", desc:"Every bowl and plate on the lunch menu, all week.",
      applyMode:"category", category:"Bowls & Plates", items:["Chicken Shawarma Bowl","Lamb Gyro Plate","Beef Kofta Plate","Chicken Kebab Bowl"],
      discMode:"percent", percent:20, days:["Mon","Tue","Wed","Thu","Fri"], hours:"11:00 AM – 2:00 PM", allDay:false, startTime:"11:00", endTime:"14:00",
      window:"Jul 1 – Aug 31", start:"2026-07-01", end:"2026-08-31", minOrder:12, maxRedemptions:20000,
      status:"Active", views:1240, redemptions:86, audience:"all", onePerEmployee:true, terms:"Cannot be combined with other offers." },
    { id:2, type:"timed", title:"Happy Hour Mezze", value:"30% off", desc:"Mezze platters and sides discounted during the afternoon lull.",
      applyMode:"items", category:"Sides", items:["Mediterranean Mezze Platter","Hummus & Pita","Spanakopita"],
      discMode:"percent", percent:30, days:["Mon","Tue","Wed","Thu","Fri"], hours:"3:00 PM – 5:00 PM", allDay:false, startTime:"15:00", endTime:"17:00",
      window:"Ongoing", start:"", end:"", minOrder:1, maxRedemptions:500,
      status:"Active", views:864, redemptions:52, audience:"all", onePerEmployee:false, terms:"" },
    { id:3, type:"bundle", title:"Lunch Combo — wrap + side + drink", value:"$15.00", desc:"Any wrap with a side and a drink for one flat price.",
      applyMode:"bundle", category:"Wraps", items:["Falafel Wrap","Hummus & Pita","Iced Tea"],
      discMode:"bundlePrice", bundlePrice:15.00, days:["Mon","Tue","Wed","Thu","Fri"], hours:"11:00 AM – 2:00 PM", allDay:false, startTime:"11:00", endTime:"14:00",
      window:"Ongoing", start:"", end:"", minOrder:1, maxRedemptions:1000,
      status:"Active", views:2010, redemptions:173, audience:"all", onePerEmployee:false, terms:"" },
    { id:4, type:"instore", title:"Show the app, get free baklava", value:"Free side", desc:"Employees who show their Office Grubb profile in-store get a free baklava with any main.",
      applyMode:"items", category:"Sweets", items:["Baklava"],
      discMode:"free", days:DAYS.slice(), hours:"All day", allDay:true, startTime:"", endTime:"",
      window:"Jul 8 – Jul 31", start:"2026-07-08", end:"2026-07-31", minOrder:1, maxRedemptions:300,
      status:"Active", views:521, redemptions:38, audience:"all", onePerEmployee:true, terms:"One per employee, per visit." },
    { id:5, type:"timed", title:"Early Bird — order before 10 AM", value:"15% off", desc:"Beat the rush: discount on next-day orders placed before 10 AM.",
      applyMode:"order", category:"Bowls & Plates", items:["Entire order"],
      discMode:"percent", percent:15, days:["Mon","Tue","Wed","Thu","Fri"], hours:"Before 10:00 AM", allDay:false, startTime:"00:00", endTime:"10:00",
      window:"Starts Jul 22", start:"2026-07-22", end:"", minOrder:10, maxRedemptions:2000,
      status:"Scheduled", views:0, redemptions:0, audience:"all", onePerEmployee:false, terms:"" },
    { id:6, type:"percent", title:"Salad season — 10% off", value:"10% off", desc:"Light lunches for the summer months.",
      applyMode:"category", category:"Salads", items:["Greek Salad","Mediterranean Mezze Platter"],
      discMode:"percent", percent:10, days:DAYS.slice(), hours:"All day", allDay:true, startTime:"", endTime:"",
      window:"Not published", start:"", end:"", minOrder:1, maxRedemptions:1000,
      status:"Draft", views:0, redemptions:0, audience:"all", onePerEmployee:false, terms:"" },
    { id:7, type:"percent", title:"Summer kickoff — 25% off first order", value:"25% off", desc:"Introductory discount for new corporate accounts.",
      applyMode:"order", category:"Bowls & Plates", items:["Entire order"],
      discMode:"percent", percent:25, days:DAYS.slice(), hours:"All day", allDay:true, startTime:"", endTime:"",
      window:"Ended Jun 30", start:"", end:"2026-06-30", minOrder:1, maxRedemptions:5000,
      status:"Expired", views:1890, redemptions:240, audience:"new", onePerEmployee:false, terms:"New corporate accounts only." }
  ];

  // ---- persistence overlay (shared with list/detail) ----
  var OVR_KEY = "og_offer_overrides", ARCH_KEY = "og_offer_archived";
  function readJSON(k,f){ try{ return JSON.parse(localStorage.getItem(k)) || f; }catch(e){ return f; } }
  function loadOffer(id){
    var base = null; for (var i=0;i<SEED.length;i++) if (SEED[i].id===id) base = SEED[i];
    if (!base) return null;
    var o = JSON.parse(JSON.stringify(base));
    var ov = readJSON(OVR_KEY,{});
    if (ov[id]) for (var k in ov[id]) o[k] = ov[id][k];
    return o;
  }
  function getId(){ var m=/[?&]id=(\d+)/.exec(location.search); return m?+m[1]:1; }

  var id = getId();
  var orig = loadOffer(id);
  if (!orig){ $(".oe-wrap").innerHTML = '<div class="od-missing" style="padding:60px;text-align:center;color:var(--ink-3)">Offer not found. <a href="offers.html" style="color:var(--accent)">Back to Special Offers</a></div>'; return; }
  var m = JSON.parse(JSON.stringify(orig));   // working model
  var dirty = false;

  // referer: came from detail?
  var fromDetail = document.referrer.indexOf("offer-detail") >= 0;
  $("#backLabel").textContent = fromDetail ? "Offer detail" : "Special Offers";
  $("#backLink").href = fromDetail ? ("offer-detail.html?id="+id) : "offers.html";

  // ---- helpers to build value label ----
  function menuBy(n){ for (var i=0;i<MENU.length;i++) if (MENU[i].n===n) return MENU[i]; return null; }
  function valueLabel(){
    if (m.discMode==="free") return "Free side";
    if (m.discMode==="bundlePrice") return money(+m.bundlePrice||0);
    if (m.discMode==="fixed") return money(+m.fixed||0)+" off";
    return (+m.percent||0)+"% off";
  }
  function appliesLabel(){
    if (m.applyMode==="order") return "Entire order";
    if (m.applyMode==="category") return m.category;
    if (m.applyMode==="bundle") return (m.items.length||0)+" bundled items";
    if (m.applyMode==="items") return m.items.length===1 ? m.items[0] : m.items.length+" menu items";
    return m.category;
  }
  function hoursLabel(){ return m.allDay ? "All day" : (fmtTime(m.startTime)+" – "+fmtTime(m.endTime)); }
  function fmtTime(t){ if(!t) return ""; var p=t.split(":"),h=+p[0],mm=p[1]; var ap=h<12?"AM":"PM"; var hh=h%12; if(hh===0)hh=12; return hh+":"+mm+" "+ap; }
  function windowLabel(){
    if (m.start && m.end) return fmtDate(m.start)+" – "+fmtDate(m.end);
    if (m.start) return "Starts "+fmtDate(m.start);
    if (m.end) return "Ends "+fmtDate(m.end);
    return "Ongoing";
  }
  var MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  function fmtDate(s){ var p=s.split("-"); return MON[+p[1]-1]+" "+(+p[2]); }

  function markDirty(){ if(!dirty){ dirty=true; $("#dirtyDot").hidden=false; } }

  // ================= FORM =================
  var I = {
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    tag:'<path d="M4 3h16v4H4zM6 7v13h12V7"/>',
    pct:'<path d="M19 5L5 19M6.5 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>',
    cal:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
    check:'<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
    ok:'<path d="M20 6L9 17l-5-5"/>',
    eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  };

  function typeCards(){
    return TYPE_ORDER.map(function(k){
      var t=TYPES[k], s=TYPE_SKIN[k];
      return '<label class="type-opt'+(m.type===k?" on":"")+'" data-type="'+k+'" style="--h:'+s.h+';--h2:'+s.h2+'">'
        + '<span class="ti">'+svgP(t.icon)+'</span>'
        + '<span><span class="tt">'+t.label+'</span><span class="tb">'+t.blurb+'</span></span></label>';
    }).join("");
  }
  function itemChecklist(){
    return MENU.map(function(it){
      var on = m.items.indexOf(it.n)>=0;
      return '<label class="ic'+(on?" on":"")+'" data-item="'+esc(it.n)+'"><span class="box">'+svgP(I.ok)+'</span>'
        + '<span class="icn">'+esc(it.n)+'</span><span class="icp">'+money(it.p)+'</span></label>';
    }).join("");
  }
  function appliesBlock(){
    var modes = m.type==="bundle"
      ? [["bundle","Custom bundle / combo items"]]
      : (m.type==="instore"
        ? [["items","Specific menu items"],["category","An entire category"],["order","In-store, order-wide"]]
        : [["items","Specific menu items"],["category","An entire menu category"],["order","The entire order"]]);
    var sel = '<div class="fld"><label>What the offer applies to</label><select class="sel" id="fApply">'
      + modes.map(function(o){ return '<option value="'+o[0]+'"'+(m.applyMode===o[0]?" selected":"")+'>'+o[1]+'</option>'; }).join("")
      + '</select></div>';
    var body = "";
    if (m.applyMode==="items" || m.applyMode==="bundle"){
      body = '<div class="fld"><label>Menu items <span class="hint">tap to include</span></label><div class="item-check" id="fItems">'+itemChecklist()+'</div></div>';
    } else if (m.applyMode==="category"){
      body = '<div class="fld"><label>Menu category</label><select class="sel" id="fCat">'
        + CATS.map(function(c){ return '<option'+(m.category===c?" selected":"")+'>'+esc(c)+'</option>'; }).join("")+'</select></div>';
    } else {
      body = '<div class="fld"><div class="del-note" style="margin:0">This offer applies to the employee\'s <b>entire order</b> — no item selection needed.</div></div>';
    }
    return sel + body;
  }
  function discountBlock(){
    if (m.type==="bundle" || m.discMode==="bundlePrice"){
      return '<div class="fld"><label>Bundle price</label><div class="inp-money"><input class="inp" id="fBundle" type="number" step="0.5" min="0" value="'+esc(m.bundlePrice)+'"></div><span class="hint">Flat price employees pay for the bundled items.</span></div>';
    }
    if (m.type==="instore" && m.discMode==="free"){
      return '<div class="fld"><label>Reward</label><input class="inp" id="fFree" type="text" value="'+esc(m.value)+'" placeholder="e.g. Free baklava"><span class="hint">Describe the free item or perk employees receive.</span></div>';
    }
    // percent / fixed choice for non-percent types
    var modeSel = "";
    if (m.type!=="percent"){
      modeSel = '<div class="fld"><label>Discount type</label><select class="sel" id="fDiscMode">'
        + '<option value="percent"'+(m.discMode==="percent"?" selected":"")+'>Percentage off</option>'
        + '<option value="fixed"'+(m.discMode==="fixed"?" selected":"")+'>Fixed amount off</option>'
        + (m.type==="instore"?'<option value="free"'+(m.discMode==="free"?" selected":"")+'>Free item</option>':'')
        + '</select></div>';
    }
    var valFld = (m.discMode==="fixed")
      ? '<div class="fld"><label>Amount off</label><div class="inp-money"><input class="inp" id="fFixed" type="number" step="0.5" min="0" value="'+esc(m.fixed)+'"></div></div>'
      : '<div class="fld"><label>Percentage off</label><input class="inp" id="fPercent" type="number" step="1" min="1" max="100" value="'+esc(m.percent)+'"><span class="hint">Applied to the selected items.</span></div>';
    return modeSel + valFld;
  }
  function daysRow(){
    return '<div class="day-row">'+DAYS.map(function(d){ return '<span class="day-pill'+(m.days.indexOf(d)>=0?" on":"")+'" data-day="'+d+'">'+d+'</span>'; }).join("")+'</div>';
  }

  function renderForm(){
    var s = TYPE_SKIN[m.type];
    var html =
      // basics
      '<div class="oe-card"><div class="oe-ch">'+svgP(I.info)+'<h2>Offer basics</h2></div><div class="oe-cb">'
        + '<div class="fld"><label>Offer type</label><div class="type-grid" id="fTypes">'+typeCards()+'</div></div>'
        + '<div class="fld"><label>Offer title</label><input class="inp" id="fTitle" type="text" maxlength="70" value="'+esc(m.title)+'" placeholder="e.g. 20% off all Bowls & Plates"></div>'
        + '<div class="fld"><label>Description <span class="hint">shown to employees</span></label><textarea class="ta" id="fDesc" maxlength="180" placeholder="Describe the deal…">'+esc(m.desc)+'</textarea></div>'
      + '</div></div>'
      // applies to
      + '<div class="oe-card"><div class="oe-ch">'+svgP(I.tag)+'<h2>Applies to</h2></div><div class="oe-cb" id="applyWrap">'+appliesBlock()+'</div></div>'
      // discount
      + '<div class="oe-card"><div class="oe-ch">'+svgP(I.pct)+'<h2>Discount &amp; value</h2></div><div class="oe-cb" id="discWrap">'+discountBlock()+'</div></div>'
      // availability
      + '<div class="oe-card"><div class="oe-ch">'+svgP(I.cal)+'<h2>Availability</h2></div><div class="oe-cb">'
        + '<div class="fld-row"><div class="fld"><label>Valid from</label><input class="inp" id="fStart" type="date" value="'+esc(m.start)+'"></div>'
          + '<div class="fld"><label>Valid until <span class="hint">blank = ongoing</span></label><input class="inp" id="fEnd" type="date" value="'+esc(m.end)+'"></div></div>'
        + '<div class="tog-row"><div><div class="tl">Available all day</div><div class="td">Turn off to set a time window</div></div><span class="toggle'+(m.allDay?" on":"")+'" id="fAllDay"></span></div>'
        + '<div class="fld-row" id="timeRow" '+(m.allDay?'style="display:none"':'')+'><div class="fld"><label>Start time</label><input class="inp" id="fStartTime" type="time" value="'+esc(m.startTime)+'"></div>'
          + '<div class="fld"><label>End time</label><input class="inp" id="fEndTime" type="time" value="'+esc(m.endTime)+'"></div></div>'
        + '<div class="fld"><label>Available days</label>'+daysRow()+'</div>'
      + '</div></div>'
      // conditions
      + '<div class="oe-card"><div class="oe-ch">'+svgP(I.check)+'<h2>Conditions</h2></div><div class="oe-cb">'
        + '<div class="fld-row"><div class="fld"><label>Minimum order</label><input class="inp" id="fMin" type="number" step="1" min="1" value="'+esc(m.minOrder)+'"></div>'
          + '<div class="fld"><label>Max redemptions <span class="hint">0 = unlimited</span></label><input class="inp" id="fMax" type="number" step="1" min="0" value="'+esc(m.maxRedemptions)+'"></div></div>'
        + '<div class="fld"><label>Audience</label><select class="sel" id="fAud"><option value="all"'+(m.audience==="all"?" selected":"")+'>All eligible employees</option><option value="new"'+(m.audience==="new"?" selected":"")+'>New corporate accounts only</option></select></div>'
        + '<div class="tog-row"><div><div class="tl">One redemption per employee</div><div class="td">Each employee can claim this once</div></div><span class="toggle'+(m.onePerEmployee?" on":"")+'" id="fOnce"></span></div>'
        + '<div class="fld"><label>Terms &amp; conditions <span class="hint">optional</span></label><textarea class="ta" id="fTerms" placeholder="e.g. Cannot be combined with other offers.">'+esc(m.terms)+'</textarea></div>'
      + '</div></div>';
    $("#form").innerHTML = html;
    bindForm();
  }

  function renderSide(){
    var o = m, skin = TYPE_SKIN[o.type], dot = STATUS_DOT[orig.status] || "var(--s-ready)";
    var pvRows = '<div class="pvr">'+svgP(I.cal)+esc(windowLabel())+'</div>'
      + '<div class="pvr">'+svgP(I.clock)+esc(o.days.length===7?"Every day":o.days.join(" · "))+' · '+esc(hoursLabel())+'</div>'
      + '<div class="pvr">'+svgP(I.tag)+'Applies to '+esc(appliesLabel())+'</div>';
    var prev = '<div class="od-panel od-preview"><div class="od-ph">'+svgP(I.eye)+'<h2>Live preview</h2><span class="ph-note">'+esc(orig.status)+'</span></div><div class="od-pb">'
      + '<div class="pv-card"><div class="pv-band" style="--h:'+skin.h+';--h2:'+skin.h2+'"><div class="pvv">'+esc(valueLabel())+'</div><div class="pvt">'+esc(o.title||"Untitled offer")+'</div></div>'
      + '<div class="pv-body">'+pvRows+'<div class="pv-cta">Redeem offer</div></div></div>'
      + '<div style="font-size:11px;color:var(--ink-3);margin-top:10px;text-align:center">Updates as you edit · Listing is free</div>'
      + '</div></div>';
    var archived = readJSON(ARCH_KEY,[]).indexOf(id) >= 0;
    var manage = archived
      ? '<div class="oe-manage"><div class="dh"><h2>Archived</h2></div><div class="db">'
        + '<p>This offer is archived and hidden from your profile. Restore it to make it visible again.</p>'
        + '<button class="btn primary block" id="restoreBtn">'+svgP('<path d="M3 12a9 9 0 109-9 9 9 0 00-6.7 3M3 3v4h4"/>')+'Restore this offer</button>'
        + '</div></div>'
      : '<div class="oe-manage"><div class="dh"><h2>Archive offer</h2></div><div class="db">'
        + '<p>Archiving hides this offer from your profile but keeps its performance history — you can restore it any time. Prefer to hide it briefly? Use the Live toggle instead.</p>'
        + '<button class="btn block" id="archiveBtn">'+svgP('<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 001 1h12a1 1 0 001-1V8M10 12h4"/>')+'Archive this offer</button>'
        + '</div></div>';
    $("#side").innerHTML = prev + manage;
    var ab=$("#archiveBtn"); if(ab) ab.onclick = openArchive;
    var rb=$("#restoreBtn"); if(rb) rb.onclick = doRestore;
  }

  function refreshPreview(){ renderSide(); }

  // ---- bindings ----
  function bindForm(){
    // type
    Array.prototype.forEach.call($("#fTypes").querySelectorAll("[data-type]"), function(el){
      el.onclick=function(e){ e.preventDefault(); var k=el.getAttribute("data-type"); if(k===m.type)return; m.type=k;
        // sensible default discMode per type
        if(k==="bundle"){ m.discMode="bundlePrice"; }
        else if(k==="instore" && m.discMode==="bundlePrice"){ m.discMode="free"; }
        else if(k==="percent"){ m.discMode="percent"; }
        if(k==="bundle" && m.applyMode!=="bundle") m.applyMode="bundle";
        if(k!=="bundle" && m.applyMode==="bundle") m.applyMode="items";
        markDirty(); renderForm(); refreshPreview(); };
    });
    bindInput("#fTitle","title"); bindInput("#fDesc","desc"); bindInput("#fTerms","terms");
    // applies
    var ap=$("#fApply"); if(ap) ap.onchange=function(){ m.applyMode=ap.value; markDirty(); $("#applyWrap").innerHTML=appliesBlock(); bindApply(); refreshPreview(); };
    bindApply();
    // discount
    bindDisc();
    // availability
    bindDate("#fStart","start"); bindDate("#fEnd","end");
    var ad=$("#fAllDay"); if(ad) ad.onclick=function(){ m.allDay=!m.allDay; ad.classList.toggle("on",m.allDay); $("#timeRow").style.display=m.allDay?"none":""; markDirty(); refreshPreview(); };
    bindInput("#fStartTime","startTime",true); bindInput("#fEndTime","endTime",true);
    Array.prototype.forEach.call(document.querySelectorAll("[data-day]"),function(el){ el.onclick=function(){ var d=el.getAttribute("data-day"); var i=m.days.indexOf(d); if(i<0)m.days.push(d); else m.days.splice(i,1); m.days=DAYS.filter(function(x){return m.days.indexOf(x)>=0;}); el.classList.toggle("on"); markDirty(); refreshPreview(); }; });
    // conditions
    bindNum("#fMin","minOrder"); bindNum("#fMax","maxRedemptions");
    var au=$("#fAud"); if(au) au.onchange=function(){ m.audience=au.value; markDirty(); };
    var on=$("#fOnce"); if(on) on.onclick=function(){ m.onePerEmployee=!m.onePerEmployee; on.classList.toggle("on",m.onePerEmployee); markDirty(); };
  }
  function bindApply(){
    var cat=$("#fCat"); if(cat) cat.onchange=function(){ m.category=cat.value; markDirty(); refreshPreview(); };
    var wrap=$("#fItems");
    if (wrap) Array.prototype.forEach.call(wrap.querySelectorAll("[data-item]"),function(el){
      el.onclick=function(e){ e.preventDefault(); var n=el.getAttribute("data-item"); var i=m.items.indexOf(n); if(i<0)m.items.push(n); else m.items.splice(i,1); el.classList.toggle("on"); markDirty(); refreshPreview(); };
    });
  }
  function bindDisc(){
    var dm=$("#fDiscMode"); if(dm) dm.onchange=function(){ m.discMode=dm.value; markDirty(); $("#discWrap").innerHTML=discountBlock(); bindDisc(); refreshPreview(); };
    bindNum("#fPercent","percent",true); bindNum("#fFixed","fixed",true); bindNum("#fBundle","bundlePrice",true);
    var fr=$("#fFree"); if(fr) fr.oninput=function(){ m.value=fr.value; markDirty(); refreshPreview(); };
  }
  function bindInput(sel,key,prev){ var el=$(sel); if(!el)return; el.oninput=function(){ m[key]=el.value; markDirty(); if(prev)refreshPreview(); else if(key==="title")refreshPreview(); }; }
  function bindNum(sel,key,prev){ var el=$(sel); if(!el)return; el.oninput=function(){ m[key]=el.value===""?"":+el.value; markDirty(); if(prev)refreshPreview(); }; }
  function bindDate(sel,key){ var el=$(sel); if(!el)return; el.onchange=function(){ m[key]=el.value; markDirty(); refreshPreview(); }; }

  // ================= SAVE =================
  function buildSaved(){
    var items;
    if (m.applyMode==="order") items=["Entire order"];
    else if (m.applyMode==="category") items=MENU.filter(function(x){return x.cat===m.category;}).map(function(x){return x.n;});
    else items=m.items.slice();
    return {
      type:m.type, title:(m.title||"").trim()||"Untitled offer", desc:(m.desc||"").trim(),
      value:valueLabel(), applies:appliesLabel(), items:items, discMode:m.discMode,
      percent:m.percent, fixed:m.fixed, bundlePrice:m.bundlePrice, applyMode:m.applyMode, category:m.category,
      days:m.days.slice(), hours:hoursLabel(), allDay:m.allDay, startTime:m.startTime, endTime:m.endTime,
      window: orig.status==="Draft" ? "Not published" : windowLabel(), start:m.start, end:m.end,
      minOrder:(m.minOrder||1), maxRedemptions:(m.maxRedemptions||0),
      audience:m.audience, onePerEmployee:m.onePerEmployee, terms:(m.terms||"").trim()
    };
  }
  function save(){
    if (m.applyMode==="items" && !m.items.length){ toast("Select at least one menu item"); return; }
    if (!m.days.length){ toast("Pick at least one available day"); return; }
    var ov = readJSON(OVR_KEY,{});
    ov[id] = buildSaved();
    try{ localStorage.setItem(OVR_KEY, JSON.stringify(ov)); }catch(e){}
    dirty=false; $("#dirtyDot").hidden=true;
    toast("Changes saved — live on your profile");
    setTimeout(function(){ location.href = "offer-detail.html?id="+id; }, 650);
  }

  // ================= ARCHIVE / RESTORE =================
  function openArchive(){
    $("#archTitle").textContent = 'Archive "'+ (m.title||"this offer") +'"?';
    $("#archSub").textContent = 'Archiving hides the '+ (TYPES[m.type]?TYPES[m.type].label.toLowerCase():"offer") +' from Office Grubb — nothing is deleted.';
    $("#archModal").classList.add("on");
  }
  function closeArch(){ $("#archModal").classList.remove("on"); }
  function doArchive(){
    var arch = readJSON(ARCH_KEY,[]);
    if (arch.indexOf(id)<0) arch.push(id);
    try{ localStorage.setItem(ARCH_KEY, JSON.stringify(arch)); }catch(e){}
    closeArch(); toast("Offer archived — restore any time");
    setTimeout(function(){ location.href="offers.html"; }, 650);
  }
  function doRestore(){
    var arch = readJSON(ARCH_KEY,[]); var i=arch.indexOf(id);
    if (i>=0){ arch.splice(i,1); try{ localStorage.setItem(ARCH_KEY, JSON.stringify(arch)); }catch(e){} }
    toast("Offer restored"); renderSide();
  }
  $("#archCancel").onclick = closeArch;
  $("#archConfirm").onclick = doArchive;
  $("#archModal").onclick = function(e){ if(e.target===$("#archModal")) closeArch(); };

  // ---- toolbar ----
  var toastT;
  function toast(msg){ var t=$("#toast"); $("#toastMsg").textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(function(){t.classList.remove("show");},2200); }
  $("#saveBtn").onclick = save;
  $("#cancelBtn").onclick = function(){ if(dirty && !confirm("Discard unsaved changes?")) return; location.href = $("#backLink").href; };
  $("#themeBtn").onclick = function(){ var r=document.documentElement,c=r.getAttribute("data-theme"); if(!c)c=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"; r.setAttribute("data-theme",c==="dark"?"light":"dark"); };
  document.addEventListener("keydown", function(e){ if(e.key==="Escape") closeArch(); });

  $("#pageTitle").textContent = "Edit offer";
  renderForm();
  renderSide();
})();
