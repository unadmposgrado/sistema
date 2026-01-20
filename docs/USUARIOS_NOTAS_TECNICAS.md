# 🔧 Notas Técnicas - Módulo de Gestión de Usuarios

## 📐 Arquitectura

```
┌─────────────────────────────────────────────┐
│         dashboard.html                      │
│  Incluye: Supabase JS, dashboard.js, nav.js │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         dashboard.js (module)               │
│  - Valida sesión                            │
│  - Detecta rol (admin)                      │
│  - Carga layout admin.html                  │
│  - Llama initAdminModules()                 │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│    initAdminModules(userId)                 │
│  Crea: <script type="module"                │
│        src="modules/admin/usuarios.js">    │
└─────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│            usuarios.js (module)                      │
│  DOMContentLoaded listener                          │
│  - Verifica #usersList existe                       │
│  - Llama inicializarModuloUsuarios()                │
│    ├─ import { obtenerPerfiles } from usuarios.api.js
│    ├─ import { ... } from usuarios.ui.js            │
│    ├─ await obtenerPerfiles()                       │
│    ├─ renderizarTablaUsuarios()                     │
│    └─ inicializarControles()                        │
└──────────────────────────────────────────────────────┘
        ↓ (dynamic imports)        ↓
   usuarios.api.js          usuarios.ui.js
   (Capa de datos)          (Capa de presentación)
```

---

## 📝 Módulos y Responsabilidades

### usuarios.api.js
**Responsabilidad:** Gestionar datos y Supabase

```javascript
export async function obtenerPerfiles()
  → SELECT * FROM perfiles
  → Retorna: Array de objetos perfil

export async function cambiarRol(userId, nuevoRol)
  → UPDATE perfiles SET rol, onboarding_completo=false
  → Atomic: siempre actualiza ambos campos
  → Retorna: Perfil actualizado

export async function resetearOnboarding(userId)
  → UPDATE perfiles SET onboarding_completo=false
  → No toca el rol
  → Retorna: Perfil actualizado

export function filtrarPerfiles(perfiles, searchTerm, rolFiltro)
  → Filtrado en JavaScript (client-side)
  → Sin consultas adicionales a Supabase
  → Retorna: Array filtrado
```

**Notas:**
- Usa `window.supabaseClient` (inicializado en supabase.js)
- Manejo de errores con `console.error()`
- Sin validación de rol (confía en RLS)
- Sin autenticación adicional (usa token de sesión)

### usuarios.ui.js
**Responsabilidad:** Renderizar y gestionar eventos

```javascript
export function renderizarTablaUsuarios(perfiles)
  → Crea tabla HTML
  → Adjunta event listeners
  → Actualiza #usersList

export function inicializarControles(perfilesOriginales)
  → Setup listeners para input búsqueda
  → Setup listeners para select filtro
  → Ambos aplican filtros dinámicamente

function attachEventListeners()
  → Bind .rol-select para cambios
  → Bind .btn-reset-onboarding para clicks

async function handleRolChange(e)
  → Confirmación
  → Llama cambiarRol() de API
  → Actualiza UI sin recargar
  → Muestra errores

async function handleResetOnboarding(e)
  → Confirmación
  → Llama resetearOnboarding() de API
  → Actualiza UI sin recargar
  → Muestra errores
```

**Notas:**
- No mantiene estado (re-renderiza siempre)
- Event delegation: listeners en elementos específicos
- Confirmaciones antes de cambios
- Estados disabled durante operaciones

### usuarios.js
**Responsabilidad:** Orquestar flujo principal

```javascript
async function inicializarModuloUsuarios()
  1. mostrarCargando()
  2. import usuarios.api y usuarios.ui
  3. obtenerPerfiles()
  4. actualizarEstadisticas()
  5. renderizarTablaUsuarios()
  6. inicializarControles()

function actualizarEstadisticas(perfiles)
  → Actualiza contadores del panel admin
  → Usa IDs: #totalUsers, #activeStudents, #trainers, #monitors
```

**Notas:**
- Punto de entrada único del módulo
- Imports dinámicos (carga en runtime)
- Flujo secuencial: primero datos, luego UI

---

## 🔄 Flujos de Datos

