(async () => {
  const msg = document.getElementById('mensaje');
  const token = new URLSearchParams(location.search).get('token') || '';
  try {
    const r = await fetch('/api/activar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const j = await r.json();
    msg.textContent = j.mensaje;
    msg.className = r.ok ? 'ok' : 'error';
  } catch {
    msg.textContent = 'No se pudo conectar con el servidor.';
    msg.className = 'error';
  }
})();
