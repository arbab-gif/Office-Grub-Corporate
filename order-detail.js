// Office Grubb — Company Group Order Detail (#OG-10482, Acme Corp)
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s){ return String(s).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];}); }
  function money(n){ return "$" + n.toFixed(2); }

  var TAX_RATE = 0.0625, PLATFORM = 0.10, COMMISSION = 0.05;

  var MAINS = [
    {n:"Chicken Shawarma Bowl", p:14.00, e:"🥙", al:["Sesame"]},
    {n:"Lamb Gyro Plate",       p:17.50, e:"🍢", al:["Dairy"]},
    {n:"Falafel Wrap",          p:11.00, e:"🧆", al:["Gluten"]},
    {n:"Mediterranean Mezze Platter", p:18.00, e:"🫓", al:["Sesame","Tree Nuts"]},
    {n:"Beef Kofta Plate",      p:16.00, e:"🍖", al:["Gluten"]},
    {n:"Greek Salad",           p:9.00,  e:"🥗", al:["Dairy"]},
    {n:"Chicken Kebab Bowl",    p:14.00, e:"🍗", al:[]},
    {n:"Spanakopita",           p:10.50, e:"🥐", al:["Gluten","Dairy"]}
  ];
  var SIDES  = [{n:"Hummus & Pita",p:3.50,e:"🫓",al:["Sesame"]},{n:"Garlic Bread",p:3.50,e:"🍞",al:["Gluten"]},{n:"Baklava",p:4.50,e:"🍯",al:["Tree Nuts"]},{n:"Lentil Soup",p:4.00,e:"🍲",al:[]}];
  var DRINKS = [{n:"Sparkling Water",p:1.00,e:"💧",al:[]},{n:"Coke Zero",p:1.00,e:"🥤",al:[]},{n:"Iced Tea",p:2.00,e:"🧋",al:[]}];
  var MODS = [["Extra garlic sauce","No onions"],["Extra tzatziki"],["No feta"],["Brown rice"],[]];
  var NOTES = ["No plastic utensils, please.","Please keep sauces on the side.","",""];

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

  // build 28 employee orders deterministically
  var employees = PEOPLE.map(function (p, i) {
    var items = [];
    var main = MAINS[i % MAINS.length];
    items.push({ n: main.n, p: main.p, e: main.e, al: main.al, mods: MODS[i % MODS.length], grp: "main" });
    if (i % 2 === 0) { var s = SIDES[i % SIDES.length]; items.push({ n:s.n, p:s.p, e:s.e, al:s.al, mods:[], grp:"side" }); }
    if (i % 3 === 0) { var d = DRINKS[i % DRINKS.length]; items.push({ n:d.n, p:d.p, e:d.e, al:d.al, mods:[], grp:"drink" }); }
    return {
      id: i,
      name: p[0], dept: p[1],
      initials: p[0].split(" ").map(function(w){return w[0];}).join(""),
      color: AV[i % AV.length],
      pickup: "A" + (125 + i),
      orderNo: "OG-10482-" + String(i + 1).padStart(2, "0"),
      status: "Preparing",
      items: items,
      note: NOTES[i % NOTES.length]
    };
  });

  function empTotal(e){ return e.items.reduce(function(s,i){return s+i.p;},0); }
  function empItemCount(e){ return e.items.length; }

  // group totals
  var totalEmployees = employees.length;
  var totalItems = employees.reduce(function(s,e){return s+empItemCount(e);},0);
  var subtotal = employees.reduce(function(s,e){return s+empTotal(e);},0);
  var tax = subtotal * TAX_RATE;
  var grandTotal = subtotal + tax;
  var platformFee = subtotal * PLATFORM;
  var commission = subtotal * COMMISSION;
  var netPayout = subtotal - platformFee - commission;

  // stat strip + breakdown + payout
  $("#sEmployees").textContent = totalEmployees;
  $("#sItems").textContent = totalItems;
  $("#sTotal").textContent = money(grandTotal);
  $("#bEmployees").textContent = totalEmployees;
  $("#bItems").textContent = totalItems;
  $("#bSubtotal").textContent = money(subtotal);
  $("#bTotal").textContent = money(grandTotal);
  $("#pGross").textContent = money(subtotal);
  $("#pTax").textContent = money(tax);
  $("#pFee").textContent = "− " + money(platformFee);
  $("#pComm").textContent = "− " + money(commission);
  $("#pNet").textContent = money(netPayout);

  // ---- table state ----
  var page = 1, perPage = 5, query = "", selectedId = 0;
  var MAX_TAGS = 2;

  function filtered(){
    var q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(function(e){ return e.name.toLowerCase().indexOf(q)>=0 || e.dept.toLowerCase().indexOf(q)>=0; });
  }

  function renderTable(){
    var list = filtered();
    var pageCount = Math.max(1, Math.ceil(list.length / perPage));
    if (page > pageCount) page = pageCount;
    var slice = list.slice((page-1)*perPage, page*perPage);

    if (!slice.length){
      $("#empRows").innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--ink-3);padding:34px">No employees match “'+esc(query)+'”.</td></tr>';
    } else {
      $("#empRows").innerHTML = slice.map(function(e){
        var tags = e.items.slice(0, MAX_TAGS).map(function(i){
          return '<span class="itag"><span class="ie">'+i.e+'</span>'+esc(i.n)+'</span>';
        }).join("");
        var more = e.items.length > MAX_TAGS ? '<span class="imore">+'+(e.items.length-MAX_TAGS)+' more</span>' : '';
        return '<tr class="emp-row'+(e.id===selectedId?' sel':'')+'" data-id="'+e.id+'">'
          + '<td><div class="who"><div class="av" style="background:color-mix(in srgb,'+e.color+' 18%, var(--surface));color:'+e.color+'">'+esc(e.initials)+'</div>'
            + '<div><div class="nm">'+esc(e.name)+'</div><div class="dept">'+esc(e.dept)+'</div></div></div></td>'
          + '<td><div class="items-cell" data-m="'+e.id+'" title="View ordered items">'+tags+more+'</div></td>'
          + '<td class="tnum">'+empItemCount(e)+'</td>'
          + '<td class="tnum" style="font-weight:600">'+money(empTotal(e))+'</td>'
          + '<td><span class="pill st-prep"><i></i>'+e.status+'</span></td>'
          + '<td style="text-align:right"><button class="chev" data-m="'+e.id+'" aria-label="View ordered items"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button></td>'
          + '</tr>';
      }).join("");
    }

    // row select (ignore clicks on the items cell / view button)
    Array.prototype.forEach.call($("#empRows").querySelectorAll(".emp-row"), function(tr){
      tr.onclick = function(ev){
        if (ev.target.closest("[data-m]")) return;
        selectedId = +tr.getAttribute("data-id");
        renderTable(); renderDetail();
      };
    });
    // items tags + view button open the ordered-items modal
    Array.prototype.forEach.call($("#empRows").querySelectorAll("[data-m]"), function(el){
      el.onclick = function(ev){ ev.stopPropagation(); openModal(+el.getAttribute("data-m")); };
    });

    // pagination
    var pg = [];
    pg.push('<button class="pg" data-p="prev"'+(page===1?' disabled':'')+'>‹</button>');
    var maxShow = Math.min(pageCount, 5);
    for (var i=1;i<=maxShow;i++) pg.push('<button class="pg'+(i===page?' on':'')+'" data-p="'+i+'">'+i+'</button>');
    if (pageCount > maxShow) { pg.push('<span style="color:var(--ink-3);padding:0 4px">…</span>'); pg.push('<button class="pg'+(pageCount===page?' on':'')+'" data-p="'+pageCount+'">'+pageCount+'</button>'); }
    pg.push('<button class="pg" data-p="next"'+(page===pageCount?' disabled':'')+'>›</button>');
    $("#pages").innerHTML = pg.join("");
    Array.prototype.forEach.call($("#pages").querySelectorAll(".pg"), function(b){
      b.onclick = function(){
        var v = b.getAttribute("data-p");
        if (v==="prev" && page>1) page--;
        else if (v==="next" && page<pageCount) page++;
        else if (v!=="prev" && v!=="next") page = +v;
        renderTable();
      };
    });
  }

  // ---- shared builders (used by the inline card and the modal) ----
  function headHtml(e, isModal){
    return '<div class="who"><div class="av" style="width:40px;height:40px;font-size:13px;background:color-mix(in srgb,'+e.color+' 18%, var(--surface));color:'+e.color+'">'+esc(e.initials)+'</div>'
      + '<div><div class="nm"'+(isModal?' id="modalTitle"':'')+'>'+esc(e.name)+'</div><div class="dp">'+esc(e.dept)+'</div></div></div>'
      + '<div class="field"><span class="fl">Order #</span><span class="fv tnum">'+e.orderNo+'</span></div>'
      + '<div class="field"><span class="fl">Pickup Code</span><span class="pickup">'+e.pickup+'</span></div>'
      + '<div class="field"><span class="fl">Status</span><span class="pill st-prep"><i></i>'+e.status+'</span></div>'
      + (isModal ? '<button class="mclose" id="mcloseBtn" aria-label="Close">×</button>' : '');
  }
  function itemsBodyHtml(e){
    var groups = [["main","Ordered Items"],["side","Sides"],["drink","Drink"]];
    var itemsHtml = groups.map(function(g){
      var rows = e.items.filter(function(i){return i.grp===g[0];});
      if (!rows.length) return "";
      var head = g[0]==="main" ? '<div class="secl">'+g[1]+'</div>' : '<div class="grouplabel">'+g[1]+'</div>';
      return head + rows.map(function(i){
        return '<div class="irow"><div class="ithumb">'+i.e+'</div><div class="ib"><div class="inm">'+esc(i.n)+'</div>'
          + (i.mods.length ? '<div class="imods">'+i.mods.map(function(m){return '<span class="imod">'+esc(m)+'</span>';}).join("")+'</div>' : '')
          + '</div><div class="ip tnum">'+money(i.p)+'</div></div>';
      }).join("");
    }).join("");
    var allergens = [];
    e.items.forEach(function(i){ i.al.forEach(function(a){ if(allergens.indexOf(a)<0) allergens.push(a); }); });
    var allerHtml = allergens.length ? '<div class="allerline">'+allergens.map(function(a){return '<span class="aller">'+esc(a)+'</span>';}).join("")+'</div>' : '';
    return itemsHtml + allerHtml
      + (e.note ? '<div class="od-notes"><div class="secl">Order Notes</div><p>'+esc(e.note)+'</p></div>' : '');
  }
  function summaryBodyHtml(e){
    var items = empTotal(e), taxE = 0, discount = 0, totalE = items + taxE - discount;
    return '<div class="secl">Order Summary</div>'
      + '<div class="sline"><span>Items Total</span><span class="sv tnum">'+money(items)+'</span></div>'
      + '<div class="sline"><span>Tax</span><span class="sv tnum">'+money(taxE)+'</span></div>'
      + '<div class="sline"><span>Discount</span><span class="sv tnum">-'+money(discount)+'</span></div>'
      + '<div class="stotal"><span class="sl">Total Amount</span><span class="sv tnum">'+money(totalE)+'</span></div>'
      + '<div style="margin-top:14px;font-size:11px;color:var(--ink-3);line-height:1.5">Tax is applied once at the company invoice level, not per employee order.</div>';
  }

  function renderDetail(){
    var e = employees.filter(function(x){return x.id===selectedId;})[0];
    if (!e) { $("#empDetail").innerHTML = ""; return; }
    $("#empDetail").innerHTML =
      '<div class="empdetail-h">' + headHtml(e, false) + '</div>'
      + '<div class="empdetail-b">'
        + '<div class="od-items">' + itemsBodyHtml(e) + '</div>'
        + '<div class="od-summary">' + summaryBodyHtml(e) + '</div>'
      + '</div>';
  }

  // ---- ordered items modal ----
  function openModal(id){
    var e = employees.filter(function(x){return x.id===id;})[0];
    if (!e) return;
    $("#modalHead").innerHTML = headHtml(e, true);
    $("#modalBody").innerHTML = '<div class="od-items">' + itemsBodyHtml(e) + '</div>'
      + '<div class="od-summary">' + summaryBodyHtml(e) + '</div>';
    $("#itemsModal").classList.add("show");
    $("#mcloseBtn").onclick = closeModal;
  }
  function closeModal(){ $("#itemsModal").classList.remove("show"); }

  // ---- toast ----
  var toastT;
  function toast(msg){ var t=$("#toast"); $("#toastMsg").textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(function(){t.classList.remove("show");},2200); }

  // ---- events ----
  $("#empSearch").addEventListener("input", function(){ query = this.value; page = 1; renderTable(); });
  $("#perPage").addEventListener("change", function(){ perPage = +this.value; page = 1; renderTable(); });
  $("#filterBtn").onclick = function(){ toast("Filter by department, status or allergen"); };

  var menu = $("#actionsMenu");
  $("#actionsBtn").onclick = function(e){ e.stopPropagation(); menu.classList.toggle("open"); };
  document.addEventListener("click", function(){ menu.classList.remove("open"); });
  var LABELS = { accept:"All 28 employee orders accepted", labels:"Printing 28 order labels…", manifest:"Kitchen manifest sent to printer", contact:"Opening message to Acme Corp", issue:"Issue reported to Office Grubb", pdf:"Summary PDF downloaded", csv:"CSV exported", map:"Opening map to 200 State Street" };
  Array.prototype.forEach.call(document.querySelectorAll("[data-a]"), function(b){
    b.onclick = function(ev){ ev.stopPropagation(); menu.classList.remove("open"); toast(LABELS[b.getAttribute("data-a")] || "Done"); };
  });

  $("#modalClose").onclick = closeModal;
  $("#itemsModal").onclick = function(ev){ if (ev.target === $("#itemsModal")) closeModal(); };
  document.addEventListener("keydown", function(ev){ if (ev.key === "Escape") closeModal(); });

  $("#themeBtn").onclick = function(){
    var r=document.documentElement, cur=r.getAttribute("data-theme");
    if(!cur) cur = matchMedia("(prefers-color-scheme: dark)").matches ? "dark":"light";
    r.setAttribute("data-theme", cur==="dark"?"light":"dark");
  };

  renderTable();
  renderDetail();
})();
