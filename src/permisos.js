const ROLES = ['Administrador', 'Estandar'];

// 'Estandar' = cualquier usuario autenticado. 'Administrador' = solo administradores.
const OPERACIONES = Object.freeze({
  'sesion.consultar': 'Estandar',
  'sesion.cerrar': 'Estandar',
  'sesion.cambiarPassword': 'Estandar',
});

module.exports = { ROLES, OPERACIONES };
