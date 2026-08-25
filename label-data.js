// Office Grubb — shared label data across all corporations
(function () {
  "use strict";
  var POOL = [
    ["John Smith","Marketing"],["Sarah Lee","HR"],["Mike Ross","Sales"],["Emily Johnson","Finance"],
    ["David Wilson","IT"],["Priya Nair","Ops"],["Tom Alvarez","Design"],["Ava Chen","Legal"],
    ["Marcus Webb","Engineering"],["Nina Patel","Product"],["Carlos Diaz","Support"],["Rachel Kim","Marketing"],
    ["Ben Torres","Finance"],["Lena Ortiz","People"],["Omar Haddad","Legal"],["Grace Liu","Product"],
    ["James Wu","Marketing"],["Sofia Rossi","Design"],["Daniel Cho","Engineering"],["Maya Singh","Ops"],
    ["Ethan Brooks","Sales"],["Chloe Martin","HR"],["Ryan Cole","IT"],["Isabel Garcia","Finance"],
    ["Noah Bennett","Engineering"],["Zoe Adams","Design"],["Liam Foster","Sales"],["Hana Sato","Product"],
    ["Owen Reid","Ops"],["Mia Flores","Legal"],["Leo Park","Sales"],["Ivy Chen","Design"],
    ["Jack Ryan","IT"],["Nora Hale","HR"],["Sam Ito","Finance"],["Ella Vance","Product"],
    ["Max Stern","Engineering"],["Ruby Ono","Ops"],["Cole Nash","Sales"],["Anya Bose","Design"]
  ];
  var MAINS = [["Chicken Shawarma Bowl","🥙",["Sesame"]],["Lamb Gyro Plate","🍢",["Dairy"]],["Falafel Wrap","🧆",["Gluten"]],["Mediterranean Mezze Platter","🫓",["Sesame","Tree Nuts"]],["Beef Kofta Plate","🍖",["Gluten"]],["Greek Salad","🥗",["Dairy"]],["Chicken Kebab Bowl","🍗",[]],["Spanakopita","🥐",["Gluten","Dairy"]]];
  var SIDES  = [["Hummus & Pita","🫓",["Sesame"]],["Garlic Bread","🍞",["Gluten"]],["Baklava","🍯",["Tree Nuts"]],["Lentil Soup","🍲",[]]];
  var DRINKS = [["Sparkling Water","💧"],["Coke Zero","🥤"],["Iced Tea","🧋"]];
  var MODS = [["Extra garlic sauce","No onions"],["Extra tzatziki"],["No feta"],["Brown rice"],[]];

  function pad(n){ return String(n).padStart(2,"0"); }

  var COMPANIES = [
    { id:"acme",      name:"Acme Corp",      order:"OG-10482", date:"Fri, Jul 11", time:"12:00 PM", count:28, status:"Preparing", color:"#E4611A", addr:"200 State St, Floor 8, Boston" },
    { id:"northline", name:"Northline Labs", order:"OG-10479", date:"Fri, Jul 11", time:"12:30 PM", count:16, status:"Confirmed", color:"#2E6F9E", addr:"1 Kendall Sq, Cambridge" },
    { id:"vantage",   name:"Vantage Group",  order:"OG-10476", date:"Fri, Jul 11", time:"1:00 PM",  count:34, status:"Preparing", color:"#22794A", addr:"88 Seaport Blvd, Boston" },
    { id:"bright",    name:"Bright Digital",  order:"OG-10471", date:"Fri, Jul 11", time:"11:30 AM", count:12, status:"Ready",     color:"#6A48A6", addr:"12 Farnsworth St, Boston" }
  ];

  function companyById(id){ for (var i=0;i<COMPANIES.length;i++) if (COMPANIES[i].id===id) return COMPANIES[i]; return null; }

  function employeesFor(id){
    var c = companyById(id); if (!c) return [];
    var out = [];
    for (var i=0;i<c.count;i++){
      var p = POOL[i % POOL.length];
      var items = [], allergens = [];
      var m = MAINS[i % MAINS.length];
      items.push({ n:m[0], e:m[1], mods:MODS[i % MODS.length] }); m[2].forEach(function(a){ if(allergens.indexOf(a)<0)allergens.push(a); });
      if (i % 2 === 0){ var s = SIDES[i % SIDES.length]; items.push({ n:s[0], e:s[1], mods:[] }); s[2].forEach(function(a){ if(allergens.indexOf(a)<0)allergens.push(a); }); }
      if (i % 3 === 0){ var d = DRINKS[i % DRINKS.length]; items.push({ n:d[0], e:d[1], mods:[] }); }
      out.push({ id:i, name:p[0], dept:p[1], orderNo:c.order+"-"+pad(i+1), pickup:"A"+(101+i), items:items, allergens:allergens });
    }
    return out;
  }

  var STATUS = { "Preparing":"st-prep", "Confirmed":"st-accepted", "Ready":"st-ready", "New":"st-new" };

  window.OG_LABELS = { companies: COMPANIES, companyById: companyById, employeesFor: employeesFor, statusClass: STATUS,
    totalLabels: COMPANIES.reduce(function(s,c){return s+c.count;},0) };
})();
