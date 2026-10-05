// RF-NEG-03: estados declarados una sola vez (5 estados)
const ESTADOS = Object.freeze({
  PENDIENTE: 'Pendiente',
  ASIGNADA: 'Asignada',
  EN_CAMINO: 'En camino',
  ENTREGADA: 'Entregada',
  CANCELADA: 'Cancelada',
});
const ESTADO_INICIAL = ESTADOS.PENDIENTE;

// RF-NEG-05: estados terminales (de ellos no se sale)
const ESTADOS_TERMINALES = Object.freeze([ESTADOS.ENTREGADA, ESTADOS.CANCELADA]);

// RD-04: transiciones permitidas, en un solo lugar
const TRANSICIONES = Object.freeze([
  { desde: ESTADOS.PENDIENTE, hacia: ESTADOS.ASIGNADA,  ejecuta: 'Administrador', condicion: 'Hay un repartidor disponible' },
  { desde: ESTADOS.ASIGNADA,  hacia: ESTADOS.EN_CAMINO, ejecuta: 'Estandar',      condicion: 'Es el repartidor asignado' },
  { desde: ESTADOS.EN_CAMINO, hacia: ESTADOS.ENTREGADA, ejecuta: 'Estandar',      condicion: 'Es el repartidor asignado' },
  { desde: ESTADOS.PENDIENTE, hacia: ESTADOS.CANCELADA, ejecuta: 'Administrador', condicion: 'La entrega aún no salió a la calle' },
  { desde: ESTADOS.ASIGNADA,  hacia: ESTADOS.CANCELADA, ejecuta: 'Administrador', condicion: 'La entrega aún no salió a la calle' },
]);

// RF-NEG-04: transiciones prohibidas de forma explícita
const TRANSICIONES_PROHIBIDAS = Object.freeze([
  { desde: ESTADOS.ENTREGADA, hacia: ESTADOS.EN_CAMINO, motivo: 'Una entrega cerrada no se reabre' },
  { desde: ESTADOS.CANCELADA, hacia: ESTADOS.PENDIENTE, motivo: 'Una entrega cancelada no se reactiva' },
  { desde: ESTADOS.EN_CAMINO, hacia: ESTADOS.CANCELADA, motivo: 'Ya salió a la calle; solo puede entregarse' },
  { desde: ESTADOS.PENDIENTE, hacia: ESTADOS.ENTREGADA, motivo: 'No se puede entregar sin asignar ni salir' },
]);

function validarTransicion(desde, hacia, rol) {
  const p = TRANSICIONES_PROHIBIDAS.find((t) => t.desde === desde && t.hacia === hacia);
  if (p) return { ok: false, motivo: p.motivo };
  const t = TRANSICIONES.find((x) => x.desde === desde && x.hacia === hacia);
  if (!t) return { ok: false, motivo: 'Transición no permitida' };
  if (t.ejecuta === 'Administrador' && rol !== 'Administrador')
    return { ok: false, motivo: 'Solo un Administrador puede ejecutar esta transición' };
  return { ok: true, condicion: t.condicion };
}

module.exports = { ESTADOS, ESTADO_INICIAL, ESTADOS_TERMINALES, TRANSICIONES, TRANSICIONES_PROHIBIDAS, validarTransicion };
