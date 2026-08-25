// Office Grubb — Two-Timer Order Status Bar (restaurant-facing, self-contained)
// Timer One = Edit Lock. Timer Two = Menu Close. Timer One is always exactly 2h before Timer Two.
// States: pre-lock (blue) -> locked (yellow) -> final (green). Green is triggered by Timer Two alone.
(function () {
  "use strict";
  var host = document.getElementById("orderStatusBar");
  if (!host) return;

  var ORDER_NO = (document.querySelector(".od-head h1") || {}).textContent || "OG-10482";
  ORDER_NO = ORDER_NO.replace(/[^0-9A-Za-z-]/g, "").replace(/^Order/, "") || "OG-10482";

  var TWO_HOURS = 2 * 3600 * 1000;
  var menuCloseAt = 0, editLockAt = 0, currentState = null, lateCount = 0, everRendered = false;

  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function parts(ms){ ms = Math.max(0, ms); var t = Math.floor(ms/1000); return [pad(Math.floor(t/3600)), pad(Math.floor((t%3600)/60)), pad(t%60)]; }
  function clockTime(ts){ var d = new Date(ts), h = d.getHours(), m = d.getMinutes(), ap = h >= 12 ? "AM".replace("AM","PM") : "AM"; ap = h>=12?"PM":"AM"; var hh = h % 12; if (hh === 0) hh = 12; return hh + ":" + pad(m) + " " + ap; }
  function stateOf(now){ if (now >= menuCloseAt) return "final"; if (now >= editLockAt) return "locked"; return "pre"; }

  function seed(which){
    var now = Date.now();
    if (which === "pre")        menuCloseAt = now + (3*3600 + 47*60) * 1000;   // both timers in the future
    else if (which === "final") menuCloseAt = now - 60 * 1000;                 // menu already closed
    else                        menuCloseAt = now + (1*3600 + 22*60 + 59) * 1000; // locked: matches reference 01:22:59
    editLockAt = menuCloseAt - TWO_HOURS;
    lateCount = 0; currentState = null; everRendered = false;
    build();
  }

  function ic(name){
    var p = {
      info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
      warn:'<path d="M10.3 3.9L2 18a2 2 0 002 3h16a2 2 0 002-3L13.7 3.9a2 2 0 00-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
      check:'<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>'
    }[name];
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + p + '</svg>';
  }
  function digitsHtml(id, ms){ var q = parts(ms); return '<span class="osb-digits" id="'+id+'"><b>'+q[0]+'</b><span class="cln">:</span><b>'+q[1]+'</b><span class="cln">:</span><b>'+q[2]+'</b></span>'; }

  function build(){
    var now = Date.now(), st = stateOf(now);
    // fire notifications on a real transition (not on first paint / manual seed)
    if (everRendered && currentState && st !== currentState){
      if (currentState === "pre" && (st === "locked" || st === "final")) notify("edit");
      if (st === "final") notify("menu");
    }
    currentState = st;

    var latePill = (st === "locked" && lateCount > 0)
      ? '<span class="osb-late">'+ic2()+' +'+lateCount+' new order'+(lateCount>1?'s':'')+'</span>' : '';

    var html = '';
    if (st === "pre"){
      html = '<div class="osb pre"><div class="osb-main"><div class="osb-ic">'+ic("info")+'</div>'
        + '<div class="osb-msg">Quantities not final. Hold prep.</div></div>'
        + '<div class="osb-timers">'
          + '<div class="osb-timer"><div class="tlabel">Edits lock in <span class="clock">— '+clockTime(editLockAt)+'</span></div>'+digitsHtml("osbT1", editLockAt-now)+'</div>'
          + '<div class="osb-timer"><div class="tlabel">Menu closes in <span class="clock">— '+clockTime(menuCloseAt)+'</span></div>'+digitsHtml("osbT2", menuCloseAt-now)+'</div>'
        + '</div></div>';
    } else if (st === "locked"){
      html = '<div class="osb locked"><div class="osb-main"><div class="osb-ic">'+ic("warn")+'</div>'
        + '<div class="osb-msg">Locked orders confirmed — start prep. Late orders may still be added.'+latePill+'</div></div>'
        + '<div class="osb-timers">'
          + '<div class="osb-timer"><div class="tlabel">Edit window</div><span class="osb-chip">'+ic("check")+'Edits locked</span></div>'
          + '<div class="osb-timer"><div class="tlabel">Menu closes in <span class="clock">— '+clockTime(menuCloseAt)+'</span></div>'+digitsHtml("osbT2", menuCloseAt-now)+'</div>'
        + '</div></div>';
    } else {
      html = '<div class="osb final"><div class="osb-main"><div class="osb-ic">'+ic("check")+'</div>'
        + '<div class="osb-msg">Menu closed. Final count confirmed — print manifest and prep for pickup.</div></div></div>';
    }

    // demo control strip
    html += '<div class="osb-demo"><span class="lbl">Preview state</span>'
      + '<button data-seed="pre"'+(st==="pre"?' class="on"':'')+'>Pre-lock · blue</button>'
      + '<button data-seed="locked"'+(st==="locked"?' class="on"':'')+'>Locked · yellow</button>'
      + '<button data-seed="final"'+(st==="final"?' class="on"':'')+'>Final · green</button>'
      + '<button class="demo-late" data-late="1">＋ Simulate late order</button>'
      + '</div>';

    host.innerHTML = html;
    everRendered = true;

    Array.prototype.forEach.call(host.querySelectorAll("[data-seed]"), function(b){ b.onclick = function(){ seed(b.getAttribute("data-seed")); }; });
    var lb = host.querySelector("[data-late]"); if (lb) lb.onclick = addLate;
  }
  function ic2(){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" style="width:12px;height:12px"><path d="M12 5v14M5 12h14"/></svg>'; }

  function tick(){
    var now = Date.now(), st = stateOf(now);
    if (st !== currentState){ build(); return; }        // state changed → full rebuild (+ notify)
    var t2 = document.getElementById("osbT2");
    if (t2){ var q = parts(menuCloseAt-now); t2.querySelectorAll("b")[0].textContent=q[0]; t2.querySelectorAll("b")[1].textContent=q[1]; t2.querySelectorAll("b")[2].textContent=q[2]; }
    var t1 = document.getElementById("osbT1");
    if (t1){ var r = parts(editLockAt-now); t1.querySelectorAll("b")[0].textContent=r[0]; t1.querySelectorAll("b")[1].textContent=r[1]; t1.querySelectorAll("b")[2].textContent=r[2]; }
  }

  function addLate(){
    if (currentState !== "locked"){ alertBox("Late orders only arrive after the edit lock", "Simulate this while the bar is in the yellow (Locked) state — that's the only window when the count can rise.", ""); return; }
    lateCount++; build();
    alertBox("New late order added", "A new order came in during the late window. The count rose to include it — it can only go up from here.", "");
  }

  // ---- notifications (in-system alert; SMS/email is per-restaurant backend) ----
  var alertT;
  function notify(which){
    if (which === "edit") alertBox(
      "Edit window closed · #"+ORDER_NO,
      "Order #"+ORDER_NO+" — the edit and cancellation window is now closed. Locked orders are confirmed. You can begin prepping.",
      "Sent via SMS + email · in-system");
    else alertBox(
      "Menu closed · #"+ORDER_NO,
      "Order #"+ORDER_NO+" — the menu is now closed. No further orders will come through. Final count confirmed — print the manifest and prep for pickup.",
      "Sent via SMS + email · in-system");
  }
  function alertBox(title, msg, chan){
    var el = document.getElementById("osbAlert");
    if (!el){ el = document.createElement("div"); el.className = "osb-alert"; el.id = "osbAlert"; document.body.appendChild(el); }
    el.innerHTML = '<div class="ai"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a9 9 0 019 9v3l1.5 3H1.5L3 15v-3a9 9 0 019-9z"/><path d="M9 20a3 3 0 006 0"/></svg></div>'
      + '<div><div class="at">'+title+'</div><div class="am">'+msg+'</div>'+(chan?'<div class="achan">🔔 '+chan+'</div>':'')+'</div>';
    el.classList.add("show");
    clearTimeout(alertT); alertT = setTimeout(function(){ el.classList.remove("show"); }, 6000);
  }

  seed("locked");      // open in the yellow state, matching the reference
  setInterval(tick, 1000);
})();
