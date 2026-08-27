// Shared corporate-portal actions: CSV export, print, toast.
// Loaded by every corporate screen so Export/Print/Download do real work rather
// than sitting there as decoration.
window.CorpActions = (function () {

  function toast(msg){
    var el = document.getElementById('cxToast');
    if (!el){
      el = document.createElement('div');
      el.id = 'cxToast'; el.className = 'cx-toast';
      el.setAttribute('role','status'); el.setAttribute('aria-live','polite');
      document.body.appendChild(el);
    }
    el.textContent = msg; el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function(){ el.hidden = true; }, 3500);
  }

  // RFC-4180-ish: quote everything, double internal quotes. Excel opens this cleanly.
  function csv(rows){
    return rows.map(function(r){
      return r.map(function(c){
        return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"';
      }).join(',');
    }).join('\r\n');
  }

  function download(filename, text, mime){
    var blob = new Blob([csv.BOM ? '' : '﻿', text], {type: (mime || 'text/csv') + ';charset=utf-8'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
    toast('Downloaded ' + filename);
  }

  function exportCSV(filename, header, rows){
    download(filename, csv([header].concat(rows)));
  }

  // Pull a rendered <table> straight out of the DOM so the export always matches
  // what is on screen, filters included.
  function exportTable(filename, tableEl, opts){
    opts = opts || {};
    var head = [].map.call(tableEl.querySelectorAll('thead th'), function(th){
      return th.textContent.trim();
    });
    var skip = opts.skipLast === false ? 0 : 1;      // trailing action column
    if (skip) head = head.slice(0, -1);
    var rows = [].map.call(tableEl.querySelectorAll('tbody tr'), function(tr){
      var cells = [].map.call(tr.children, function(td){ return td.textContent.trim(); });
      return skip ? cells.slice(0, -1) : cells;
    });
    if (!rows.length){ toast('Nothing to export — no rows match the current filter.'); return; }
    exportCSV(filename, head, rows);
  }

  // Print one region without dragging the sidebar and chrome onto the page.
  function printRegion(el, title){
    var prev = document.querySelector('.cx-printing');
    if (prev) prev.classList.remove('cx-printing');
    document.body.classList.add('cx-print-mode');
    el.classList.add('cx-printing');
    var restore = function(){
      document.body.classList.remove('cx-print-mode');
      el.classList.remove('cx-printing');
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    if (title){ document.title = title; }
    window.print();
    setTimeout(restore, 1200);   // Safari/old Edge never fire afterprint
  }

  function stamp(){
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-'
         + String(d.getDate()).padStart(2,'0');
  }

  return { toast:toast, exportCSV:exportCSV, exportTable:exportTable,
           printRegion:printRegion, download:download, stamp:stamp };
})();
