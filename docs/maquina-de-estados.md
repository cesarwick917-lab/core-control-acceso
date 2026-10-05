# Máquina de estados: Entrega

Entidad central: **Entrega** (tabla `entregas`, columna `estado`).
Estados y transiciones definidos en un solo lugar: `src/dominio/entregaEstados.js`.

Estados: Pendiente (inicial), Asignada, En camino, Entregada (terminal), Cancelada (terminal).

## Transiciones permitidas

| Desde | Hacia | Quién la ejecuta | Condición |
|---|---|---|---|
| Pendiente | Asignada | Administrador | Hay un repartidor disponible |
| Asignada | En camino | Estándar (repartidor) | Es el repartidor asignado |
| En camino | Entregada | Estándar (repartidor) | Es el repartidor asignado |
| Pendiente | Cancelada | Administrador | La entrega aún no salió a la calle |
| Asignada | Cancelada | Administrador | La entrega aún no salió a la calle |

## Transiciones prohibidas (explícitas)

| Desde | Hacia | Motivo |
|---|---|---|
| Entregada | En camino | Una entrega cerrada no se reabre |
| Cancelada | Pendiente | Una entrega cancelada no se reactiva |
| En camino | Cancelada | Ya salió a la calle; solo puede entregarse |
| Pendiente | Entregada | No se puede entregar sin asignar ni salir |

Toda transición que no esté en la primera tabla se rechaza. De los estados terminales no sale ninguna.
