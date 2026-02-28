/* =========================================
 *  BUTTON RIPPLE EFFECT
 *  Self-initializing: attaches to all .btn
 * ========================================= */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty('--x', ((e.clientX - rect.left) / rect.width * 100) + '%');
    btn.style.setProperty('--y', ((e.clientY - rect.top) / rect.height * 100) + '%');
  });
});
