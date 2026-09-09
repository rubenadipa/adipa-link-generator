# Brief · Generador de Enlaces Protegidos ADIPA

## Problema que resuelve

En ADIPA, los cursos y diplomados en video se sirven desde una intranet sin control fuerte sobre quién los reproduce ni desde dónde. Hoy cualquier persona con el URL del recurso puede acceder desde cualquier dispositivo, y no existe una barrera efectiva contra el reenvío del enlace, el uso compartido de la sesión, ni el plagio del contenido pagado. El único control actual es el login estándar, que un alumno puede saltarse compartiendo credenciales.

Este proyecto entrega una **capa de protección con doble autenticación** sobre cada enlace a un video de curso:

1. **Correo asignado**: el alumno solo entra si su correo coincide con el que el staff asoció al link al momento de crearlo (verificado con OTP por email).
2. **Device fingerprint**: cada link acepta un máximo de 2 dispositivos. El 3er dispositivo queda bloqueado, sin excepciones automáticas.

El staff de ADIPA (roles "cursos" y "diplomados", aislados entre sí) gestiona los links: los crea, monitorea accesos, revoca, libera slots o extiende validez. Rodrigo (admin) hace lo mismo más gestionar cuentas de staff.

## Usuario principal y roles

**Usuario principal del journey**: el **staff generador de ADIPA**. Es quien crea los links protegidos, ve las estadísticas de acceso y ejecuta acciones sobre ellos. El alumno es un actor secundario que aparece cuando abre un link.

**Roles del sistema:**

- **Admin (Rodrigo)** — Rol único. Crea, revoca y edita cuentas de staff, asigna tipo (cursos o diplomados). Puede hacer todo lo del staff pero sobre cualquier link, sin restricción de tipo.
- **Staff Cursos** — Crea, edita, revoca y monitorea únicamente links de tipo "curso". No puede ver ni tocar links de tipo "diplomado".
- **Staff Diplomados** — Espejo del anterior, sobre links de tipo "diplomado". No puede ver ni tocar los de curso.
- **Alumno** — Actor secundario, sin cuenta persistente. Se autentica por link + email + OTP + fingerprint cada vez que abre un recurso protegido.

## Pantallas / piezas (en orden del journey)

### Journey del Staff

1. **P1. Login** — Formulario de email + password. Redirige a P2 según rol y tipo.
2. **P2. Dashboard** — Stats agregadas (links activos, revocados, accesos del día, bloqueos del día) + lista paginada de links del staff con estado (activo / expirado / revocado).
3. **P3. Crear link** — Formulario: seleccionar curso o diplomado del catálogo (gestionado en P7, filtrado por `activo == true` y por el tipo del staff), ingresar correo del alumno, opcional activar "tiempo de validez en días desde 1er acceso". Al confirmar, genera link único y lo copia al portapapeles.
4. **P4. Detalle del link** — Muestra: correo asignado, curso, estado, devices vinculados (0/2, 1/2, 2/2), tabla de logs de acceso (email intentado, IP, fecha/hora, browser, país, resultado). Acciones: revocar link, revocar 1 device (libera slot), sumar 1 slot extra, extender validez.
5. **P5. Logout** — Cierra sesión y vuelve a P1.

### Journey extra del Admin (Rodrigo)

6. **P6. Gestionar staff** — Lista de cuentas staff con acciones: crear nuevo staff (email + tipo cursos/diplomados), revocar cuenta, cambiar tipo.
7. **P7. Gestionar catálogo** — CRUD de cursos y diplomados (crear, editar, desactivar). Acceso: solo Admin. Staff Cursos/Diplomados únicamente selecciona del catálogo (solo lectura, filtrado por su tipo) al crear un link en P3.

Admin accede a P6 y P7 desde el Dashboard (P2), no solo desde el login.

### Journey del Alumno

