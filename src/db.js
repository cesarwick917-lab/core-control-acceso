const Database = require('better-sqlite3');
const config = require('./config');

const db = new Database(config.DB_FILE);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  correo TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'Estandar',
  activo INTEGER NOT NULL DEFAULT 0,
  desactivado INTEGER NOT NULL DEFAULT 0,
  intentos_fallidos INTEGER NOT NULL DEFAULT 0,
  bloqueado_hasta INTEGER,
  sesiones_validas_desde INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS tokens_activacion (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  token_hash TEXT NOT NULL UNIQUE,
  vence INTEGER NOT NULL,
  usado INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS correos_en_cola (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  destinatario TEXT NOT NULL,
  asunto TEXT NOT NULL,
  cuerpo TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  creado INTEGER NOT NULL,
  enviado_en INTEGER
);
CREATE TABLE IF NOT EXISTS sesiones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  token_hash TEXT NOT NULL UNIQUE,
  creada INTEGER NOT NULL,
  cerrada INTEGER NOT NULL DEFAULT 0
);
`);

module.exports = db;
