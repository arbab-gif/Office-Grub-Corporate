// Corporate → Employees. Roster with status filter and search.
(function () {
  var PEOPLE = [
    { name:'Dana Whitfield',    email:'dwhitfield@beaconyards.com',   dept:'Marketing',   drop:'Floor 3',   status:'Active',      enrolled:'Feb 3, 2026',  orders:84  },
    { name:'Marcus Oyelaran',   email:'moyelaran@beaconyards.com',    dept:'Engineering', drop:'Floor 6',   status:'Active',      enrolled:'Jan 12, 2026', orders:122 },
    { name:'Priya Raghunathan', email:'praghunathan@beaconyards.com', dept:'Legal',       drop:'Floor 3',   status:'Active',      enrolled:'Mar 21, 2026', orders:47  },
    { name:'Tom Beaulieu',      email:'tbeaulieu@beaconyards.com',    dept:'Operations',  drop:'Floor 3',   status:'Invited',     enrolled:null,           orders:null},
    { name:'Aisha Nkemdirim',   email:'ankemdirim@beaconyards.com',   dept:'Compliance',  drop:'Braintree', status:'Active',      enrolled:'Feb 28, 2026', orders:63  },
    { name:'Grant Sollazzo',    email:'gsollazzo@byf-capital.com',    dept:'Finance',     drop:'Floor 6',   status:'Deactivated', enrolled:'Nov 4, 2025',  orders:210 },
    { name:'Yuki Tanabe',       email:'ytanabe@beaconyards.com',      dept:'Engineering', drop:'Floor 6',   status:'Active',      enrolled:'Apr 9, 2026',  orders:38  },
    { name:'Rosalind Achebe',   email:'rachebe@beaconyards.com',      dept:'People & HR', drop:'Floor 3',   status:'Active',      enrolled:'Jan 8, 2026',  orders:91  }
  ];

  var KEBAB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">'
    + '<circle cx="12" cy="6" r=".6"/><circle cx="12" cy="12" r=".6"/><circle cx="12" cy="18" r=".6"/></svg>';

  var filter = 'all', term = '';
  var rows = document.getElementById('empRows');
  var empty = document.getElementById('empEmpty');

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  function matches(p){
    if (filter !== 'all' && p.status.toLowerCase() !== filter) return false;
    if (!term) return true;
    var hay = (p.name + ' ' + p.email + ' ' + p.dept + ' ' + p.drop).toLowerCase();
    return hay.indexOf(term) > -1;
  }

  var count = document.getElementById('empCount');

  function render(){
    var list = PEOPLE.filter(matches);
    rows.innerHTML = list.map(function(p){
      return '<tr>'
        + '<th scope="row" class="cx-emp"><b>' + esc(p.name) + '</b><em>' + esc(p.email) + '</em></th>'
        + '<td>' + esc(p.dept) + '</td>'
        + '<td>' + esc(p.drop) + '</td>'
        + '<td><i class="cx-status ' + p.status.toLowerCase() + '">' + p.status + '</i></td>'
        + '<td class="mono">' + (p.enrolled || '—') + '</td>'
        + '<td class="ta-r mono">' + (p.orders == null ? '–' : p.orders) + '</td>'
        + '<td class="ta-r"><button class="cx-row-act" aria-label="Actions for ' + esc(p.name) + '">' + KEBAB + '</button></td>'
        + '</tr>';
    }).join('');
    empty.hidden = list.length > 0;
    // filtering silently changed the list before — say what is being shown
    count.textContent = list.length === PEOPLE.length
      ? PEOPLE.length + ' employees'
      : 'Showing ' + list.length + ' of ' + PEOPLE.length + ' employees';
  }

  document.getElementById('empTabs').addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b) return;
    this.querySelectorAll('button').forEach(function(x){
      x.classList.remove('on'); x.setAttribute('aria-selected','false');
    });
    b.classList.add('on'); b.setAttribute('aria-selected','true');
    filter = b.dataset.f;
    render();
  });
  document.getElementById('empSearch').addEventListener('input', function(){
    term = this.value.trim().toLowerCase();
    render();
  });

  render();
})();
