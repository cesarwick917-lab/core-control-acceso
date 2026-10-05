# Core: Control de acceso

Proyecto: Despacho de entregas a domicilio (JavaScript, Node.js, HTML y CSS).

## Requisitos
Node.js 20.6 o superior.

## Cómo ejecutar
1. `npm install`
2. Copiar `.env.example` a `.env` y completar las variables (ver abajo).
3. `npm run crear-admin` (crea el primer Administrador con ADMIN_CORREO y ADMIN_PASSWORD).
4. `npm start` y abrir http://localhost:3000/registro.html
5. En otra terminal, `npm run enviador` envía los correos pendientes de la cola.

## Variables de entorno
| Variable | Para qué sirve |
|---|---|
| PORT | Puerto del servidor |
| APP_BASE_URL | URL base usada en los enlaces de los correos |
| DB_FILE | Archivo de la base de datos SQLite |
| SMTP_HOST | Servidor SMTP |
| SMTP_PORT | Puerto SMTP |
| SMTP_USER | Usuario SMTP |
| SMTP_PASSWORD | Contraseña (de aplicación) SMTP |
| SMTP_FROM | Remitente de los correos |
| ADMIN_CORREO | Correo del primer Administrador |
| ADMIN_PASSWORD | Contraseña del primer Administrador |

## Cómo provocar cada criterio de aceptación
- **RF-CA-01:** en /registro.html registrar el mismo correo dos veces; el segundo se rechaza.
- **RF-CA-02:** las contraseñas se guardan con bcrypt (hash con sal). Dos usuarios con la misma contraseña tienen hashes distintos en la tabla `usuarios`.
- **RF-CA-14:** registrar con contraseña de 5 caracteres o sin números; se rechaza con mensaje.
- **RF-CA-15/16:** tras registrarse, iniciar sesión en /login.html dice "La cuenta no está activa". Correr `npm run enviador`, abrir el enlace recibido y la cuenta se activa. Abrirlo de nuevo se rechaza.
- **RF-CA-17:** en /reenviar.html la respuesta es igual exista o no el correo.
- **RF-CA-03:** en /login.html, contraseña incorrecta y correo inexistente dan el mismo mensaje.
- **RF-CA-19:** fallar 5 veces seguidas; el sexto intento con la clave correcta se rechaza durante 15 minutos.
- **RF-CA-07/18:** /api/yo sin sesión da 401. Tras cerrar sesión en /panel.html la cookie anterior deja de servir.
- **RF-CA-05/06:** los permisos están en `src/permisos.js`. Con un usuario Estándar, `fetch('/api/admin/usuarios')` en la consola da 403.
- **RF-CA-08/20/21:** como Administrador, en /admin.html listar usuarios, cambiar rol, desactivar y reactivar. No se puede cambiar el propio rol ni desactivarse a sí mismo.
- **RF-CA-09/10/11/12:** en /recuperar.html pedir recuperación (misma respuesta con correo inexistente), abrir el enlace del correo, definir contraseña nueva; reusar el enlace se rechaza y las sesiones anteriores dejan de servir.
- **RF-CA-13:** en /admin.html pulsar "Forzar restablecimiento" sobre un usuario.
- **RF-CA-22:** en /panel.html cambiar contraseña con la actual incorrecta; se rechaza.
- **Cola de correo (RF-NOT-08/09/12/13):** con `SMTP_HOST` vacío o inválido, registrar un usuario funciona y el correo queda en estado `pendiente` en la tabla `correos_en_cola`. Correr `npm run enviador` dos veces no duplica envíos.
- **RD-09:** reiniciar `npm start`; los usuarios siguen en `datos.db`.

## Máquina de estados de negocio
Pendiente de entregar en este hito (ver docs/ cuando se agregue).
