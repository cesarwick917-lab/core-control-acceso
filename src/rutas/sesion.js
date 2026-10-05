const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const seg = require('../seguridad');
const { abrirSesion, cerrarSesion, requiere } = require('../sesion');

const router = express.Router();
const MAX_INTENTOS = 5;
const BLOQUEO_MS = 15 * 60 * 1000;
const HASH_FALSO = bcrypt.hashSync('relleno-1234', 12);

router.post('/login', async (req, res) => {
  const correoIn = String((req.body && req.body.correo) || '').trim().toLowerCase();
  const password = req.body && typeof req.body.password === 'string' ? req.body.password : '';
  const u = db.prepare('SELECT * FROM usuarios WHERE correo = ?').get(correoIn);

  if (u && u.bloqueado_hasta && u.bloqueado_hasta > Date.now())
    return res.status(429).json({ mensaje: 'Cuenta bloqueada temporalmente por intentos fallidos. Intenta más tarde.' });

  const ok = await seg.verificar(password, u ? u.password_hash : HASH_FALSO);
  if (!u || !ok) {
    if (u) {
      db.prepare(`UPDATE usuarios SET
        bloqueado_hasta = CASE WHEN intentos_fallidos + 1 >= ? THEN ? ELSE bloqueado_hasta END,
        intentos_fallidos = CASE WHEN intentos_fallidos + 1 >= ? THEN 0 ELSE intentos_fallidos + 1 END
        WHERE id = ?`).run(MAX_INTENTOS, Date.now() + BLOQUEO_MS, MAX_INTENTOS, u.id);
    }
    return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos.' });
  }
  if (!u.activo || u.desactivado)
    return res.status(403).json({ mensaje: 'La cuenta no está activa.' });

  db.prepare('UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?').run(u.id);
  abrirSesion(res, u.id);
  res.json({ mensaje: 'Sesión iniciada.' });
});

router.get('/yo', ...requiere('sesion.consultar'), (req, res) => {
  res.json({ correo: req.usuario.correo, rol: req.usuario.rol });
});

router.post('/logout', ...requiere('sesion.cerrar'), (req, res) => {
  cerrarSesion(req, res);
  res.json({ mensaje: 'Sesión cerrada.' });
});

module.exports = router;
