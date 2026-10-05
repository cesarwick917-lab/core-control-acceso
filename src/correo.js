const db = require('./db');

function encolar(destinatario, asunto, cuerpo) {
  db.prepare(
    'INSERT INTO correos_en_cola (destinatario, asunto, cuerpo, creado) VALUES (?, ?, ?, ?)'
  ).run(destinatario, asunto, cuerpo, Date.now());
}

module.exports = { encolar };
