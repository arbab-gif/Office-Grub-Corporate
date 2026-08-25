// Office Grubb — Labels hub (all corporations)
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s){ return String(s).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];}); }
  function ic(p){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'+p+'</svg>'; }

  var C = window.OG_LABELS;
  var query = "";

  function initials(n){ return n.split(" ").map(function(w){return w[0];}).join(""); }

  function renderStats(){
    var comps = C.companies.length;
    var nextTime = "11:30 AM"; // earliest deadline
    $("#stats").innerHTML =
      '<div class="lbl-stat hi"><div class="sl">Label Batches</div><div class="sv tnum">'+comps+'</div><div class="sd">companies · today</div></div>'
      + '<div class="lbl-stat"><div class="sl">Total Labels</div><div class="sv tnum">'+C.totalLabels+'</div><div class="sd">one per employee order</div></div>'
      + '<div class="lbl-stat"><div class="sl">Companies</div><div class="sv tnum">'+comps+'</div><div class="sd">on Fri, Jul 11 delivery</div></div>'
      + '<div class="lbl-stat"><div class="sl">Earliest Pickup</div><div class="sv tnum">'+nextTime+'</div><div class="sd">Bright Digital</div></div>';
    $("#allN").textContent = C.totalLabels;
  }

  function renderList(){
    var q = query.trim().toLowerCase();
    var list = C.companies.filter(function(c){ return !q || (c.name+" "+c.order).toLowerCase().indexOf(q)>=0; });
    if (!list.length){ $("#list").innerHTML = '<div style="padding:40px;text-align:center;color:var(--ink-3);background:var(--surface);border:1px solid var(--border);border-radius:16px">No companies match.</div>'; return; }
    $("#list").innerHTML = list.map(function(c){
      var stc = C.statusClass[c.status] || "st-new";
      return '<div class="lbl-card" style="--h:'+c.color+'">'
        + '<div class="lbl-co"><div class="logo" style="background:'+c.color+'">'+esc(initials(c.name))+'</div>'
          + '<div><div class="oid tnum">#'+c.order+'</div><div class="cn">'+esc(c.name)+'</div>'
          + '<span class="pill '+stc+'" style="margin-top:5px"><i></i>'+esc(c.status)+'</span></div></div>'
        + '<div class="lbl-meta">'
          + '<div class="mf">'+ic('<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>')+'<div><div class="ml">Delivery</div><div class="mv">'+esc(c.date)+' · '+esc(c.time)+'</div></div></div>'
          + '<div class="mf">'+ic('<path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>')+'<div><div class="ml">Address</div><div class="mv">'+esc(c.addr)+'</div></div></div>'
        + '</div>'
        + '<div class="lbl-right"><div style="text-align:right"><div class="nlab tnum">'+c.count+'</div><div class="nlabl">labels to print</div></div>'
          + '<a class="lbl-print" href="label-sheet.html?c='+c.id+'">'+ic('<path d="M6 9V3h12v6M6 18H4v-6h16v6h-2M8 14h8v7H8z"/>')+'Preview &amp; print</a></div>'
      + '</div>';
    }).join("");
  }

  var toastT;
  function toast(msg){ var t=$("#toast"); $("#toastMsg").textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(function(){t.classList.remove("show");},2000); }

  $("#search").addEventListener("input", function(){ query = this.value; renderList(); });
  $("#printAll").onclick = function(){ toast("Queued "+C.totalLabels+" labels across "+C.companies.length+" companies"); };

  renderStats();
  renderList();
})();
