const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const hashear = (password) => bcrypt.hash(password, 12);
const verificar = (password, hash) => bcrypt.compare(password, hash);

const RE_CORREO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const correoValido = (c) =>
  typeof c === 'string' && c.length > 0 && c.length <= 254 && RE_CORREO.test(c);

const passwordCumplePolitica = (p) =>
  typeof p === 'string' && p.length >= 8 && p.length <= 72 &&
  /[A-Za-z]/.test(p) && /\d/.test(p);

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const nuevoToken = () => {
  const token = crypto.randomBytes(32).toString('base64url');
  return { token, hash: hashToken(token) };
};

module.exports = { hashear, verificar, correoValido, passwordCumplePolitica, hashToken, nuevoToken };
