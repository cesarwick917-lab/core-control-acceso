const db = require('./db');
const seg = require('./seguridad');

(async () => {
  const correo = String(process.env.ADMIN_CORREO || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!seg.correoValido(correo) || !seg.passwordCumplePolitica(password)) {
    console.error('ADMIN_CORREO o ADMIN_PASSWORD no son válidos.');
    process.exit(1);
  }
  if (db.prepare('SELECT 1 FROM usuarios WHERE correo = ?').get(correo)) {
    console.error('Ese correo ya existe.');
    process.exit(1);
  }
  db.prepare("INSERT INTO usuarios (correo, password_hash, rol, activo) VALUES (?, ?, 'Administrador', 1)")
    .run(correo, await seg.hashear(password));
  console.log('Administrador creado.');
})();
