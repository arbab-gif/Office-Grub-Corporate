// Office Grubb — Restaurant Order Flow
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s){ return String(s).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];}); }
  function money(n){ return "$" + n.toFixed(2); }

  var COMPANIES = {
    acme:      { name: "Acme Corp",      color: "#E4611A", window: "12:00 PM", mins: 720 },
    northline: { name: "Northline Labs", color: "#2E6F9E", window: "12:30 PM", mins: 750 },
    vantage:   { name: "Vantage Group",  color: "#22794A", window: "1:00 PM",  mins: 780 }
  };

  // full restaurant-side lifecycle
  var FLOW = ["new","accepted","prep","ready","picked","delivered","completed"];
  var STATUS = {
    new:       { label: "New Order",        cls: "st-new",       h:"--s-new" },
    accepted:  { label: "Accepted",         cls: "st-accepted",  h:"--s-accepted" },
    prep:      { label: "Preparing",        cls: "st-prep",      h:"--s-prep" },
    ready:     { label: "Ready",            cls: "st-ready",     h:"--s-ready" },
    picked:    { label: "Picked Up",        cls: "st-picked",    h:"--s-out" },
    delivered: { label: "Delivered",        cls: "st-delivered", h:"--s-delivered" },
    completed: { label: "Completed",        cls: "st-completed", h:"--s-done" },
    cancelled: { label: "Cancelled",        cls: "st-cancelled", h:"--s-cancel" }
  };
  var STAGE_LABEL = { new:"New", accepted:"Accepted", prep:"Preparing", ready:"Ready", picked:"Picked Up", delivered:"Delivered", completed:"Completed" };
  var NEXT = { new:"accepted", accepted:"prep", prep:"ready", ready:"picked", picked:"delivered", delivered:"completed" };
  var NEXTLABEL = {
    new:"Accept order", accepted:"Start preparing", prep:"Mark ready for pickup",
    ready:"Confirm driver pickup", picked:"Confirm delivered", delivered:"Complete & archive"
  };

  function ord(o){ return { commission:0.05, platform:0.10 }; } // Q3 rates for payout demo

  var orders = [
    { id:"4021", co:"acme", cust:"Maria Chen", dept:"Design", status:"new",
      items:[{q:1,n:"Chicken Shawarma Bowl",p:14.50,mods:["No onions","Extra garlic sauce"]},{q:1,n:"Hummus & Pita",p:5.00,mods:[]}],
      allergens:["Sesame"], edits:[{type:"Modifier changed",detail:"Added extra garlic sauce",w:"8m ago"}] },
    { id:"4022", co:"acme", cust:"David Park", dept:"Engineering", status:"accepted",
      items:[{q:1,n:"Falafel Wrap",p:11.00,mods:["Add feta"]},{q:1,n:"Greek Salad (side)",p:5.00,mods:[]}],
      allergens:["Gluten","Dairy"], edits:[{type:"Item changed",detail:"Chicken Wrap → Falafel Wrap",w:"22m ago"}] },
    { id:"4023", co:"northline", cust:"Priya Nair", dept:"Ops", status:"prep",
      items:[{q:1,n:"Lamb Gyro Plate",p:17.50,mods:["Extra tzatziki on side"]}], allergens:["Dairy"], edits:[] },
    { id:"4024", co:"northline", cust:"Tom Alvarez", dept:"Sales", status:"prep",
      items:[{q:1,n:"Greek Salad",p:9.00,mods:["No feta"]},{q:1,n:"Lentil Soup (cup)",p:4.00,mods:[]}], allergens:[], edits:[] },
    { id:"4025", co:"vantage", cust:"Sarah Kim", dept:"Finance", status:"ready",
      items:[{q:2,n:"Mediterranean Mezze Platter",p:22.00,mods:[]}], allergens:["Sesame","Tree Nuts"], edits:[] },
    { id:"4026", co:"vantage", cust:"James Wu", dept:"Marketing", status:"new",
      items:[{q:1,n:"Spanakopita",p:10.50,mods:[]},{q:1,n:"Baklava",p:5.00,mods:[]}], allergens:["Gluten","Dairy","Tree Nuts"],
      edits:[{type:"Quantity changed",detail:"Baklava 2 → 1",w:"31m ago"}] },
    { id:"4027", co:"acme", cust:"Lena Ortiz", dept:"People", status:"picked",
      items:[{q:1,n:"Chicken Kebab Bowl",p:15.00,mods:["Brown rice","Double protein (+$3)"]}], allergens:[], edits:[] },
    { id:"4028", co:"vantage", cust:"Omar Haddad", dept:"Legal", status:"accepted",
      items:[{q:1,n:"Beef Kofta Plate",p:16.50,mods:["Well done"]},{q:1,n:"Hummus & Pita",p:5.00,mods:[]}], allergens:["Sesame","Gluten"], edits:[] },
    { id:"4029", co:"vantage", cust:"Grace Liu", dept:"Product", status:"cancelled",
      items:[{q:1,n:"Chicken Souvlaki Wrap",p:12.00,mods:[]}], allergens:["Gluten"],
      edits:[{type:"Order cancelled",detail:"Employee cancelled — out sick",w:"5m ago"}] },
    { id:"4018", co:"acme", cust:"Ben Torres", dept:"Finance", status:"delivered",
      items:[{q:1,n:"Chicken Shawarma Bowl",p:14.50,mods:["Extra pickles"]}], allergens:["Sesame"], edits:[] },
    { id:"4015", co:"northline", cust:"Ava Singh", dept:"Design", status:"completed",
      items:[{q:1,n:"Vegetarian Mezze Box",p:13.00,mods:[]}], allergens:["Sesame"], edits:[] }
  ];

  var filterCo = "all", filterStage = "all", selectedId = "4021";
  var sortKey = "delivery", sortDir = 1;
  var view = "list"; // 'list' | 'kanban'
  var KCOLS = ["new","accepted","prep","ready","picked","delivered","completed","cancelled"];

  function orderTotal(o){ return o.items.reduce(function(s,i){return s+i.p*i.q;},0); }
  function orderQty(o){ return o.items.reduce(function(s,i){return s+i.q;},0); }

  function visible(){
    return orders.filter(function(o){
      if (filterCo !== "all" && o.co !== filterCo) return false;
      if (filterStage !== "all" && o.status !== filterStage) return false;
      return true;
    });
  }
  function sorted(list){
    var arr = list.slice();
    arr.sort(function(a,b){
      var x, y;
      switch(sortKey){
        case "order": x=+a.id; y=+b.id; break;
        case "customer": x=a.cust.toLowerCase(); y=b.cust.toLowerCase(); break;
        case "company": x=COMPANIES[a.co].name; y=COMPANIES[b.co].name; break;
        case "qty": x=orderQty(a); y=orderQty(b); break;
        case "price": x=orderTotal(a); y=orderTotal(b); break;
        case "delivery": x=COMPANIES[a.co].mins; y=COMPANIES[b.co].mins; break;
        case "status": x=FLOW.indexOf(a.status); y=FLOW.indexOf(b.status); break;
        default: x=0; y=0;
      }
      if (x<y) return -1*sortDir; if (x>y) return 1*sortDir; return (+a.id)-(+b.id);
    });
    return arr;
  }

  // ---- stage tracker ----
  function renderStages(){
    var counts = {}; FLOW.forEach(function(s){counts[s]=0;});
    orders.forEach(function(o){ if(counts[o.status]!==undefined) counts[o.status]++; });
    $("#stages").innerHTML = FLOW.map(function(s){
      return '<div class="stage'+(filterStage===s?' active':'')+'" data-s="'+s+'" style="--h:var('+STATUS[s].h+')">'
        + '<div class="snum tnum">'+counts[s]+'</div><div class="sbar"></div><div class="snm">'+STATUS[s].label+'</div></div>';
    }).join("");
    Array.prototype.forEach.call($("#stages").children, function(el){
      el.onclick = function(){ var s=el.getAttribute("data-s"); filterStage=(filterStage===s?"all":s); refresh(); };
    });
    $("#clearStage").style.display = filterStage==="all" ? "none" : "inline";
  }
  $("#clearStage").onclick = function(){ filterStage="all"; refresh(); };

  // ---- sub-tabs ----
  function renderSubtabs(){
    var keys = ["all"].concat(Object.keys(COMPANIES));
    $("#subtabs").innerHTML = keys.map(function(k){
      var name = k==="all" ? "All Companies" : COMPANIES[k].name;
      var cnt = k==="all" ? orders.length : orders.filter(function(o){return o.co===k;}).length;
      var dot = k==="all" ? "" : '<i style="width:8px;height:8px;border-radius:2px;background:'+COMPANIES[k].color+'"></i>';
      return '<div class="subtab'+(filterCo===k?' active':'')+'" data-k="'+k+'">'+dot+esc(name)+' <span class="cnt tnum">'+cnt+'</span></div>';
    }).join("");
    Array.prototype.forEach.call($("#subtabs").children, function(el){
      el.onclick = function(){ filterCo = el.getAttribute("data-k"); refresh(); };
    });
  }

  // ---- table head ----
  var COLS = [
    {k:"order",label:"Order"},{k:"customer",label:"Customer"},{k:"company",label:"Company"},
    {k:null,label:"Items & Modifiers"},{k:"qty",label:"Qty",num:true},{k:"price",label:"Price",num:true},
    {k:"delivery",label:"Delivery"},{k:"status",label:"Status"}
  ];
  function renderHead(){
    $("#head").innerHTML = COLS.map(function(c){
      if (!c.k) return '<th>'+c.label+'</th>';
      var on = sortKey===c.k;
      return '<th class="sortable'+(c.num?' num':'')+(on?' sorted':'')+'" data-k="'+c.k+'">'+c.label
        + '<span class="arw">'+(on?(sortDir>0?'▲':'▼'):'▲')+'</span></th>';
    }).join("");
    Array.prototype.forEach.call($("#head").children, function(th){
      var k = th.getAttribute("data-k"); if(!k) return;
      th.onclick = function(){ if(sortKey===k){sortDir*=-1;}else{sortKey=k;sortDir=1;} renderHead(); renderRows(); };
    });
  }

  function renderRows(){
    var list = sorted(visible());
    $("#rows").innerHTML = list.map(function(o){
      var st = STATUS[o.status], c = COMPANIES[o.co];
      var itemsHtml = o.items.map(function(i){
        var mods = i.mods.length ? '<div class="mod">'+esc(i.mods.join(" · "))+'</div>' : '';
        return '<div class="it">'+(i.q>1?i.q+'× ':'')+esc(i.n)+'</div>'+mods;
      }).join("");
      var editB = o.edits.length ? '<span class="edit-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>'+(o.status==="cancelled"?"cancelled":"edited")+'</span>' : '';
      return '<tr data-id="'+o.id+'" class="'+(o.id===selectedId?'sel ':'')+(o.status==="cancelled"?'cancelled':'')+'">'
        + '<td class="ordno tnum">#'+o.id+'</td>'
        + '<td class="cust">'+esc(o.cust)+'<small>'+esc(o.dept)+'</small></td>'
        + '<td><span class="co"><i style="background:'+c.color+'"></i>'+esc(c.name)+'</span></td>'
        + '<td class="itmcell">'+itemsHtml+'</td>'
        + '<td class="num tnum">'+orderQty(o)+'</td>'
        + '<td class="num price tnum">'+money(orderTotal(o))+'</td>'
        + '<td class="tnum">'+c.window+'</td>'
        + '<td class="st-cell"><span class="pill '+st.cls+'"><i></i>'+st.label+'</span>'+editB+'</td></tr>';
    }).join("");
    Array.prototype.forEach.call($("#rows").children, function(tr){
      tr.onclick = function(){ selectedId = tr.getAttribute("data-id"); renderRows(); renderPanel(); };
    });
    var tot = list.filter(function(o){return o.status!=="cancelled";}).reduce(function(s,o){return s+orderTotal(o);},0);
    $("#rowCount").textContent = list.length + " order" + (list.length!==1?"s":"") + " shown";
    $("#manifestTotal").textContent = money(tot);
  }

  // ---- kanban ----
  function cardHtml(o){
    var c = COMPANIES[o.co], st = STATUS[o.status];
    var items = o.items.map(function(i){ return (i.q>1?i.q+"× ":"")+i.n; }).join(", ");
    var aller = o.allergens.length ? '<div class="kc-aller">'+o.allergens.map(function(a){return '<span class="aller">'+esc(a)+'</span>';}).join("")+'</div>' : "";
    var edit = o.edits.length ? '<span class="kedit" title="Edited by employee">✎</span>' : "";
    return '<div class="kcard'+(o.id===selectedId?' sel':'')+(o.status==="cancelled"?' cancelled':'')+'" draggable="true" data-id="'+o.id+'" style="--h:var('+st.h+')">'
      + '<div class="kc-top"><span class="ordno tnum">#'+o.id+'</span><span class="price tnum">'+money(orderTotal(o))+'</span></div>'
      + '<div class="co"><i style="background:'+c.color+'"></i>'+esc(c.name)+' · '+c.window+'</div>'
      + '<div class="kc-cust">'+esc(o.cust)+' '+edit+'</div>'
      + '<div class="kc-items">'+esc(items)+'</div>'
      + aller
      + '</div>';
  }
  function renderKanban(){
    var list = orders.filter(function(o){ return filterCo==="all" || o.co===filterCo; });
    var by = {}; KCOLS.forEach(function(s){ by[s]=[]; });
    list.forEach(function(o){ if(by[o.status]) by[o.status].push(o); });
    $("#kanban").innerHTML = KCOLS.map(function(s){
      var meta = STATUS[s];
      var cards = by[s].length ? by[s].map(cardHtml).join("") : '<div class="kempty">No orders</div>';
      return '<div class="kcol" data-col="'+s+'" style="--h:var('+meta.h+')">'
        + '<div class="kcol-h"><span class="kdot"></span><span class="kname">'+meta.label+'</span><span class="kcnt tnum">'+by[s].length+'</span></div>'
        + '<div class="kcards" data-col="'+s+'">'+cards+'</div></div>';
    }).join("");

    // card interactions
    Array.prototype.forEach.call($("#kanban").querySelectorAll(".kcard"), function(card){
      card.addEventListener("click", function(){ selectedId = card.getAttribute("data-id"); openDrawer(); renderKanban(); renderPanel(); });
      card.addEventListener("dragstart", function(e){ e.dataTransfer.setData("text/plain", card.getAttribute("data-id")); e.dataTransfer.effectAllowed="move"; card.classList.add("dragging"); });
      card.addEventListener("dragend", function(){ card.classList.remove("dragging"); });
    });
    // drop zones
    Array.prototype.forEach.call($("#kanban").querySelectorAll(".kcards"), function(zone){
      zone.addEventListener("dragover", function(e){ e.preventDefault(); zone.classList.add("dragover"); });
      zone.addEventListener("dragleave", function(){ zone.classList.remove("dragover"); });
      zone.addEventListener("drop", function(e){
        e.preventDefault(); zone.classList.remove("dragover");
        var id = e.dataTransfer.getData("text/plain");
        var col = zone.getAttribute("data-col");
        var o = orders.filter(function(x){return x.id===id;})[0];
        if(o && o.status!==col){ o.status = col; selectedId = id; toast("Order #"+id+" → "+STATUS[col].label); refresh(); }
      });
    });
  }

  function openDrawer(){ if(view==="kanban"){ $("#panel").classList.add("open"); $("#kbackdrop").classList.add("show"); } }
  function closeDrawer(){ $("#panel").classList.remove("open"); $("#kbackdrop").classList.remove("show"); }

  function setView(v){
    view = v;
    $("#listView").style.display = v==="list" ? "" : "none";
    $("#kanbanView").style.display = v==="kanban" ? "" : "none";
    $("#split").classList.toggle("kanban", v==="kanban");
    $("#boardHint").textContent = v==="list" ? "Click any column to sort" : "Drag cards between stages · click a card for details";
    Array.prototype.forEach.call($("#viewToggle").children, function(b){ b.classList.toggle("active", b.getAttribute("data-v")===v); });
    if(v==="list") closeDrawer();
    refresh();
  }

  // ---- activity timeline (whole flow, per order) ----
  function activity(o){
    var idx = FLOW.indexOf(o.status);
    var rows = [];
    rows.push({state:"done", t:"Order placed", d:esc(o.cust)+" · "+COMPANIES[o.co].name, w:"Yesterday 4:12 PM"});
    if (o.edits.length){
      o.edits.forEach(function(e){
        var cancel = /cancel/i.test(e.type);
        rows.push({state:cancel?"cancel":"warn", t:e.type+" (employee, real-time)", d:esc(e.detail), w:e.w});
      });
    }
    if (o.status==="cancelled"){
      return rows.map(rowHtml).join("");
    }
    rows.push({state: idx>=0 ? "done":"", t:"Edit window locked", d:"Manifest finalized at 10:00 AM", w:"10:00 AM"});
    var stageMeta = [
      {s:"accepted", t:"Accepted", d:"Restaurant confirmed the order"},
      {s:"prep",     t:"Preparing", d:"In the kitchen · label printed"},
      {s:"ready",    t:"Ready for pickup", d:"Packaged & labeled, awaiting driver"},
      {s:"picked",   t:"Picked up by driver", d:"Count scanned · food photo uploaded"},
      {s:"delivered",t:"Delivered", d:"Employee confirmed receipt · accuracy logged"},
      {s:"completed",t:"Completed & settled", d:"Payout + threshold updated, saved to history"}
    ];
    stageMeta.forEach(function(m){
      var mi = FLOW.indexOf(m.s);
      var state = mi < idx ? "done" : (mi === idx ? "now" : "");
      rows.push({state:state, t:m.t, d:m.d, w: mi<=idx ? "" : "pending"});
    });
    return rows.map(rowHtml).join("");
  }
  function rowHtml(r){
    return '<div class="actrow '+r.state+'"><div class="adot"></div><div class="abody"><div class="att">'+r.t+'</div>'
      + '<div class="ad">'+r.d+'</div>'+(r.w?'<div class="aw">'+r.w+'</div>':'')+'</div></div>';
  }

  function payoutBlock(o){
    var r = ord(o), gross = orderTotal(o);
    var pf = gross*r.platform, cm = gross*r.commission, net = gross-pf-cm;
    return '<div class="payout">'
      + '<div class="eyebrow" style="margin-bottom:8px">Payout & settlement</div>'
      + '<div class="kv"><span class="kk">Gross food sales</span><span class="vv">'+money(gross)+'</span></div>'
      + '<div class="kv"><span class="kk">Platform fee (10%)</span><span class="vv">− '+money(pf)+'</span></div>'
      + '<div class="kv"><span class="kk">Performance comm. (5% · Q3)</span><span class="vv">− '+money(cm)+'</span></div>'
      + '<div class="kv" style="font-size:14px"><span class="kk" style="font-weight:700;color:var(--ink)">Net to restaurant</span><span class="vv">'+money(net)+'</span></div>'
      + '<div class="divider" style="margin:12px 0"></div>'
      + '<div class="eyebrow" style="margin-bottom:4px">$15k threshold counter</div>'
      + '<div class="kv" style="padding:0"><span class="kk">Sofia\'s Kitchen</span><span class="vv">$11,259.50 / $15,000</span></div>'
      + '<div class="thermo"><i style="width:75%"></i></div>'
      + '</div>';
  }

  function renderPanel(){
    var o = orders.filter(function(x){return x.id===selectedId;})[0];
    if(!o){ $("#panel").innerHTML = '<div class="empty-panel">Select an order.</div>'; return; }
    var st = STATUS[o.status], c = COMPANIES[o.co];
    var cancelled = o.status==="cancelled";
    var completed = o.status==="completed";

    var stepIdx = FLOW.indexOf(o.status);
    var stepper = FLOW.map(function(s,i){
      var cls = i<stepIdx ? "done" : (i===stepIdx ? "current" : "");
      return '<div class="step '+cls+'"><div class="ball"></div><div class="lb">'+STAGE_LABEL[s]+'</div></div>';
    }).join("");

    var itemsHtml = o.items.map(function(i){
      return '<div class="item"><div class="qty tnum">'+i.q+'</div><div style="flex:1"><div class="nm">'+esc(i.n)+'</div>'
        + (i.mods.length?'<div class="mods">'+esc(i.mods.join(" · "))+'</div>':'')+'</div><div class="ip tnum">'+money(i.p*i.q)+'</div></div>';
    }).join("");
    var allerHtml = o.allergens.length ? o.allergens.map(function(a){return '<span class="aller">'+esc(a)+'</span>';}).join(" ") : '<span class="none-tag">No allergen flags</span>';

    var actions;
    if (cancelled) {
      actions = '<button class="btn block" disabled>Order cancelled by employee</button><button class="btn block" data-act="label">View label</button>';
    } else if (completed) {
      actions = '<button class="btn block" disabled>Completed &amp; archived</button><button class="btn block" data-act="label">Reprint label</button>';
    } else {
      actions = '<button class="btn primary block" data-act="advance">'+NEXTLABEL[o.status]+' →</button>'
        + '<div class="row"><button class="btn block" data-act="label">Print label</button>'
        + (o.status==="new" ? '<button class="btn block ghost-danger" data-act="reject">Reject</button>' : '<button class="btn block" data-act="back">Step back</button>')
        + '</div>';
    }

    $("#panel").innerHTML =
      '<div class="panel-head"><div style="flex:1"><div class="hno tnum">#'+o.id+'</div><div class="hsub">'+esc(o.cust)+' · '+esc(o.dept)+'</div></div><span class="pill '+st.cls+'"><i></i>'+st.label+'</span><button class="panel-close" data-act="close" title="Close" aria-label="Close">×</button></div>'
      + '<div class="panel-body">'
        + (cancelled ? '' : '<div><div class="eyebrow" style="margin-bottom:11px">Stage</div><div class="stepper">'+stepper+'</div></div><div class="divider"></div>')
        + '<div class="kv"><span class="kk">Company</span><span class="vv"><span class="co" style="justify-content:flex-end"><i style="background:'+c.color+'"></i>'+esc(c.name)+'</span></span></div>'
        + '<div class="kv"><span class="kk">Delivery date / time</span><span class="vv tnum">Fri Jul 11 · '+c.window+'</span></div>'
        + '<div class="kv"><span class="kk">Quantity</span><span class="vv tnum">'+orderQty(o)+' items</span></div>'
        + '<div class="divider"></div>'
        + '<div><div class="eyebrow" style="margin-bottom:10px">Items &amp; modifiers</div><div class="items">'+itemsHtml+'</div></div>'
        + '<div class="kv" style="font-size:14px;padding-top:2px"><span class="kk" style="font-weight:600;color:var(--ink)">Order total</span><span class="vv tnum">'+money(orderTotal(o))+'</span></div>'
        + '<div class="divider"></div>'
        + '<div><div class="eyebrow" style="margin-bottom:9px">Allergen flags</div>'+allerHtml+'</div>'
        + '<div class="divider"></div>'
        + '<div><div class="eyebrow" style="margin-bottom:11px">Order activity — whole flow</div><div class="act">'+activity(o)+'</div></div>'
        + (completed ? '<div class="divider"></div>'+payoutBlock(o) : '')
      + '</div>'
      + '<div class="panel-actions">'+actions
        + '<a class="btn block" href="order-detail.html" style="text-decoration:none">Open full company order →</a>'
      + '</div>';

    Array.prototype.forEach.call($("#panel").querySelectorAll("[data-act]"), function(btn){
      btn.onclick = function(){ doAction(o, btn.getAttribute("data-act")); };
    });
  }

  function doAction(o, act){
    if (act==="advance"){ var n=NEXT[o.status]; if(n){ o.status=n; toast("Order #"+o.id+" → "+STATUS[n].label); } }
    else if (act==="back"){ var i=FLOW.indexOf(o.status); if(i>0){ o.status=FLOW[i-1]; toast("Order #"+o.id+" moved back to "+STATUS[o.status].label); } }
    else if (act==="reject"){ toast("Order #"+o.id+" flagged for review"); }
    else if (act==="label"){ return showLabel(o); }
    else if (act==="close"){ return closeDrawer(); }
    refresh();
  }

  function syncStats(){
    var pending = orders.filter(function(o){return o.status==="new"||o.status==="accepted"||o.status==="prep";}).length;
    $("#navCount").textContent = pending;
    $("#totOrders").textContent = orders.length;
  }

  function showLabel(o){
    var itemsHtml = o.items.map(function(i){ return '<div>'+i.q+'× '+esc(i.n)+(i.mods.length?' — '+esc(i.mods.join(", ")):'')+'</div>'; }).join("");
    var aller = o.allergens.length ? '<div class="label-aller">⚠ ALLERGENS: '+o.allergens.join(", ").toUpperCase()+'</div>' : '';
    $("#labelCard").innerHTML =
      '<div class="label-top"><div class="lg"><span>🍽️</span>Office Grubb</div><div class="lno tnum">#'+o.id+'</div></div>'
      + '<div class="label-body">'
        + '<div class="lrow"><span class="lk">Company</span><b>'+esc(COMPANIES[o.co].name)+'</b></div>'
        + '<div class="lrow"><span class="lk">Customer</span><b>'+esc(o.cust)+'</b></div>'
        + '<div class="lrow"><span class="lk">Deliver by</span><b>Fri · '+COMPANIES[o.co].window+'</b></div>'
        + '<div class="label-items">'+itemsHtml+'</div>'+aller
      + '</div>'
      + '<div class="label-foot">Office Grubb · Boston, MA · Sofia\'s Kitchen</div>';
    $("#overlay").classList.add("show");
  }

  var toastT;
  function toast(msg){ var t=$("#toast"); $("#toastMsg").textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(function(){t.classList.remove("show");},2200); }

  function refresh(){ renderStages(); renderSubtabs(); renderHead(); renderRows(); renderKanban(); renderPanel(); syncStats(); }

  $("#acceptAll").onclick = function(){
    var n=0; orders.forEach(function(o){ if(o.status==="new"){ o.status="accepted"; n++; } });
    refresh(); toast(n?("Accepted "+n+" new order"+(n>1?"s":"")):"No new orders to accept");
  };
  Array.prototype.forEach.call($("#viewToggle").children, function(b){ b.onclick = function(){ setView(b.getAttribute("data-v")); }; });
  $("#kbackdrop").onclick = closeDrawer;
  $("#printManifest").onclick = function(){ toast("Consolidated manifest sent to printer"); };
  $("#closeLabel").onclick = function(){ $("#overlay").classList.remove("show"); };
  $("#overlay").onclick = function(e){ if(e.target===$("#overlay")) $("#overlay").classList.remove("show"); };
  $("#themeBtn").onclick = function(){
    var r=document.documentElement, cur=r.getAttribute("data-theme");
    if(!cur) cur = matchMedia("(prefers-color-scheme: dark)").matches ? "dark":"light";
    r.setAttribute("data-theme", cur==="dark"?"light":"dark");
  };

  var secs = 42*60 + 15, cdEl = $("#cd");
  setInterval(function(){ if(secs>0)secs--; var h=Math.floor(secs/3600),m=Math.floor((secs%3600)/60),s=secs%60; cdEl.textContent=(h<10?"0":"")+h+":"+(m<10?"0":"")+m+":"+(s<10?"0":"")+s; }, 1000);

  refresh();
})();
