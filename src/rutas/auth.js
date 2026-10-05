const express = require('express');
const db = require('../db');
const config = require('../config');
const seg = require('../seguridad');
const correo = require('../correo');

const router = express.Router();

function crearTokenActivacion(usuarioId, destinatario) {
  db.prepare('UPDATE tokens_activacion SET usado = 1 WHERE usuario_id = ? AND usado = 0').run(usuarioId);
  const { token, hash } = seg.nuevoToken();
  const vence = Date.now() + config.ACTIVACION_HORAS * 3600 * 1000;
  db.prepare('INSERT INTO tokens_activacion (usuario_id, token_hash, vence) VALUES (?, ?, ?)')
    .run(usuarioId, hash, vence);
  const enlace = `${config.APP_BASE_URL}/activar.html?token=${token}`;
  correo.encolar(destinatario, 'Activa tu cuenta',
    `Abre este enlace para activar tu cuenta:\n${enlace}\nVence en ${config.ACTIVACION_HORAS} horas.`);
}

const registrar = db.transaction((correoIn, hash) => {
  const r = db.prepare('INSERT INTO usuarios (correo, password_hash) VALUES (?, ?)').run(correoIn, hash);
  crearTokenActivacion(r.lastInsertRowid, correoIn);
});

router.post('/registro', async (req, res) => {
  const correoIn = String((req.body && req.body.correo) || '').trim().toLowerCase();
  const password = req.body && req.body.password;

  if (!seg.correoValido(correoIn))
    return res.status(400).json({ mensaje: 'El correo no tiene un formato válido.' });
  if (!seg.passwordCumplePolitica(password))
    return res.status(400).json({ mensaje: 'La contraseña debe tener entre 8 y 72 caracteres, con letras y números.' });
  if (db.prepare('SELECT 1 FROM usuarios WHERE correo = ?').get(correoIn))
    return res.status(409).json({ mensaje: 'Ese correo ya está registrado.' });

  try {
    registrar(correoIn, await seg.hashear(password));
  } catch (e) {
    if (String(e.code).startsWith('SQLITE_CONSTRAINT'))
      return res.status(409).json({ mensaje: 'Ese correo ya está registrado.' });
    throw e;
  }
  res.status(201).json({ mensaje: 'Cuenta creada. Revisa tu correo para activarla.' });
});

const activar = db.transaction((tokenHash) => {
  const t = db.prepare('SELECT * FROM tokens_activacion WHERE token_hash = ?').get(tokenHash);
  if (!t || t.usado || t.vence < Date.now()) return false;
  db.prepare('UPDATE tokens_activacion SET usado = 1 WHERE id = ?').run(t.id);
  db.prepare('UPDATE usuarios SET activo = 1 WHERE id = ?').run(t.usuario_id);
  return true;
});

router.post('/activar', (req, res) => {
  const ok = activar(seg.hashToken(String((req.body && req.body.token) || '')));
  if (!ok) return res.status(400).json({ mensaje: 'El enlace no es válido o ya venció.' });
  res.json({ mensaje: 'Cuenta activada. Ya puedes iniciar sesión.' });
});

const reenviar = db.transaction((correoIn) => {
  const u = db.prepare('SELECT id, activo FROM usuarios WHERE correo = ?').get(correoIn);
  if (u && !u.activo) crearTokenActivacion(u.id, correoIn);
});

router.post('/reenviar', (req, res) => {
  reenviar(String((req.body && req.body.correo) || '').trim().toLowerCase());
  res.json({ mensaje: 'Si el correo corresponde a una cuenta pendiente, te enviamos un nuevo enlace.' });
});

module.exports = router;