1. **A1. Landing del link** — Pantalla mínima con logo ADIPA y campo "ingresá tu correo".
2. **A2. Solicitud de OTP** — Al enviar el correo, si coincide con el asignado envía código OTP de 6 dígitos al mail. Si no coincide, muestra error.
3. **A3. Ingreso de OTP** — Input de 6 dígitos. Valida contra el código enviado. Máximo 3 intentos, luego bloqueo temporal de 15 minutos. Incluye opción "reenviar código" con cooldown de 30 segundos entre reenvíos; cada reenvío invalida el código anterior.
4. **A4. Verificación de fingerprint** — Captura silenciosa del FP del navegador. Si el FP ya está registrado o hay slot libre, pasa. Si es un 3er device distinto, muestra pantalla de bloqueo.
5. **A5. Reproductor** — Componente que carga el video del curso (título, descripción, player) validando token de sesión en cada request. Mientras el reproductor esté activo, el token se renueva solo en segundo plano (heartbeat), sin pedir nueva autenticación. Si el alumno cierra el reproductor y vuelve después de que el token expiró por inactividad, debe re-autenticarse (correo + OTP; el fingerprint ya registrado no cuenta como device nuevo).

### Pantallas de error / bloqueo

- **E1. Correo no autorizado** — el email ingresado no coincide con el asignado.
- **E2. OTP inválido / bloqueo temporal** — 3 intentos fallidos → espera 15 min.
- **E3. Límite de dispositivos alcanzado** — 3er device, con CTA a contactar soporte.
- **E4. Enlace revocado o expirado** — con CTA a contactar soporte.

## Datos por pantalla (qué entra, qué sale)

### P1. Login
- **Entra**: `{ email, password }`
- **Sale**: sesión JWT con `{ staffId, rol: "admin" | "staff", tipo: "cursos" | "diplomados" | null }`

### P2. Dashboard
- **Entra**: `staffId` (del JWT)
- **Sale**: `{ stats: { activos, revocados, accesos_hoy, bloqueos_hoy }, links: Link[] }`
  - `Link = { id, contenidoTitulo, emailAsignado, estado, devicesUsados, createdAt }`

### P3. Crear link
- **Entra**: `{ contenidoId, emailAlumno, validezDias?: number }`
- **Sale**: `{ linkId, url: "https://.../l/<tokenPublico>", tokenPublico }`

### P4. Detalle link
- **Entra**: `linkId`
- **Sale**: `{ link: Link, devices: Device[], logs: LogAcceso[] }`
  - `Device = { id, fingerprint, primerAcceso, ultimoAcceso }`
  - `LogAcceso = { emailIntentado, ip, fechaHora, browser, pais, resultado }`
- **Acciones (entrada)**: `revocar(linkId)`, `revocarDevice(linkId, deviceId)`, `sumarSlot(linkId)`, `extenderValidez(linkId, dias)`

### P6. Gestionar staff (admin)
- **Entra**: `{ }` (lista todo)
- **Sale**: `{ staff: StaffAccount[] }`
- **Acciones**: `crearStaff({ email, tipo })`, `revocarStaff(id)`, `cambiarTipo(id, tipo)`

### P7. Gestionar catálogo (admin)
- **Entra**: `{ }` (lista todo) para ver; para mutar: `crearContenido({ tipo, titulo, descripcion })`, `editarContenido(id, { titulo?, descripcion? })`, `desactivarContenido(id)`
- **Sale**: `{ contenidos: Contenido[] }`
  - `Contenido = { id, tipo: "curso" | "diplomado", titulo, descripcion, activo }`

### A1. Landing del link
- **Entra**: `tokenPublico` (por URL path)
- **Sale**: render de landing (sin datos sensibles)

### A2. Solicitud OTP
- **Entra**: `{ tokenPublico, email }`
- **Sale**: si `email == asignado` → dispara envío de OTP y responde `{ok: true}`; si no → `{ok: false, error: "correo_no_autorizado"}`

