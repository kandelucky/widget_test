/* =========================================
 *  FULLSCREEN HANDLER
 *  Self-initializing: looks for #fullscreenToggle
 *  Uses: window.sound (SoundManager instance)
 *  Uses: window.langStrings (loaded by puzzle-loader)
 * ========================================= */
(function() {
  const fsBtn = document.getElementById('fullscreenToggle');
  if (!fsBtn) return;

  let userWantsFullscreen = localStorage.getItem('codyssey_fullscreen') === '1';

  function lang(key, fallback) {
    return (window.langStrings && window.langStrings[key]) || fallback || '';
  }

  function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }

  function syncFsButton() {
    var icon = fsBtn.querySelector('img');
    if (isFullscreen()) {
      fsBtn.classList.add('is-fullscreen');
      if (icon) icon.src = icon.src.replace('maximize.png', 'minimize.png');
      fsBtn.title = lang('fullscreenExit', 'Exit fullscreen');
    } else {
      fsBtn.classList.remove('is-fullscreen');
      if (icon) icon.src = icon.src.replace('minimize.png', 'maximize.png');
      fsBtn.title = lang('fullscreenEnter', 'Fullscreen');
    }
  }

  fsBtn.addEventListener('click', () => {
    if (window.sound) { window.sound.init(); window.sound.click(); }
    if (!isFullscreen()) {
      const el = document.documentElement;
      const rfs = el.requestFullscreen || el.webkitRequestFullscreen;
      if (rfs) rfs.call(el).catch(() => {});
    } else {
      userWantsFullscreen = false;
      localStorage.removeItem('codyssey_fullscreen');
      const efs = document.exitFullscreen || document.webkitExitFullscreen;
      if (efs) efs.call(document);
    }
  });

  ['fullscreenchange', 'webkitfullscreenchange'].forEach(evt => {
    document.addEventListener(evt, () => {
      syncFsButton();
      if (isFullscreen()) {
        userWantsFullscreen = true;
        localStorage.setItem('codyssey_fullscreen', '1');
        removeRestoreOverlay();
      } else if (userWantsFullscreen) {
        setTimeout(() => {
          if (!isFullscreen() && userWantsFullscreen) {
            showRestoreOverlay();
          }
        }, 400);
      }
    });
  });

  syncFsButton();

  // On page load: if user had fullscreen on previous page, prompt to restore
  if (userWantsFullscreen && !isFullscreen()) {
    setTimeout(function() {
      if (!isFullscreen()) showRestoreOverlay();
    }, 300);
  }

  document.addEventListener('visibilitychange', () => {
    setTimeout(syncFsButton, 300);
  });
  window.addEventListener('resize', () => {
    setTimeout(syncFsButton, 100);
  });

  function showRestoreOverlay() {
    if (document.getElementById('fsRestoreOverlay')) return;
    const ov = document.createElement('div');
    ov.id = 'fsRestoreOverlay';
    ov.style.cssText = `
      position:fixed;inset:0;z-index:99999;
      background:rgba(0,0,0,0.82);
      display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      cursor:pointer;user-select:none;
      -webkit-tap-highlight-color:transparent;
    `;
    var iconImg = fsBtn.querySelector('img');
    var iconSrc = iconImg ? iconImg.src.replace('minimize.png', 'maximize.png') : '';
    const msg = lang('fullscreenRestore', 'Tap to return to fullscreen');
    ov.innerHTML = `
      <div style="margin-bottom:16px;">${iconSrc ? '<img src="' + iconSrc + '" style="width:56px;height:56px;filter:invert(1);" alt="">' : ''}</div>
      <div style="color:#fff;font-family:'Fredoka',sans-serif;font-size:18px;font-weight:600;">
        ${msg}
      </div>
    `;
    ov.addEventListener('click', () => {
      const el = document.documentElement;
      const rfs = el.requestFullscreen || el.webkitRequestFullscreen;
      if (rfs) rfs.call(el).catch(() => {});
      removeRestoreOverlay();
    });
    document.body.appendChild(ov);
  }

  function removeRestoreOverlay() {
    const ov = document.getElementById('fsRestoreOverlay');
    if (ov) ov.remove();
  }
})();
