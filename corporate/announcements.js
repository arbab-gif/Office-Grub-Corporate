// Corporate → Announcements.
// One-way broadcast from the corporate admin to employees. Distinct from the Office
// Feed, which is employee-authored and two-way.
//
// Compose is a four-step flow — Message → Audience → Delivery → Review — because a
// broadcast to 500 people is not undoable, and the reach needs to be visible before
// send, not after.
(function () {
  var HEADCOUNT = 500;

  var TYPES = [
    { k:'update', label:'Update',       desc:'General news about the meal programme.' },
    { k:'menu',   label:'Menu',         desc:'A change to what is available, or a new restaurant.' },
    { k:'event',  label:'Event',        desc:'Live Kitchen days, tastings, one-off service.' },
    { k:'urgent', label:'Service issue', desc:'Delivery delayed or cancelled. Bypasses quiet hours.' }
  ];

  var DEPTS = [
    { name:'Engineering', n:158 }, { name:'Operations', n:96 }, { name:'Marketing', n:92 },
    { name:'Finance', n:51 }, { name:'Legal', n:38 }, { name:'Compliance', n:34 },
    { name:'People & HR', n:22 }, { name:'Facilities', n:5 }
  ];
  var DROPS = [ { name:'Floor 3', n:214 }, { name:'Floor 6', n:198 }, { name:'Braintree', n:88 } ];

  var ITEMS = [
    { id:1, title:'Bangkok Bites is here on Wednesday', type:'event', state:'Sent',
      when:'Sent Aug 18, 9:02 AM', audience:'Everyone · 500 people',
      body:'Live Kitchen this Wednesday. Bangkok Bites will be cooking on Floor 3 from 12:00.',
      stats:{ delivered:500, opened:412 } },
    { id:2, title:'Ordering closes at 10:30, not 11:00', type:'update', state:'Sent',
      when:'Sent Aug 12, 4:15 PM', audience:'Everyone · 500 people',
      body:'A reminder that the cutoff moved. Orders placed after 10:30 will not reach the kitchen.',
      stats:{ delivered:500, opened:377 } },
    { id:3, title:'Braintree delivery running late today', type:'urgent', state:'Sent',
      when:'Sent Aug 11, 11:48 AM', audience:'Braintree · 88 people',
      body:'Traffic on Route 3. Expect delivery around 12:30. Nothing is cancelled.',
      stats:{ delivered:88, opened:81 } },
    { id:4, title:'New autumn menu from Clover', type:'menu', state:'Scheduled',
      when:'Sends Aug 22, 8:00 AM', audience:'Everyone · 500 people',
      body:'Clover Food Lab is refreshing its menu from Monday. Six new bowls, same prices.',
      stats:null },
    { id:5, title:'Facilities: kitchen closed for cleaning', type:'update', state:'Draft',
      when:'Edited Aug 19, 2:31 PM', audience:'Facilities · 5 people',
      body:'',
      stats:null }
  ];

  /* ---------------------------------------------------------------- state */
  var filter = 'all', term = '';
  var view = 'list';
  var D = null;                 // draft under composition

  function blank(){
    return { step:1, title:'', body:'', type:'update',
             scope:'all', depts:[], drops:[],
             when:'now', date:'', time:'08:00',
             channels:{ app:true, email:true, sms:false } };
  }

  var listEl   = document.getElementById('anList');
  var flowEl   = document.getElementById('anFlow');
  var rowsEl   = document.getElementById('anRows');
  var emptyEl  = document.getElementById('anEmpty');
  var countEl  = document.getElementById('anCount');

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function typeOf(k){ return TYPES.filter(function(t){ return t.k === k; })[0] || TYPES[0]; }

  /* ------------------------------------------------------------- reach */
  // Reach is recomputed live — the whole point of the audience step is that you
  // see how many people a send actually touches before you commit to it.
  function reach(){
    if (D.scope === 'all') return HEADCOUNT;
    if (D.scope === 'dept')
      return DEPTS.filter(function(d){ return D.depts.indexOf(d.name) > -1; })
                  .reduce(function(a, d){ return a + d.n; }, 0);
    return DROPS.filter(function(d){ return D.drops.indexOf(d.name) > -1; })
                .reduce(function(a, d){ return a + d.n; }, 0);
  }
  function audienceLabel(){
    if (D.scope === 'all') return 'Everyone';
    if (D.scope === 'dept') return D.depts.length ? D.depts.join(', ') : 'No department selected';
    return D.drops.length ? D.drops.join(', ') : 'No drop point selected';
  }

  /* -------------------------------------------------------------- list */
  function matches(a){
    if (filter !== 'all' && a.state.toLowerCase() !== filter) return false;
    if (!term) return true;
    return (a.title + ' ' + a.body + ' ' + a.audience).toLowerCase().indexOf(term) > -1;
  }

  function renderList(){
    var rows = ITEMS.filter(matches);
    rowsEl.innerHTML = rows.map(function(a){
      var t = typeOf(a.type);
      return '<article class="cx-ann">'
        + '<div class="cx-ann-h">'
          + '<i class="cx-tag t-' + a.type + '">' + t.label + '</i>'
          + '<i class="cx-status ' + a.state.toLowerCase() + '">' + a.state + '</i>'
          + '<span class="cx-ann-when">' + esc(a.when) + '</span>'
        + '</div>'
        + '<h3>' + esc(a.title) + '</h3>'
        + (a.body ? '<p>' + esc(a.body) + '</p>' : '<p class="dim">No content yet.</p>')
        + '<div class="cx-ann-f">'
          + '<span class="cx-ann-aud">' + esc(a.audience) + '</span>'
          + (a.stats
              ? '<span class="cx-ann-stat">' + a.stats.delivered + ' delivered · '
                + Math.round(a.stats.opened / a.stats.delivered * 100) + '% opened</span>'
              : '')
        + '</div>'
        + '</article>';
    }).join('');
    emptyEl.hidden = rows.length > 0;
    countEl.textContent = rows.length === ITEMS.length
      ? ITEMS.length + ' announcements'
      : 'Showing ' + rows.length + ' of ' + ITEMS.length + ' announcements';
  }

  /* -------------------------------------------------------------- flow */
  var STEPS = ['Message', 'Audience', 'Delivery', 'Review'];

  function railHTML(){
    return '<div class="cx-flow-rail">' + STEPS.map(function(s, i){
      var n = i + 1;
      var cls = n === D.step ? 'on' : (n < D.step ? 'done' : '');
      return '<div class="cx-fstep ' + cls + '"><span>' + (n < D.step ? '✓' : n) + '</span>' + s + '</div>';
    }).join('') + '</div>';
  }

  function stepMessage(){
    return '<div class="cx-f-label">What are you telling people?</div>'
      + '<div class="cx-f-field"><label for="anTitle">Title</label>'
        + '<input id="anTitle" data-d="title" value="' + esc(D.title) + '" maxlength="70"'
        + ' placeholder="Bangkok Bites is here on Wednesday">'
        + '<div class="cx-f-help"><span id="anTitleCount">' + D.title.length + '/70</span> · shown in the notification and at the top of the message</div></div>'
      + '<div class="cx-f-field"><label for="anBody">Message</label>'
        + '<textarea id="anBody" data-d="body" rows="5" placeholder="Keep it to what someone needs to know before lunch.">' + esc(D.body) + '</textarea></div>'
      + '<div class="cx-f-label">Type</div>'
      + '<div class="cx-f-types">' + TYPES.map(function(t){
          return '<button class="cx-f-type' + (D.type === t.k ? ' on' : '') + '" data-type="' + t.k + '">'
            + '<b>' + t.label + '</b><em>' + t.desc + '</em></button>';
        }).join('') + '</div>'
      + (D.type === 'urgent'
          ? note('warn', 'A service issue sends immediately on every channel you pick, including outside quiet hours. Use it when lunch is affected — not for news.')
          : '');
  }

  function stepAudience(){
    var body = '<div class="cx-f-label">Who receives it?</div>'
      + '<div class="cx-f-scope">'
        + scopeBtn('all',  'Everyone',      HEADCOUNT + ' enrolled employees')
        + scopeBtn('dept', 'By department', '8 departments')
        + scopeBtn('drop', 'By drop point', '3 drop points')
      + '</div>';

    if (D.scope === 'dept'){
      body += '<div class="cx-f-picks">' + DEPTS.map(function(d){
        var on = D.depts.indexOf(d.name) > -1;
        return '<button class="cx-pick' + (on ? ' on' : '') + '" data-dept="' + esc(d.name) + '">'
          + '<span class="cx-pick-box"></span>' + esc(d.name) + '<em>' + d.n + '</em></button>';
      }).join('') + '</div>';
    } else if (D.scope === 'drop'){
      body += '<div class="cx-f-picks">' + DROPS.map(function(d){
        var on = D.drops.indexOf(d.name) > -1;
        return '<button class="cx-pick' + (on ? ' on' : '') + '" data-drop="' + esc(d.name) + '">'
          + '<span class="cx-pick-box"></span>' + esc(d.name) + '<em>' + d.n + '</em></button>';
      }).join('') + '</div>';
    }

    var r = reach();
    body += '<div class="cx-reach"><div><div class="cx-reach-n">' + r.toLocaleString('en-US')
      + ' <span>' + (r === 1 ? 'person' : 'people') + '</span></div>'
      + '<div class="cx-reach-s">' + esc(audienceLabel()) + '</div></div>'
      + '<div class="cx-reach-pct">' + Math.round(r / HEADCOUNT * 100) + '%<em>of enrolled</em></div></div>';

    if (D.scope !== 'all' && r > 0 && r < 10){
      body += note('warn', 'This reaches ' + r + ' people. A group this small makes the message effectively personal — check that is what you intend.');
    }
    return body;
  }

  function scopeBtn(k, label, sub){
    return '<button class="cx-f-scope-b' + (D.scope === k ? ' on' : '') + '" data-scope="' + k + '">'
      + '<b>' + label + '</b><em>' + sub + '</em></button>';
  }

  function stepDelivery(){
    return '<div class="cx-f-label">When does it go out?</div>'
      + '<div class="cx-f-scope">'
        + '<button class="cx-f-scope-b' + (D.when === 'now' ? ' on' : '') + '" data-when="now">'
          + '<b>Send now</b><em>Delivered within a minute</em></button>'
        + '<button class="cx-f-scope-b' + (D.when === 'later' ? ' on' : '') + '" data-when="later">'
          + '<b>Schedule</b><em>Pick a date and time</em></button>'
      + '</div>'
      + (D.when === 'later'
          ? '<div class="cx-f-two">'
            + '<div class="cx-f-field"><label for="anDate">Date</label>'
              + '<input id="anDate" type="date" data-d="date" value="' + esc(D.date) + '"></div>'
            + '<div class="cx-f-field"><label for="anTime">Time</label>'
              + '<input id="anTime" type="time" data-d="time" value="' + esc(D.time) + '"></div>'
            + '</div>'
            + note('info', 'Anything that affects today\'s lunch should land before the 10:30 AM cutoff, or people cannot act on it.')
          : '')
      + '<div class="cx-f-label">Channels</div>'
      + '<div class="cx-f-picks wide">'
        + chan('app',   'In the app',  'Appears in their notifications. Always on.')
        + chan('email', 'Email',       'To their work address.')
        + chan('sms',   'SMS',         'Text message. Best kept for service issues.')
      + '</div>';
  }

  function chan(k, label, sub){
    var on = D.channels[k], locked = k === 'app';
    return '<button class="cx-pick wide' + (on ? ' on' : '') + (locked ? ' locked' : '') + '" data-chan="' + k + '"'
      + (locked ? ' disabled' : '') + '>'
      + '<span class="cx-pick-box"></span><span class="cx-pick-b"><b>' + label + '</b><em>' + sub + '</em></span></button>';
  }

  function stepReview(){
    var r = reach(), t = typeOf(D.type);
    var chans = Object.keys(D.channels).filter(function(k){ return D.channels[k]; })
      .map(function(k){ return { app:'In the app', email:'Email', sms:'SMS' }[k]; }).join(', ');
    var issues = problems();

    return '<div class="cx-f-label">Check before it goes</div>'
      + '<article class="cx-ann preview">'
        + '<div class="cx-ann-h"><i class="cx-tag t-' + D.type + '">' + t.label + '</i>'
        + '<span class="cx-ann-when">' + (D.when === 'now' ? 'Sends immediately'
            : 'Scheduled ' + (D.date || 'date not set') + ' at ' + D.time) + '</span></div>'
        + '<h3>' + (esc(D.title) || '<span class="dim">Untitled</span>') + '</h3>'
        + (D.body ? '<p>' + esc(D.body) + '</p>' : '<p class="dim">No message written.</p>')
      + '</article>'
      + '<div class="cx-mf-rows">'
        + '<div class="cx-mf-r"><span>Audience</span><b>' + esc(audienceLabel()) + '</b></div>'
        + '<div class="cx-mf-r"><span>Reaches</span><b>' + r.toLocaleString('en-US') + ' of ' + HEADCOUNT + ' enrolled</b></div>'
        + '<div class="cx-mf-r"><span>Channels</span><b>' + (chans || 'None') + '</b></div>'
        + '<div class="cx-mf-r"><span>Type</span><b>' + t.label + '</b></div>'
      + '</div>'
      + (issues.length ? note('warn', '<b>Still needed:</b> ' + issues.join(' · ') + '.') : '')
      + note('info', 'Announcements cannot be recalled once sent. Employees cannot reply — point them somewhere if you need an answer back.');
  }

  function problems(){
    var m = [];
    if (!D.title.trim()) m.push('a title');
    if (!D.body.trim()) m.push('a message');
    if (D.scope !== 'all' && reach() === 0) m.push('at least one group');
    if (D.when === 'later' && !D.date) m.push('a send date');
    return m;
  }

  function note(kind, html){
    var cls = kind === 'warn' ? 'cx-warn' : 'cx-privacy';
    var ic = kind === 'warn'
      ? '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>'
      : '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>';
    return '<div class="' + cls + '"><svg viewBox="0 0 24 24">' + ic + '</svg><span>' + html + '</span></div>';
  }

  function renderFlow(){
    var bodies = [stepMessage, stepAudience, stepDelivery, stepReview];
    var last = D.step === 4;
    flowEl.innerHTML =
      '<div class="db-head cx-head">'
        + '<div><button class="cx-back" data-cancel="1">← Announcements</button>'
        + '<h1>New announcement</h1>'
        + '<div class="cx-meta"><span>Step ' + D.step + ' of 4 · ' + STEPS[D.step - 1] + '</span></div></div>'
      + '</div>'
      + railHTML()
      + '<div class="cx-flow-card">' + bodies[D.step - 1]() + '</div>'
      + '<div class="cx-flow-foot">'
        + (D.step > 1 ? '<button class="cx-btn ghost" data-step="' + (D.step - 1) + '">Back</button>' : '')
        + '<span style="flex:1"></span>'
        + '<button class="cx-btn ghost" data-savedraft="1">Save draft</button>'
        + (last
            ? '<button class="cx-btn" data-send="1"' + (problems().length ? ' disabled' : '') + '>'
              + (D.when === 'now' ? 'Send to ' + reach().toLocaleString('en-US') + ' people' : 'Schedule announcement') + '</button>'
            : '<button class="cx-btn" data-step="' + (D.step + 1) + '">Continue</button>')
      + '</div>';
  }

  function renderSent(){
    var r = reach();
    flowEl.innerHTML = '<div class="cx-done">'
      + '<div class="cx-done-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>'
      + '<h1>' + (D.when === 'now' ? 'Announcement sent' : 'Announcement scheduled') + '</h1>'
      + '<p>' + (D.when === 'now'
          ? '“' + esc(D.title) + '” went to <b>' + r.toLocaleString('en-US') + ' people</b>.'
          : '“' + esc(D.title) + '” will go to <b>' + r.toLocaleString('en-US') + ' people</b> on ' + esc(D.date) + ' at ' + esc(D.time) + '.') + '</p>'
      + '<button class="cx-btn" data-cancel="1">Back to announcements</button>'
      + '</div>';
  }

  function paint(){
    listEl.hidden = view !== 'list';
    flowEl.hidden = view === 'list';
    if (view === 'list') renderList();
    else if (view === 'flow') renderFlow();
    else renderSent();
    window.scrollTo(0, 0);
  }

  /* ------------------------------------------------------------ events */
  document.getElementById('anNew').addEventListener('click', function(){
    D = blank(); view = 'flow'; paint();
  });
  document.getElementById('anTabs').addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b) return;
    this.querySelectorAll('button').forEach(function(x){
      x.classList.remove('on'); x.setAttribute('aria-selected','false'); });
    b.classList.add('on'); b.setAttribute('aria-selected','true');
    filter = b.dataset.f; renderList();
  });
  document.getElementById('anSearch').addEventListener('input', function(){
    term = this.value.trim().toLowerCase(); renderList();
  });

  flowEl.addEventListener('click', function(e){
    var el;
    if ((el = e.target.closest('[data-cancel]'))){ view = 'list'; D = null; return paint(); }
    if ((el = e.target.closest('[data-step]'))){  D.step = +el.dataset.step; return renderFlow(); }
    if ((el = e.target.closest('[data-type]'))){  D.type = el.dataset.type; return renderFlow(); }
    if ((el = e.target.closest('[data-scope]'))){ D.scope = el.dataset.scope; return renderFlow(); }
    if ((el = e.target.closest('[data-when]'))){  D.when = el.dataset.when; return renderFlow(); }
    if ((el = e.target.closest('[data-dept]'))){  toggle(D.depts, el.dataset.dept); return renderFlow(); }
    if ((el = e.target.closest('[data-drop]'))){  toggle(D.drops, el.dataset.drop); return renderFlow(); }
    if ((el = e.target.closest('[data-chan]'))){
      var k = el.dataset.chan; if (k === 'app') return;
      D.channels[k] = !D.channels[k]; return renderFlow();
    }
    if ((el = e.target.closest('[data-savedraft]'))){
      ITEMS.unshift({ id:Date.now(), title:D.title || 'Untitled draft', type:D.type, state:'Draft',
        when:'Edited just now', audience:audienceLabel() + ' · ' + reach() + ' people',
        body:D.body, stats:null });
      view = 'list'; D = null; return paint();
    }
    if ((el = e.target.closest('[data-send]'))){
      ITEMS.unshift({ id:Date.now(), title:D.title, type:D.type,
        state:D.when === 'now' ? 'Sent' : 'Scheduled',
        when:D.when === 'now' ? 'Sent just now' : 'Sends ' + D.date + ', ' + D.time,
        audience:audienceLabel() + ' · ' + reach() + ' people',
        body:D.body, stats:D.when === 'now' ? { delivered:reach(), opened:0 } : null });
      view = 'sent'; return paint();
    }
  });

  // text inputs update state without a re-render, so focus and caret survive typing
  flowEl.addEventListener('input', function(e){
    var t = e.target; if (!t.dataset || !t.dataset.d) return;
    D[t.dataset.d] = t.value;
    if (t.dataset.d === 'title'){
      var c = document.getElementById('anTitleCount');
      if (c) c.textContent = D.title.length + '/70';
    }
  });

  function toggle(arr, v){
    var i = arr.indexOf(v);
    if (i > -1) arr.splice(i, 1); else arr.push(v);
  }

  paint();
})();
