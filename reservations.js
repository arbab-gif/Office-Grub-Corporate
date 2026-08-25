// Office Grubb — Reservations management (restaurant side)
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s){ return String(s).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];}); }
  function initials(n){ return n.split(" ").map(function(w){return w[0];}).join(""); }
  var AV = ["#E4611A","#6A48A6","#245E86","#1F7A47","#B4362A","#0E7C7C"];

  // reservation fee per spec: groups 1–4 → $10, groups 5+ → $15–20 (we use $18)
  function feeFor(size){ return size <= 4 ? 10 : 18; }
  function feeTier(size){ return size <= 4 ? "Groups of 1–4" : "Groups of 5 or more"; }
  // deposit (held from employee) for groups of 3+ : $25–50 (we use $35 / $50 for large)
  function depositFor(size){ return size < 3 ? 0 : (size >= 8 ? 50 : 35); }

  var STATUS = {
    New:       { label:"New request",  cls:"rs-new" },
    Accepted:  { label:"Accepted",     cls:"rs-accepted" },
    Attended:  { label:"Attended",     cls:"rs-attended" },
    Blocked:   { label:"Blocked",      cls:"rs-blocked" },
    "No-show": { label:"No-show",      cls:"rs-noshow" },
    Cancelled: { label:"Cancelled",    cls:"rs-cancelled" }
  };
  var TABS = ["All","New","Accepted","Attended","Blocked","Cancelled"];

  function guests(names, yes, no, maybe){
    var g = [];
    names.forEach(function(n, i){ g.push({ name:n, rsvp: i<yes?"yes":(i<yes+no?"no":(i<yes+no+maybe?"maybe":"pending")) }); });
    return g;
  }

  var reservations = [
    { id:"RSV-2041", host:"Sarah Lee", company:"Acme Corp", size:6, when:"Today", time:"12:30 PM", status:"New",
      invited:["Sarah Lee","Mike Ross","Ava Chen","Tom Alvarez","Nina Patel","Ben Torres"], yes:5, no:1, maybe:0,
      note:"Window table if possible — client lunch." },
    { id:"RSV-2030", host:"James Wu", company:"Acme Corp", size:4, when:"Today", time:"12:00 PM", status:"New",
      invited:["James Wu","Sofia Rossi","Daniel Cho","Maya Singh"], yes:4, no:0, maybe:0, note:"" },
    { id:"RSV-2038", host:"Mike Ross", company:"Northline Labs", size:2, when:"Today", time:"1:00 PM", status:"Accepted",
      invited:["Mike Ross","Priya Nair"], yes:2, no:0, maybe:0, note:"", table:"B1" },
    { id:"RSV-2035", host:"Priya Nair", company:"Vantage Group", size:8, when:"Today", time:"6:30 PM", status:"Accepted",
      invited:["Priya Nair","Grace Liu","Omar Haddad","Lena Ortiz","Ethan Brooks","Chloe Martin","Ryan Cole","Isabel Garcia"], yes:7, no:0, maybe:1,
      note:"Birthday — bringing a cake, need space for candles.", table:"P2" },
    { id:"RSV-2025", host:"Emily Johnson", company:"Bright Digital", size:3, when:"Tomorrow", time:"12:15 PM", status:"Accepted",
      invited:["Emily Johnson","Noah Bennett","Zoe Adams"], yes:2, no:0, maybe:1, note:"One vegetarian." },
    { id:"RSV-2012", host:"Grace Liu", company:"Vantage Group", size:10, when:"Fri, Jul 12", time:"7:00 PM", status:"New",
      invited:["Grace Liu","Liam Foster","Hana Sato","Owen Reid","Mia Flores","Leo Park","Ivy Chen","Jack Ryan","Nora Hale","Sam Ito"], yes:8, no:1, maybe:1,
      note:"Client dinner — will need a private area if available." },
    { id:"RSV-2019", host:"Tom Alvarez", company:"Northline Labs", size:2, when:"Today", time:"11:45 AM", status:"Attended",
      invited:["Tom Alvarez","Rachel Kim"], yes:2, no:0, maybe:0, note:"" },
    { id:"RSV-2008", host:"Ben Torres", company:"Acme Corp", size:5, when:"Yesterday", time:"1:00 PM", status:"No-show",
      invited:["Ben Torres","Marcus Webb","Carlos Diaz","Nina Patel","Ava Chen"], yes:5, no:0, maybe:0, note:"" },
    { id:"RSV-2001", host:"Ava Chen", company:"Bright Digital", size:2, when:"Yesterday", time:"12:30 PM", status:"Cancelled",
      invited:["Ava Chen","David Wilson"], yes:1, no:1, maybe:0, note:"",
      cancelReason:"Requested by the guest", cancelBy:"Guest", cancelNote:"Cancelled 40 hrs before — outside the 36-hour window." }
  ];
  reservations.forEach(function(r, i){ r.color = AV[i % AV.length]; });

  var filter = "All", query = "", selectedId = reservations[0].id;
  var view = "cards", sortKey = "time", sortDir = 1;

  function stats(){
    var today = reservations.filter(function(r){ return r.when==="Today" && r.status!=="Cancelled"; });
    var covers = today.reduce(function(s,r){ return s + r.size; }, 0);
    var pending = reservations.filter(function(r){ return r.status==="New"; }).length;
    var attended = reservations.filter(function(r){ return r.status==="Attended"; });
    var fees = attended.reduce(function(s,r){ return s + feeFor(r.size); }, 0);
    $("#stToday").textContent = today.length;
    $("#stCovers").textContent = covers + " covers";
    $("#stPending").textContent = pending;
    $("#stAttended").textContent = attended.length;
    $("#stFees").textContent = "$" + fees.toFixed(2);
  }

  function renderTabs(){
    $("#tabs").innerHTML = TABS.map(function(t){
      var cnt = t==="All" ? reservations.length : reservations.filter(function(r){return r.status===t;}).length;
      return '<div class="res-tab'+(filter===t?' on':'')+'" data-t="'+t+'">'+t+' <span class="cnt tnum">'+cnt+'</span></div>';
    }).join("");
    Array.prototype.forEach.call($("#tabs").children, function(el){ el.onclick = function(){ filter = el.getAttribute("data-t"); render(); }; });
  }

  function svgP(p){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'+p+'</svg>'; }

  function visibleList(){
    var q = query.trim().toLowerCase();
    return reservations.filter(function(r){
      if (filter!=="All" && r.status!==filter) return false;
      if (q && (r.host+" "+r.company).toLowerCase().indexOf(q)<0) return false;
      return true;
    });
  }
  // sorting (table view)
  var STATUS_ORDER = ["New","Accepted","Attended","Blocked","No-show","Cancelled"];
  function whenIdx(w){ return w==="Yesterday"?-1 : w==="Today"?0 : w==="Tomorrow"?1 : 2; }
  function timeMins(t){ var m=t.match(/(\d+):(\d+)\s*(AM|PM)/); if(!m) return 0; var h=(+m[1])%12+(m[3]==="PM"?12:0); return h*60+ +m[2]; }
  function timeVal(r){ return whenIdx(r.when)*10000 + timeMins(r.time); }
  function sorted(list){
    var arr = list.slice();
    arr.sort(function(a,b){
      var x, y;
      switch(sortKey){
        case "host": x=a.host.toLowerCase(); y=b.host.toLowerCase(); break;
        case "company": x=a.company.toLowerCase(); y=b.company.toLowerCase(); break;
        case "party": x=a.size; y=b.size; break;
        case "fee": x=feeFor(a.size); y=feeFor(b.size); break;
        case "status": x=STATUS_ORDER.indexOf(a.status); y=STATUS_ORDER.indexOf(b.status); break;
        default: x=timeVal(a); y=timeVal(b);
      }
      if (x<y) return -1*sortDir; if (x>y) return 1*sortDir; return timeVal(a)-timeVal(b);
    });
    return arr;
  }

  function renderList(){ if (view==="table") renderTable(); else renderCards(); }

  function renderCards(){
    var list = visibleList();
    if (!list.length){ $("#list").innerHTML = emptyMsg(); return; }
    $("#list").innerHTML = list.map(function(r){
      var st = STATUS[r.status];
      var fee = feeFor(r.size);
      return '<div class="res-card'+(r.id===selectedId?' sel':'')+'" data-id="'+r.id+'" style="--h:var('+hue(r.status)+')">'
        + '<div class="res-time"><div class="t tnum">'+r.time.replace(" ","")+'</div><div class="d">'+esc(r.when)+'</div></div>'
        + '<div class="res-mid"><div class="host">'+esc(r.host)+'</div><div class="comp">'+esc(r.company)+'</div>'
          + '<div class="row2"><span class="party">'+svgP('<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5"/><path d="M17 8h5"/>')+'Party of '+r.size+'</span>'
          + '<span class="rsvp-mini"><b>'+r.yes+' yes</b> · '+r.no+' no · '+r.maybe+' maybe</span></div></div>'
        + '<div class="res-right"><span class="pill '+st.cls+'"><i></i>'+st.label+'</span><span class="fee">Fee <b>$'+fee+'</b></span></div>'
      + '</div>';
    }).join("");
    Array.prototype.forEach.call($("#list").querySelectorAll(".res-card"), function(c){
      c.onclick = function(){ selectedId = c.getAttribute("data-id"); render(); };
    });
  }
  function emptyMsg(){ return '<div style="padding:40px;text-align:center;color:var(--ink-3);background:var(--surface);border:1px solid var(--border);border-radius:14px">No reservations in this view.</div>'; }

  var COLS = [
    {k:"time",label:"When"},{k:"host",label:"Host"},{k:"company",label:"Company"},
    {k:"party",label:"Party",num:true},{k:null,label:"RSVPs"},{k:"fee",label:"Fee",num:true},{k:"status",label:"Status"}
  ];
  function renderTable(){
    var list = sorted(visibleList());
    var head = COLS.map(function(c){
      if (!c.k) return '<th>'+c.label+'</th>';
      var on = sortKey===c.k;
      return '<th class="sortable'+(c.num?' num':'')+(on?' sorted':'')+'" data-k="'+c.k+'">'+c.label+'<span class="arw">'+(on?(sortDir>0?'▲':'▼'):'▲')+'</span></th>';
    }).join("");
    var body = !list.length ? '<tr><td colspan="7" style="text-align:center;color:var(--ink-3);padding:34px">No reservations in this view.</td></tr>'
      : list.map(function(r){
        var st = STATUS[r.status];
        return '<tr class="'+(r.id===selectedId?'sel':'')+'" data-id="'+r.id+'">'
          + '<td><div style="font-weight:600" class="tnum">'+esc(r.time)+'</div><div style="font-size:11px;color:var(--ink-3)">'+esc(r.when)+'</div></td>'
          + '<td class="rhost">'+esc(r.host)+'</td>'
          + '<td style="color:var(--ink-2)">'+esc(r.company)+'</td>'
          + '<td class="num tnum">'+r.size+'</td>'
          + '<td class="rt-rsvp"><b>'+r.yes+'</b> · '+r.no+' · '+r.maybe+'</td>'
          + '<td class="num tnum" style="font-weight:600">$'+feeFor(r.size)+'</td>'
          + '<td><span class="pill '+st.cls+'"><i></i>'+st.label+'</span></td>'
        + '</tr>';
      }).join("");
    $("#list").innerHTML = '<div class="res-table-wrap"><table class="rt"><thead><tr>'+head+'</tr></thead><tbody>'+body+'</tbody></table></div>';
    Array.prototype.forEach.call($("#list").querySelectorAll("thead th.sortable"), function(th){
      var k = th.getAttribute("data-k");
      th.onclick = function(){ if(sortKey===k){sortDir*=-1;}else{sortKey=k;sortDir=1;} renderTable(); };
    });
    Array.prototype.forEach.call($("#list").querySelectorAll("tbody tr[data-id]"), function(tr){
      tr.onclick = function(){ selectedId = tr.getAttribute("data-id"); render(); };
    });
  }
  function hue(status){ return { New:"--s-new", Accepted:"--s-prep", Attended:"--s-ready", Blocked:"--s-cancel", "No-show":"--s-cancel", Cancelled:"--s-done" }[status]; }

  function renderDetail(){
    var r = reservations.filter(function(x){return x.id===selectedId;})[0];
    if (!r){ $("#detail").innerHTML = '<div class="empty-detail">'+svgP('<path d="M4 5h16v6H4z"/><path d="M4 11c0 5 4 8 8 8s8-3 8-8"/>')+'<div>Select a reservation.</div></div>'; return; }
    var st = STATUS[r.status];
    var fee = feeFor(r.size), dep = depositFor(r.size);
    var g = guests(r.invited, r.yes, r.no, r.maybe);
    var pending = r.size - (r.yes + r.no + r.maybe);

    var guestHtml = g.map(function(gu, i){
      return '<span class="guest"><span class="ga" style="background:'+AV[i%AV.length]+'">'+esc(initials(gu.name))+'</span>'+esc(gu.name.split(" ")[0])+' <span class="gd '+gu.rsvp+'"></span></span>';
    }).join("");

    var depHtml = dep ? '<div class="depchip">'+svgP('<path d="M20 6L9 17l-5-5"/>')+'Employee deposit $'+dep+' held · refundable if cancelled 36h+ before</div>'
      : '<div style="font-size:11.5px;color:var(--ink-3);margin-top:8px">No deposit — parties of 1–2 don\'t require one.</div>';

    var actions;
    if (r.status === "New") {
      actions = '<button class="btn primary block" data-act="accept">Accept booking</button>'
        + '<div class="row"><button class="btn block" data-act="message">Message host</button><button class="btn block danger" data-act="block">Block · at capacity</button></div>'
        + '<button class="btn block danger" data-act="cancel">Cancel booking…</button>';
    } else if (r.status === "Accepted") {
      actions = '<button class="btn primary block" data-act="attended">Confirm attendance</button>'
        + '<div class="row"><button class="btn block" data-act="message">Message host</button><button class="btn block danger" data-act="noshow">Mark no-show</button></div>'
        + '<button class="btn block danger" data-act="cancel">Cancel booking…</button>';
    } else if (r.status === "Attended") {
      actions = '<button class="btn block" disabled>✓ Attended — fee $'+fee+' billed</button>';
    } else {
      actions = '<button class="btn block" disabled>'+st.label+'</button>';
    }

    $("#detail").innerHTML =
      '<div class="rd-head"><div class="rid">'+r.id+'</div><div class="rh">'+esc(r.host)+'</div><div class="rc">'+esc(r.company)+' · host</div><span class="pill '+st.cls+'"><i></i>'+st.label+'</span></div>'
      + '<div class="rd-body">'
        + (r.status==="Cancelled" && r.cancelReason ? cancellationCard(r) : '')
        + '<div class="kv"><span class="kk">Date &amp; time</span><span class="vv">'+esc(r.when)+' · '+esc(r.time)+'</span></div>'
        + '<div class="kv"><span class="kk">Party size</span><span class="vv tnum">'+r.size+' guests</span></div>'
        + '<div class="kv"><span class="kk">Assign table</span><span class="vv">'+assignControl(r)+'</span></div>'
        + '<div class="divider"></div>'
        + '<div><div class="eyebrow" style="margin-bottom:2px">RSVPs</div><div class="rsvp-bars">'
          + '<div class="rsvp-chip yes"><div class="n tnum">'+r.yes+'</div><div class="l">Yes</div></div>'
          + '<div class="rsvp-chip no"><div class="n tnum">'+r.no+'</div><div class="l">No</div></div>'
          + '<div class="rsvp-chip maybe"><div class="n tnum">'+r.maybe+'</div><div class="l">Maybe</div></div>'
          + '</div>'
          + (pending>0?'<div style="font-size:11px;color:var(--ink-3);margin-bottom:8px">'+pending+' not yet responded</div>':'')
          + '<div class="guests">'+guestHtml+'</div></div>'
        + '<div class="divider"></div>'
        + '<div><div class="eyebrow" style="margin-bottom:8px">Restaurant fee</div>'
          + '<div class="feecard"><div class="fee-top"><span style="font-size:12.5px;color:var(--ink-2)">'+feeTier(r.size)+'</span><span class="fee-amt">$'+fee+'</span></div>'
          + '<div class="fee-rule">Flat per-confirmed-reservation fee (not percentage-based). Charged <b>only after you confirm the party attended</b> — billed Net&nbsp;30.</div>'
          + depHtml + '</div></div>'
        + (r.note ? '<div><div class="eyebrow" style="margin-bottom:7px">Host note</div><div class="notecard">'+esc(r.note)+'</div></div>' : '')
      + '</div>'
      + '<div class="rd-actions">'+actions+'</div>';

    Array.prototype.forEach.call($("#detail").querySelectorAll("[data-act]"), function(b){
      b.onclick = function(){ doAction(r, b.getAttribute("data-act")); };
    });
  }

  function doAction(r, act){
    if (act==="accept"){ r.status="Accepted"; toast("Reservation "+r.id+" accepted — host notified"); }
    else if (act==="block"){ r.status="Blocked"; toast("Reservation "+r.id+" blocked — slot at capacity"); }
    else if (act==="attended"){ r.status="Attended"; toast("Attendance confirmed — $"+feeFor(r.size)+" fee billed (Net 30)"); }
    else if (act==="noshow"){ r.status="No-show"; toast("Marked as no-show"); }
    else if (act==="message"){ toast("Opening message to "+r.host); return; }
    else if (act==="cancel"){ openCancel(r); return; }
    else if (act==="assigntable"){ openTablePicker(r); return; }
    render();
  }

  function cancellationCard(r){
    var dep = depositFor(r.size);
    return '<div class="cxcard"><div class="cx-h">'+svgP('<circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/>')+'Cancellation</div>'
      + '<div class="cx-row"><span class="k">Reason</span><span class="v">'+esc(r.cancelReason)+'</span></div>'
      + '<div class="cx-row"><span class="k">Cancelled by</span><span class="v">'+esc(r.cancelBy||"Restaurant")+'</span></div>'
      + '<div class="cx-row"><span class="k">Deposit</span><span class="v">'+(dep?('$'+dep+' refunded'):'None')+'</span></div>'
      + (r.cancelNote?'<div class="cx-note">“'+esc(r.cancelNote)+'”</div>':'')
      + '</div>';
  }

  // ---- cancel-with-reason modal ----
  var CX_REASONS = ["Fully booked / at capacity","Kitchen closure or emergency","Requested by the guest","Duplicate booking","Health or safety issue","Other reason"];
  var cxTarget = null, cxReason = null;
  function renderCxReasons(){
    $("#cxReasons").innerHTML = CX_REASONS.map(function(rr){
      return '<div class="cx-opt'+(cxReason===rr?" on":"")+'" data-r="'+esc(rr)+'"><span class="radio"></span>'+esc(rr)+'</div>';
    }).join("");
    Array.prototype.forEach.call($("#cxReasons").children, function(el){
      el.onclick = function(){ cxReason = el.getAttribute("data-r"); renderCxReasons(); updateNoteReq(); };
    });
    updateNoteReq();
  }
  function updateNoteReq(){ $("#cxNoteLabel").innerHTML = (cxReason==="Other reason") ? 'Note to host <span class="req">*required</span>' : 'Note to host (optional)'; }
  function openCancel(r){
    cxTarget = r.id; cxReason = null;
    $("#cxTitle").textContent = "Cancel reservation " + r.id;
    $("#cxNote").value = "";
    renderCxReasons();
    var dep = depositFor(r.size), d = $("#cxDep");
    d.className = "cx-dep" + (dep ? "" : " none");
    d.innerHTML = dep
      ? svgP('<path d="M20 6L9 17l-5-5"/>')+'<span>The host\'s <b>$'+dep+' deposit</b> will be fully refunded — a restaurant-initiated cancellation is always refunded, regardless of the 36-hour rule.</span>'
      : svgP('<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>')+'<span>No deposit on this reservation (party of 1–2).</span>';
    $("#cxNotify").classList.add("on");
    $("#cxModal").classList.add("show");
  }
  function closeCancel(){ $("#cxModal").classList.remove("show"); }
  function confirmCancel(){
    if (!cxReason){ toast("Choose a cancellation reason"); return; }
    var note = $("#cxNote").value.trim();
    if (cxReason==="Other reason" && !note){ toast("Add a note for “Other reason”"); $("#cxNote").focus(); return; }
    var r = reservations.filter(function(x){return x.id===cxTarget;})[0]; if (!r) return;
    r.status = "Cancelled"; r.cancelReason = cxReason; r.cancelNote = note; r.cancelBy = "Restaurant";
    var notified = $("#cxNotify").classList.contains("on");
    var dep = depositFor(r.size);
    closeCancel();
    toast("Reservation "+r.id+" cancelled" + (notified?" — host notified":"") + (dep?" · $"+dep+" refunded":""));
    render();
  }
  $("#cxClose").onclick = closeCancel;
  $("#cxKeep").onclick = closeCancel;
  $("#cxConfirm").onclick = confirmCancel;
  $("#cxNotify").onclick = function(){ $("#cxNotify").classList.toggle("on"); };
  $("#cxModal").onclick = function(e){ if (e.target===$("#cxModal")) closeCancel(); };

  // ---- table assignment ----
  var TABLES = [
    { id:"T1", area:"Main floor", seats:2 }, { id:"T2", area:"Main floor", seats:4 }, { id:"T3", area:"Main floor", seats:4 }, { id:"T4", area:"Main floor", seats:6 },
    { id:"W1", area:"Window", seats:2 }, { id:"W2", area:"Window", seats:4 }, { id:"W3", area:"Window", seats:6 },
    { id:"P1", area:"Patio", seats:4 }, { id:"P2", area:"Patio", seats:8 },
    { id:"B1", area:"Bar", seats:2 }, { id:"B2", area:"Bar", seats:2 }
  ];
  var OCCUPIED = ["T2"]; // walk-ins / already seated, independent of Office Grubb bookings
  function tableById(id){ for (var i=0;i<TABLES.length;i++) if (TABLES[i].id===id) return TABLES[i]; return null; }
  function tableTakenBy(id, exceptResId){
    for (var i=0;i<reservations.length;i++){ var x=reservations[i];
      if (x.table===id && x.id!==exceptResId && (x.status==="New"||x.status==="Accepted"||x.status==="Attended")) return x; }
    return null;
  }
  function tableStatus(t, r){
    if (t.seats < r.size) return "small";
    if (OCCUPIED.indexOf(t.id)>=0 || tableTakenBy(t.id, r.id)) return "occupied";
    return "free";
  }

  // control shown in the Assign-table detail row (empty vs assigned)
  function assignControl(r){
    if (r.status==="Cancelled" || r.status==="Blocked" || r.status==="No-show"){
      return r.table ? '<span style="color:var(--ink-2);font-weight:600">Table '+esc(r.table)+'</span>' : '<span style="color:var(--ink-3)">—</span>';
    }
    if (r.table){
      return '<button class="table-badge" data-act="assigntable">'+svgP('<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M6 12v6M18 12v6"/>')+'Table '+esc(r.table)+' <span class="chg">· change</span></button>';
    }
    return '<button class="assign-btn" data-act="assigntable">'+svgP('<path d="M12 5v14M5 12h14"/>')+'Assign</button>';
  }

  var tblTarget = null, tblPick = null;
  function openTablePicker(r){
    tblTarget = r.id; tblPick = r.table || null;
    $("#tblTitle").textContent = "Assign a table — " + r.host;
    $("#tblSub").textContent = "Party of " + r.size + " · " + r.when + " " + r.time + ". Pick a table; you can change it any time.";
    renderTables(r);
    $("#tblUnassign").style.display = r.table ? "" : "none";
    $("#tblModal").classList.add("show");
  }
  function renderTables(r){
    var areas = {};
    TABLES.forEach(function(t){ (areas[t.area]=areas[t.area]||[]).push(t); });
    var html = "";
    Object.keys(areas).forEach(function(a){
      html += '<div class="tbl-area"><div class="ta-h">'+esc(a)+'</div><div class="tbl-grid">'
        + areas[a].map(function(t){
            var s = tableStatus(t, r);
            var cls = s==="occupied" ? " occupied" : (s==="small" ? " small" : "");
            var sel = tblPick===t.id ? " sel" : "";
            var flag = s==="occupied" ? '<div class="tflag">Occupied</div>' : (s==="small" ? '<div class="tflag">Too small</div>' : '');
            return '<div class="tbl-cell'+cls+sel+'" data-t="'+t.id+'" data-ok="'+(s==="free"?1:0)+'"><div class="tdot"></div><div class="tn">'+t.id+'</div><div class="ts">Seats '+t.seats+'</div>'+flag+'</div>';
          }).join("")
        + '</div></div>';
    });
    html += '<div class="tbl-legend"><span><i style="background:var(--s-ready)"></i>Available</span><span><i style="background:var(--s-cancel)"></i>Occupied</span><span><i style="background:var(--s-new)"></i>Too small for party</span></div>';
    $("#tblAreas").innerHTML = html;
    Array.prototype.forEach.call($("#tblAreas").querySelectorAll(".tbl-cell"), function(c){
      c.onclick = function(){ if (c.getAttribute("data-ok")!=="1") return; tblPick = c.getAttribute("data-t"); renderTables(r); };
    });
    $("#tblAssign").disabled = !tblPick;
  }
  function closeTable(){ $("#tblModal").classList.remove("show"); }
  $("#tblClose").onclick = closeTable;
  $("#tblCancel").onclick = closeTable;
  $("#tblModal").onclick = function(e){ if (e.target===$("#tblModal")) closeTable(); };
  $("#tblAssign").onclick = function(){
    if (!tblPick) return;
    var r = reservations.filter(function(x){return x.id===tblTarget;})[0]; if (!r) return;
    r.table = tblPick; closeTable(); toast("Assigned Table "+tblPick+" to "+r.host); render();
  };
  $("#tblUnassign").onclick = function(){
    var r = reservations.filter(function(x){return x.id===tblTarget;})[0]; if (!r) return;
    r.table = null; closeTable(); toast("Table unassigned for "+r.host); render();
  };

  function render(){ renderTabs(); renderList(); renderDetail(); stats(); }

  var toastT;
  function toast(msg){ var t=$("#toast"); $("#toastMsg").textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(function(){t.classList.remove("show");},2200); }

  // ---- availability modal ----
  var SLOTS = [ ["Lunch · 11:30 AM–1:30 PM", "8 tables", true], ["Afternoon · 1:30–4:00 PM", "5 tables", true], ["Dinner · 5:30–8:00 PM", "10 tables", true], ["Late · 8:00–9:30 PM", "4 tables", false] ];
  function renderSlots(){
    $("#avSlots").innerHTML = SLOTS.map(function(s,i){
      return '<div class="slotrow"><div><div class="st">'+esc(s[0])+'</div><div class="sd">'+esc(s[1])+' available</div></div><span class="toggle'+(s[2]?' on':'')+'" data-slot="'+i+'"></span></div>';
    }).join("");
    Array.prototype.forEach.call($("#avSlots").querySelectorAll("[data-slot]"), function(t){
      t.onclick = function(){ var i=+t.getAttribute("data-slot"); SLOTS[i][2]=!SLOTS[i][2]; t.classList.toggle("on"); };
    });
  }
  $("#availBtn").onclick = function(){ renderSlots(); $("#avModal").classList.add("show"); };
  $("#avClose").onclick = function(){ $("#avModal").classList.remove("show"); };
  $("#avCancel").onclick = function(){ $("#avModal").classList.remove("show"); };
  $("#avModal").onclick = function(e){ if(e.target===$("#avModal")) $("#avModal").classList.remove("show"); };
  $("#avSave").onclick = function(){ var open=SLOTS.filter(function(s){return s[2];}).length; $("#avModal").classList.remove("show"); toast(open+" of "+SLOTS.length+" slots open for booking"); };

  Array.prototype.forEach.call(document.querySelectorAll("#viewToggle .vt"), function(b){
    b.onclick = function(){ view = b.getAttribute("data-v"); Array.prototype.forEach.call(document.querySelectorAll("#viewToggle .vt"), function(x){ x.classList.toggle("on", x===b); }); renderList(); };
  });
  $("#search").addEventListener("input", function(){ query=this.value; renderList(); });
  $("#themeBtn").onclick = function(){ var r=document.documentElement, c=r.getAttribute("data-theme"); if(!c)c=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"; r.setAttribute("data-theme", c==="dark"?"light":"dark"); };

  render();
})();
