/* =========================================
 *  CIPHER PUZZLE ENGINE
 *  Exposes: initPuzzle(), updateKeyDisplay(),
 *           updateStatus(), checkVictory()
 *  Uses: window.sound, window.langStrings
 * ========================================= */

function initPuzzle(config) {
  const message = config.message.toUpperCase();
  const hints = new Set(config.hints.map(h => h.toUpperCase()));
  const grid = document.getElementById('cipherGrid');
  const keyDiv = document.getElementById('cipherKey');
  const lang = window.langStrings || {};

  // Keep the title, clear the rest
  const keyTitle = lang.cipherKeyTitle || '\u10E8\u10D8\u10E4\u10E0\u10D8\u10E1 \u10D2\u10D0\u10E1\u10D0\u10E6\u10D4\u10D1\u10D8';
  keyDiv.innerHTML = '<div class="cipher-key-title">' + keyTitle + '</div>';
  grid.innerHTML = '';

  // Build cipher key — symbol (in cipher font) = letter
  const usedLetters = new Set(message.replace(/ /g, '').split(''));
  const allLetters = [...usedLetters].sort();

  allLetters.forEach(letter => {
    const item = document.createElement('div');
    item.className = hints.has(letter) ? 'key-item' : 'key-item unknown';
    item.dataset.letter = letter;

    const symbolSpan = document.createElement('span');
    symbolSpan.className = 'key-symbol';
    symbolSpan.textContent = letter;

    const equalsSpan = document.createTextNode(' = ');

    const letterSpan = document.createElement('span');
    letterSpan.className = 'key-letter';
    letterSpan.textContent = hints.has(letter) ? letter : '?';

    item.appendChild(symbolSpan);
    item.appendChild(equalsSpan);
    item.appendChild(letterSpan);
    keyDiv.appendChild(item);
  });

  // Build puzzle grid
  let inputIndex = 0;
  let totalInputs = 0;
  let solvedInputs = 0;

  message.split('').forEach((char) => {
    if (char === ' ') {
      const space = document.createElement('div');
      space.className = 'cipher-space';
      grid.appendChild(space);
      return;
    }

    const cell = document.createElement('div');
    cell.className = 'cipher-cell';

    const code = document.createElement('div');
    code.className = 'cipher-code';
    code.textContent = char;

    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 1;
    input.className = 'cipher-input';
    input.dataset.answer = char;
    input.dataset.index = inputIndex++;

    if (hints.has(char)) {
      input.value = char;
      input.classList.add('hint');
      input.readOnly = true;
      solvedInputs++;
    }

    totalInputs++;
    cell.appendChild(code);
    cell.appendChild(input);
    grid.appendChild(cell);
  });

  document.getElementById('totalCount').textContent = totalInputs;
  document.getElementById('solvedCount').textContent = solvedInputs;
  document.getElementById('hintCount').textContent = hints.size;

  // Input handlers
  const inputs = grid.querySelectorAll('.cipher-input:not([readonly])');

  inputs.forEach(inp => {
    inp.addEventListener('input', (e) => {
      if (window.sound) window.sound.init();
      const val = e.target.value.toUpperCase();
      e.target.value = val;
      if (val === '') return;

      if (val === e.target.dataset.answer) {
        e.target.classList.remove('wrong');
        e.target.classList.add('correct');
        e.target.readOnly = true;
        if (window.sound) window.sound.correct();

        // Auto-fill same letters
        grid.querySelectorAll('.cipher-input').forEach(other => {
          if (other.dataset.answer === val && !other.readOnly) {
            other.value = val;
            other.classList.add('correct');
            other.readOnly = true;
          }
        });

        updateKeyDisplay(val);
        updateStatus();
        checkVictory(config);

        const nextEmpty = grid.querySelector('.cipher-input:not([readonly])');
        if (nextEmpty) nextEmpty.focus();

      } else {
        e.target.classList.remove('correct');
        e.target.classList.add('wrong');
        if (window.sound) window.sound.wrong();
        setTimeout(() => {
          e.target.classList.remove('wrong');
          e.target.value = '';
          e.target.focus();
        }, 500);
      }
    });

    inp.addEventListener('focus', () => {
      if (window.sound) window.sound.init();
    });
  });

  // Focus first empty input
  const firstEmpty = grid.querySelector('.cipher-input:not([readonly])');
  if (firstEmpty) firstEmpty.focus();
}

function updateKeyDisplay(letter) {
  document.querySelectorAll('.key-item').forEach(item => {
    if (item.dataset.letter === letter) {
      item.classList.remove('unknown');
      item.querySelector('.key-letter').textContent = letter;
    }
  });
}

function updateStatus() {
  const solved = document.querySelectorAll('.cipher-input[readonly]').length;
  document.getElementById('solvedCount').textContent = solved;
}

function checkVictory(config) {
  const allInputs = document.querySelectorAll('.cipher-input');
  const allSolved = [...allInputs].every(inp => inp.readOnly);

  if (allSolved) {
    setTimeout(() => {
      document.getElementById('decodedMessage').textContent = config.victoryText;
      if (window.sound) window.sound.victory();
      showVictory();
      startConfetti();
    }, 400);
  }
}

function showVictory() {
  document.getElementById('victoryOverlay').classList.add('show');
}

function closeVictory() {
  if (window.sound) window.sound.click();
  document.getElementById('victoryOverlay').classList.remove('show');
  document.getElementById('pdfSection').classList.add('visible');
}
