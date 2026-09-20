/* Lightbox (nuotraukų padidinimas) */
(function(){
  var overlay = document.getElementById('lightbox');
  var img = document.getElementById('lightboxImg');
  var closeBtn = document.getElementById('lightboxClose');
  if(!overlay || !img || !closeBtn) return;
  function openLightbox(src, alt){
    img.src = src;
    img.alt = alt || '';
    overlay.classList.add('open');
  }
  function closeLightbox(){
    overlay.classList.remove('open');
    img.src = '';
  }
  document.addEventListener('click', function(e){
    var t = e.target.closest ? e.target.closest('.zoomable') : null;
    if(t){ openLightbox(t.src, t.alt); }
  });
  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', function(e){ if(e.target === overlay) closeLightbox(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeLightbox(); });
})();

/* Redaguojamo turinio užkrovimas iš data/content.json (Sveltia CMS redaguoja būtent šį failą).
   Veikia kiekviename puslapyje: kiekviena funkcija tyliai nieko nedaro, jei tam puslapiui
   skirtų elementų (pvz. vandens grafiko ar pranešimų sąrašo) jame nėra. */
(function(){
  fetch('data/content.json').then(function(r){
    if(!r.ok) throw new Error('no content.json');
    return r.json();
  }).then(renderContent).catch(function(){ /* naudoti atsarginį statinį turinį */ });

  function esc(s){
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function renderContent(data){
    var seasonTag = document.getElementById('dSeasonTag');
    var heroTitle = document.getElementById('dHeroTitle');
    var heroLede = document.getElementById('dHeroLede');
    var schedHead = document.getElementById('dScheduleHead');
    var schedBody = document.getElementById('dScheduleBody');
    var grid = document.getElementById('dNoticeGrid');

    if(data.season_tag && seasonTag) seasonTag.textContent = data.season_tag;
    if(data.hero_title && heroTitle){
      heroTitle.innerHTML = esc(data.hero_title) + ' <em>' + esc(data.hero_title_accent || '') + '</em>';
    }
    if(data.hero_lede && heroLede) heroLede.textContent = data.hero_lede;

    if(Array.isArray(data.schedule) && data.schedule.length && schedHead && schedBody){
      schedHead.innerHTML = data.schedule.map(function(d){
        return '<th scope="col">' + esc(d.day) + '</th>';
      }).join('');
      schedBody.innerHTML = data.schedule.map(function(d){
        var isOff = !d.hours || d.hours === '—' || d.hours.toLowerCase() === 'netiekiama';
        return '<td class="' + (isOff ? 'off' : 'hours') + '">' + esc(d.hours) + '</td>';
      }).join('');
    }

    // "Naujausia informacija" juosta yra kiekviename puslapyje, tad ją atnaujiname visada,
    // net jei šiame puslapyje pranešimų tinklelio (dNoticeGrid) nėra.
    if(Array.isArray(data.notices) && data.notices[0]){
      var lt = document.getElementById('latestLinkTitle');
      var ld = document.getElementById('latestLinkDate');
      if(lt) lt.textContent = data.notices[0].title || '';
      if(ld) ld.textContent = data.notices[0].date || '';
    }

    if(Array.isArray(data.notices) && grid){
      grid.innerHTML = data.notices.map(function(n){
        var html = '<article class="notice">';
        html += '<span class="tag tag--' + esc(n.tag_style || 'forest') + '">' + esc(n.tag_label) + '</span>';
        html += '<span class="date-tag">' + esc(n.date) + '</span>';
        html += '<h3>' + esc(n.title) + '</h3>';
        if(n.body) html += '<p>' + esc(n.body) + '</p>';
        if(Array.isArray(n.list) && n.list.length){
          var tag = n.list_style === 'ol' ? 'ol' : 'ul';
          html += '<' + tag + '>' + n.list.map(function(li){
            return '<li>' + esc(typeof li === 'string' ? li : li.item) + '</li>';
          }).join('') + '</' + tag + '>';
        }
        if(n.image) html += '<div class="img-frame"><img class="zoomable" src="' + esc(n.image) + '" alt="' + esc(n.title) + '" loading="lazy"></div>';
        if(Array.isArray(n.table_rows) && n.table_rows.length){
          html += '<div class="waste-table-wrap"><table class="waste-table"><thead><tr><th>Mėnuo</th><th>Mišrios rūšiuojamos</th><th>Stiklas</th><th>Žaliosios</th></tr></thead><tbody>';
          html += n.table_rows.map(function(r){
            return '<tr><td class="month">' + esc(r.month) + '</td><td>' + esc(r.mixed) + '</td><td>' + esc(r.glass) + '</td><td>' + esc(r.green) + '</td></tr>';
          }).join('');
          html += '</tbody></table></div>';
          if(Array.isArray(n.table_note) && n.table_note.length){
            html += '<ul class="table-note">' + n.table_note.map(function(t){ return '<li>' + esc(typeof t === 'string' ? t : t.item) + '</li>'; }).join('') + '</ul>';
          }
        }
        if(n.meta) html += '<p class="meta">' + esc(n.meta) + '</p>';
        html += '</article>';
        return html;
      }).join('');
    }
  }
})();
