// Office Grubb — Calendar dashboard (restaurant)
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s){ return String(s).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];}); }
  function svgP(p){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'+p+'</svg>'; }

  var REF_TODAY = new Date(2026, 6, 30); // Thu, Jul 30 2026 — treated as "today"
  var RESTAURANT = "Sofia's Kitchen";

  var I = {
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    cal:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
    orders:'<path d="M3 6h18M3 12h18M3 18h12"/>',
    users:'<path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.9"/>',
    pin:'<path d="M12 21s7-6.3 7-12a7 7 0 10-14 0c0 5.7 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    menu:'<path d="M4 3h16v4H4zM6 7v13h12V7"/><path d="M9 11h6"/>',
    store:'<path d="M3 10l1.5-5h15L21 10M4 10v9h16v-9M4 10h16"/>',
    check:'<path d="M20 6L9 17l-5-5"/>',
    fire:'<path d="M12 3c1 3-1 4-1 6a3 3 0 006 0c0-1-.5-2-1-3 2 1 4 3.5 4 7a6 6 0 11-12 0c0-2 1-3.5 2-4.5C11 6 12 5 12 3z"/>',
    arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
    x:'<path d="M18 6L6 18M6 6l12 12"/>',
    doc:'<path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9zM14 3v6h6"/>',
    phone:'<path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.5-1.1a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
    resv:'<path d="M4 5h16v6H4z"/><path d="M4 11c0 5 4 8 8 8s8-3 8-8"/>',
    table:'<path d="M3 9h18M5 9v9M19 9v9M4 5h16v4H4z"/>'
  };

  var TYPE = {
    order: { cls:"order", label:"Corporate Orders" },
    menu:  { cls:"menu",  label:"Menu Available" },
    live:  { cls:"live",  label:"Live Kitchen Event" },
    reservation: { cls:"reservation", label:"Reservation" }
  };
  var STATUS_LABEL = { upcoming:"Upcoming", completed:"Completed", cancelled:"Cancelled" };

  var LK_MENU = ["Chicken Shawarma Bowl","Falafel Wrap","Greek Salad","Hummus & Pita","Baklava","Iced Tea"];
  var DISHES = ["Chicken Shawarma Bowl","Lamb Gyro Plate","Falafel Wrap","Greek Salad","Mediterranean Mezze Platter","Hummus & Pita","Spanakopita","Baklava","Iced Tea"];
  // food items to show per event (available menu for menu days, menu for live)
  function itemsFor(e){
    if (e.items) return e.items;
    if (e.type==="live") return e.menu;
    if (e.type==="menu")  return DISHES.slice(0, 6);
    return null;
  }
  // per-employee order overview for corporate orders
  var NAMES = ["Daniel Okafor","Elena Ruiz","Priya Nair","Marcus Bell","Sarah Kim","James Cole","Aisha Rahman","Tom Reilly","Dana Fox","Liam Chen","Nina Patel","Owen Brooks","Maya Lopez","Sam Ortiz","Zoe Wright"];
  var MODS = ["", "", "", "No onions", "Extra sauce", "Gluten-free", "No nuts"];
  function sampleEmployees(e){
    var n=Math.min(e.orders, 7), out=[];
    for (var i=0;i<n;i++){
      out.push({ name:NAMES[(e.id*3+i)%NAMES.length], item:DISHES[(e.id+i)%DISHES.length], mod:MODS[(e.id*2+i)%MODS.length] });
    }
    return out;
  }

  // ---- events ----
  var EVENTS = [
    { id:1, type:"order", company:"Apple Inc.",       date:"2026-07-20", orders:45, time:"12:30 PM", status:"completed" },
    { id:2, type:"menu",  company:"Google Inc.",      date:"2026-07-24", expected:60, status:"completed" },
    { id:3, type:"order", company:"Acme Corp",        date:"2026-07-29", orders:28, time:"12:00 PM", status:"completed" },
    { id:4, type:"order", company:"Northline Labs",   date:"2026-07-30", orders:12, time:"11:45 AM", status:"upcoming" },
    { id:5, type:"menu",  company:"Beacon Financial", date:"2026-07-31", expected:40, status:"upcoming" },
    { id:6, type:"order", company:"Apple Inc.",       date:"2026-08-03", orders:52, time:"12:30 PM", status:"upcoming" },
    { id:7, type:"live",  company:"Microsoft HQ",     date:"2026-08-05", time:"12:00 PM", headcount:150, location:"Boston Office", menu:LK_MENU, status:"upcoming" },
    { id:8, type:"order", company:"TechNova",         date:"2026-08-06", orders:30, time:"1:00 PM", status:"upcoming" },
    { id:9, type:"menu",  company:"Google Inc.",      date:"2026-08-07", expected:65, status:"upcoming" },
    { id:10, type:"order", company:"Harbor Health",   date:"2026-08-10", orders:18, time:"11:30 AM", status:"upcoming" },
    { id:11, type:"live",  company:"Acme Corp",       date:"2026-08-12", time:"11:30 AM", headcount:120, location:"Boston Office", menu:LK_MENU, status:"upcoming" },
    { id:12, type:"order", company:"Beacon Financial",date:"2026-08-14", orders:22, time:"12:15 PM", status:"cancelled" },
    { id:13, type:"order", company:"Apple Inc.",      date:"2026-08-17", orders:48, time:"12:30 PM", status:"upcoming" },
    { id:14, type:"menu",  company:"Northline Labs",  date:"2026-08-19", expected:35, status:"upcoming" },
    // dine-in reservations booked through Office Grubb
    { id:15, type:"reservation", company:"Northline Labs",   host:"Daniel Okafor", date:"2026-07-22", time:"12:30 PM", party:6, table:"B1", status:"completed" },
    { id:16, type:"reservation", company:"Acme Corp",        host:"Elena Ruiz",    date:"2026-07-30", time:"1:00 PM",  party:4, table:"—", status:"upcoming" },
    { id:17, type:"reservation", company:"TechNova",         host:"Priya Nair",    date:"2026-08-04", time:"12:45 PM", party:8, table:"P2", status:"upcoming" },
    { id:18, type:"reservation", company:"Beacon Financial", host:"Marcus Bell",   date:"2026-08-11", time:"6:30 PM",  party:5, table:"—", status:"upcoming" }
  ];
  // ---- busy-day demo: July 16 has 3 corporate orders, 2 Live Kitchen, 25 reservations ----
  (function seedBusyDay(){
    var d="2026-07-16", id=100;
    var oc=["Apple Inc.","Google Inc.","Acme Corp"], on=[38,52,44], ot=["12:00 PM","12:30 PM","1:00 PM"];
    for (var i=0;i<3;i++) EVENTS.push({ id:id++, type:"order", company:oc[i], date:d, orders:on[i], time:ot[i], status:"upcoming" });
    var lc=["Microsoft HQ","TechNova"], lh=[140,90], lt=["11:30 AM","12:00 PM"];
    for (var j=0;j<2;j++) EVENTS.push({ id:id++, type:"live", company:lc[j], date:d, time:lt[j], headcount:lh[j], location:"Boston Office", menu:LK_MENU, status:"upcoming" });
    var rc=["Acme Corp","Beacon Financial","Harbor Health","TechNova","Northline Labs"];
    var rt=["11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","6:00 PM","6:30 PM"];
    for (var k=0;k<25;k++) EVENTS.push({ id:id++, type:"reservation", company:rc[k%rc.length], host:NAMES[k%NAMES.length], date:d, time:rt[k%rt.length], party:2+(k%8), table:(k%3===0?"—":("T"+((k%12)+1))), status:"upcoming" });
  })();
  // ---- single-type-heavy demo: July 9 has 1 order, 1 reservation, 12 Live Kitchen ----
  (function seedLiveHeavyDay(){
    var d="2026-07-09", id=200;
    EVENTS.push({ id:id++, type:"order", company:"Apple Inc.", date:d, orders:36, time:"12:30 PM", status:"upcoming" });
    EVENTS.push({ id:id++, type:"reservation", company:"Acme Corp", host:"Elena Ruiz", date:d, time:"1:00 PM", party:4, table:"T3", status:"upcoming" });
    var lc=["Google Inc.","Microsoft HQ","TechNova","Beacon Financial","Harbor Health","Northline Labs"];
    var lt=["10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM"];
    for (var m=0;m<12;m++) EVENTS.push({ id:id++, type:"live", company:lc[m%lc.length], date:d, time:lt[m%lt.length], headcount:80+m*10, location:"Boston Office", menu:LK_MENU, status:"upcoming" });
  })();
  var COMPANIES = (function(){ var s={},a=[]; EVENTS.forEach(function(e){ if(!s[e.company]){s[e.company]=1;a.push(e.company);} }); return a.sort(); })();

  // ---- date helpers (browser Date is fine here) ----
  var DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  var DOWF = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var MONF = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  function ymd(d){ return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2); }
  function parseD(s){ var p=s.split("-"); return new Date(+p[0],+p[1]-1,+p[2]); }
  function addDays(d,n){ var x=new Date(d); x.setDate(x.getDate()+n); return x; }
  function sameDay(a,b){ return ymd(a)===ymd(b); }
  function startOfWeek(d){ var day=d.getDay(); return addDays(d, -((day+6)%7)); }  /* Monday start */
  var MONTH_DOW = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  function longDate(d){ return DOWF[d.getDay()]+", "+MONF[d.getMonth()]+" "+d.getDate(); }

  // ---- state ----
  var state = {
    view: "month",
    cursor: new Date(REF_TODAY),
    filters: { types:{order:true,menu:true,live:true,reservation:true}, status:{upcoming:true,completed:true,cancelled:true}, corps:{} }, // corps empty = all
    selId: null
  };
  function anyCorp(){ for (var k in state.filters.corps) if (state.filters.corps[k]) return true; return false; }
  function passes(e){
    if (e.type==="menu") return false;               /* Menu Availability not shown on calendar (per design) */
    if (!state.filters.types[e.type]) return false;
    if (!state.filters.status[e.status]) return false;
    if (anyCorp() && !state.filters.corps[e.company]) return false;
    return true;
  }
  function eventsOn(dateStr){ return EVENTS.filter(function(e){ return e.date===dateStr && passes(e); }); }
  function byId(id){ for (var i=0;i<EVENTS.length;i++) if (EVENTS[i].id===id) return EVENTS[i]; return null; }
  function activeFilterCount(){
    var n=0;
    ["order","menu","live","reservation"].forEach(function(t){ if(!state.filters.types[t]) n++; });
    ["upcoming","completed","cancelled"].forEach(function(s){ if(!state.filters.status[s]) n++; });
    if (anyCorp()) n++;
    return n;
  }

  // ---- period label + nav ----
  function periodLabel(){
    var c=state.cursor;
    if (state.view==="month") return MONF[c.getMonth()]+" "+c.getFullYear();
    if (state.view==="week"){ var s=startOfWeek(c), e=addDays(s,6);
      if (s.getMonth()===e.getMonth()) return MONF[s.getMonth()]+" "+s.getDate()+"–"+e.getDate()+", "+s.getFullYear();
      return MON[s.getMonth()]+" "+s.getDate()+" – "+MON[e.getMonth()]+" "+e.getDate()+", "+e.getFullYear();
    }
    return "Upcoming schedule";
  }
  function navBy(dir){
    var c=state.cursor;
    if (state.view==="month") state.cursor=new Date(c.getFullYear(), c.getMonth()+dir, 1);
    else if (state.view==="week") state.cursor=addDays(c, dir*7);
    else state.cursor=new Date(c.getFullYear(), c.getMonth()+dir, 1);
    render();
  }

  // ---- month chip / full card ----
  function chip(e){
    var t=TYPE[e.type];
    var right = e.time ? esc(e.time) : (e.type==="reservation" ? (e.party+"p") : "");
    return '<div class="cev cev-'+t.cls+(e.status==="cancelled"?" cancelled":"")+'" data-ev="'+e.id+'">'
      + '<img class="cev-av" src="assets/figma/avatar-acme.png" alt="">'
      + '<span class="ct">'+esc(e.company)+'</span><span class="cx">'+right+'</span></div>';
  }
  function fullCard(e){
    var t=TYPE[e.type], d=parseD(e.date);
    var rows="";
    if (e.type==="order"){
      rows = row(I.orders,'<b>'+e.orders+'</b> <span class="rl">orders expected</span>')
           + row(I.clock,'Delivery <b>'+esc(e.time)+'</b>');
    } else if (e.type==="menu"){
      rows = row(I.check,'<b>Menu open</b> for ordering')
           + row(I.users,'<b>'+e.expected+'</b> <span class="rl">employees expected</span>');
    } else if (e.type==="live"){
      rows = row(I.clock,'<b>'+esc(e.time)+'</b>')
           + row(I.users,'<b>'+e.headcount+'</b> <span class="rl">headcount</span>')
           + row(I.pin,esc(e.location));
    } else {
      rows = row(I.user,'Host <b>'+esc(e.host)+'</b>')
           + row(I.users,'<b>'+e.party+'</b> <span class="rl">guests</span>')
           + row(I.clock,'<b>'+esc(e.time)+'</b>')
           + row(I.table, e.table&&e.table!=="—" ? 'Table <b>'+esc(e.table)+'</b>' : '<span class="rl">Table unassigned</span>');
    }
    var label = e.type==="live" ? '🔥 '+t.label : (e.type==="reservation" ? '🍽 '+t.label : t.label);
    return '<div class="ccard '+t.cls+(e.status==="cancelled"?" cancelled":"")+'" data-ev="'+e.id+'">'
      + '<span class="ccard-type">'+label+'</span>'
      + '<div class="ccard-co">'+esc(e.company)+'</div>'
      + '<div class="ccard-date">'+DOWF[d.getDay()]+', '+MONF[d.getMonth()]+' '+d.getDate()+'</div>'
      + '<div class="ccard-rows">'+rows
        + '<div class="ccard-row" style="border:0;padding:0;margin-top:2px"><span class="ccard-status st-'+e.status+'">'+STATUS_LABEL[e.status]+'</span></div>'
      + '</div></div>';
  }
  function row(icon,html){ return '<div class="ccard-row">'+svgP(icon)+'<span>'+html+'</span></div>'; }

  // ---- views ----
  function renderMonth(){
    var c=state.cursor, first=new Date(c.getFullYear(), c.getMonth(), 1);
    var start=startOfWeek(first);
    var head='<div class="cal-dow">'+MONTH_DOW.map(function(d){return '<div>'+d+'</div>';}).join("")+'</div>';
    var cells="", total=0;
    for (var i=0;i<42;i++){
      var day=addDays(start,i), inMonth=day.getMonth()===c.getMonth(), ds=ymd(day);
      var evs=eventsOn(ds); total+=evs.length;
      var content = evs.length===0 ? "" : (evs.length<=3 ? evs.map(chip).join("") : daySummary(evs));
      var dc = evs.length ? ' data-daycell="'+ds+'"' : '';
      cells += '<div class="cal-cell'+(inMonth?"":" oom")+(sameDay(day,REF_TODAY)?" today":"")+(evs.length?" has-ev":"")+'"'+dc+'>'
        + '<div class="cal-daynum">'+day.getDate()+'</div>'+content+'</div>';
    }
    return '<div class="cal-month">'+head+'<div class="cal-grid">'+cells+'</div></div>';
  }
  // compact workload summary for a dense day (colored count pills)
  function daySummary(evs){
    var counts={order:0,live:0,reservation:0,menu:0};
    evs.forEach(function(e){ counts[e.type]++; });
    var pills = ["order","live","reservation","menu"].filter(function(t){return counts[t];})
      .map(function(t){ return '<span class="cev-cnt '+t+'"><i></i>'+counts[t]+'</span>'; }).join("");
    return '<div class="cev-day"><div class="cev-day-pills">'+pills+'</div><div class="cev-day-total">'+evs.length+' events · view day</div></div>';
  }
  function renderWeek(){
    var start=startOfWeek(state.cursor), cols="", total=0;
    for (var i=0;i<7;i++){
      var day=addDays(start,i), evs=eventsOn(ymd(day)); total+=evs.length;
      var body = evs.length ? evs.map(fullCard).join("") : '<div class="cal-wempty">No events</div>';
      cols += '<div class="cal-wcol'+(sameDay(day,REF_TODAY)?" today":"")+'">'
        + '<div class="cal-wh"><div class="dn">'+DOW[day.getDay()]+'</div><div class="dd">'+day.getDate()+'</div></div>'
        + '<div class="cal-wbody">'+body+'</div></div>';
    }
    return total ? '<div class="cal-week">'+cols+'</div>' : emptyState();
  }
  function renderAgenda(){
    var list = EVENTS.filter(passes).slice().sort(function(a,b){ return a.date<b.date?-1:(a.date>b.date?1:0); });
    if (!list.length) return emptyState();
    var byDate={}, order=[];
    list.forEach(function(e){ if(!byDate[e.date]){byDate[e.date]=[];order.push(e.date);} byDate[e.date].push(e); });
    return '<div class="cal-agenda">'+order.map(function(ds){
      var d=parseD(ds), isT=sameDay(d,REF_TODAY);
      return '<div class="cal-agr"><div class="cal-agr-h">'
        + '<span class="adate">'+MONF[d.getMonth()]+' '+d.getDate()+'</span><span class="aday">'+DOWF[d.getDay()]+'</span>'
        + (isT?'<span class="atoday">Today</span>':'')+'<span class="aline"></span></div>'
        + '<div class="cal-agr-body">'+byDate[ds].map(fullCard).join("")+'</div></div>';
    }).join("")+'</div>';
  }
  function emptyState(){
    return '<div class="cal-empty"><div class="ei">'+svgP(I.cal)+'</div>'
      + '<h3>No upcoming events</h3><p>Your scheduled corporate orders and Live Kitchen events will appear here.</p></div>';
  }

  // ---- drawer ----
  function openDrawer(id, fromDay){
    var e=byId(id); if(!e) return; state.selId=id;
    var t=TYPE[e.type], d=parseD(e.date);
    var typeLabel = e.type==="live" ? '🔥 Live Kitchen Event' : (e.type==="reservation" ? '🍽 Reservation' : t.label);
    var sub = e.type==="order" ? (e.orders+" orders · delivery "+e.time)
            : e.type==="menu" ? ("Menu open · "+e.expected+" employees expected")
            : e.type==="live" ? (e.time+" · "+e.headcount+" headcount")
            : ("Party of "+e.party+" · "+e.time);
    var pillCls = e.status==="upcoming"?"st-upcoming":e.status==="completed"?"st-completed":"st-cancelled";

    var rows="";
    function dr(icon,label,val){ return '<div class="dw-row"><div class="di">'+svgP(icon)+'</div><div><div class="dl">'+label+'</div><div class="dv">'+val+'</div></div></div>'; }
    rows += dr(I.store,"Corporation", esc(e.company));
    rows += dr(I.cal,"Date", DOWF[d.getDay()]+", "+MONF[d.getMonth()]+" "+d.getDate()+", "+d.getFullYear());
    if (e.type==="order"){
      rows += dr(I.clock,"Delivery time", esc(e.time));
      rows += dr(I.orders,"Number of orders", '<b>'+e.orders+'</b> orders');
    } else if (e.type==="menu"){
      rows += dr(I.check,"Menu status", "Open for ordering");
      rows += dr(I.users,"Expected orders", e.expected+" employees");
    } else if (e.type==="live"){
      rows += dr(I.clock,"Event time", esc(e.time));
      rows += dr(I.pin,"Location", esc(e.location));
      rows += dr(I.users,"Expected headcount", e.headcount+" employees");
    } else {
      rows += dr(I.user,"Host", esc(e.host));
      rows += dr(I.clock,"Reservation time", esc(e.time));
      rows += dr(I.users,"Party size", '<b>'+e.party+'</b> guests');
      rows += dr(I.table,"Table", (e.table&&e.table!=="—") ? esc(e.table) : "Not yet assigned");
    }
    rows += '<div class="dw-row"><div class="di">'+svgP(I.check)+'</div><div><div class="dl">Status</div>'
         + '<span class="dw-status-pill '+pillCls+'">'+STATUS_LABEL[e.status]+'</span></div></div>';

    var menuSec="";
    if (e.type==="order"){
      // per-employee order overview
      var emps = sampleEmployees(e), more = e.orders - emps.length;
      var erows = emps.map(function(p){
        var avatar = p.name.split(" ").map(function(x){return x.charAt(0);}).join("").slice(0,2);
        var mod = p.mod ? '<span class="dw-emp-mod">'+esc(p.mod)+'</span>' : '';
        return '<div class="dw-emp"><span class="dw-emp-av">'+esc(avatar)+'</span>'
          + '<span class="dw-emp-n">'+esc(p.name)+'</span>'
          + '<span class="dw-emp-i">'+esc(p.item)+mod+'</span></div>';
      }).join("");
      menuSec = '<div class="dw-sec-h">Employee orders <span class="dw-count">'+e.orders+' total</span></div>'
        + '<div class="dw-emps">'+erows+'</div>'
        + (more>0 ? '<div class="dw-more">+'+more+' more employees — <b>View orders</b> for the full breakdown</div>'
                  : '<div class="dw-more">Open <b>View orders</b> for the full order detail</div>');
    } else {
      var items = itemsFor(e);
      if (items && items.length){
        var secTitle = e.type==="live" ? "Menu details" : e.type==="menu" ? "Available menu items" : "";
        if (secTitle){
          menuSec = '<div class="dw-sec-h">'+secTitle+'</div><div class="dw-menu">'
            + items.map(function(m){ return '<span class="dw-mchip">'+esc(m)+'</span>'; }).join("")+'</div>';
        }
      }
    }

    // actions
    var foot;
    if (e.type==="live"){
      foot = '<div class="dw-foot-row"><button class="btn primary" data-viewevent>'+svgP(I.arrow)+'View event</button>'
           + '<button class="btn" data-contact>'+svgP(I.phone)+'Contact OG</button></div>'
           + (e.status==="upcoming" ? '<button class="btn danger" data-cancel>Request cancellation</button>' : '');
    } else if (e.type==="reservation"){
      foot = '<button class="btn primary" data-viewresv>'+svgP(I.resv)+'View reservation</button>'
           + (e.status==="upcoming" ? '<div class="dw-foot-row"><button class="btn" data-contact>'+svgP(I.phone)+'Contact host</button><button class="btn danger" data-cancel>Cancel reservation</button></div>' : '');
    } else {
      foot = '<button class="btn primary" data-vieworders>'+svgP(I.orders)+'View orders</button>'
           + (e.status==="upcoming" ? '<div class="dw-foot-row"><button class="btn" data-contact>'+svgP(I.phone)+'Contact OG</button><button class="btn danger" data-cancel>Request cancellation</button></div>' : '');
    }

    var back = fromDay ? '<button class="dw-back" id="dwBack">'+svgP('<path d="M15 18l-6-6 6-6"/>')+MON[parseD(fromDay).getMonth()]+' '+parseD(fromDay).getDate()+'</button>' : '';
    $("#drawer").innerHTML = '<div class="dw-hero '+t.cls+(back?" has-back":"")+'"><button class="dw-close" id="dwClose" aria-label="Close">×</button>'+back
      + '<span class="dw-type">'+typeLabel+'</span><div class="dw-co">'+esc(e.company)+'</div><div class="dw-sub">'+esc(sub)+'</div></div>'
      + '<div class="dw-body"><div class="dw-rows">'+rows+'</div>'+menuSec+'</div>'
      + '<div class="dw-foot">'+foot+'</div>';

    $("#drawer").classList.add("on"); $("#drawer").setAttribute("aria-hidden","false"); $("#drawerOv").classList.add("on");
    $("#dwClose").onclick=closeDrawer;
    if (fromDay){ var bb=$("#dwBack"); if(bb) bb.onclick=function(){ openDay(fromDay); }; }
    wireDrawer(e);
  }

  // ---- day drawer (dense day → grouped overview) ----
  function dayRow(e){
    var t=TYPE[e.type];
    var title = e.type==="reservation" ? esc(e.host)+' · '+esc(e.company) : esc(e.company);
    var sub = e.type==="reservation" ? ('Party of '+e.party+(e.table&&e.table!=="—"?' · Table '+esc(e.table):' · unassigned'))
            : e.type==="live" ? ('Live Kitchen · '+esc(e.location))
            : e.type==="menu" ? ('Menu open · '+e.expected+' expected')
            : ('Delivery '+esc(e.time));
    var right = e.type==="order" ? (e.orders+' orders') : esc(e.time || (e.expected+'p'));
    return '<div class="dw-drow '+t.cls+'" data-open="'+e.id+'"><span class="dw-drow-dot"></span>'
      + '<div class="dw-drow-main"><div class="dw-drow-t">'+title+'</div><div class="dw-drow-s">'+sub+'</div></div>'
      + '<div class="dw-drow-r">'+right+'</div></div>';
  }
  function openDay(ds){
    var d=parseD(ds), evs=EVENTS.filter(function(e){ return e.date===ds && passes(e); });
    if (!evs.length) return;
    var counts={order:0,live:0,reservation:0,menu:0}; evs.forEach(function(e){ counts[e.type]++; });
    var GROUPS=[["order","Corporate Orders"],["live","Live Kitchen"],["reservation","Reservations"],["menu","Menu Availability"]];
    var summary = GROUPS.filter(function(x){return counts[x[0]];})
      .map(function(x){ return '<span class="dw-daycount '+x[0]+'"><b>'+counts[x[0]]+'</b> '+x[1]+'</span>'; }).join("");
    var groups = GROUPS.map(function(x){
      var g=evs.filter(function(e){return e.type===x[0];});
      if (!g.length) return "";
      return '<div class="dw-sec-h">'+x[1]+' <span class="dw-count">'+g.length+'</span></div><div class="dw-drows">'+g.map(dayRow).join("")+'</div>';
    }).join("");
    $("#drawer").innerHTML = '<div class="dw-hero day"><button class="dw-close" id="dwClose" aria-label="Close">×</button>'
      + '<span class="dw-type">'+DOWF[d.getDay()]+'</span><div class="dw-co">'+MONF[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear()+'</div>'
      + '<div class="dw-sub">'+evs.length+' events scheduled</div></div>'
      + '<div class="dw-body"><div class="dw-daysummary">'+summary+'</div>'+groups+'</div>';
    $("#drawer").classList.add("on"); $("#drawer").setAttribute("aria-hidden","false"); $("#drawerOv").classList.add("on");
    $("#dwClose").onclick=closeDrawer;
    Array.prototype.forEach.call($("#drawer").querySelectorAll("[data-open]"),function(el){ el.onclick=function(){ openDrawer(+el.getAttribute("data-open"), ds); }; });
  }
  function closeDrawer(){ $("#drawer").classList.remove("on"); $("#drawer").setAttribute("aria-hidden","true"); $("#drawerOv").classList.remove("on"); state.selId=null; }
  function wireDrawer(e){
    var d;
    if ((d=$("#drawer").querySelector("[data-vieworders]"))) d.onclick=function(){ location.href = "order-detail.html?company="+encodeURIComponent(e.company); };
    if ((d=$("#drawer").querySelector("[data-viewevent]"))) d.onclick=function(){ location.href="live.html"; };
    if ((d=$("#drawer").querySelector("[data-viewresv]"))) d.onclick=function(){ location.href="reservations.html"; };
    if ((d=$("#drawer").querySelector("[data-contact]"))) d.onclick=function(){ toast(e.type==="reservation" ? ("Contacting "+e.host) : "Messaging your Office Grubb coordinator"); };
    if ((d=$("#drawer").querySelector("[data-cancel]"))) d.onclick=function(){ toast(e.type==="reservation" ? ("Reservation for "+e.host+" cancelled") : ("Cancellation request sent to Office Grubb for "+e.company)); };
  }

  // ---- filters ----
  function renderFilters(){
    var types=[["order","Order"],["reservation","Reservation"],["live","Live Kitchen"]];
    $("#fTypes").innerHTML = '<div class="cf-chip'+(allTypes()?" on":"")+'" data-tall>All</div>'
      + types.map(function(t){ return '<div class="cf-chip'+(state.filters.types[t[0]]?" on":"")+'" data-type="'+t[0]+'">'+t[1]+'</div>'; }).join("");
    var st=[["upcoming","Upcoming"],["completed","Completed"],["cancelled","Cancelled"]];
    $("#fStatus").innerHTML = st.map(function(s){ return '<div class="cf-chip'+(state.filters.status[s[0]]?" on":"")+'" data-status="'+s[0]+'">'+s[1]+'</div>'; }).join("");
    renderCorps("");
    // wire
    Array.prototype.forEach.call($("#fTypes").querySelectorAll("[data-type]"),function(el){ el.onclick=function(){ var k=el.getAttribute("data-type"); state.filters.types[k]=!state.filters.types[k]; renderFilters(); render(); }; });
    $("#fTypes").querySelector("[data-tall]").onclick=function(){ var v=!allTypes(); state.filters.types={order:v,menu:v,live:v,reservation:v}; renderFilters(); render(); };
    Array.prototype.forEach.call($("#fStatus").querySelectorAll("[data-status]"),function(el){ el.onclick=function(){ var k=el.getAttribute("data-status"); state.filters.status[k]=!state.filters.status[k]; renderFilters(); render(); }; });
  }
  function allTypes(){ return state.filters.types.order&&state.filters.types.menu&&state.filters.types.live&&state.filters.types.reservation; }
  function renderCorps(q){
    q=(q||"").toLowerCase();
    $("#fCorps").innerHTML = COMPANIES.filter(function(c){ return c.toLowerCase().indexOf(q)>=0; }).map(function(c){
      return '<div class="cf-corp'+(state.filters.corps[c]?" on":"")+'" data-corp="'+esc(c)+'"><span class="cbx">'+svgP(I.check)+'</span>'+esc(c)+'</div>';
    }).join("");
    Array.prototype.forEach.call($("#fCorps").querySelectorAll("[data-corp]"),function(el){ el.onclick=function(){ var c=el.getAttribute("data-corp"); state.filters.corps[c]=!state.filters.corps[c]; if(!state.filters.corps[c]) delete state.filters.corps[c]; renderCorps($("#fCorpSearch").value); render(); }; });
  }

  // ---- render ----
  function render(){
    $("#period").textContent = periodLabel();
    var html = state.view==="month" ? renderMonth() : state.view==="week" ? renderWeek() : renderAgenda();
    $("#body").innerHTML = html;
    // wire event clicks
    Array.prototype.forEach.call($("#body").querySelectorAll("[data-ev]"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); openDrawer(+el.getAttribute("data-ev")); }; });
    Array.prototype.forEach.call($("#body").querySelectorAll("[data-daycell]"),function(el){ el.onclick=function(ev){ if(ev.target.closest("[data-ev]")) return; openDay(el.getAttribute("data-daycell")); }; });
    // filter count
    var n=activeFilterCount(); var fc=$("#fcount"); if(n){ fc.hidden=false; fc.textContent=n; } else fc.hidden=true;
  }
  function setView(){
    Array.prototype.forEach.call($("#views").children,function(b){ b.classList.toggle("on", b.getAttribute("data-v")===state.view); });
    render();
  }

  // ---- events ----
  Array.prototype.forEach.call($("#views").children,function(b){ b.onclick=function(){ state.view=b.getAttribute("data-v"); setView(); }; });
  $("#prevBtn").onclick=function(){ navBy(-1); };
  $("#nextBtn").onclick=function(){ navBy(1); };
  $("#todayBtn").onclick=function(){ state.cursor=new Date(REF_TODAY); render(); };
  $("#filtersBtn").onclick=function(e){ e.stopPropagation(); $("#filters").classList.toggle("on"); };
  $("#fClear").onclick=function(){ state.filters={types:{order:true,menu:true,live:true,reservation:true},status:{upcoming:true,completed:true,cancelled:true},corps:{}}; $("#fCorpSearch").value=""; renderFilters(); render(); };
  $("#fCorpSearch").addEventListener("input",function(){ renderCorps(this.value); });
  document.addEventListener("click",function(e){ if(!$("#filters").contains(e.target) && e.target!==$("#filtersBtn") && !$("#filtersBtn").contains(e.target)) $("#filters").classList.remove("on"); });
  $("#drawerOv").onclick=closeDrawer;
  document.addEventListener("keydown",function(e){ if(e.key==="Escape"){ closeDrawer(); $("#filters").classList.remove("on"); } });
  var _tb=$("#themeBtn"); if(_tb) _tb.onclick=function(){};

  var toastT;
  function toast(msg){ var t=$("#toast"); $("#toastMsg").textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(function(){t.classList.remove("show");},2400); }

  renderFilters();
  render();
})();
