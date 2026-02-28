/* =========================================
 *  PUZZLE CONFIG — Test Cipher (DEMO)
 *
 *  NOTE: This is a demo/test puzzle.
 *  Password and config are encrypted client-side.
 *  In production, use pre-encrypted strings
 *  generated with _tools/encrypt.html
 * ========================================= */

(function() {
  // Demo mode: encrypt on the fly
  const DEMO_PASSWORD = "1";

  const puzzleConfig = {
    message: "SUPER STAR",
    hints: ['S', 'A', 'R'],
    victoryText: "SUPER STAR"
  };

  const encryptedPuzzle = CryptoJS.AES.encrypt(
    JSON.stringify(puzzleConfig), DEMO_PASSWORD
  ).toString();

  const pdfMessage = "ეს არის ბონუს PDF-ის სატესტო ვერსია. რეალურ პროდუქტში აქ იქნება თავსატეხების ფაილი.";
  const encryptedPDF = CryptoJS.AES.encrypt(pdfMessage, DEMO_PASSWORD).toString();

  window.PUZZLE_CONFIG = {
    id: 'test-cipher',
    lang: 'ka',
    encryptedPuzzle: encryptedPuzzle,
    encryptedPDF: encryptedPDF,
    pdfFilename: 'bonus-puzzle',
    title: 'ბონუს თავსატეხი',
    subtitle: 'პრო ვერსიის მფლობელებისთვის',
    theme: {
      '--primary': '#5D4037',
      '--primary-light': '#8D6E63',
      '--accent': '#B71C1C',
      '--bg-gradient': 'none'
    }
  };
})();