### A3. Ingreso OTP
- **Entra**: `{ tokenPublico, otp }`
- **Sale**: `{ sessionAlumno }` (token temporal firmado, 1 hora) o error

### A4. Verificación fingerprint
- **Entra**: `{ sessionAlumno, fingerprint }`
- **Sale**: si FP conocido o slot libre → `{ok: true}` y registra si es nuevo; si no → `{ok: false, error: "limite_devices"}`

### A5. Reproductor
- **Entra**: `{ sessionAlumno }` (validado en cada request)
- **Sale**: `{ videoUrl, titulo, descripcion }` desde storage (mock en v1)
- **Heartbeat**: mientras el player esté activo, `renovarSesion(sessionAlumno)` → `{ sessionAlumno: nuevoToken }` cada N minutos, sin interacción del alumno. Si no hay heartbeat y el token expira, la siguiente request falla y se exige re-autenticación completa.

## Reglas de negocio (si... entonces...)

1. Si `staff.tipo == "cursos"` → NO puede listar, ver, crear ni editar links de tipo "diplomados". Idem al revés.
2. Si `email_ingresado != email_asignado_del_link` → bloqueo inmediato con mensaje "correo no autorizado para este enlace".
3. Si el alumno falla el OTP 3 veces seguidas → bloqueo temporal del link por 15 minutos, medido desde el 3er intento.
4. Si `devices_registrados < 2` y llega un FP nuevo → registra el FP y da acceso.
5. Si `devices_registrados == 2` y llega un FP nuevo → bloqueo con mensaje "límite de dispositivos alcanzado, contactar soporte".
6. Si `link.validezDias` está seteado y `hoy > primerAcceso + validezDias` → bloqueo por expiración.
7. Si `link.estado == "revocado"` → bloqueo en cualquier apertura futura.
8. Por defecto los links son **permanentes** (representan ventas de curso). El tiempo de validez es la excepción, aplicable solo a casos puntuales (webinars, cursos de temporada, promos).
9. 1 link = 1 correo. El correo asignado se fija al crear el link y no es editable después. Si el alumno necesita otro correo, el staff genera un link nuevo.
10. El staff puede sobre sus propios links: revocar link entero, revocar 1 device (libera slot), sumar 1 slot extra (máx 3 slots totales), extender validez cuando aplique.
11. El admin (Rodrigo) puede todo lo del staff sobre cualquier link + gestionar cuentas staff (crear, revocar, cambiar tipo).
12. Cada acceso (exitoso o bloqueado) queda logueado con: email intentado, IP, fecha/hora, browser (user-agent parseado), país (geo-IP), resultado.
13. Al momento de crear un link, si el correo del alumno ya tiene otro link activo para el mismo contenido → advertencia al staff (pero se permite crear, útil para casos de reventa o reemplazo).
14. 1 fingerprint de navegador = 1 device. Dos navegadores distintos en el mismo equipo físico consumen 2 slots separados (no se intenta correlacionar por IP u otras señales en v1).
15. Al revocar 1 device (regla 10), el slot queda libre para cualquier fingerprint nuevo, incluyendo el mismo que fue revocado — no existe lista negra permanente por link.
16. El login del staff usa solo email + password, sin OTP. El doble factor (OTP + fingerprint) es una barrera diseñada específicamente para el alumno externo (actor no confiable); el staff es personal interno de ADIPA.
17. El token de sesión del alumno se renueva automáticamente (heartbeat) mientras el reproductor esté activo, sin exigir nueva autenticación. Si expira por inactividad, el alumno debe repetir correo + OTP; el fingerprint ya registrado no cuenta como device nuevo.
18. Después del bloqueo temporal de 15 min por OTP inválido (regla 3), el contador de intentos se reinicia a 3.
19. El catálogo de cursos/diplomados lo gestiona únicamente el Admin (P7). Un contenido no se elimina físicamente si tiene links asociados: se desactiva (`activo: false`) y deja de listarse en P3, pero los links ya creados sobre él siguen funcionando con normalidad.

