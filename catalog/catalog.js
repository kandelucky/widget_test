/* =========================================
 *  CATALOG — Rendering
 *  Loads language file for UI strings
 * ========================================= */
document.addEventListener('DOMContentLoaded', () => {
  const catalog = window.PUZZLE_CATALOG || [];
  const grid = document.getElementById('catalogGrid');
  // Priority: 1) user choice in localStorage, 2) browser language (if available), 3) default 'en'
  const availableLangs = ['ka', 'en'];
  const browserLang = (navigator.language || '').slice(0, 2).toLowerCase();
  const detectedLang = availableLangs.indexOf(browserLang) !== -1 ? browserLang : 'en';
  const lang = localStorage.getItem('codyssey_lang') || detectedLang;
  document.documentElement.lang = lang;
  window._langBasePath = 'shared/';

  // Define global applyLanguageStrings (if not already set by puzzle-loader)
  if (!window.applyLanguageStrings) {
    window.applyLanguageStrings = function(strings) {
      document.querySelectorAll('[data-lang]').forEach(function(el) {
        var key = el.getAttribute('data-lang');
        if (strings[key]) el.textContent = strings[key];
      });
      document.querySelectorAll('[data-lang-html]').forEach(function(el) {
        var key = el.getAttribute('data-lang-html');
        if (strings[key]) el.innerHTML = strings[key];
      });
      document.querySelectorAll('[data-lang-placeholder]').forEach(function(el) {
        var key = el.getAttribute('data-lang-placeholder');
        if (strings[key]) el.placeholder = strings[key];
      });
      document.querySelectorAll('[data-lang-title]').forEach(function(el) {
        var key = el.getAttribute('data-lang-title');
        if (strings[key]) el.title = strings[key];
      });
    };
  }

  // "Coming soon" click sound via Web Audio API
  function playComingSoonSound() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  }

  // Render catalog cards (reads title/subtitle from lang strings via titleKey/subtitleKey)
  function renderCards(strings) {
    grid.innerHTML = '';

    catalog.forEach(function(puzzle) {
      var card = document.createElement('a');
      card.className = 'catalog-card';

      card.href = puzzle.comingSoon ? '#' : puzzle.url;
      card.addEventListener('click', function(e) {
        e.preventDefault();
        card.style.animation = 'none';
        card.offsetHeight;
        card.style.animation = 'pop 0.2s ease';
        playComingSoonSound();
        if (!puzzle.comingSoon) {
          setTimeout(function() { window.location.href = puzzle.url; }, 250);
        }
      });

      var title = (strings && puzzle.titleKey && strings[puzzle.titleKey]) || puzzle.id;
      var subtitle = (strings && puzzle.subtitleKey && strings[puzzle.subtitleKey]) || '';

      var imageContent = puzzle.coverImage
        ? '<img src="' + puzzle.coverImage + '" alt="' + title + '" loading="lazy">'
        : '<div class="catalog-card-placeholder">\u{1F9E9}</div>';

      card.innerHTML =
        '<div class="catalog-card-image">' +
          imageContent +
          (puzzle.new ? '<span class="new-badge">NEW</span>' : '') +
        '</div>' +
        '<div class="catalog-card-body">' +
          '<p>' + subtitle + '</p>' +
        '</div>' +
        '<div class="catalog-card-badge">' +
          '<img src="shared/img/catalog_img/button_for_category_cards_v1.png" alt="">' +
          '<span>' + title + '</span>' +
        '</div>';

      grid.appendChild(card);
    });

    if (catalog.length === 0) {
      var emptyText = (window.langStrings && window.langStrings.catalogEmpty) || '';
      grid.innerHTML = '<p style="color:var(--ink-light);text-align:center;grid-column:1/-1;">' + emptyText + '</p>';
    }
  }

  // Language change callback — re-render cards + apply data-lang strings
  window.onLanguageChange = function(langCode, strings) {
    renderCards(strings);
    if (window.applyLanguageStrings) {
      window.applyLanguageStrings(strings);
    }
  };

  // Load language file
  fetch('shared/lang/' + lang + '.json')
    .then(r => r.ok ? r.json() : Promise.reject())
    .catch(() => fetch('shared/lang/ka.json').then(r => r.json()))
    .then(strings => {
      window.langStrings = strings;
      renderCards(strings);

      // Apply data-lang to static elements
      if (window.applyLanguageStrings) {
        window.applyLanguageStrings(strings);
      }
    })
    .catch(() => renderCards({}));

  // Privacy info (first visit)
  var privacyOverlay = document.getElementById('privacyOverlay');
  var privacyOkBtn = document.getElementById('privacyOkBtn');
  if (privacyOverlay && privacyOkBtn) {
    if (!localStorage.getItem('codyssey_privacy_ok')) {
      privacyOverlay.classList.add('show');
    }
    privacyOkBtn.addEventListener('click', function() {
      localStorage.setItem('codyssey_privacy_ok', '1');
      privacyOverlay.classList.remove('show');
    });
  }
});
