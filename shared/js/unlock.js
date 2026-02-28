/* =========================================
 *  UNLOCK & DOWNLOAD
 *  Exposes: tryUnlock(), downloadPDF()
 *  Uses: window.sound, window.PUZZLE_CONFIG,
 *        CryptoJS (from CDN), initPuzzle()
 * ========================================= */

let _userPassword = '';

function tryUnlock() {
  if (window.sound) { window.sound.init(); window.sound.click(); }

  const config = window.PUZZLE_CONFIG;
  const password = document.getElementById('passwordInput').value.trim();
  const errorEl = document.getElementById('passwordError');

  try {
    const bytes = CryptoJS.AES.decrypt(config.encryptedPuzzle, password);
    const text = bytes.toString(CryptoJS.enc.Utf8);
    if (!text) throw new Error('wrong');

    const puzzleData = JSON.parse(text);
    _userPassword = password;
    errorEl.classList.remove('show');

    if (window.sound) window.sound.unlock();
    document.getElementById('passwordSection').style.display = 'none';
    document.getElementById('puzzleSection').classList.add('visible');
    initPuzzle(puzzleData);

  } catch (e) {
    if (window.sound) window.sound.wrong();
    errorEl.classList.add('show');
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordInput').focus();
  }
}

async function downloadPDF() {
  if (window.sound) { window.sound.init(); window.sound.click(); }

  const config = window.PUZZLE_CONFIG;
  const password = _userPassword || document.getElementById('passwordInput')?.value;
  const filename = (config.pdfFilename || 'bonus-puzzle') + '_' + Date.now();

  try {
    let encryptedData;

    if (config.encryptedPDFUrl) {
      // Lazy-load from separate file
      const response = await fetch(config.encryptedPDFUrl);
      encryptedData = await response.text();
    } else {
      encryptedData = config.encryptedPDF;
    }

    const bytes = CryptoJS.AES.decrypt(encryptedData, password);
    const text = bytes.toString(CryptoJS.enc.Utf8);

    // Check if it's base64-encoded binary (PDF)
    if (text.startsWith('JVBER') || text.startsWith('/9j/')) {
      // Base64-encoded binary file
      const binary = atob(text);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([array], { type: 'application/pdf' });
      triggerDownload(blob, filename + '.pdf');
    } else {
      // Plain text
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      triggerDownload(blob, filename + '.txt');
    }
  } catch (e) {
    console.error('Download failed');
  }
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
