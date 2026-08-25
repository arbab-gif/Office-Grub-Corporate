// Office Grubb — Label Sheet flow
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s){ return String(s).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];}); }

  // ---- same 28 employee orders as the detail screen ----
  var MAINS = [["Chicken Shawarma Bowl","🥙",["Sesame"]],["Lamb Gyro Plate","🍢",["Dairy"]],["Falafel Wrap","🧆",["Gluten"]],["Mediterranean Mezze Platter","🫓",["Sesame","Tree Nuts"]],["Beef Kofta Plate","🍖",["Gluten"]],["Greek Salad","🥗",["Dairy"]],["Chicken Kebab Bowl","🍗",[]],["Spanakopita","🥐",["Gluten","Dairy"]]];
  var SIDES  = [["Hummus & Pita","🫓",["Sesame"]],["Garlic Bread","🍞",["Gluten"]],["Baklava","🍯",["Tree Nuts"]],["Lentil Soup","🍲",[]]];
  var DRINKS = [["Sparkling Water","💧"],["Coke Zero","🥤"],["Iced Tea","🧋"]];
  var MODS = [["Extra garlic sauce","No onions"],["Extra tzatziki"],["No feta"],["Brown rice"],[]];
  var PEOPLE = [["John Smith","Marketing"],["Sarah Lee","HR"],["Mike Ross","Sales"],["Emily Johnson","Finance"],["David Wilson","IT"],["Priya Nair","Ops"],["Tom Alvarez","Design"],["Ava Chen","Legal"],["Marcus Webb","Engineering"],["Nina Patel","Product"],["Carlos Diaz","Support"],["Rachel Kim","Marketing"],["Ben Torres","Finance"],["Lena Ortiz","People"],["Omar Haddad","Legal"],["Grace Liu","Product"],["James Wu","Marketing"],["Sofia Rossi","Design"],["Daniel Cho","Engineering"],["Maya Singh","Ops"],["Ethan Brooks","Sales"],["Chloe Martin","HR"],["Ryan Cole","IT"],["Isabel Garcia","Finance"],["Noah Bennett","Engineering"],["Zoe Adams","Design"],["Liam Foster","Sales"],["Hana Sato","Product"]];

  var COMPANY = "Acme Corp", DELIVER = "Fri Jul 11 · 12:00 PM";
  var employees = PEOPLE.map(function (p, i) {
    var items = [], allergens = [];
    var m = MAINS[i % MAINS.length];
    items.push({ n:m[0], e:m[1], mods:MODS[i % MODS.length] }); m[2].forEach(function(a){ if(allergens.indexOf(a)<0)allergens.push(a); });
    if (i % 2 === 0){ var s = SIDES[i % SIDES.length]; items.push({ n:s[0], e:s[1], mods:[] }); s[2].forEach(function(a){ if(allergens.indexOf(a)<0)allergens.push(a); }); }
    if (i % 3 === 0){ var d = DRINKS[i % DRINKS.length]; items.push({ n:d[0], e:d[1], mods:[] }); }
    return { id:i, name:p[0], dept:p[1], orderNo:"OG-10482-"+String(i+1).padStart(2,"0"), pickup:"A"+(125+i), items:items, allergens:allergens };
  });

  // ---- formats ----
  var FORMATS = {
    "5160":  { name:"Avery 5160", desc:"30 per sheet · 2.63\" × 1\"", cols:3, per:30, cls:"fmt-5160", page:"@page{size:letter;margin:0.5in;}" },
    "5163":  { name:"Avery 5163", desc:"10 per sheet · 4\" × 2\"",  cols:2, per:10, cls:"fmt-5163", page:"@page{size:letter;margin:0.5in;}" },
    "thermal":{ name:"Thermal 4×6", desc:"1 per label · roll printer", cols:1, per:1,  cls:"fmt-thermal", page:"@page{size:4in 6in;margin:0.15in;}" }
  };
  var format = "5160";
  var opts = { allergens:true, pickup:true, mods:true };
  var selected = {}; employees.forEach(function(e){ selected[e.id] = true; });

  // build format options
  $("#formats").innerHTML = Object.keys(FORMATS).map(function(k){
    var f = FORMATS[k];
    return '<div class="opt'+(k===format?' on':'')+'" data-f="'+k+'"><div class="radio"></div><div><div class="ot">'+f.name+'</div><div class="od">'+f.desc+'</div></div></div>';
  }).join("");
  Array.prototype.forEach.call($("#formats").children, function(el){
    el.onclick = function(){ format = el.getAttribute("data-f"); render(); };
  });

  // toggles
  Array.prototype.forEach.call(document.querySelectorAll(".toggle[data-opt]"), function(t){
    t.onclick = function(){ var k=t.getAttribute("data-opt"); opts[k]=!opts[k]; render(); };
  });

  function selectedList(){ return employees.filter(function(e){ return selected[e.id]; }); }

  function labelHtml(e){
    var itemsHtml = e.items.map(function(i){
      var mods = (opts.mods && i.mods.length) ? ' <span class="mod">('+esc(i.mods.join(", "))+')</span>' : '';
      return i.e + ' ' + esc(i.n) + mods;
    }).join("<br>");
    var aller = (opts.allergens && e.allergens.length) ? '<div class="label-aller">⚠ '+e.allergens.join(", ").toUpperCase()+'</div>' : '';
    var pk = opts.pickup ? '<span class="pk">'+e.pickup+'</span>' : '';
    return '<div class="label'+(selected[e.id]?'':' off')+'" data-id="'+e.id+'">'
      + '<div class="label-check'+(selected[e.id]?' on':'')+'" data-check="'+e.id+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg></div>'
      + '<div class="label-top"><span class="lg"><span>🍽️</span>Office Grubb</span><span class="lno">#'+e.orderNo+'</span></div>'
      + '<div class="label-body">'
        + '<div class="label-co">'+esc(COMPANY)+' · '+DELIVER+'</div>'
        + '<div class="label-emp"><span class="nm">'+esc(e.name)+'</span>'+pk+'</div>'
        + '<div class="label-items">'+itemsHtml+'</div>'
        + aller
      + '</div></div>';
  }

  function render(){
    var f = FORMATS[format];
    // print @page
    $("#printPage").textContent = f.page;
    // sheet
    var sheet = $("#sheet");
    sheet.className = "sheet " + f.cls;
    sheet.innerHTML = employees.map(labelHtml).join("");
    // wire checkboxes
    Array.prototype.forEach.call(sheet.querySelectorAll("[data-check]"), function(c){
      c.onclick = function(){ var id=+c.getAttribute("data-check"); selected[id]=!selected[id]; render(); };
    });
    // format option active states
    Array.prototype.forEach.call($("#formats").children, function(el){ el.classList.toggle("on", el.getAttribute("data-f")===format); });
    // toggles reflect
    Array.prototype.forEach.call(document.querySelectorAll(".toggle[data-opt]"), function(t){ t.classList.toggle("on", opts[t.getAttribute("data-opt")]); });

    var n = selectedList().length;
    var sheets = Math.max(1, Math.ceil(n / f.per));
    $("#sumSelected").textContent = n;
    $("#sumFormat").textContent = f.name;
    $("#sumSheets").textContent = sheets;
    $("#printTopN").textContent = n;
    $("#metaFormat").textContent = f.name + " · " + (f.cols===1?"1 up":f.cols+" across");
    $("#metaCount").textContent = n + " label" + (n!==1?"s":"") + " · " + sheets + " sheet" + (sheets!==1?"s":"");
  }

  $("#selAll").onclick = function(){ employees.forEach(function(e){ selected[e.id]=true; }); render(); };
  $("#selNone").onclick = function(){ employees.forEach(function(e){ selected[e.id]=false; }); render(); };

  var toastT;
  function toast(msg){ var t=$("#toast"); $("#toastMsg").textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(function(){t.classList.remove("show");},2000); }

  function doPrint(){
    var n = selectedList().length;
    if (!n){ toast("Select at least one label to print"); return; }
    window.print();
  }
  $("#printBtn").onclick = doPrint;
  $("#printTop").onclick = doPrint;
  $("#pdfBtn").onclick = function(){ toast("Label sheet exported to PDF"); };

  $("#scope").onchange = function(){ toast("Showing " + this.options[this.selectedIndex].text); };

  // theme toggle if present (none here) — keep consistent behaviour available
  render();
})();
