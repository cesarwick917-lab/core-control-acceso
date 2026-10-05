module.exports = {
  PORT: process.env.PORT || 3000,
  APP_BASE_URL: process.env.APP_BASE_URL || 'http://localhost:3000',
  DB_FILE: process.env.DB_FILE || 'datos.db',
  ACTIVACION_HORAS: 24,
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: Number(process.env.SMTP_PORT || 587),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  SMTP_FROM: process.env.SMTP_FROM || '',
};
