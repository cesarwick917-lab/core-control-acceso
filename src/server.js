const express = require('express');
const path = require('path');
const config = require('./config');
require('./db');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api', require('./rutas/auth'));

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed')
    return res.status(400).json({ mensaje: 'La petición no es válida.' });
  console.error(err);
  res.status(500).json({ mensaje: 'Ocurrió un error. Intenta de nuevo más tarde.' });
});

app.listen(config.PORT, () => console.log(`Servidor en http://localhost:${config.PORT}`));
