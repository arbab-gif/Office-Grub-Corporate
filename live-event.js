// Office Grubb — Live Kitchen Event Detail (restaurant)
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s){ return String(s).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];}); }
  function svgP(p){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'+p+'</svg>'; }
  function money(n){ return "$"+Number(n).toFixed(2); }
  function fmtMoney0(n){ return "$"+Math.round(n).toLocaleString(); }

  var TODAY = "2026-07-27";
  var COMMISSION = 0.20, DAY_MIN = 800, AVG_SPEND = 18, CUISINE = "Mediterranean";
  var RESTAURANT = "Sofia's Kitchen";

  var I = {
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pin:'<path d="M12 21s7-6.3 7-12a7 7 0 10-14 0c0 5.7 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    users:'<path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.9"/>',
    cal:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
    menu:'<path d="M4 3h16v4H4zM6 7v13h12V7"/><path d="M9 11h6"/>',
    money:'<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
    phone:'<path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.5-1.1a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    check:'<path d="M20 6L9 17l-5-5"/>',
    box:'<path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    truck:'<path d="M3 6h11v9H3zM14 9h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/>',
    park:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 17V7h4a3 3 0 010 6H9"/>',
    key:'<circle cx="8" cy="15" r="4"/><path d="M10.8 12.2L21 2M17 6l2 2M15 8l2 2"/>',
    tool:'<path d="M14 7a4 4 0 00-5.4 5.4L3 18l3 3 5.6-5.6A4 4 0 0017 10l-2 2-3-3 2-2z"/>',
    flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    star:'<path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.5 7.1 18l.9-5.5-4-3.9L9.5 8z"/>',
    shield:'<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    store:'<path d="M3 10l1.5-5h15L21 10M4 10v9h16v-9M4 10h16"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>'
  };

  // menu + dietary tags
  var MENU = [
    {n:"Chicken Shawarma Bowl",p:14.00,diet:["Halal","GF option"]},
    {n:"Lamb Gyro Plate",p:17.50,diet:["Halal"]},
    {n:"Falafel Wrap",p:11.00,diet:["Vegetarian","Vegan option"]},
    {n:"Greek Salad",p:9.00,diet:["Vegetarian","Gluten-free"]},
    {n:"Mediterranean Mezze Platter",p:18.00,diet:["Vegetarian"]},
    {n:"Hummus & Pita",p:3.50,diet:["Vegan"]},
    {n:"Spanakopita",p:10.50,diet:["Vegetarian"]},
    {n:"Baklava",p:4.50,diet:["Vegetarian","Contains nuts"]},
    {n:"Iced Tea",p:2.00,diet:["Vegan","Gluten-free"]}
  ];
  function menuBy(n){ for (var i=0;i<MENU.length;i++) if (MENU[i].n===n) return MENU[i]; return null; }

  // equipment (restaurant brings)
  var EQUIP = [
    {k:"warmers", t:"Food warmers & chafing dishes", d:"Keep the spread hot through service"},
    {k:"table",   t:"Serving table & display setup", d:"Your own branded serving station"},
    {k:"pos",     t:"POS system / card reader",      d:"You take payment from employees directly"},
    {k:"pack",    t:"Utensils, napkins & packaging",  d:"Enough for the estimated headcount"},
    {k:"signage", t:"Menu board & signage",           d:"So employees can see the day's menu"}
  ];
  // prep checklist (section 6)
  var PREP = [
    {k:"staff",   t:"Staff assigned",      d:"Team rostered for the event"},
    {k:"warmers", t:"Warmers ready",       d:"Loaded, tested and hot"},
    {k:"pos",     t:"POS ready",           d:"Card reader charged & connected"},
    {k:"signage", t:"Menu / signage ready", d:"Boards printed and packed"},
    {k:"arrival", t:"Arrival confirmed",    d:"Driver / van scheduled to arrive on time"}
  ];

  var REQ_REASONS = ["Change event time","Adjust the menu","Headcount looks off","Setup / access issue","Other"];

  // corporate on-site contacts by company
  var CORP = {
    "Acme Corp":        {name:"Jordan Blake",  role:"Office Manager",     phone:"(617) 555-0110", email:"jordan.blake@acme.com"},
    "TechNova":         {name:"Priya Nair",    role:"Workplace Lead",     phone:"(617) 555-0121", email:"priya.nair@technova.io"},
    "Beacon Financial": {name:"Tom Reilly",    role:"Facilities Manager", phone:"(617) 555-0133", email:"t.reilly@beaconfin.com"},
    "Harbor Health":    {name:"Dana Fox",      role:"People Ops",         phone:"(617) 555-0144", email:"dana.fox@harborhealth.org"},
    "Meridian Labs":    {name:"Sam Ortiz",     role:"Office Coordinator", phone:"(617) 555-0155", email:"s.ortiz@meridianlabs.com"}
  };
  var REST_CONTACT = {name:"Sofia Haddad", role:"Owner · "+RESTAURANT, phone:"(617) 555-0170", email:"sofia@sofiaskitchen.com", initials:"SH"};

  // ---- events (mirrors live.js, enriched) ----
  var EVENTS = [
    { id:"LK-2041", status:"invited", company:"TechNova", initials:"TN",
      date:"2026-07-30", day:"Thursday", time:"11:30 AM – 1:30 PM",
      address:"800 Boylston St, Floor 12", suite:"Suite 1200 — The Hub", city:"Boston, MA 02199", distance:"3.1 mi from your kitchen",
      setupArea:"12th-floor open café by the east windows", headcount:150,
      menu:["Chicken Shawarma Bowl","Falafel Wrap","Greek Salad","Hummus & Pita","Baklava","Iced Tea"],
      rep:{name:"Maya Chen", role:"Office Grubb · On-site coordinator", initials:"MC", phone:"(617) 555-0142", email:"maya.chen@officegrubb.com"},
      feeState:"after", setup:{} },
    { id:"LK-2038", status:"confirmed", company:"Acme Corp", initials:"AC",
      date:"2026-07-29", day:"Wednesday", time:"11:30 AM – 1:30 PM",
      address:"125 Summer St, Floor 8", suite:"Suite 800 — Main Café", city:"Boston, MA 02110", distance:"1.4 mi from your kitchen",
      setupArea:"8th-floor café, tables pre-cleared along the north wall", headcount:180,
      menu:["Chicken Shawarma Bowl","Lamb Gyro Plate","Falafel Wrap","Greek Salad","Hummus & Pita","Baklava","Iced Tea"],
      rep:{name:"Maya Chen", role:"Office Grubb · On-site coordinator", initials:"MC", phone:"(617) 555-0142", email:"maya.chen@officegrubb.com"},
      feeState:"after", setup:{warmers:true,table:true,pos:true}, prep:{staff:true,warmers:true,pos:true} },
    { id:"LK-2035", status:"confirmed", company:"Beacon Financial", initials:"BF",
      date:"2026-08-05", day:"Wednesday", time:"12:00 PM – 2:00 PM",
      address:"200 Clarendon St, Lobby", suite:"Concourse level — event alcove", city:"Boston, MA 02116", distance:"2.2 mi from your kitchen",
      setupArea:"Lobby concourse, near the Clarendon St entrance", headcount:120,
      menu:["Chicken Shawarma Bowl","Falafel Wrap","Greek Salad","Hummus & Pita","Iced Tea"],
      rep:{name:"Diego Alvarez", role:"Office Grubb · On-site coordinator", initials:"DA", phone:"(617) 555-0188", email:"diego.alvarez@officegrubb.com"},
      feeState:"after", setup:{} },
    { id:"LK-2044", status:"confirmed", company:"Harbor Health", initials:"HH",
      date:"2026-08-12", day:"Wednesday", time:"11:00 AM – 1:00 PM",
      address:"1 Marina Park Dr, Floor 3", suite:"Suite 300 — Harborview room", city:"Boston, MA 02210", distance:"2.9 mi from your kitchen",
      setupArea:"3rd-floor Harborview room, buffet line along the window", headcount:95,
      menu:["Chicken Shawarma Bowl","Falafel Wrap","Greek Salad","Baklava","Iced Tea"],
      rep:{name:"Maya Chen", role:"Office Grubb · On-site coordinator", initials:"MC", phone:"(617) 555-0142", email:"maya.chen@officegrubb.com"},
      feeState:"after", setup:{} },
    { id:"LK-2029", status:"completed", company:"Meridian Labs", initials:"ML",
      date:"2026-07-15", day:"Tuesday", time:"11:30 AM – 1:30 PM",
      address:"401 Congress St, Floor 5", suite:"Suite 500 — Commons", city:"Boston, MA 02210", distance:"2.7 mi from your kitchen",
      setupArea:"5th-floor commons, central island", headcount:160, gross:2940,
      menu:["Chicken Shawarma Bowl","Falafel Wrap","Greek Salad","Hummus & Pita","Baklava"],
      rep:{name:"Maya Chen", role:"Office Grubb · On-site coordinator", initials:"MC", phone:"(617) 555-0142", email:"maya.chen@officegrubb.com"},
      feeState:"paid", setup:{warmers:true,table:true,pos:true,pack:true,signage:true}, prep:{staff:true,warmers:true,pos:true,signage:true,arrival:true} },
    { id:"LK-2024", status:"completed", company:"Acme Corp", initials:"AC",
      date:"2026-07-01", day:"Tuesday", time:"11:30 AM – 1:30 PM",
      address:"125 Summer St, Floor 8", suite:"Suite 800 — Main Café", city:"Boston, MA 02110", distance:"1.4 mi from your kitchen",
      setupArea:"8th-floor café, north wall", headcount:175, gross:3260,
      menu:["Chicken Shawarma Bowl","Lamb Gyro Plate","Greek Salad","Hummus & Pita","Baklava","Iced Tea"],
      rep:{name:"Maya Chen", role:"Office Grubb · On-site coordinator", initials:"MC", phone:"(617) 555-0142", email:"maya.chen@officegrubb.com"},
      feeState:"paid", setup:{warmers:true,table:true,pos:true,pack:true,signage:true}, prep:{staff:true,warmers:true,pos:true,signage:true,arrival:true} },
    { id:"LK-2019", status:"completed", company:"Beacon Financial", initials:"BF",
      date:"2026-06-20", day:"Friday", time:"12:00 PM – 2:00 PM",
      address:"200 Clarendon St, Lobby", suite:"Concourse level — event alcove", city:"Boston, MA 02116", distance:"2.2 mi from your kitchen",
      setupArea:"Lobby concourse", headcount:130, gross:2180,
      menu:["Chicken Shawarma Bowl","Falafel Wrap","Greek Salad","Iced Tea"],
      rep:{name:"Diego Alvarez", role:"Office Grubb · On-site coordinator", initials:"DA", phone:"(617) 555-0188", email:"diego.alvarez@officegrubb.com"},
      feeState:"due", setup:{warmers:true,table:true,pos:true,pack:true,signage:true}, prep:{staff:true,warmers:true,pos:true,signage:true,arrival:true} }
  ];

  var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var MONF = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  function parts(d){ var p=d.split("-"); return {y:+p[0],m:+p[1],day:+p[2]}; }
  function shortDate(d){ var p=parts(d); return MON[p.m-1]+" "+p.day; }
  function isToday(d){ return d===TODAY; }

  // time helpers
  function toMin(str){ var m=/(\d+):(\d+)\s*(AM|PM)/i.exec(str); if(!m) return null; var h=+m[1]%12; if(/PM/i.test(m[3]))h+=12; return h*60+ +m[2]; }
  function fromMin(t){ t=(t+1440)%1440; var h=Math.floor(t/60), mm=t%60; var ap=h<12?"AM":"PM"; var hh=h%12; if(hh===0)hh=12; return hh+":"+(mm<10?"0":"")+mm+" "+ap; }
  function startEnd(e){ var p=e.time.split("–"); return {start:(p[0]||"").trim(), end:(p[1]||"").trim()}; }
  function arrivalTime(e){ var s=toMin(startEnd(e).start); return s==null?"—":fromMin(s-60); }
  function setupWindow(e){ var s=toMin(startEnd(e).start); return s==null?"—":(fromMin(s-60)+" – "+fromMin(s-5)); }

  function eventGross(e){ return (e.gross!=null)?e.gross:e.headcount*AVG_SPEND; }
  function eventFee(e){ return eventGross(e)*COMMISSION; }
  function isProjected(e){ return e.gross==null; }

  function getId(){ var m=/[?&]id=(LK-\d+)/.exec(location.search); return m?m[1]:"LK-2038"; }
  function byId(id){ for (var i=0;i<EVENTS.length;i++) if (EVENTS[i].id===id) return EVENTS[i]; return null; }

  var e = byId(getId());
  if (e && !e.prep) e.prep = {};

  function statusInfo(ev){
    if (ev.ready) return {cls:"confirmed", label:"Ready for event", dot:"var(--s-ready)"};
    if (ev.status==="confirmed" && isToday(ev.date)) return {cls:"today", label:"Today", dot:"var(--accent)"};
    return { invited:{cls:"invited",label:"Needs confirmation",dot:"var(--s-new)"},
             confirmed:{cls:"confirmed",label:"Confirmed",dot:"var(--s-ready)"},
             completed:{cls:"completed",label:"Completed",dot:"var(--ink-3)"},
             declined:{cls:"declined",label:"Declined",dot:"var(--s-cancel,#c0392b)"} }[ev.status];
  }

  // ---------- render helpers ----------
  function sec(icon,title,extra,body){ return '<section class="le-card"><div class="le-ch">'+svgP(icon)+'<h2>'+title+'</h2>'+(extra||"")+'</div><div class="le-cb">'+body+'</div></section>'; }
  function fact(icon,label,val){ return '<div class="lk-fact"><div class="fi">'+svgP(icon)+'</div><div><div class="fl">'+label+'</div><div class="fv">'+val+'</div></div></div>'; }
  function infoRow(icon,label,val){ return '<div class="le-row">'+svgP(icon)+'<div><div class="le-rl">'+label+'</div><div class="le-rv">'+val+'</div></div></div>'; }
  function contact(ini,name,role,phone,email,cls){
    return '<div class="lk-rep '+(cls||"")+'"><div class="av">'+esc(ini)+'</div>'
      + '<div><div class="nm">'+esc(name)+'</div><div class="rl">'+esc(role)+'</div></div>'
      + '<div class="contact"><button class="cbtn" data-tel="'+esc(phone)+'" title="'+esc(phone)+'">'+svgP(I.phone)+'</button>'
      + '<button class="cbtn" data-mailto="'+esc(email)+'" title="'+esc(email)+'">'+svgP(I.mail)+'</button></div></div>';
  }

  function render(){
    if (!e){ $("#wrap").innerHTML='<div class="lk-detail-empty">'+svgP(I.star)+'<div>Event not found. <a href="live.html" style="color:var(--accent)">Back to Live Kitchen</a></div></div>'; return; }
    document.title = "Office Grubb — "+e.company+" Live Kitchen";
    var st = statusInfo(e), pd = parts(e.date), se = startEnd(e);
    var past = e.status==="completed"||e.status==="declined";

    // hero
    var hero = '<div class="lk-d-hero le-hero"><div class="row"><span class="cuisine">'+CUISINE+' pop-up</span>'
      + '<span class="lk-d-status" style="--x:0"><i style="background:'+st.dot+'"></i>'+st.label+'</span></div>'
      + '<div class="co">'+esc(e.company)+'</div><div class="ev">Live Kitchen · '+e.id+' · hosted on-site</div></div>';

    // 1. Event overview
    var overview = sec(I.star,"1 · Event overview","",
      '<div class="lk-facts">'
      + fact(I.store,"Corporation", esc(e.company))
      + fact(I.cal,"Event date", e.day+'<small>'+MONF[pd.m-1]+' '+pd.day+', '+pd.y+'</small>')
      + fact(I.clock,"Time", esc(se.start)+' – '+esc(se.end))
      + fact(I.menu,"Cuisine", CUISINE)
      + fact(I.users,"Estimated headcount", e.headcount+'<small>covers · set by the company</small>')
      + '</div>');

    // 2. Location & access
    var loc = sec(I.pin,"2 · Location &amp; access","",
      '<div class="lk-map"><div class="lk-map-vis"><div class="road r1"></div><div class="road r2"></div><div class="lk-map-pin">'+svgP(I.pin)+'</div></div>'
      + '<div class="lk-map-addr"><div class="ad">'+esc(e.address)+'<small>'+esc(e.city)+' · '+esc(e.distance)+'</small></div>'
      + '<button class="btn" data-directions>'+svgP(I.pin)+'Directions</button></div></div>'
      + '<div class="le-rows">'
      + infoRow(I.key,"Building / floor / suite", esc(e.suite))
      + infoRow(I.tool,"Setup area", esc(e.setupArea))
      + infoRow(I.truck,"Parking / loading", "Loading dock at the rear — 30-minute limit for unloading. Street parking or paid garage otherwise.")
      + infoRow(I.shield,"Access notes", "Check in at lobby security with photo ID. Use the freight elevator to the floor; your Office Grubb rep meets you there.")
      + '</div>');

    // 3. Confirmed menu
    var items = e.menu.map(menuBy).filter(Boolean);
    var menuRows = items.map(function(m){
      var tags = (m.diet||[]).map(function(t){ return '<span class="lk-diet">'+esc(t)+'</span>'; }).join("");
      return '<div class="lk-menu-row le-menu-row"><div class="th">'+esc(m.n.charAt(0))+'</div>'
        + '<div class="le-mi"><div class="nm">'+esc(m.n)+'</div><div class="le-diet">'+tags+'</div></div>'
        + '<div class="pr tnum">'+money(m.p)+'</div></div>';
    }).join("");
    var menu = sec(I.menu,"3 · Confirmed menu",'<span class="le-note-r">'+items.length+' items</span>',
      '<div class="lk-menu">'+menuRows+'</div>'
      + '<div class="le-callout">'+svgP(I.info)+'<span><b>Menu notes:</b> Curated with '+esc(e.company)+'. Halal mains and vegetarian/vegan options included. Serve buffet-style; label allergens (nuts in baklava) at the station.</span></div>');

    // 4. Setup requirements
    var equipRows = EQUIP.map(function(s){ return '<div class="le-eq">'+svgP(I.check)+esc(s.t)+'<small>'+esc(s.d)+'</small></div>'; }).join("");
    var setup = sec(I.tool,"4 · Setup requirements","",
      '<div class="lk-facts">'
      + fact(I.clock,"Arrival time", arrivalTime(e)+'<small>~60 min before service</small>')
      + fact(I.tool,"Setup window", setupWindow(e)+'<small>allow ~45–55 min</small>')
      + '</div>'
      + '<div class="le-sub">Equipment you bring</div><div class="le-eqs">'+equipRows+'</div>'
      + '<div class="le-callout accent">'+svgP(I.info)+'<span><b>POS / payment reminder:</b> Bring your own POS or card reader — employees pay you directly on-site. Office Grubb does not process Live Kitchen payments.</span></div>'
      + '<div class="le-callout">'+svgP(I.user)+'<span><b>Staff notes:</b> Roster at least 2–3 for '+e.headcount+' covers. Uniform + hairnets. Keep a runner topping up warmers through the rush.</span></div>');

    // 5. Contacts
    var corp = CORP[e.company] || {name:"Facilities Team", role:"On-site contact", phone:"(617) 555-0100", email:"facilities@"+e.company.toLowerCase().replace(/[^a-z]/g,"")+".com"};
    var corpIni = corp.name.split(" ").map(function(x){return x.charAt(0);}).join("").slice(0,2);
    var contacts = sec(I.phone,"5 · Contacts","",
      '<div class="le-contacts">'
      + '<div class="le-clabel">Corporate on-site contact</div>'+contact(corpIni,corp.name,corp.role+" · "+e.company,corp.phone,corp.email)
      + '<div class="le-clabel">Office Grubb representative</div>'+contact(e.rep.initials,e.rep.name,e.rep.role,e.rep.phone,e.rep.email,"og")
      + '<div class="le-clabel">Restaurant contact (you)</div>'+contact(REST_CONTACT.initials,REST_CONTACT.name,REST_CONTACT.role,REST_CONTACT.phone,REST_CONTACT.email,"rest")
      + '</div>');

    // 6. Preparation checklist
    var doneN = PREP.filter(function(p){return e.prep[p.k];}).length;
    var prepRows = PREP.map(function(p){
      var on = e.prep[p.k]?" on":"";
      return '<div class="lk-ci'+on+'" data-prep="'+p.k+'"><div class="box">'+svgP(I.check)+'</div>'
        + '<div><div class="ct">'+esc(p.t)+'</div><div class="cd">'+esc(p.d)+'</div></div></div>';
    }).join("");
    var prep = sec(I.check,"6 · Preparation checklist",'<span class="le-note-r">'+doneN+'/'+PREP.length+' ready</span>',
      '<div class="lk-check">'+prepRows+'</div>'
      + (past?'<div class="le-callout">'+svgP(I.info)+'<span>This event is over — the checklist is locked.</span></div>'
             :'<div class="le-callout">'+svgP(I.info)+'<span>Tick everything off, then <b>Mark ready for event</b> up top to signal Office Grubb you\'re set.</span></div>'));

    // 7. Billing / fee
    var g=eventGross(e), f=eventFee(e), proj=isProjected(e);
    var feeBadge = e.feeState==="paid" ? '<span class="lk-fee-badge paid">'+svgP(I.check)+'Paid</span>'
      : e.feeState==="due" ? '<span class="lk-fee-badge due"><i></i>Due now</span>'
      : '<span class="lk-fee-badge after">Billed after event</span>';
    var billing = sec(I.money,"7 · Billing &amp; fee","",
      '<div class="lk-fee"><div><div class="amt tnum">'+(proj?"≈ ":"")+fmtMoney0(f)+'</div>'
      + '<div class="fmeta"><b>20%</b> of '+(proj?"≈ "+fmtMoney0(g)+" projected":fmtMoney0(g)+" actual")+' gross</div></div>'
      + '<div class="fstate">'+feeBadge+'</div></div>'
      + '<div class="le-rows">'
      + infoRow(I.money,"Fee model", "20% of gross event revenue, billed to you. $800/day minimum — any shortfall is billed to "+esc(e.company)+", never to you. $0 setup fee to the company.")
      + infoRow(I.info,"Post-event billing", "Collected after the event once you've taken payment from employees on-site. Settle from the Live Kitchen tab; it does not count toward your $15,000 commission threshold.")
      + '</div>');

    // layout
    $("#wrap").innerHTML = hero
      + '<div class="le-grid">'
      + '<div class="le-main">'+overview+loc+menu+setup+'</div>'
      + '<div class="le-side">'+contacts+prep+billing+'</div>'
      + '</div>';

    syncActions();
    wire();
  }

  function syncActions(){
    var rb=$("#readyBtn"), past=e.status==="completed"||e.status==="declined";
    if (past){ rb.style.display="none"; return; }
    rb.style.display="";
    if (e.ready){ rb.className="btn"; rb.innerHTML=svgP(I.check)+"Ready ✓ — undo"; }
    else { rb.className="btn primary"; rb.innerHTML=svgP(I.check)+"Mark ready for event"; }
  }

  function wire(){
    var past=e.status==="completed"||e.status==="declined";
    Array.prototype.forEach.call($("#wrap").querySelectorAll("[data-prep]"),function(el){
      el.onclick=function(){ if(past){ toast("This event is over — checklist is locked"); return; }
        var k=el.getAttribute("data-prep"); e.prep[k]=!e.prep[k]; render(); };
    });
    var d;
    if ((d=$("#wrap").querySelector("[data-directions]"))) d.onclick=function(){ toast("Opening directions to "+e.address); };
    Array.prototype.forEach.call($("#wrap").querySelectorAll("[data-tel]"),function(b){ b.onclick=function(){ toast("Calling "+b.getAttribute("data-tel")); }; });
    Array.prototype.forEach.call($("#wrap").querySelectorAll("[data-mailto]"),function(b){ b.onclick=function(){ toast("Drafting email to "+b.getAttribute("data-mailto")); }; });
  }

  // ---------- actions ----------
  var toastT;
  function toast(msg){ var t=$("#toast"); $("#toastMsg").textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(function(){t.classList.remove("show");},2400); }

  $("#readyBtn").onclick=function(){
    if (!e) return;
    if (e.ready){ e.ready=false; toast("Marked not ready"); render(); return; }
    openReady();
  };
  function openReady(){
    $("#readyTitle").textContent = "Mark "+e.company+" event as ready?";
    $("#readySub").textContent = "Confirm your team and station are set for the "+e.company+" event on "+shortDate(e.date)+", "+startEnd(e).start+".";
    $("#readyList").innerHTML = PREP.map(function(p){
      var on=e.prep[p.k];
      return '<div class="le-rl-item'+(on?" on":"")+'">'+svgP(on?I.check:'<circle cx="12" cy="12" r="9"/>')+esc(p.t)+'</div>';
    }).join("");
    var miss = PREP.filter(function(p){return !e.prep[p.k];});
    var note = $("#readyNote");
    if (miss.length){ note.style.display=""; note.innerHTML = '<b>'+miss.length+' item'+(miss.length>1?"s":"")+' still open:</b> '+miss.map(function(p){return esc(p.t);}).join(", ")+'. You can still mark ready, but finish these before service.'; }
    else { note.style.display=""; note.innerHTML = 'All checklist items complete. Office Grubb will be notified you\'re set.'; }
    $("#readyModal").classList.add("on");
  }
  function closeReady(){ $("#readyModal").classList.remove("on"); }
  $("#readyCancel").onclick = closeReady;
  $("#readyModal").onclick = function(ev){ if(ev.target===$("#readyModal")) closeReady(); };
  $("#readyOk").onclick = function(){
    if (!e) return;
    var miss=PREP.filter(function(p){return !e.prep[p.k];}).length;
    e.ready=true; closeReady();
    toast(miss ? ("Marked ready — "+miss+" checklist item"+(miss>1?"s":"")+" still open") : "Ready for event — Office Grubb notified");
    render();
  };
  $("#calBtn").onclick=function(){ if(e) toast("Added "+e.company+" Live Kitchen to your calendar"); };
  $("#contactBtn").onclick=function(){ if(e) toast("Messaging "+e.rep.name+" · "+e.rep.phone); };

  // request changes modal
  var reqReason=null;
  $("#reqBtn").onclick=function(){
    if (!e) return; reqReason=null;
    $("#reqSub").textContent="Tell "+e.rep.name+" what needs to change for the "+e.company+" event on "+shortDate(e.date)+".";
    $("#reqReasons").innerHTML = REQ_REASONS.map(function(r){ return '<div class="lk-reason" data-r="'+esc(r)+'"><span class="rd"></span>'+r+'</div>'; }).join("");
    Array.prototype.forEach.call($("#reqReasons").children,function(el){ el.onclick=function(){ reqReason=el.getAttribute("data-r");
      Array.prototype.forEach.call($("#reqReasons").children,function(x){x.classList.remove("on");}); el.classList.add("on"); }; });
    $("#reqNote").value=""; $("#reqModal").classList.add("on");
  };
  $("#reqCancel").onclick=function(){ $("#reqModal").classList.remove("on"); };
  $("#reqSend").onclick=function(){ if(!reqReason){ toast("Pick what needs to change"); return; } $("#reqModal").classList.remove("on"); toast("Change request sent to "+e.rep.name); };
  $("#reqModal").onclick=function(ev){ if(ev.target===$("#reqModal")) $("#reqModal").classList.remove("on"); };
  document.addEventListener("keydown",function(ev){ if(ev.key==="Escape"){ $("#reqModal").classList.remove("on"); $("#readyModal").classList.remove("on"); } });

  $("#themeBtn").onclick=function(){ var r=document.documentElement,c=r.getAttribute("data-theme"); if(!c)c=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"; r.setAttribute("data-theme",c==="dark"?"light":"dark"); };

  render();
})();
