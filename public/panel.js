(async () => {
  const r = await fetch('/api/yo');
  if (!r.ok) { location.href = 'login.html'; return; }
  const u = await r.json();
  document.getElementById('quien').textContent = `${u.correo} (${u.rol})`;
  if (u.rol === 'Administrador') document.getElementById('enlace-admin').hidden = false;
  document.getElementById('salir').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    location.href = 'login.html';
  });
})();
