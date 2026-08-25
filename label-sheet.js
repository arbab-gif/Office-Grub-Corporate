// Office Grubb — Label Sheet flow (per-company, ?c=<companyId>)
// Two Avery laser formats, chosen via a popup when printing.
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s){ return String(s).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];}); }

  var DB = window.OG_LABELS;
  var cid = (new URLSearchParams(location.search)).get("c") || DB.companies[0].id;
  var company = DB.companyById(cid) || DB.companies[0];
  cid = company.id;
  var employees = DB.employeesFor(cid);
  var COMPANY = company.name, DELIVER = company.date.replace(",","") + " · " + company.time;

  // The two Avery packets the restaurant can buy. Both print on a laser printer.
  var FORMATS = {
    "94231": { name:"Avery 94231", dims:"7.5\" × 1.5\"", cols:1, per:6, cls:"fmt-94231", shape:"shape-94231", cells:3, page:"@page{size:letter;margin:0.5in;}" },
    "5164":  { name:"Avery 5164",  dims:"4\" × 3.33\"",  cols:2, per:6, cls:"fmt-5164",  shape:"shape-5164",  cells:6, page:"@page{size:letter;margin:0.5in;}" }
  };
  var format = "94231";          // default; the popup lets the restaurant switch
  var pendingFormat = format;
  var opts = { allergens:true, pickup:true, mods:true };
  var selected = {}; employees.forEach(function(e){ selected[e.id] = true; });
  var startPos = 1;
  var testMode = false;

  // header + scope
  $("#hdrSub").textContent = "Order #" + company.order + " · " + company.name + " · " + company.date + " delivery";
  $("#scope").innerHTML = DB.companies.map(function(c){
    return '<option value="'+c.id+'"'+(c.id===cid?' selected':'')+'>'+esc(c.name)+' — '+c.count+' labels</option>';
  }).join("");
  $("#scope").onchange = function(){ location.search = "?c=" + this.value; };

  Array.prototype.forEach.call(document.querySelectorAll(".toggle[data-opt]"), function(t){ t.onclick = function(){ opts[t.getAttribute("data-opt")] = !opts[t.getAttribute("data-opt")]; render(); }; });

  function selectedList(){ return employees.filter(function(e){ return selected[e.id]; }); }
  function shapeHtml(k, small){ var f = FORMATS[k]; var cells = ""; for (var i=0;i<f.cells;i++) cells += "<i></i>"; return '<div class="fmt-shape '+f.shape+(small?" shape-sm":"")+'">'+cells+'</div>'; }

  function labelHtml(e){
    var itemsHtml = e.items.map(function(i){
      var mods = (opts.mods && i.mods.length) ? ' <span class="mod">('+esc(i.mods.join(", "))+')</span>' : '';
      return i.e + ' ' + esc(i.n) + mods;
    }).join("<br>");
    var aller = (opts.allergens && e.allergens.length) ? '<div class="label-aller">⚠ '+e.allergens.join(", ").toUpperCase()+'</div>' : '';
    var pk = opts.pickup ? '<span class="pk">'+e.pickup+'</span>' : '';
    return '<div class="label'+(selected[e.id]?'':' off')+'" data-id="'+e.id+'">'
      + '<button class="label-one" data-one="'+e.id+'" title="Print just this label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V3h12v6M6 18H4v-6h16v6h-2M8 14h8v7H8z"/></svg></button>'
      + '<div class="label-check'+(selected[e.id]?' on':'')+'" data-check="'+e.id+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg></div>'
      + '<div class="label-top"><span class="lg"><span>🍽️</span>Office Grubb</span><span class="lno">#'+e.orderNo+'</span></div>'
      + '<div class="label-body">'
        + '<div class="label-main"><div class="label-co">'+esc(COMPANY)+' · '+DELIVER+'</div>'
          + '<div class="label-emp"><span class="nm">'+esc(e.name)+'</span>'+pk+'</div></div>'
        + '<div class="label-side"><div class="label-items">'+itemsHtml+'</div>'+aller+'</div>'
      + '</div></div>';
  }

  function renderStock(){
    var f = FORMATS[format];
    $("#stockCur").innerHTML = shapeHtml(format, true)
      + '<div class="sh-txt"><div class="sn">'+f.name+'</div><div class="sd">'+f.dims+' · '+f.per+' per sheet · laser</div></div>';
  }

  function render(){
    var f = FORMATS[format];
    $("#printPage").textContent = f.page;
    var sheet = $("#sheet");
    sheet.className = "sheet " + f.cls;

    if (testMode){
      var t = "";
      for (var p=1;p<=f.per;p++) t += '<div class="label test"><div><div class="tpos tnum">'+p+'</div><div class="tlbl">Office Grubb · align test</div></div></div>';
      sheet.innerHTML = t;
      $("#metaFormat").textContent = f.name + " · alignment test";
      $("#metaCount").textContent = f.per + " test cells · 1 sheet";
      renderStock();
      return;
    }

    var lead = f.per > 1 ? (startPos - 1) : 0;
    if (startPos > f.per) startPos = f.per; if (startPos < 1) startPos = 1;
    lead = startPos - 1;
    var blanks = "";
    for (var b=0;b<lead;b++) blanks += '<div class="label blank"><span>used</span></div>';
    sheet.innerHTML = blanks + employees.map(labelHtml).join("");

    Array.prototype.forEach.call(sheet.querySelectorAll("[data-check]"), function(c){
      c.onclick = function(){ var id=+c.getAttribute("data-check"); selected[id]=!selected[id]; render(); };
    });
    Array.prototype.forEach.call(sheet.querySelectorAll("[data-one]"), function(btn){
      btn.onclick = function(ev){ ev.stopPropagation(); printOne(+btn.getAttribute("data-one")); };
    });
    Array.prototype.forEach.call(document.querySelectorAll(".toggle[data-opt]"), function(t){ t.classList.toggle("on", opts[t.getAttribute("data-opt")]); });

    // offset control (both Avery formats are sheet stock)
    $("#offsetVal").value = startPos;
    $("#offMax").textContent = "of " + f.per;
    $("#offMinus").disabled = startPos <= 1;
    $("#offPlus").disabled = startPos >= f.per;

    var n = selectedList().length;
    var sheets = Math.max(1, Math.ceil((lead + n) / f.per));
    $("#sumSelected").textContent = n;
    $("#sumFormat").textContent = f.name;
    $("#sumSheets").textContent = sheets;
    $("#printTopN").textContent = n;
    $("#metaFormat").textContent = f.name + " · " + (f.cols===1?"1 across":f.cols+" across");
    $("#metaCount").textContent = n + " label" + (n!==1?"s":"") + (lead? " · from position "+startPos : "") + " · " + sheets + " sheet" + (sheets!==1?"s":"");
    renderStock();
  }

  function setFormat(k){ format = k; if (startPos > FORMATS[k].per) startPos = FORMATS[k].per; render(); renderFmtOpts(); }
  function setOffset(v){ startPos = v; render(); }

  // ---- format popup ----
  var FORMAT_ORDER = ["94231", "5164"];
  function renderFmtOpts(){
    $("#fmtOpts").innerHTML = FORMAT_ORDER.map(function(k){
      var f = FORMATS[k];
      return '<div class="fmt-opt'+(k===pendingFormat?" on":"")+'" data-f="'+k+'">'+shapeHtml(k,false)
        + '<div class="fmt-info"><div class="fn">'+f.name+'</div><div class="fd">'+f.dims+' · '+f.per+' per sheet · laser</div></div>'
        + '<div class="fmt-radio"></div></div>';
    }).join("");
    Array.prototype.forEach.call($("#fmtOpts").children, function(el){
      el.onclick = function(){ pendingFormat = el.getAttribute("data-f"); setFormat(pendingFormat); };
    });
  }
  function openFmt(){ pendingFormat = format; $("#fmtN").textContent = selectedList().length; renderFmtOpts(); $("#fmtModal").classList.add("show"); }
  function closeFmt(){ $("#fmtModal").classList.remove("show"); }

  // ---- printing ----
  var toastT;
  function toast(msg){ var t=$("#toast"); $("#toastMsg").textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(function(){t.classList.remove("show");},2000); }
  function doPrint(){ if (!selectedList().length){ toast("Select at least one label to print"); return; } window.print(); }
  function printOne(id){ employees.forEach(function(e){ selected[e.id] = (e.id===id); }); render(); window.print(); }
  function printTest(){ testMode = true; render(); window.print(); testMode = false; render(); toast("Test sheet sent — check alignment on your "+FORMATS[format].name+" stock"); }

  // wiring
  $("#selAll").onclick = function(){ employees.forEach(function(e){ selected[e.id]=true; }); render(); };
  $("#selNone").onclick = function(){ employees.forEach(function(e){ selected[e.id]=false; }); render(); };
  $("#offMinus").onclick = function(){ setOffset(startPos - 1); };
  $("#offPlus").onclick = function(){ setOffset(startPos + 1); };
  $("#offsetVal").onchange = function(){ var v = parseInt(this.value, 10); setOffset(isNaN(v) ? 1 : v); };

  $("#printTop").onclick = openFmt;
  $("#printBtn").onclick = openFmt;
  $("#changeFmt").onclick = openFmt;
  $("#testBtn").onclick = printTest;
  $("#fmtClose").onclick = closeFmt;
  $("#fmtCancel").onclick = closeFmt;
  $("#fmtModal").onclick = function(e){ if (e.target === $("#fmtModal")) closeFmt(); };
  $("#fmtPrint").onclick = function(){ closeFmt(); doPrint(); };
  $("#fmtTest").onclick = function(){ closeFmt(); printTest(); };

  render();
})();
