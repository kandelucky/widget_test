/* =========================================
 *  LANGUAGE SWITCHER
 *  Self-initializing: looks for #langToggle
 *  Uses: window.applyLanguageStrings (from puzzle-loader or catalog)
 *  Uses: window._langBasePath (set by loader/catalog)
 * ========================================= */
(function() {
  var btn = document.getElementById('langToggle');
  if (!btn) return;

  var LANGS = [
    { code: 'ka', label: '\u10e5\u10d0\u10e0\u10d7\u10e3\u10da\u10d8', flag: '\uD83C\uDDEC\uD83C\uDDEA' },
    { code: 'en', label: 'English', flag: '\uD83C\uDDEC\uD83C\uDDE7' }
  ];

  var dropdown = null;
  var open = false;

  function currentLang() {
    return localStorage.getItem('codyssey_lang') || document.documentElement.lang || 'ka';
  }

  function createDropdown() {
    dropdown = document.createElement('div');
    dropdown.className = 'lang-dropdown';

    var cur = currentLang();
    LANGS.forEach(function(lang) {
      var item = document.createElement('div');
      item.className = 'lang-dropdown-item' + (lang.code === cur ? ' active' : '');
      item.textContent = lang.flag + '  ' + lang.label;
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        switchLang(lang.code);
      });
      dropdown.appendChild(item);
    });

    // Append to nearest positioned ancestor (.catalog-nav or .top-controls)
    var container = btn.closest('.catalog-nav') || btn.closest('.top-controls') || btn.parentElement;
    container.appendChild(dropdown);
  }

  function toggleDropdown() {
    if (open) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }

  function openDropdown() {
    if (!dropdown) createDropdown();
    dropdown.style.display = 'block';
    open = true;
    // Update active state
    var cur = currentLang();
    var items = dropdown.querySelectorAll('.lang-dropdown-item');
    items.forEach(function(item, i) {
      if (LANGS[i].code === cur) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  function closeDropdown() {
    if (dropdown) dropdown.style.display = 'none';
    open = false;
  }

  function switchLang(langCode) {
    closeDropdown();
    if (langCode === currentLang()) return;

    localStorage.setItem('codyssey_lang', langCode);
    document.documentElement.lang = langCode;

    var basePath = window._langBasePath || 'shared/';
    fetch(basePath + 'lang/' + langCode + '.json?v=2')
      .then(function(r) {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then(function(strings) {
        window.langStrings = strings;
        if (window.applyLanguageStrings) {
          window.applyLanguageStrings(strings);
        }
        // Notify catalog or other modules to re-render with new language
        if (window.onLanguageChange) {
          window.onLanguageChange(langCode, strings);
        }
      })
      .catch(function() {
        console.warn('Language file not found: ' + langCode);
      });
  }

  // Button click
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (window.sound) { window.sound.init(); window.sound.click(); }
    toggleDropdown();
  });

  // Close on outside click
  document.addEventListener('click', function() {
    if (open) closeDropdown();
  });
})();