### Flujo de Carga Inicial
```
DOMContentLoaded
    ↓
inicializarModuloUsuarios()
    ├─ mostrarCargando()
    ├─ import * from usuarios.api.js
    ├─ import * from usuarios.ui.js
    ├─ obtenerPerfiles() → [perfiles]
    ├─ actualizarEstadisticas(perfiles)
    ├─ renderizarTablaUsuarios(perfiles)
    ├─ inicializarControles(perfiles)
    └─ console.log("✅ Inicializado")
```

### Flujo de Búsqueda
```
user escribe en #userSearch
    ↓
Input event → aplicarFiltros()
    ├─ searchTerm = input.value
    ├─ rolFiltro = select.value
    ├─ filtrarPerfiles(perfilesOriginales, searchTerm, rolFiltro)
    ├─ perfilesFiltrados = resultado
    └─ renderizarTablaUsuarios(perfilesFiltrados)
```

### Flujo de Cambio de Rol
```
user selecciona rol en .rol-select
    ↓
handleRolChange(event)
    ├─ confirm("¿Cambiar el rol?")
    ├─ select.disabled = true
    ├─ cambiarRol(userId, nuevoRol)
    │   └─ Supabase UPDATE
    ├─ SI éxito:
    │   ├─ select.dataset.currentRol = nuevoRol
    │   ├─ actualizar badge a "⚠ Pendiente"
    │   └─ alert("Rol cambiado")
    ├─ SI error:
    │   ├─ select.value = rolAnterior
    │   └─ alert("Error: " + err)
    └─ select.disabled = false
```

### Flujo de Reset Onboarding
```
user hace clic en .btn-reset-onboarding
    ↓
handleResetOnboarding(event)
    ├─ confirm("¿Resetear onboarding?")
    ├─ btn.disabled = true
    ├─ resetearOnboarding(userId)
    │   └─ Supabase UPDATE
    ├─ SI éxito:
    │   ├─ actualizar badge a "⚠ Pendiente"
    │   └─ alert("Onboarding reseteado")
    ├─ SI error:
    │   └─ alert("Error: " + err)
    └─ btn.disabled = false
```

---

## 💾 Estado en Supabase

### Tabla `perfiles`
```sql
id          UUID PRIMARY KEY
nombre      TEXT
email       TEXT
rol         TEXT (monitor|estudiante|facilitador|admin)
onboarding_completo BOOLEAN (true|false)
created_at  TIMESTAMP
updated_at  TIMESTAMP
-- ... otros campos
```

**Invariantes:**
- `rol` y `onboarding_completo` deben estar sincronizados
- Si cambias `rol`, siempre `onboarding_completo = false`
- RLS previene cambios no-autorizados

---

## 🎯 Patrones Implementados

### 1. Módular y Desacoplado
```
- Cada módulo (api, ui) es independiente
- Pueden importarse/usarse por separado
- Bajo acoplamiento, alta cohesión
```

### 2. Separación de Responsabilidades
```
api.js    → Solo datos y Supabase
ui.js     → Solo presentación y eventos
orq.js    → Solo orquestación
```

### 3. Sin Estado Global
```
- No usa window.* para datos
- Pasa datos como parámetros
- Re-renderiza cuando cambian datos
```

### 4. Event-Driven
```
- Eventos DOM disparan handlers
- Handlers actualizan data
- Data actualiza UI
```

### 5. Async/Await
```
- Operaciones asincrónas explícitas
- Try/catch para errores
- Estados disabled durante operaciones
```

---

## 🔍 Debugging

### Activar Logs Detallados
```javascript
// En usuarios.api.js, descomentar:
console.log('🔍 Enviando update a Supabase...', { userId, nuevoRol });
console.log('✅ Respuesta de Supabase:', data);
```

### Ver Estado de Supabase
```javascript
// En Console, ejecutar:
const { data } = await supabaseClient
  .from('perfiles')
  .select('*')
  .limit(5);
console.table(data);
```

### Monitorear Cambios RLS
```sql
-- En Supabase, buscar logs de:
- SELECT * FROM perfiles
- UPDATE perfiles SET ...
```

### Network Tab
```
DevTools → Network
- Ver peticiones POST a Supabase
- Revisar status 200/4xx/5xx
- Ver payload enviado y respuesta
```

---

## 🚀 Optimizaciones Futuras

