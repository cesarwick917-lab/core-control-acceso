const express = require('express');
const db = require('../db');
const seg = require('../seguridad');
const { crearCodigoRecuperacion } = require('../recuperacion');
const { abrirSesion, requiere } = require('../sesion');

const router = express.Router();
const MSG_POLITICA = 'La contraseña debe tener entre 8 y 72 caracteres, con letras y números.';

const iniciar = db.transaction((correoIn) => {
  const u = db.prepare('SELECT id FROM usuarios WHERE correo = ?').get(correoIn);
  if (u) crearCodigoRecuperacion(u.id, correoIn);
});

router.post('/recuperar', (req, res) => {
  const correoIn = String((req.body && req.body.correo) || '').trim().toLowerCase();
  if (!seg.correoValido(correoIn))
    return res.status(400).json({ mensaje: 'El correo no tiene un formato válido.' });
  iniciar(correoIn);
  res.json({ mensaje: 'Si el correo está registrado, te enviamos las instrucciones.' });
});

const consumir = db.transaction((codigoHash, nuevoHash) => {
  const c = db.prepare('SELECT * FROM codigos_recuperacion WHERE codigo_hash = ?').get(codigoHash);
  if (!c || c.usado || c.vence < Date.now()) return false;
  db.prepare('UPDATE codigos_recuperacion SET usado = 1 WHERE id = ?').run(c.id);
  db.prepare('UPDATE usuarios SET password_hash = ?, sesiones_validas_desde = ?, intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?')
    .run(nuevoHash, Date.now(), c.usuario_id);
  return true;
});

router.post('/restablecer', async (req, res) => {
  const b = req.body || {};
  if (!seg.passwordCumplePolitica(b.password)) return res.status(400).json({ mensaje: MSG_POLITICA });
  const ok = consumir(seg.hashToken(String(b.token || '')), await seg.hashear(b.password));
  if (!ok) return res.status(400).json({ mensaje: 'El enlace no es válido o ya venció.' });
  res.json({ mensaje: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
});

router.post('/cambiar-password', ...requiere('sesion.cambiarPassword'), async (req, res) => {
  const { actual, nueva } = req.body || {};
  const u = db.prepare('SELECT password_hash FROM usuarios WHERE id = ?').get(req.usuario.id);
  if (typeof actual !== 'string' || !(await seg.verificar(actual, u.password_hash)))
    return res.status(400).json({ mensaje: 'La contraseña actual no es correcta.' });
  if (!seg.passwordCumplePolitica(nueva)) return res.status(400).json({ mensaje: MSG_POLITICA });
  db.prepare('UPDATE usuarios SET password_hash = ?, sesiones_validas_desde = ? WHERE id = ?')
    .run(await seg.hashear(nueva), Date.now(), req.usuario.id);
  abrirSesion(res, req.usuario.id);
  res.json({ mensaje: 'Contraseña cambiada. Se cerraron tus otras sesiones.' });
});

module.exports = router;
