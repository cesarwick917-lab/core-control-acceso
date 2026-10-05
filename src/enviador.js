const nodemailer = require('nodemailer');
const db = require('./db');
const config = require('./config');

async function main() {
  const transporte = nodemailer.createTransport({
    host: config.SMTP_HOST, port: config.SMTP_PORT,
    auth: { user: config.SMTP_USER, pass: config.SMTP_PASSWORD },
    connectionTimeout: 10000, socketTimeout: 15000,
  });
  const pendientes = db.prepare("SELECT id FROM correos_en_cola WHERE estado = 'pendiente' ORDER BY id").all();
  const reclamar = db.prepare("UPDATE correos_en_cola SET estado = 'enviando' WHERE id = ? AND estado = 'pendiente'");

  for (const { id } of pendientes) {
    if (reclamar.run(id).changes !== 1) continue;
    const c = db.prepare('SELECT * FROM correos_en_cola WHERE id = ?').get(id);
    try {
      await transporte.sendMail({ from: config.SMTP_FROM, to: c.destinatario, subject: c.asunto, text: c.cuerpo });
      db.prepare("UPDATE correos_en_cola SET estado = 'enviado', enviado_en = ? WHERE id = ?").run(Date.now(), id);
    } catch (e) {
      db.prepare("UPDATE correos_en_cola SET estado = 'pendiente' WHERE id = ?").run(id);
      console.error(`No se pudo enviar el correo ${id}: ${e.code || e.name}`);
    }
  }
}
main();