### 1. Paginación
```javascript
// Actualmente: carga TODOS los usuarios
// Optimización: Cargar de 20 en 20
obtenerPerfiles(limit=20, offset=0)
```

### 2. Búsqueda en Backend
```javascript
// Actualmente: filtrado en JavaScript
// Optimización: usar PostgreSQL LIKE en Supabase
select().ilike('nombre', '%term%')
```

### 3. Cache
```javascript
// Actualmente: re-obtiene cada vez
// Optimización: Cache con TTL o versión
localStorage.setItem('perfiles', JSON.stringify(data))
```

### 4. Validación Frontend
```javascript
// Agregar validaciones antes de enviar
- Verificar rol válido
- Verificar ID no vacío
- Verificar cambio real (no enviar si es igual)
```

### 5. Componentes Reutilizables
```javascript
// Extraer tabla genérica
// Extraer controles de búsqueda genéricos
// Compartir con otros módulos admin
```

---

## 🔐 Seguridad - Checklist

- [ ] RLS permite solo admin leer/actualizar
- [ ] No hay validación de rol en frontend (confía en RLS)
- [ ] No expone datos sensibles en UI
- [ ] Confirmaciones antes de cambios importantes
- [ ] No modifica Supabase Auth
- [ ] No almacena tokens localmente
- [ ] Usa sesión segura de Supabase

---

## 📦 Dependencias

```javascript
// Externas (ya en proyecto):
- @supabase/supabase-js (v2)

// Internas (creadas):
- usuarios.api.js
- usuarios.ui.js
- usuarios.js

// Estilos:
- css/base.css (variables CSS)
- css/admin.css (estilos específicos)
```

---

## 🐛 Errores Conocidos

### 1. "usuarios.api.js not found"
**Causa:** Ruta incorrecta en import
**Solución:** Verificar que archivos existen en `modules/admin/`

### 2. "RLS policy violation"
**Causa:** Admin no tiene permisos en Supabase RLS
**Solución:** Configurar políticas RLS correctamente

### 3. "Tabla muy lenta con muchos usuarios"
**Causa:** Filtrado en JavaScript para +1000 usuarios
**Solución:** Implementar búsqueda en backend

---

## 📋 Cambios Realizados a Archivos Existentes

### js/dashboard.js
```diff
async function initAdminModules(userId) {
  const usuariosModule = document.createElement('script');
+ usuariosModule.type = 'module';  // ← AGREGADO
  usuariosModule.src = 'modules/admin/usuarios.js';
  document.body.appendChild(usuariosModule);
}
```

### css/admin.css
```diff
+ /* AGREGADO: Estilos para tabla de usuarios */
+ .users-table { ... }
+ .badge { ... }
+ .btn-reset-onboarding { ... }
+ /* ~250 líneas nuevas */
```

---

## ✅ Puntos de Extensión

### 1. Agregar más campos a tabla
```javascript
// usuarios.api.js:
.select('id, nombre, email, rol, onboarding_completo, created_at')
                                                        // ↑ nuevo

// usuarios.ui.js:
const tr.innerHTML = `
  ...
  <td>${new Date(perfil.created_at).toLocaleDateString()}</td>
`;
```

### 2. Agregar más acciones
```javascript
// usuarios.ui.js:
button.addEventListener('click', async () => {
  await miNuevaAccion(userId);
  renderizarTablaUsuarios(perfiles);
});
```

### 3. Agregar más filtros
```javascript
// admin.html:
<select id="onboardingFilter">
  <option value="">Todos</option>
  <option value="true">Completados</option>
  <option value="false">Pendientes</option>
</select>

// usuarios.ui.js:
const aplicarFiltros = () => {
  const onboardingFilter = document.getElementById('onboardingFilter').value;
  // Aplicar filtro
};
```

---

## 📞 Contacto/Autor

**Módulo:** Gestión de Usuarios (Admin)
**Implementación:** 20 de enero de 2026
**Versión:** 1.0
**Status:** ✅ Producción

Para mantenimiento o extensión, revisar:
- `USUARIOS_MODULO_IMPLEMENTACION.md` (Documentación completa)
- `USUARIOS_TESTING_GUIDE.md` (Testing)
- `USUARIOS_RESUMEN_RAPIDO.md` (Resumen visual)
