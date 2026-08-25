// Office Grubb — Live Kitchen (restaurant portal)
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s){ return String(s).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];}); }
  function svgP(p){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'+p+'</svg>'; }
  function money(n){ return "$"+Number(n).toFixed(2); }

  var TODAY = "2026-07-27";
  var COMMISSION = 0.20;      // 20% of gross event revenue billed to the restaurant
  var DAY_MIN = 800;          // $800/day minimum — shortfall billed to the corporation, not the restaurant
  var AVG_SPEND = 18;         // est. per-head spend used to project revenue for upcoming events
  var CUISINE = "Mediterranean";
  function fmtMoney0(n){ return "$" + Math.round(n).toLocaleString(); }
  // gross event revenue: actual for completed events, projected (headcount × avg spend) otherwise
  function eventGross(e){ return (e.gross != null) ? e.gross : e.headcount * AVG_SPEND; }
  function eventFee(e){ return eventGross(e) * COMMISSION; }
  function isProjected(e){ return e.gross == null; }
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
    star:'<path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.5 7.1 18l.9-5.5-4-3.9L9.5 8z"/>',
    shield:'<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>'
  };

  // curated Mediterranean spread for the day
  var MENU = [
    {n:"Chicken Shawarma Bowl",p:14.00},{n:"Falafel Wrap",p:11.00},
    {n:"Lamb Gyro Plate",p:17.50},{n:"Greek Salad",p:9.00},
    {n:"Hummus & Pita",p:3.50},{n:"Baklava",p:4.50},{n:"Iced Tea",p:2.00}
  ];
  function menuSet(names){ return MENU.filter(function(m){return names.indexOf(m.n)>=0;}); }

  var SETUP = [
    {k:"warmers", t:"Food warmers & chafing dishes", d:"Keep the spread hot through service"},
    {k:"table",   t:"Serving table & display setup", d:"Your own branded serving station"},
    {k:"pos",     t:"POS system / card reader",      d:"You take payment from employees directly"},
    {k:"pack",    t:"Utensils, napkins & packaging",  d:"Enough for the estimated headcount"},
    {k:"signage", t:"Menu board & signage",           d:"So employees can see the day's menu"}
  ];

  var REASONS = ["Scheduling conflict","Not enough staff that day","Location too far","Headcount too low","Other"];

  // ---- events ----
  var EVENTS = [
    { id:"LK-2041", status:"invited", company:"TechNova", initials:"TN",
      date:"2026-07-30", day:"Thursday", time:"11:30 AM – 1:30 PM",
      address:"800 Boylston St, Floor 12", city:"Boston, MA 02199", distance:"3.1 mi from your kitchen",
      headcount:150, menu:["Chicken Shawarma Bowl","Falafel Wrap","Greek Salad","Hummus & Pita","Baklava","Iced Tea"],
      rep:{name:"Maya Chen", role:"Office Grubb · On-site coordinator", initials:"MC", phone:"(617) 555-0142", email:"maya.chen@officegrubb.com"},
      feeState:"after", setup:{} },
    { id:"LK-2038", status:"confirmed", company:"Acme Corp", initials:"AC",
      date:"2026-07-29", day:"Wednesday", time:"11:30 AM – 1:30 PM",
      address:"125 Summer St, Floor 8", city:"Boston, MA 02110", distance:"1.4 mi from your kitchen",
      headcount:180, menu:["Chicken Shawarma Bowl","Lamb Gyro Plate","Falafel Wrap","Greek Salad","Hummus & Pita","Baklava","Iced Tea"],
      rep:{name:"Maya Chen", role:"Office Grubb · On-site coordinator", initials:"MC", phone:"(617) 555-0142", email:"maya.chen@officegrubb.com"},
      feeState:"after", setup:{warmers:true,table:true,pos:true} },
    { id:"LK-2035", status:"confirmed", company:"Beacon Financial", initials:"BF",
      date:"2026-08-05", day:"Wednesday", time:"12:00 PM – 2:00 PM",
      address:"200 Clarendon St, Lobby", city:"Boston, MA 02116", distance:"2.2 mi from your kitchen",
      headcount:120, menu:["Chicken Shawarma Bowl","Falafel Wrap","Greek Salad","Hummus & Pita","Iced Tea"],
      rep:{name:"Diego Alvarez", role:"Office Grubb · On-site coordinator", initials:"DA", phone:"(617) 555-0188", email:"diego.alvarez@officegrubb.com"},
      feeState:"after", setup:{} },
    { id:"LK-2044", status:"confirmed", company:"Harbor Health", initials:"HH",
      date:"2026-08-12", day:"Wednesday", time:"11:00 AM – 1:00 PM",
      address:"1 Marina Park Dr, Floor 3", city:"Boston, MA 02210", distance:"2.9 mi from your kitchen",
      headcount:95, menu:["Chicken Shawarma Bowl","Falafel Wrap","Greek Salad","Baklava","Iced Tea"],
      rep:{name:"Maya Chen", role:"Office Grubb · On-site coordinator", initials:"MC", phone:"(617) 555-0142", email:"maya.chen@officegrubb.com"},
      feeState:"after", setup:{} },
    // past
    { id:"LK-2029", status:"completed", company:"Meridian Labs", initials:"ML",
      date:"2026-07-15", day:"Tuesday", time:"11:30 AM – 1:30 PM",
      address:"401 Congress St, Floor 5", city:"Boston, MA 02210", distance:"2.7 mi from your kitchen",
      headcount:160, gross:2940, menu:["Chicken Shawarma Bowl","Falafel Wrap","Greek Salad","Hummus & Pita","Baklava"],
      rep:{name:"Maya Chen", role:"Office Grubb · On-site coordinator", initials:"MC", phone:"(617) 555-0142", email:"maya.chen@officegrubb.com"},
      feeState:"paid", setup:{warmers:true,table:true,pos:true,pack:true,signage:true} },
    { id:"LK-2024", status:"completed", company:"Acme Corp", initials:"AC",
      date:"2026-07-01", day:"Tuesday", time:"11:30 AM – 1:30 PM",
      address:"125 Summer St, Floor 8", city:"Boston, MA 02110", distance:"1.4 mi from your kitchen",
      headcount:175, gross:3260, menu:["Chicken Shawarma Bowl","Lamb Gyro Plate","Greek Salad","Hummus & Pita","Baklava","Iced Tea"],
      rep:{name:"Maya Chen", role:"Office Grubb · On-site coordinator", initials:"MC", phone:"(617) 555-0142", email:"maya.chen@officegrubb.com"},
      feeState:"paid", setup:{warmers:true,table:true,pos:true,pack:true,signage:true} },
    { id:"LK-2019", status:"completed", company:"Beacon Financial", initials:"BF",
      date:"2026-06-20", day:"Friday", time:"12:00 PM – 2:00 PM",
      address:"200 Clarendon St, Lobby", city:"Boston, MA 02116", distance:"2.2 mi from your kitchen",
      headcount:130, gross:2180, menu:["Chicken Shawarma Bowl","Falafel Wrap","Greek Salad","Iced Tea"],
      rep:{name:"Diego Alvarez", role:"Office Grubb · On-site coordinator", initials:"DA", phone:"(617) 555-0188", email:"diego.alvarez@officegrubb.com"},
      feeState:"due", setup:{warmers:true,table:true,pos:true,pack:true,signage:true} }
  ];

  var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var MONF = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  function parts(d){ var p=d.split("-"); return {y:+p[0],m:+p[1],day:+p[2]}; }
  function shortDate(d){ var p=parts(d); return MON[p.m-1]+" "+p.day; }
  function longDate(d,dow){ var p=parts(d); return dow+", "+MONF[p.m-1]+" "+p.day+", "+p.y; }
  function isToday(d){ return d===TODAY; }
  function isUpcoming(e){ return (e.status==="invited"||e.status==="confirmed") && e.date>=TODAY; }

  var TABS = ["Upcoming","Invitations","Past"];
  var state = { tab:"Upcoming", selId:null };

  function byId(id){ for (var i=0;i<EVENTS.length;i++) if (EVENTS[i].id===id) return EVENTS[i]; return null; }
  function displayStatus(e){
    if (e.status==="confirmed" && isToday(e.date)) return {cls:"today", label:"Today"};
    return { invited:{cls:"invited",label:"Needs confirmation"}, confirmed:{cls:"confirmed",label:"Confirmed"},
             completed:{cls:"completed",label:"Completed"}, declined:{cls:"declined",label:"Declined"} }[e.status];
  }

  // ---------- stats ----------
  function renderStats(){
    var up = EVENTS.filter(isUpcoming);
    var pend = EVENTS.filter(function(e){return e.status==="invited";});
    var covers = up.reduce(function(s,e){return s+e.headcount;},0);
    var feesDue = EVENTS.filter(function(e){return e.status==="completed" && e.feeState==="due";})
                        .reduce(function(s,e){return s + eventFee(e);}, 0);
    $("#stUpcoming").textContent = up.length;
    var next = up.slice().sort(function(a,b){return a.date<b.date?-1:1;})[0];
    $("#stNext").textContent = next ? ("next: "+next.company+" · "+shortDate(next.date)) : "none scheduled";
    $("#stPending").textContent = pend.length;
    $("#stCovers").textContent = covers.toLocaleString();
    $("#stFees").textContent = fmtMoney0(feesDue);
  }

  function tabCount(t){
    if (t==="Invitations") return EVENTS.filter(function(e){return e.status==="invited";}).length;
    if (t==="Past") return EVENTS.filter(function(e){return e.status==="completed"||e.status==="declined";}).length;
    return EVENTS.filter(isUpcoming).length;
  }
  function renderTabs(){
    $("#tabs").innerHTML = TABS.map(function(t){
      return '<div class="lk-tab'+(state.tab===t?" on":"")+'" data-t="'+t+'">'+t+' <span class="cnt tnum">'+tabCount(t)+'</span></div>';
    }).join("");
    Array.prototype.forEach.call($("#tabs").children,function(el){ el.onclick=function(){ state.tab=el.getAttribute("data-t"); state.selId=null; render(); }; });
  }

  // ---------- list ----------
  function listFor(tab){
    var list = EVENTS.filter(function(e){
      if (tab==="Invitations") return e.status==="invited";
      if (tab==="Past") return e.status==="completed"||e.status==="declined";
      return isUpcoming(e);
    });
    list.sort(function(a,b){ return (tab==="Past") ? (a.date<b.date?1:-1) : (a.date<b.date?-1:1); });
    return list;
  }
  function eventCard(e){
    var p = parts(e.date), st = displayStatus(e);
    var sel = e.id===state.selId ? " sel" : "";
    var done = (e.status==="completed"||e.status==="declined") ? " done" : "";
    return '<div class="lk-card'+sel+done+'" data-ev="'+e.id+'">'
      + '<span class="lk-pill '+st.cls+'"><i></i>'+st.label+'</span>'
      + '<div class="lk-card-top">'
        + '<div class="lk-date"><div class="m">'+MON[p.m-1]+'</div><div class="d">'+p.day+'</div></div>'
        + '<div class="lk-card-h"><div class="co">'+esc(e.company)+'</div>'
          + '<div class="tm">'+svgP(I.clock)+e.day+' · '+esc(e.time)+'</div></div>'
      + '</div>'
      + '<div class="lk-card-meta">'
        + '<span class="lk-chip">'+svgP(I.users)+'<b>'+e.headcount+'</b>&nbsp;est.</span>'
        + '<span class="lk-chip">'+svgP(I.pin)+esc(e.city.split(",")[0])+'</span>'
        + '<span class="lk-cuisine">'+CUISINE+'</span>'
      + '</div></div>';
  }
  function renderList(){
    var list = listFor(state.tab);
    if (!list.length){
      var msg = state.tab==="Invitations" ? "No pending invitations. New Live Kitchen events will appear here for you to confirm."
        : state.tab==="Past" ? "No past events yet. Completed Live Kitchen events will be listed here."
        : "No upcoming events scheduled. Office Grubb will schedule you into the rotation.";
      $("#list").innerHTML = '<div class="lk-empty">'+msg+'</div>';
      return;
    }
    if (!state.selId || !list.some(function(e){return e.id===state.selId;})) state.selId = list[0].id;
    $("#list").innerHTML = list.map(eventCard).join("");
    Array.prototype.forEach.call($("#list").querySelectorAll("[data-ev]"),function(c){
      c.onclick=function(){ state.selId=c.getAttribute("data-ev"); render(); };
    });
  }

  // ---------- detail ----------
  function fact(icon,label,val){
    return '<div class="lk-fact"><div class="fi">'+svgP(icon)+'</div><div><div class="fl">'+label+'</div><div class="fv">'+val+'</div></div></div>';
  }
  function renderDetail(){
    var e = byId(state.selId);
    if (!e){ $("#detail").innerHTML = '<div class="lk-detail-empty">'+svgP(I.star)+'<div>Select an event to see the full brief.</div></div>'; return; }
    var st = displayStatus(e);

    var pd = parts(e.date);
    var facts = '<div class="lk-facts">'
      + fact(I.cal,"Date", e.day+'<small>'+MONF[pd.m-1]+' '+pd.day+', '+pd.y+'</small>')
      + fact(I.clock,"Service time", e.time)
      + fact(I.users,"Estimated headcount", e.headcount+'<small>covers · set by the company</small>')
      + fact(I.money,"Your fee", '20%<small>of event revenue · billed after</small>')
      + '</div>';

    // location
    var loc = '<div class="lk-sec"><div class="lk-sec-h">'+svgP(I.pin)+'Location</div>'
      + '<div class="lk-map"><div class="lk-map-vis"><div class="road r1"></div><div class="road r2"></div>'
        + '<div class="lk-map-pin">'+svgP(I.pin)+'</div></div>'
        + '<div class="lk-map-addr"><div class="ad">'+esc(e.address)+'<small>'+esc(e.city)+' · '+esc(e.distance)+'</small></div>'
        + '<button class="btn" data-directions>'+svgP(I.pin)+'Directions</button></div></div></div>';

    // menu
    var items = menuSet(e.menu);
    var menu = '<div class="lk-sec"><div class="lk-sec-h">'+svgP(I.menu)+'Confirmed menu <span style="margin-left:6px;color:var(--ink-3);font-weight:700">'+items.length+' items</span></div>'
      + '<div class="lk-menu">'+items.map(function(m){
          return '<div class="lk-menu-row"><div class="th">'+esc(m.n.charAt(0))+'</div><div class="nm">'+esc(m.n)+'</div><div class="pr tnum">'+money(m.p)+'</div></div>';
        }).join("")+'</div></div>';

    // rep
    var rep = '<div class="lk-sec"><div class="lk-sec-h">'+svgP(I.shield)+'Office Grubb on-site rep</div>'
      + '<div class="lk-rep"><div class="av">'+esc(e.rep.initials)+'</div>'
        + '<div><div class="nm">'+esc(e.rep.name)+'</div><div class="rl">'+esc(e.rep.role)+'</div></div>'
        + '<div class="contact"><button class="cbtn" data-call title="'+esc(e.rep.phone)+'">'+svgP(I.phone)+'</button>'
        + '<button class="cbtn" data-email title="'+esc(e.rep.email)+'">'+svgP(I.mail)+'</button></div></div></div>';

    // setup checklist
    var past = e.status==="completed"||e.status==="declined";
    var doneCount = SETUP.filter(function(s){return e.setup[s.k];}).length;
    var check = '<div class="lk-sec"><div class="lk-sec-h">'+svgP(I.box)+'What you bring'
      + '<span style="margin-left:6px;color:var(--ink-3);font-weight:700">'+doneCount+'/'+SETUP.length+'</span></div>'
      + '<div class="lk-check">'+SETUP.map(function(s){
          var on = e.setup[s.k] ? " on":"";
          return '<div class="lk-ci'+on+'" data-setup="'+s.k+'"><div class="box">'+svgP(I.check)+'</div>'
            + '<div><div class="ct">'+esc(s.t)+'</div><div class="cd">'+esc(s.d)+'</div></div></div>';
        }).join("")+'</div>'
      + '<div class="lk-check-note">'+svgP(I.info)+'Office Grubb doesn\'t process Live Kitchen payments — employees pay you directly at your POS.</div></div>';

    // fee
    var feeBadge = e.feeState==="paid" ? '<span class="lk-fee-badge paid">'+svgP(I.check)+'Paid</span>'
      : e.feeState==="due" ? '<span class="lk-fee-badge due"><i></i>Due now</span>'
      : '<span class="lk-fee-badge after">Billed after event</span>';
    var proj = isProjected(e), gross = eventGross(e), feeAmt = eventFee(e);
    var grossLabel = proj ? ("≈ "+fmtMoney0(gross)+" projected") : (fmtMoney0(gross)+" actual");
    var fee = '<div class="lk-sec"><div class="lk-sec-h">'+svgP(I.money)+'Office Grubb fee</div>'
      + '<div class="lk-fee"><div><div class="amt tnum">'+(proj?"≈ ":"")+fmtMoney0(feeAmt)+'</div>'
        + '<div class="fmeta"><b>20%</b> of '+grossLabel+' · billed after the event</div></div>'
      + '<div class="fstate">'+feeBadge+'</div></div>'
      + '<div class="lk-check-note">'+svgP(I.info)+'Flat 20% of gross event revenue. A <b>$800/day minimum</b> applies — if the event falls short, Office Grubb bills the shortfall to the company, never to you.</div></div>';

    // hero
    var evLabel = "Live Kitchen · "+e.id;
    var hero = '<div class="lk-d-hero"><div class="row"><span class="cuisine">'+CUISINE+' pop-up</span>'
      + '<span class="lk-d-status" style="--x:0"><i style="background:'+({invited:"var(--s-new)",confirmed:"var(--s-ready)",today:"var(--accent)",completed:"var(--ink-3)",declined:"var(--s-cancel,#c0392b)"}[st.cls])+'"></i>'+st.label+'</span></div>'
      + '<div class="co">'+esc(e.company)+'</div><div class="ev">'+evLabel+' · hosted on-site</div></div>';

    // footer actions
    var foot = "";
    if (e.status==="invited"){
      foot = '<button class="btn" data-decline>Decline</button><button class="btn primary" data-confirm>'+svgP(I.check)+'Confirm event</button>';
    } else if (e.status==="confirmed"){
      foot = '<button class="btn" data-msg>'+svgP(I.mail)+'Message rep</button>'
        + (isToday(e.date) ? '<button class="btn primary" data-complete>'+svgP(I.check)+'Mark completed</button>'
                           : '<button class="btn primary" data-cal>'+svgP(I.cal)+'Add to calendar</button>');
    } else if (e.status==="completed"){
      foot = e.feeState==="due"
        ? '<button class="btn" data-summary>View summary</button><button class="btn primary" data-settle>'+svgP(I.money)+'Settle '+fmtMoney0(eventFee(e))+' fee</button>'
        : '<button class="btn" data-summary>View summary</button><button class="btn" data-rebook>Request rebooking</button>';
    } else {
      foot = '<button class="btn grow" data-rebook>Offer to reschedule</button>';
    }

    var fullBtn = '<a class="btn le-openfull" href="live-event.html?id='+e.id+'">'+svgP('<path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9zM14 3v6h6"/>')+'Open full event brief'+svgP('<path d="M9 6l6 6-6 6"/>')+'</a>';

    $("#detail").innerHTML = '<div class="lk-d">'+hero
      + '<div class="lk-d-body">'+fullBtn+facts+loc+menu+rep+check+fee+'</div>'
      + '<div class="lk-d-foot">'+foot+'</div></div>';

    wireDetail(e);
  }

  function wireDetail(e){
    // setup checklist toggles (only when not past)
    var past = e.status==="completed"||e.status==="declined";
    Array.prototype.forEach.call($("#detail").querySelectorAll("[data-setup]"),function(el){
      el.onclick=function(){ if(past){ toast("This event is over — checklist is locked"); return; }
        var k=el.getAttribute("data-setup"); e.setup[k]=!e.setup[k]; renderDetail(); };
    });
    var d;
    if ((d=$("#detail").querySelector("[data-directions]"))) d.onclick=function(){ toast("Opening directions to "+e.address); };
    if ((d=$("#detail").querySelector("[data-call]"))) d.onclick=function(){ toast("Calling "+e.rep.name+" · "+e.rep.phone); };
    if ((d=$("#detail").querySelector("[data-email]"))) d.onclick=function(){ toast("Drafting email to "+e.rep.email); };
    if ((d=$("#detail").querySelector("[data-msg]"))) d.onclick=function(){ toast("Messaging "+e.rep.name); };
    if ((d=$("#detail").querySelector("[data-cal]"))) d.onclick=function(){ toast("Added "+e.company+" event to your calendar"); };
    if ((d=$("#detail").querySelector("[data-confirm]"))) d.onclick=function(){ openConfirm(e); };
    if ((d=$("#detail").querySelector("[data-decline]"))) d.onclick=function(){ openDecline(e); };
    if ((d=$("#detail").querySelector("[data-complete]"))) d.onclick=function(){ e.status="completed"; if(e.gross==null) e.gross=e.headcount*AVG_SPEND; e.feeState="due"; toast(e.company+" event marked completed — 20% fee ("+fmtMoney0(eventFee(e))+") now due"); render(); };
    if ((d=$("#detail").querySelector("[data-settle]"))) d.onclick=function(){ openFee(e); };
    if ((d=$("#detail").querySelector("[data-summary]"))) d.onclick=function(){ toast("Event summary — "+e.headcount+" covers, "+fmtMoney0(eventGross(e))+" gross, "+CUISINE); };
    if ((d=$("#detail").querySelector("[data-rebook]"))) d.onclick=function(){ toast("Rebooking request sent to Office Grubb"); };
  }

  // ---------- modals ----------
  var pending = null, decReason = null;
  function openConfirm(e){ pending=e; $("#confTitle").textContent='Confirm '+e.company+' Live Kitchen?';
    $("#confSub").textContent='On '+longDate(e.date,e.day)+', '+e.time+'. By confirming you commit to setting up on-site.';
    $("#confModal").classList.add("on"); }
  $("#confCancel").onclick=function(){ $("#confModal").classList.remove("on"); };
  $("#confOk").onclick=function(){ if(pending){ pending.status="confirmed"; $("#confModal").classList.remove("on"); toast(pending.company+" event confirmed — see you on-site!"); state.tab="Upcoming"; state.selId=pending.id; render(); } };

  function openDecline(e){ pending=e; decReason=null; $("#decTitle").textContent='Decline '+e.company+' event?';
    $("#decReasons").innerHTML = REASONS.map(function(r){ return '<div class="lk-reason" data-r="'+esc(r)+'"><span class="rd"></span>'+r+'</div>'; }).join("");
    Array.prototype.forEach.call($("#decReasons").children,function(el){ el.onclick=function(){ decReason=el.getAttribute("data-r");
      Array.prototype.forEach.call($("#decReasons").children,function(x){x.classList.remove("on");}); el.classList.add("on"); }; });
    $("#decNote").value=""; $("#decModal").classList.add("on"); }
  $("#decCancel").onclick=function(){ $("#decModal").classList.remove("on"); };
  $("#decOk").onclick=function(){ if(!decReason){ toast("Pick a reason so Office Grubb can reschedule"); return; }
    if(pending){ pending.status="declined"; $("#decModal").classList.remove("on"); toast(pending.company+" event declined — Office Grubb notified"); state.tab="Past"; state.selId=pending.id; render(); } };

  function openFee(e){ pending=e;
    var g=eventGross(e), f=eventFee(e);
    $("#feeSub").textContent='Settle the 20% Office Grubb commission for the '+e.company+' event on '+shortDate(e.date)+'.';
    $("#feeGross").textContent=fmtMoney0(g);
    $("#feeAmt").textContent=fmtMoney0(f);
    $("#feeOk").innerHTML='Pay '+fmtMoney0(f)+' fee';
    $("#feeModal").classList.add("on"); }
  $("#feeCancel").onclick=function(){ $("#feeModal").classList.remove("on"); };
  $("#feeOk").onclick=function(){ if(pending){ pending.feeState="paid"; $("#feeModal").classList.remove("on"); toast(fmtMoney0(eventFee(pending))+" fee paid — thanks!"); render(); } };

  // how it works
  var STEPS = [
    ["Office Grubb schedules you","You're placed into a company's monthly rotation based on employee preference and ordering data. Each day features a different cuisine — you bring the Mediterranean."],
    ["Review & confirm the event","Check the date, address, estimated headcount and confirmed menu, then confirm. An Office Grubb rep is assigned as your on-site point of contact."],
    ["Set up on-site","Bring your warmers, serving station and POS. Office Grubb coordinates access and logistics; their rep is there on the day to handle any issues."],
    ["Serve & get paid directly","Employees come down, order and pay you directly at your POS. Office Grubb never handles Live Kitchen payments."],
    ["Settle the 20% fee after","Office Grubb bills 20% of the event's gross revenue after the event — never before — so you collect from employees first. A $800/day minimum applies; if the event falls short, the shortfall goes to the client, not you."]
  ];
  $("#howBtn").onclick=function(){
    $("#howBody").innerHTML = STEPS.map(function(s,i){ return '<div class="lk-step"><div class="n">'+(i+1)+'</div><div><div class="st">'+s[0]+'</div><div class="sb">'+s[1]+'</div></div></div>'; }).join("");
    $("#howModal").classList.add("on");
  };
  $("#howClose").onclick=$("#howDone").onclick=function(){ $("#howModal").classList.remove("on"); };

  // dismiss modals on backdrop / escape
  Array.prototype.forEach.call(document.querySelectorAll(".modal-ov"),function(m){ m.onclick=function(e){ if(e.target===m) m.classList.remove("on"); }; });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape") Array.prototype.forEach.call(document.querySelectorAll(".modal-ov.on"),function(m){m.classList.remove("on");}); });

  // ---------- misc ----------
  var toastT;
  function toast(msg){ var t=$("#toast"); $("#toastMsg").textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(function(){t.classList.remove("show");},2400); }
  $("#themeBtn").onclick=function(){ var r=document.documentElement,c=r.getAttribute("data-theme"); if(!c)c=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"; r.setAttribute("data-theme",c==="dark"?"light":"dark"); };

  function render(){ renderStats(); renderTabs(); renderList(); renderDetail(); }
  render();
})();
