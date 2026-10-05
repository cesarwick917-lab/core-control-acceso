const params = new URLSearchParams(location.search);
document.querySelectorAll('form[data-endpoint]').forEach((form) => {
  const campoToken = form.querySelector('[name=token]');
  if (campoToken) campoToken.value = params.get('token') || '';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('mensaje');
    try {
      const r = await fetch(form.dataset.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const j = await r.json();
      if (r.ok && form.dataset.redirect) { location.href = form.dataset.redirect; return; }
      msg.textContent = j.mensaje;
      msg.className = r.ok ? 'ok' : 'error';
    } catch {
      msg.textContent = 'No se pudo conectar con el servidor.';
      msg.className = 'error';
    }
  });
});