## Fuera de alcance (qué NO se construye en esta versión)

1. **Integración real con el storage/CDN de videos de ADIPA** — se usa un mock con URLs de video placeholder. En producción el video real se serviría desde el storage que disponga ADIPA (S3 firmado, Bunny CDN, Vimeo privado, etc.), integrado por su equipo de IT.
2. **Integración con la pasarela de pago** — los links no se crean automáticamente tras la compra. El staff los crea manualmente en v1. La integración con el flujo de compra queda para v2.
3. **Envío real de correos transaccionales** — el OTP se muestra en pantalla en modo demo, o se envía por un servicio en sandbox (tipo Resend). En producción se conectaría al SMTP corporativo de ADIPA.
4. **Recuperación de contraseña de staff** — si un staff olvida su password, Rodrigo la resetea manualmente desde el panel de admin. No hay flujo self-service.
5. **Reportería exportable / dashboards avanzados** — solo las stats básicas del dashboard. No hay exportación a Excel, gráficos históricos ni filtros complejos.
6. **Multi-tenant** — la app asume una sola organización (ADIPA). No hay soporte para múltiples clientes en la misma instancia.
7. **Notificaciones push o email al staff** cuando ocurre un bloqueo o evento relevante.
8. **App móvil nativa** — la web app es responsive mobile-first, pero no hay app iOS/Android dedicada.
9. **Protección DDoS o rate limiting a nivel de infraestructura** — se implementa el bloqueo por 3 OTPs fallidos, pero la protección de red queda para el hosting/CDN de ADIPA.
10. **DRM sobre el video** — el fingerprint protege el ACCESO al recurso, no la copia posterior mediante herramientas de captura de pantalla o grabadores. Ese es un problema aparte que requeriría integración con DRM (Widevine, PlayReady, FairPlay). Queda anotado como el primer candidato para v2 si ADIPA lo prioriza.
11. **Precisión del geo-IP en los logs** — el país se resuelve con una librería/servicio de geo-IP estándar (best-effort), sin garantía de precisión: VPNs y proxies pueden alterar el resultado. No se implementa detección ni bloqueo de VPN en v1.

## Nota técnica de implementación (v1)

- **Stack**: Next.js 15 (App Router) + TypeScript + Tailwind CSS.
- **Persistencia**: Postgres real (Neon, vía integración nativa de Vercel Marketplace) con Drizzle ORM. Los datos (staff, links, devices, logs, catálogo, OTPs) sobreviven reinicios y son consistentes entre las instancias serverless de Vercel — ya no hay el problema de datos "in-memory" por cold start que tuvo la primera versión desplegada. El schema vive en `src/lib/db/schema.ts`; `drizzle-kit push` aplica cambios de schema contra la base real.
- **Auth staff**: bcrypt para hash de password + JWT en cookie httpOnly.
- **OTP**: código de 6 dígitos generado en memoria con TTL de 10 minutos. Envío en modo demo (se muestra el OTP en pantalla); el hook de envío real (Resend/SMTP) queda comentado en el código para conectar en v2.
- **Fingerprint**: hash simple derivado de atributos del navegador (canvas + user-agent) — ver "Fuera de alcance" punto 9 sobre por qué esto no es una barrera anti-fraude fuerte, solo un identificador best-effort de dispositivo.

## Retrospectiva

*(Esta sección se completa DESPUÉS de construir y probar la app.)*

### 1. ¿Qué pregunta de Claude te hizo dar cuenta de algo que no tenías claro del flujo?

<a completar tras la construcción>

### 2. ¿Qué diferencia hubo entre tu mapa inicial y lo que terminaste construyendo?

<a completar tras la construcción>

### 3. Si tuvieras que hacer este flujo de verdad para ADIPA, ¿cuál sería el primer riesgo o pieza faltante?

<a completar tras la construcción>
