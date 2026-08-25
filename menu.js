// Office Grubb — Menu management
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s){ return String(s).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];}); }
  function money(n){ return "$" + Number(n).toFixed(2); }

  var CATS = ["Bowls & Plates","Wraps","Salads","Sides","Drinks","Sweets"];
  var ALLERGENS = ["Gluten","Dairy","Sesame","Tree Nuts","Peanuts","Shellfish","Eggs","Soy"];

  var items = [
    { id:1, cat:"Bowls & Plates", name:"Chicken Shawarma Bowl", emoji:"🥙", price:14.00, desc:"Grilled chicken, seasoned rice, garlic sauce.", allergens:["Sesame"], thumbs:96, mustTry:true, avail:true, mods:["Extra garlic sauce","No onions","Add feta"] },
    { id:2, cat:"Bowls & Plates", name:"Lamb Gyro Plate", emoji:"🍢", price:17.50, desc:"Sliced lamb, warm pita, tzatziki, fries.", allergens:["Dairy"], thumbs:93, mustTry:false, avail:true, mods:["Extra tzatziki"] },
    { id:3, cat:"Bowls & Plates", name:"Beef Kofta Plate", emoji:"🍖", price:16.00, desc:"Spiced beef koftas, hummus, pita.", allergens:["Gluten"], thumbs:90, mustTry:false, avail:true, mods:["Well done"] },
    { id:4, cat:"Bowls & Plates", name:"Chicken Kebab Bowl", emoji:"🍗", price:14.00, desc:"Grilled kebab, brown rice, veg.", allergens:[], thumbs:92, mustTry:false, avail:true, mods:["Brown rice","Double protein (+$3)"] },
    { id:5, cat:"Wraps", name:"Falafel Wrap", emoji:"🧆", price:11.00, desc:"Crispy falafel, tahini, pickles. Vegan.", allergens:["Gluten","Sesame"], thumbs:91, mustTry:true, avail:true, mods:["Add feta","No pickles"] },
    { id:6, cat:"Wraps", name:"Chicken Souvlaki Wrap", emoji:"🌯", price:12.00, desc:"Grilled chicken, tzatziki, salad.", allergens:["Dairy","Gluten"], thumbs:88, mustTry:false, avail:true, mods:[] },
    { id:7, cat:"Salads", name:"Greek Salad", emoji:"🥗", price:9.00, desc:"Tomato, cucumber, feta, kalamata olives.", allergens:["Dairy"], thumbs:88, mustTry:false, avail:true, mods:["No feta"] },
    { id:8, cat:"Salads", name:"Mediterranean Mezze Platter", emoji:"🫓", price:18.00, desc:"Hummus, baba ganoush, dolmas, pita.", allergens:["Sesame","Tree Nuts"], thumbs:94, mustTry:true, avail:true, mods:[] },
    { id:9, cat:"Sides", name:"Hummus & Pita", emoji:"🫓", price:3.50, desc:"House hummus with warm pita.", allergens:["Sesame"], thumbs:89, mustTry:false, avail:true, mods:[] },
    { id:10, cat:"Sides", name:"Garlic Bread", emoji:"🍞", price:3.50, desc:"Toasted, herbed, buttery.", allergens:["Gluten","Dairy"], thumbs:85, mustTry:false, avail:true, mods:[] },
    { id:11, cat:"Sides", name:"Lentil Soup", emoji:"🍲", price:4.00, desc:"Red lentil, cumin, lemon.", allergens:[], thumbs:87, mustTry:false, avail:true, mods:["Cup","Bowl (+$2)"] },
    { id:12, cat:"Sides", name:"Spanakopita", emoji:"🥐", price:10.50, desc:"Spinach & feta in flaky filo.", allergens:["Gluten","Dairy"], thumbs:86, mustTry:false, avail:false, mods:[] },
    { id:13, cat:"Drinks", name:"Sparkling Water", emoji:"💧", price:1.00, desc:"Chilled, 12oz.", allergens:[], thumbs:82, mustTry:false, avail:true, mods:[] },
    { id:14, cat:"Drinks", name:"Iced Tea", emoji:"🧋", price:2.00, desc:"House-brewed, unsweetened.", allergens:[], thumbs:84, mustTry:false, avail:true, mods:["Sweetened","Lemon"] },
    { id:15, cat:"Sweets", name:"Baklava", emoji:"🍯", price:4.50, desc:"Honey, walnut, layered filo.", allergens:["Tree Nuts","Gluten"], thumbs:90, mustTry:false, avail:true, mods:[] }
  ];
  var nextId = 16;

  var filterCat = "All", query = "";
  var editing = null; // item being edited (or draft)

  function stats(){
    var avail = items.filter(function(i){return i.avail;}).length;
    var must = items.filter(function(i){return i.mustTry;}).length;
    var avg = items.length ? Math.round(items.reduce(function(s,i){return s+i.thumbs;},0)/items.length) : 0;
    $("#stTotal").textContent = items.length;
    $("#stAvail").textContent = avail;
    $("#stOff").textContent = (items.length-avail) + " unavailable (86'd)";
    $("#stMust").textContent = must;
    $("#stRate").textContent = avg + "%";
  }

  function renderChips(){
    var cats = ["All"].concat(CATS);
    $("#chips").innerHTML = cats.map(function(c){
      var cnt = c==="All" ? items.length : items.filter(function(i){return i.cat===c;}).length;
      return '<div class="mchip'+(filterCat===c?' on':'')+'" data-c="'+esc(c)+'">'+esc(c)+' <span class="cnt tnum">'+cnt+'</span></div>';
    }).join("");
    Array.prototype.forEach.call($("#chips").children, function(el){
      el.onclick = function(){ filterCat = el.getAttribute("data-c"); render(); };
    });
  }

  function cardHtml(it){
    var aller = it.allergens.map(function(a){return '<span class="aller">'+esc(a)+'</span>';}).join("");
    var mods = it.mods.length ? '<span class="mods-n">'+it.mods.length+' modifier'+(it.mods.length>1?'s':'')+'</span>' : '<span class="mods-n">No modifiers</span>';
    return '<div class="mitem'+(it.avail?'':' off')+'" data-id="'+it.id+'">'
      + '<div class="mitem-top"><div class="mthumb">'+(it.mustTry?'<span class="musttry">★ MUST-TRY</span>':'')+it.emoji+'</div>'
        + '<div class="mi-b"><div class="mi-row"><h4>'+esc(it.name)+'</h4><span class="price">'+money(it.price)+'</span></div>'
        + '<div class="desc">'+esc(it.desc)+'</div></div></div>'
      + '<div class="mi-meta">'+aller+mods+'<span class="thumbs">👍 '+it.thumbs+'%</span></div>'
      + '<div class="mitem-foot">'
        + '<div class="avail'+(it.avail?'':' off')+'"><span class="toggle'+(it.avail?' on':'')+'" data-avail="'+it.id+'"></span><span class="lbl">'+(it.avail?'Available':"Unavailable · 86'd")+'</span></div>'
        + '<button class="edit-item" data-edit="'+it.id+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>Edit</button>'
      + '</div></div>';
  }

  function render(){
    renderChips(); stats();
    var q = query.trim().toLowerCase();
    var list = items.filter(function(i){
      if (filterCat!=="All" && i.cat!==filterCat) return false;
      if (q && (i.name+" "+i.desc+" "+i.cat).toLowerCase().indexOf(q)<0) return false;
      return true;
    });
    var cats = filterCat==="All" ? CATS : [filterCat];
    var html = cats.map(function(c){
      var rows = list.filter(function(i){return i.cat===c;});
      if (!rows.length) return "";
      // must-try first, then by rating
      rows.sort(function(a,b){ return (b.mustTry?1:0)-(a.mustTry?1:0) || b.thumbs-a.thumbs; });
      return '<div class="cat-group"><div class="cat-h">'+esc(c)+' <span class="n">'+rows.length+' item'+(rows.length>1?'s':'')+'</span></div>'
        + '<div class="menu-grid">'+rows.map(cardHtml).join("")+'</div></div>';
    }).join("");
    $("#groups").innerHTML = html || '<div style="padding:40px;text-align:center;color:var(--ink-3)">No items match.</div>';

    Array.prototype.forEach.call($("#groups").querySelectorAll("[data-avail]"), function(t){
      t.onclick = function(){ var it=find(+t.getAttribute("data-avail")); it.avail=!it.avail; toast(it.name+(it.avail?" is available":" marked unavailable (86'd)")); render(); };
    });
    Array.prototype.forEach.call($("#groups").querySelectorAll("[data-edit]"), function(b){
      b.onclick = function(){ openEditor(find(+b.getAttribute("data-edit"))); };
    });
  }
  function find(id){ return items.filter(function(i){return i.id===id;})[0]; }

  // ---- editor drawer ----
  function openEditor(it){
    var isNew = !it;
    editing = it ? JSON.parse(JSON.stringify(it)) : { id:nextId, cat:CATS[0], name:"", emoji:"🍽️", price:0, desc:"", allergens:[], thumbs:0, mustTry:false, avail:true, mods:[] };
    $("#medTitle").textContent = isNew ? "Add menu item" : "Edit item";
    $("#medBody").innerHTML =
      '<div class="fld"><label>Item name</label><input id="fName" value="'+esc(editing.name)+'" placeholder="e.g. Chicken Shawarma Bowl"></div>'
      + '<div class="fld-row">'
        + '<div class="fld"><label>Category</label><select id="fCat">'+CATS.map(function(c){return '<option'+(c===editing.cat?' selected':'')+'>'+esc(c)+'</option>';}).join("")+'</select></div>'
        + '<div class="fld"><label>Price ($)</label><input id="fPrice" type="number" step="0.50" min="0" value="'+editing.price+'"></div>'
      + '</div>'
      + '<div class="fld"><label>Emoji</label><input id="fEmoji" value="'+esc(editing.emoji)+'" maxlength="4" style="width:80px"></div>'
      + '<div class="fld"><label>Description</label><textarea id="fDesc" placeholder="Short description shown to employees">'+esc(editing.desc)+'</textarea></div>'
      + '<div class="fld"><label>Allergens</label><div class="chipset" id="fAller">'
        + ALLERGENS.map(function(a){ return '<span class="achip'+(editing.allergens.indexOf(a)>=0?' on':'')+'" data-a="'+esc(a)+'">'+esc(a)+'</span>'; }).join("")
        + '</div></div>'
      + '<div class="fld"><label>Modifiers</label><div class="modlist" id="fMods"></div><button class="addmod" id="fAddMod">＋ Add modifier</button></div>'
      + '<div><div class="switchrow"><div><div class="st">Must-Try item</div><div class="sd">Surfaces to the top of the menu.</div></div><span class="toggle'+(editing.mustTry?' on':'')+'" id="fMust"></span></div>'
        + '<div class="switchrow"><div><div class="st">Available</div><div class="sd">Turn off to 86 the item today.</div></div><span class="toggle'+(editing.avail?' on':'')+'" id="fAvail"></span></div></div>';

    renderMods();
    Array.prototype.forEach.call($("#fAller").children, function(c){ c.onclick = function(){ c.classList.toggle("on"); }; });
    $("#fAddMod").onclick = function(){ editing.mods.push(""); renderMods(); };
    $("#fMust").onclick = function(){ $("#fMust").classList.toggle("on"); };
    $("#fAvail").onclick = function(){ $("#fAvail").classList.toggle("on"); };

    $("#med").classList.add("show"); $("#medBackdrop").classList.add("show");
  }
  function renderMods(){
    var wrap = $("#fMods");
    wrap.innerHTML = editing.mods.map(function(m,idx){
      return '<div class="modrow"><input data-mi="'+idx+'" value="'+esc(m)+'" placeholder="e.g. Extra garlic sauce"><button class="rm" data-rm="'+idx+'">×</button></div>';
    }).join("");
    Array.prototype.forEach.call(wrap.querySelectorAll("[data-mi]"), function(inp){ inp.oninput = function(){ editing.mods[+inp.getAttribute("data-mi")] = inp.value; }; });
    Array.prototype.forEach.call(wrap.querySelectorAll("[data-rm]"), function(b){ b.onclick = function(){ editing.mods.splice(+b.getAttribute("data-rm"),1); renderMods(); }; });
  }
  function closeEditor(){ $("#med").classList.remove("show"); $("#medBackdrop").classList.remove("show"); editing = null; }

  function saveEditor(){
    if (!editing) return;
    var name = $("#fName").value.trim();
    if (!name){ toast("Item name is required"); $("#fName").focus(); return; }
    editing.name = name;
    editing.cat = $("#fCat").value;
    editing.price = parseFloat($("#fPrice").value) || 0;
    editing.emoji = $("#fEmoji").value.trim() || "🍽️";
    editing.desc = $("#fDesc").value.trim();
    editing.allergens = Array.prototype.filter.call($("#fAller").children, function(c){return c.classList.contains("on");}).map(function(c){return c.getAttribute("data-a");});
    editing.mods = editing.mods.map(function(m){return m.trim();}).filter(Boolean);
    editing.mustTry = $("#fMust").classList.contains("on");
    editing.avail = $("#fAvail").classList.contains("on");

    var existing = find(editing.id);
    if (existing){ Object.keys(editing).forEach(function(k){ existing[k] = editing[k]; }); toast(editing.name+" updated"); }
    else { items.push(editing); nextId++; toast(editing.name+" added to menu"); }
    closeEditor(); render();
  }

  var toastT;
  function toast(msg){ var t=$("#toast"); $("#toastMsg").textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(function(){t.classList.remove("show");},2000); }

  $("#addItem").onclick = function(){ openEditor(null); };
  $("#medClose").onclick = closeEditor;
  $("#medCancel").onclick = closeEditor;
  $("#medBackdrop").onclick = closeEditor;
  $("#medSave").onclick = saveEditor;
  $("#search").addEventListener("input", function(){ query = this.value; render(); });
  $("#themeBtn").onclick = function(){ var r=document.documentElement, c=r.getAttribute("data-theme"); if(!c)c=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"; r.setAttribute("data-theme", c==="dark"?"light":"dark"); };

  render();
})();
