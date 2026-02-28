/* =========================================
 *  PUZZLE LOADER — Orchestrator
 *  Reads window.PUZZLE_CONFIG (set by config.js)
 *  Initializes all modules, loads language,
 *  applies theme, wires up event handlers
 * ========================================= */

(function() {
  const config = window.PUZZLE_CONFIG;
  if (!config) {
    console.error('PUZZLE_CONFIG not found');
    return;
  }

  // --- Sound setup ---
  window.sound = new SoundManager();
  const soundBtn = document.getElementById('soundToggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      window.sound.init();
      window.sound.toggle();
      window.sound.click();
    });
  }

  // --- Apply theme ---
  if (config.theme) {
    const root = document.documentElement;
    Object.entries(config.theme).forEach(([key, value]) => {
      if (key.startsWith('--')) {
        root.style.setProperty(key, value);
      }
    });
    if (config.theme['--bg-gradient'] && config.theme['--bg-gradient'] !== 'none') {
      document.body.style.background = config.theme['--bg-gradient'];
    }
    if (config.theme.backgroundImage) {
      document.body.style.backgroundImage = "url('" + config.theme.backgroundImage + "')";
      document.body.style.backgroundSize = 'cover';
    }
  }

  // --- Set header ---
  const headerH1 = document.querySelector('.header h1');
  const headerP = document.querySelector('.header p');
  if (headerH1 && config.title) headerH1.textContent = config.title;
  if (headerP && config.subtitle) headerP.textContent = config.subtitle;

  // --- Load language ---
  // Priority: 1) user choice in localStorage, 2) browser language (if available), 3) config, 4) default 'en'
  const availableLangs = ['ka', 'en'];
  const browserLang = (navigator.language || '').slice(0, 2).toLowerCase();
  const detectedLang = availableLangs.indexOf(browserLang) !== -1 ? browserLang : 'en';
  const lang = localStorage.getItem('codyssey_lang') || detectedLang;
  document.documentElement.lang = lang;

  // Determine base path to shared/
  const scripts = document.querySelectorAll('script[src*="puzzle-loader"]');
  let basePath = '../../shared/';
  if (scripts.length > 0) {
    const src = scripts[0].getAttribute('src');
    basePath = src.replace('js/puzzle-loader.js', '');
  }
  window._langBasePath = basePath;

  fetch(basePath + 'lang/' + lang + '.json')
    .then(r => {
      if (!r.ok) throw new Error('Language file not found');
      return r.json();
    })
    .catch(() => fetch(basePath + 'lang/ka.json').then(r => r.json()))
    .then(strings => {
      window.langStrings = strings;
      applyLanguageStrings(strings);
    })
    .catch(() => {
      // Language files not available, UI keeps default text
      window.langStrings = {};
    });

  // --- Wire up password form ---
  const unlockBtn = document.getElementById('unlockBtn');
  if (unlockBtn) {
    unlockBtn.addEventListener('click', tryUnlock);
  }

  const passwordInput = document.getElementById('passwordInput');
  if (passwordInput) {
    passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') tryUnlock();
    });
  }

  // --- Wire up victory close ---
  const victoryCloseBtn = document.getElementById('victoryCloseBtn');
  if (victoryCloseBtn) {
    victoryCloseBtn.addEventListener('click', closeVictory);
  }

  // --- Wire up download ---
  const downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadPDF);
  }

  // --- Console ---
  console.log('%c\u{1F9E9} ' + (config.title || 'Puzzle'), 'font-size: 16px; font-weight: bold;');
})();

/* ===== LANGUAGE SYSTEM ===== */

window.applyLanguageStrings = function applyLanguageStrings(strings) {
  // Text content
  document.querySelectorAll('[data-lang]').forEach(el => {
    const key = el.getAttribute('data-lang');
    if (strings[key]) el.textContent = strings[key];
  });

  // HTML content (for strings with markup like <strong>)
  document.querySelectorAll('[data-lang-html]').forEach(el => {
    const key = el.getAttribute('data-lang-html');
    if (strings[key]) el.innerHTML = strings[key];
  });

  // Placeholders
  document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
    const key = el.getAttribute('data-lang-placeholder');
    if (strings[key]) el.placeholder = strings[key];
  });

  // Title attributes
  document.querySelectorAll('[data-lang-title]').forEach(el => {
    const key = el.getAttribute('data-lang-title');
    if (strings[key]) el.title = strings[key];
  });
};
