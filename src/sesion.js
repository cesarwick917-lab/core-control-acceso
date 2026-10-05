const db = require('./db');
const seg = require('./seguridad');
const { OPERACIONES } = require('./permisos');

const COOKIE = 'sid';
const OPCIONES = { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/' };

function abrirSesion(res, usuarioId) {
  const { token, hash } = seg.nuevoToken();
  db.prepare('INSERT INTO sesiones (usuario_id, token_hash, creada) VALUES (?, ?, ?)').run(usuarioId, hash, Date.now());
  res.cookie(COOKIE, token, OPCIONES);
}

function cerrarSesion(req, res) {
  const t = req.cookies && req.cookies[COOKIE];
  if (typeof t === 'string' && t)
    db.prepare('UPDATE sesiones SET cerrada = 1 WHERE token_hash = ?').run(seg.hashToken(t));
  res.clearCookie(COOKIE, OPCIONES);
}

function autenticar(req, res, next) {
  const t = req.cookies && req.cookies[COOKIE];
  if (typeof t === 'string' && t) {
    const u = db.prepare(`
      SELECT u.id, u.correo, u.rol FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id
      WHERE s.token_hash = ? AND s.cerrada = 0 AND u.activo = 1 AND u.desactivado = 0
        AND s.creada >= u.sesiones_validas_desde`).get(seg.hashToken(t));
    if (u) { req.usuario = u; return next(); }
  }
  res.status(401).json({ mensaje: 'Necesitas iniciar sesión.' });
}

function requiere(operacion) {
  const rolExigido = OPERACIONES[operacion];
  if (!rolExigido) throw new Error(`Operación sin permiso declarado: ${operacion}`);
  return [autenticar, (req, res, next) => {
    if (rolExigido === 'Administrador' && req.usuario.rol !== 'Administrador')
      return res.status(403).json({ mensaje: 'No tienes permiso para esta operación.' });
    next();
  }];
}

module.exports = { abrirSesion, cerrarSesion, autenticar, requiere };
