const db = require('./db');
const seg = require('./seguridad');
const correo = require('./correo');
const config = require('./config');

function crearCodigoRecuperacion(usuarioId, destinatario) {
  db.prepare('UPDATE codigos_recuperacion SET usado = 1 WHERE usuario_id = ? AND usado = 0').run(usuarioId);
  const { token, hash } = seg.nuevoToken();
  db.prepare('INSERT INTO codigos_recuperacion (usuario_id, codigo_hash, vence) VALUES (?, ?, ?)')
    .run(usuarioId, hash, Date.now() + 30 * 60 * 1000);
  const enlace = `${config.APP_BASE_URL}/restablecer.html?token=${token}`;
  correo.encolar(destinatario, 'Restablece tu contraseña',
    `Abre este enlace para definir una contraseña nueva:\n${enlace}\nVence en 30 minutos.`);
}

module.exports = { crearCodigoRecuperacion };
