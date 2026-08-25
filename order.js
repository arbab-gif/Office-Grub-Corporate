// Office Grubb — Corporate Order Detail (#OG-10482, Acme Corp)
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s){ return String(s).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];}); }
  function money(n){ return "$" + n.toFixed(2); }

  // ---- data ----
  var MAINS = [
    {n:"Chicken Shawarma Bowl", p:14.00, e:"🥙"}, {n:"Lamb Gyro Plate", p:17.50, e:"🍢"},
    {n:"Falafel Wrap", p:11.00, e:"🧆"}, {n:"Mediterranean Mezze Platter", p:18.00, e:"🫓"},
    {n:"Beef Kofta Plate", p:16.00, e:"🍖"}, {n:"Greek Salad", p:9.00, e:"🥗"},
    {n:"Chicken Kebab Bowl", p:14.00, e:"🍗"}, {n:"Spanakopita", p:10.50, e:"🥐"}
  ];
  var SIDES  = [{n:"Hummus & Pita",p:3.50,e:"🫓"},{n:"Garlic Bread",p:3.50,e:"🍞"},{n:"Baklava",p:4.50,e:"🍯"},{n:"Lentil Soup",p:4.00,e:"🍲"}];
  var DRINKS = [{n:"Sparkling Water",p:1.00,e:"💧"},{n:"Coke Zero",p:1.00,e:"🥤"},{n:"Iced Tea",p:2.00,e:"🧋"}];
  var MODS = [["Extra garlic sauce","No onions"],["Extra tzatziki"],["No feta"],["Brown rice","Double protein"],[]];
  var INSTR = ["No plastic utensils, please.","Please keep sauces on the side.","",""," Allergy: nut-free prep, please.",""];
  var PEOPLE = [
    ["John Smith","Marketing"],["Sarah Lee","HR"],["Mike Ross","Sales"],["Emily Johnson","Finance"],
    ["David Wilson","IT"],["Priya Nair","Ops"],["Tom Alvarez","Design"],["Ava Chen","Legal"],
    ["Marcus Webb","Engineering"],["Nina Patel","Product"],["Carlos Diaz","Support"],["Rachel Kim","Marketing"],
    ["Ben Torres","Finance"],["Lena Ortiz","People"],["Omar Haddad","Legal"],["Grace Liu","Product"],
    ["James Wu","Marketing"],["Sofia Rossi","Design"],["Daniel Cho","Engineering"],["Maya Singh","Ops"],
    ["Ethan Brooks","Sales"],["Chloe Martin","HR"],["Ryan Cole","IT"],["Isabel Garcia","Finance"],
    ["Noah Bennett","Engineering"],["Zoe Adams","Design"],["Liam Foster","Sales"],["Hana Sato","Product"]
  ];
  var AV = ["#E4611A","#6A48A6","#245E86","#1F7A47","#B4362A","#0E7C7C"];

  var employees = PEOPLE.map(function (p, i) {
    var items = [];
    var m = MAINS[i % MAINS.length];
    items.push({ n:m.n, p:m.p, e:m.e, mods:MODS[i % MODS.length], grp:"main" });
    if (i % 2 === 0) { var s = SIDES[i % SIDES.length]; items.push({ n:s.n, p:s.p, e:s.e, mods:[], grp:"side" }); }
    if (i % 3 === 0) { var d = DRINKS[i % DRINKS.length]; items.push({ n:d.n, p:d.p, e:d.e, mods:[], grp:"drink" }); }
    return {
      id:i, name:p[0], dept:p[1],
      initials:p[0].split(" ").map(function(w){return w[0];}).join(""),
      color:AV[i % AV.length],
      orderNo:"OG-10482-" + String(i+1).padStart(2,"0"),
      items:items, instr:INSTR[i % INSTR.length].trim()
    };
  });

  function eTotal(e){ return e.items.reduce(function(s,i){return s+i.p;},0); }
  function eQty(e){ return e.items.length; }

  var totalEmployees = employees.length;
  var totalItems = employees.reduce(function(s,e){return s+eQty(e);},0);
  var grossTotal = employees.reduce(function(s,e){return s+eTotal(e);},0);

  $("#ovEmp").textContent = totalEmployees;
  $("#ovItems").textContent = totalItems;
  $("#ovTotal").textContent = money(grossTotal);
  $("#empCount").textContent = totalEmployees + " employees · " + totalItems + " items";

  // ---- kitchen summary (consolidated quantities) ----
  (function(){
    var map = {};
    employees.forEach(function(e){ e.items.forEach(function(i){
      if(!map[i.n]) map[i.n] = {n:i.n, e:i.e, qty:0, grp:i.grp};
      map[i.n].qty++;
    });});
    var rows = Object.keys(map).map(function(k){return map[k];}).sort(function(a,b){return b.qty-a.qty;});
    $("#ksum").innerHTML = rows.map(function(r){
      return '<div class="ksum-row"><span class="kq tnum">'+r.qty+'×</span><span class="ke">'+r.e+'</span><span class="kn">'+esc(r.n)+'</span></div>';
    }).join("");
    $("#ksumTotal").textContent = totalItems + " items";
  })();

  // ---- packaging summary ----
  (function(){
    var labels = totalEmployees;                 // one label per employee order
    var bags = totalEmployees;                    // one bag per employee
    var containers = employees.reduce(function(s,e){ return s + e.items.filter(function(i){return i.grp==="main"||i.grp==="side";}).length; },0);
    var drinks = employees.reduce(function(s,e){ return s + e.items.filter(function(i){return i.grp==="drink";}).length; },0);
    $("#pkLabels").textContent = labels;
    $("#pkContainers").textContent = containers;
    $("#pkBags").textContent = bags;
    $("#pkDrinks").textContent = drinks;
  })();

  // ---- employee order cards ----
  var query = "", openId = 0;
  function renderEmp(){
    var q = query.trim().toLowerCase();
    var list = employees.filter(function(e){
      if(!q) return true;
      var hay = (e.name+" "+e.dept+" "+e.items.map(function(i){return i.n;}).join(" ")).toLowerCase();
      return hay.indexOf(q)>=0;
    });
    if(!list.length){ $("#empList").innerHTML = '<div style="padding:26px;text-align:center;color:var(--ink-3)">No employees match.</div>'; return; }
    $("#empList").innerHTML = list.map(function(e){
      var itemsHtml = e.items.map(function(i){
        return '<div class="eitem"><div class="eq tnum">1</div><div style="flex:1"><div class="en">'+i.e+'&nbsp; '+esc(i.n)+'</div>'
          + (i.mods.length?'<div class="em">'+esc(i.mods.join(" · "))+'</div>':'')+'</div><div class="ep tnum">'+money(i.p)+'</div></div>';
      }).join("");
      var instr = e.instr ? '<div class="einstr">📝 <span><b>Special instructions:</b> '+esc(e.instr)+'</span></div>' : '';
      return '<div class="emp-o'+(e.id===openId?' open':'')+'" data-id="'+e.id+'">'
        + '<div class="emp-o-head">'
          + '<div class="who"><div class="av" style="background:color-mix(in srgb,'+e.color+' 18%,var(--surface));color:'+e.color+'">'+esc(e.initials)+'</div>'
            + '<div><div class="nm">'+esc(e.name)+'</div><div class="oid">#'+e.orderNo+' · '+esc(e.dept)+'</div></div></div>'
          + '<span class="qtybadge tnum">'+eQty(e)+' items</span>'
          + '<span class="etot tnum">'+money(eTotal(e))+'</span>'
          + '<span class="exp"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 9l6 6 6-6"/></svg></span>'
        + '</div>'
        + '<div class="emp-o-body">'+itemsHtml+instr+'</div>'
      + '</div>';
    }).join("");
    Array.prototype.forEach.call($("#empList").querySelectorAll(".emp-o-head"), function(h){
      h.onclick = function(){ var card=h.parentNode; var id=+card.getAttribute("data-id"); openId = (openId===id?-1:id); renderEmp(); };
    });
  }

  // ---- status flow + timeline + actions ----
  var FLOW = ["New","Confirmed","Preparing","Ready for Pickup","Picked Up","Delivered","Completed"];
  var SMETA = {
    "New":{cls:"st-new"}, "Confirmed":{cls:"st-accepted"}, "Preparing":{cls:"st-prep"},
    "Ready for Pickup":{cls:"st-ready"}, "Picked Up":{cls:"st-picked"}, "Delivered":{cls:"st-delivered"}, "Completed":{cls:"st-completed"}
  };
  var TIMES = {
    "New":"Jul 10, 4:12 PM", "Confirmed":"Jul 10, 4:25 PM", "Preparing":"Jul 11, 9:40 AM",
    "Ready for Pickup":"", "Picked Up":"", "Delivered":"", "Completed":""
  };
  var status = "New";

  function renderStatus(){
    var m = SMETA[status];
    var sp = $("#ovStatus"); sp.className = "pill " + m.cls; sp.innerHTML = '<i></i>'+status;
    // timeline
    var idx = FLOW.indexOf(status);
    $("#timeline").innerHTML = FLOW.map(function(s,i){
      var cls = i<idx ? "done" : (i===idx ? "now" : "pending");
      var node = i<idx ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>' : (i===idx ? '<i></i>' : '');
      var when = TIMES[s] || (i<=idx ? "" : "—");
      return '<div class="tlrow '+cls+'"><div class="tlnode">'+node+'</div><div><div class="tt">'+s+'</div><div class="tw">'+(when||"—")+'</div></div></div>';
    }).join("");
    renderActions();
  }

  function renderActions(){
    var idx = FLOW.indexOf(status);
    function b(id, label, svg, enabled, primary){
      return '<button class="btn'+(primary&&enabled?' primary':'')+'" data-act="'+id+'"'+(enabled?'':' disabled')+'>'
        + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'+svg+'</svg>'+label+'</button>';
    }
    var acts = ""
      + b("confirm","Confirm Order",'<path d="M20 6L9 17l-5-5"/>', status==="New", status==="New")
      + b("prepare","Start Preparing",'<path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.5 7.1 18l.9-5.5-4-3.9L9.5 8z"/>', status==="Confirmed", status==="Confirmed")
      + b("kitchen","Print Kitchen Summary",'<path d="M6 9V3h12v6M6 18H4v-6h16v6h-2M8 14h8v7H8z"/>', true, false)
      + b("labels","Print Labels",'<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 20h10M8 8h4"/>', true, false)
      + b("ready","Mark Ready for Pickup",'<path d="M20 8h-3V5a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2h3v3a2 2 0 002 2h10a2 2 0 002-2v-9a2 2 0 00-2-2z"/>', status==="Preparing", status==="Preparing");
    var note = idx>=FLOW.indexOf("Ready for Pickup") ? '<span class="act-note">'+ (status==="Ready for Pickup"?"Awaiting driver pickup":"Handled by driver / employee — "+status) +'</span>' : '';
    $("#actBar").innerHTML = acts + note;
    Array.prototype.forEach.call($("#actBar").querySelectorAll("[data-act]"), function(btn){
      btn.onclick = function(){ doAct(btn.getAttribute("data-act")); };
    });
  }

  function doAct(a){
    if (a==="confirm" && status==="New"){ status="Confirmed"; TIMES.Confirmed="Jul 11, 9:32 AM"; toast("Order confirmed"); renderStatus(); }
    else if (a==="prepare" && status==="Confirmed"){ status="Preparing"; TIMES.Preparing="Jul 11, 9:40 AM"; toast("Preparing started"); renderStatus(); }
    else if (a==="ready" && status==="Preparing"){ status="Ready for Pickup"; TIMES["Ready for Pickup"]="Jul 11, 11:05 AM"; toast("Marked ready for pickup"); renderStatus(); }
    else if (a==="kitchen"){ toast("Kitchen summary sent to printer"); }
    else if (a==="labels"){ toast("Printing "+totalEmployees+" labels…"); }
  }

  var toastT;
  function toast(msg){ var t=$("#toast"); $("#toastMsg").textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(function(){t.classList.remove("show");},2000); }

  $("#empSearch").addEventListener("input", function(){ query=this.value; renderEmp(); });
  $("#printSummary").onclick = function(){ toast("Kitchen summary sent to printer"); };
  $("#printKitchen").onclick = function(){ toast("Kitchen summary sent to printer"); };
  $("#mapBtn").onclick = function(){ toast("Opening map to 200 State Street"); };

  renderEmp();
  renderStatus();
})();
