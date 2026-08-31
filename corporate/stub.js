// Screens that exist in the nav but are not built out yet.
// Each one renders the real data we already hold plus its scope, so clicking a nav
// item always lands somewhere honest instead of doing nothing.
(function () {
  var S = {
    guests: {
      eyebrow:'People', title:'Guests',
      lead:'Visitors who order on your account.',
      stats:[['4','Active guests'],['$1,290.00','Guest credit this period'],['86','Guest orders']],
      rows:[
        ['Guest passes','Issued by an employee, valid for one service day'],
        ['Credit','Charged at the same $15.00 daily rate as an employee'],
        ['Billing','A separate line on your invoice, under GL 6410-GST']
      ],
      scope:['Issue and revoke guest passes','See who sponsored each visitor',
             'Guest credit against the separate exposure line','Per-visit history and receipts']
    },
    benefit: {
      eyebrow:'Program', title:'Meal benefit', locked:true,
      lead:'The shape of your programme. Set by Office Grubb.',
      stats:[['$15.00','Daily credit'],['10:30 AM','Ordering closes'],['12:00 PM','Delivery']],
      rows:[
        ['Service days','Mon · Tue · Wed · Thu'],
        ['Credit model','Per person, per service day. No rollover — unused credit is never billed.'],
        ['Ordering window','Set by Office Grubb, roughly 90 minutes before service']
      ],
      note:'These are set by your account manager, not here. The cutoff drives restaurant prep and driver dispatch, so it cannot be edited by the corporation.',
      scope:['Request a change to the daily credit','Request different service days',
             'See the change history and who approved it']
    },
    drops: {
      eyebrow:'Program', title:'Drop points',
      lead:'The buildings we deliver to.',
      stats:[['3','Drop points'],['500','Enrolled across all'],['142','Orders on the last service day']],
      table:{ head:['Drop point','Code','Enrolled','Delivery contact'],
              rows:[['Floor 3','BYF-03','214','Dana Whitfield'],
                    ['Floor 6','BYF-06','198','Marcus Oyelaran'],
                    ['Braintree','BYF-BT2','88','Aisha Nkemdirim']] },
      scope:['Add or retire a drop point','Set delivery instructions per building',
             'Nominate the person who tracks that building\'s orders','Building-level order history']
    },
    live: {
      eyebrow:'Program', title:'Live Kitchen',
      lead:'A restaurant cooks on site, included in your plan.',
      stats:[['Wednesdays','Cadence'],['Bangkok Bites','Next restaurant'],['$0','Setup fee']],
      rows:[
        ['What it costs you','Nothing extra. Employees pay the restaurant directly on site.'],
        ['The one exception','An $800/day minimum. If on-site sales fall short, the difference is added to your next delivery invoice — never charged to the restaurant.'],
        ['Headcount','Your estimate is passed to the restaurant so they can prep']
      ],
      scope:['Confirm headcount before each event','Past event history and attendance',
             'Request a cuisine or a specific restaurant','Corporate branding add-on, quoted at cost']
    },
    integrations: {
      eyebrow:'Program', title:'Integrations',
      lead:'Connect the systems you already run.',
      table:{ head:['System','Purpose','Phase'],
              rows:[['Stripe','Subscription billing and invoicing','Launch'],
                    ['DocuSign','Corporate agreement e-signature','Launch'],
                    ['Twilio SMS','Delivery and service alerts','Launch'],
                    ['Google Maps','Address validation and routing','Launch'],
                    ['Slack / MS Teams','Order and delivery notifications','Phase 2'],
                    ['HubSpot CRM','Account pipeline and renewals','Phase 2'],
                    ['QuickBooks / Xero','Push invoices to your ledger','Phase 2']] },
      scope:['Connect and authorise each system','Map GL codes to your chart of accounts',
             'Choose which events raise a notification']
    },
    schedule: {
      eyebrow:'Service', title:'Schedule',
      lead:'Which restaurant is coming, and when.',
      stats:[['Mon · Tue · Wed · Thu','Service days'],['12:00 PM','Delivery'],['4','Restaurants in rotation']],
      table:{ head:['Day','Restaurant','Cuisine','Note'],
              rows:[['Monday',"Anna's Taqueria",'Mexican','—'],
                    ['Tuesday','Bon Me','Vietnamese','—'],
                    ['Wednesday','Bangkok Bites','Thai','Live Kitchen — on site'],
                    ['Thursday','Clover Food Lab','Vegetarian','—'],
                    ['Friday','—','—','No service']] },
      scope:['Full calendar by month','Upcoming Live Kitchen dates',
             'Advance orders placed by your team','Holiday and closure handling']
    },
    issues: {
      eyebrow:'Service', title:'Service issues',
      lead:'What went wrong with a delivery, and what happened about it.',
      stats:[['2','Open this period'],['$645.00','Refunded this period'],['1','Awaiting restaurant']],
      table:{ head:['Date','Drop point','Issue','Status'],
              rows:[['Jul 20','BYF-BT2','1 order missing at scan — Clover Food Lab','Refunded before billing'],
                    ['May 28','BYF-03','Zaftigs short delivery','Credit note carried forward'],
                    ['Aug 11','BYF-BT2','Delivery late — traffic on Route 3','Resolved, no charge']] },
      rows:[['How refunds appear','Caught before billing they never reach your invoice. Caught after, they appear as a credit note carried forward.']],
      scope:['Report an issue against a specific order or batch','Track the restaurant\'s response',
             'See the refund on the invoice it affects']
    },
    settings: {
      eyebrow:'', title:'Settings',
      lead:'Account, billing and notification preferences.',
      rows:[
        ['Account','Company details, registered domains, corporate agreement'],
        ['Billing','Billing contact, payment method, PO number, tax exemption'],
        ['Checkout','How meals are paid — account-wide, changeable at any time'],
        ['Notifications','Who is alerted about deliveries, service issues and invoices'],
        ['Access','Who administers this account, and per-building order trackers']
      ],
      scope:['Change the checkout model','Manage administrators',
             'Update billing contact and payment method','Download the signed agreement']
    }
  };

  var key = document.body.getAttribute('data-stub');
  var d = S[key];
  if (!d) return;

  document.title = 'Office Grubb — ' + d.title + ' · Beacon Yards Financial';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  var html = '<div class="db-head cx-head"><div>'
    + (d.eyebrow ? '<div class="cx-eyebrow">' + d.eyebrow + '</div>' : '')
    + '<h1>' + esc(d.title) + (d.locked ? ' <i class="cx-lockchip" style="vertical-align:middle">'
        + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4.5" y="10" width="15" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>Set by Office Grubb</i>' : '')
    + '</h1>'
    + '<p class="cx-subtext">' + d.lead + '</p>'
    + '<div class="cx-meta">'
      + '<span><svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 21v-5h6v5"/></svg>Beacon Yards Financial</span>'
      + '<span class="mono">OG-BLFB-6KKM-BBUL</span>'
      + '<span><svg viewBox="0 0 24 24"><path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/></svg>3 drop points</span>'
    + '</div></div></div>';

  if (d.stats){
    html += '<div class="db-grid">' + d.stats.map(function(s){
      return '<div class="cx-kpi col-4"><div class="cx-k">' + esc(s[1]) + '</div>'
        + '<div class="cx-v">' + esc(s[0]) + '</div></div>';
    }).join('') + '</div>';
  }


  if (d.table){
    html += '<div class="cx-table"><table><thead><tr>'
      + d.table.head.map(function(h){ return '<th scope="col">' + esc(h) + '</th>'; }).join('')
      + '</tr></thead><tbody>'
      + d.table.rows.map(function(r){
          return '<tr>' + r.map(function(c, i){
            return i === 0 ? '<th scope="row">' + esc(c) + '</th>' : '<td>' + esc(c) + '</td>';
          }).join('') + '</tr>';
        }).join('')
      + '</tbody></table></div>';
  }

  if (d.rows){
    html += '<div class="cx-mf-rows" style="margin-top:18px">' + d.rows.map(function(r){
      return '<div class="cx-mf-r" style="align-items:flex-start">'
        + '<span style="flex:none;width:190px">' + esc(r[0]) + '</span>'
        + '<b style="flex:1;text-align:left;font-weight:500;color:var(--cx-ink2);line-height:1.55">'
        + esc(r[1]) + '</b></div>';
    }).join('') + '</div>';
  }

  if (d.note){
    html += '<div class="cx-privacy"><svg viewBox="0 0 24 24"><rect x="4.5" y="10" width="15" height="10" rx="2"/>'
      + '<path d="M8 10V7a4 4 0 018 0v3"/></svg><span>' + esc(d.note) + '</span></div>';
  }

  html += '<div class="db-card" style="margin-top:20px">'
    + '<div class="db-ch"><h2>Coming to this screen</h2>'
    + '<span class="cx-pill">Not built yet</span></div>'
    + '<ul class="cx-scope">' + d.scope.map(function(s){
        return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>'
    + '</div>';

  document.querySelector('.db-wrap').innerHTML = html;
})();
