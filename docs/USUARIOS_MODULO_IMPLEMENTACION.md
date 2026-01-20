# Módulo de Gestión de Usuarios - Documentación de Implementación

## 📋 Resumen
Se ha implementado un módulo completo y modular para la gestión de usuarios (tabla `perfiles`) en Supabase, accesible solo para administradores. El módulo permite listar, buscar, filtrar, cambiar roles y resetear onboarding de usuarios.

## 🎯 Funcionalidades Implementadas

### 1. **Listar Usuarios**
- Obtiene todos los usuarios de la tabla `perfiles` en Supabase
- Muestra: Nombre, Email, Rol, Estado de Onboarding
- Ordenados alfabéticamente por nombre

### 2. **Buscar Usuarios**
- Input de búsqueda en tiempo real
- Busca por nombre o email
- Filtrado instantáneo sin recargar la página

### 3. **Filtrar por Rol**
- Select con opciones: Monitor, Estudiante, Facilitador, Admin
- Filtra combinado con búsqueda

### 4. **Cambiar Rol**
- Select editable en cada fila de la tabla
- Al cambiar rol:
  - ✅ Se actualiza el campo `rol` en Supabase
  - ✅ Se fuerza automáticamente `onboarding_completo = false`
  - ✅ La UI actualiza el badge de onboarding inmediatamente
  - ✅ Confirmación antes de aplicar cambios
- El usuario no recibe desconexión, el cambio se reflejará en su próximo login

### 5. **Resetear Onboarding**
- Botón "🔄 Reset" en cada fila
- Solo actualiza `onboarding_completo = false`
- Mantiene el rol actual sin cambios
- Confirmación antes de aplicar

### 6. **Actualizar Estadísticas**
- Actualiza automáticamente los contadores del dashboard
- Total de usuarios
- Estudiantes activos
- Facilitadores
- Monitores

## 📁 Archivos Creados/Modificados

### Archivos Creados en `modules/admin/`

#### 1. **usuarios.api.js** (Nueva capa de datos)
```javascript
- obtenerPerfiles()              // GET all perfiles
- cambiarRol(userId, nuevoRol)   // UPDATE rol + onboarding_completo
- resetearOnboarding(userId)     // UPDATE onboarding_completo only
- filtrarPerfiles()              // Helper para búsqueda/filtrado
```

**Características:**
- Uso del cliente Supabase ya inicializado (`window.supabaseClient`)
- Manejo de errores con `console.error()`
- Operaciones atómicas (cambiar rol siempre resetea onboarding)
- Sin modificación de Auth

#### 2. **usuarios.ui.js** (Nueva capa de presentación)
```javascript
- renderizarTablaUsuarios()      // Render tabla HTML con eventos
- inicializarControles()         // Setup búsqueda y filtros
- attachEventListeners()         // Bind eventos a elementos
- handleRolChange()              // Event handler para cambios de rol
- handleResetOnboarding()        // Event handler para reset
- mostrarCargando()              // UI de carga
- mostrarError()                 // UI de error
```

**Características:**
- Tabla HTML5 responsive
- Badges visuales para estado de onboarding
- Actualizaciones dinámicas sin recargar
- Confirmaciones antes de cambios
- Estados disabled en botones durante operaciones

#### 3. **usuarios.js** (Orquestador del módulo)
```javascript
- inicializarModuloUsuarios()    // Main entry point
- actualizarEstadisticas()       // Actualizar contadores
- Imports dinámicos de usuarios.api.js y usuarios.ui.js
```

**Características:**
- Espera a que el DOM esté listo
- Carga módulos ES6 dinámicamente con `import()`
- Orquesta el flujo: obtener datos → actualizar stats → renderizar → init controles
- Manejo centralizado de errores

### Archivo Modificado

#### `js/dashboard.js`
```javascript
// Línea ~294: Cambio en initAdminModules()
- Agregado: usuariosModule.type = 'module';
// Permite que usuarios.js cargue módulos ES6 dinámicamente
```

#### `css/admin.css`
```css
// Agregados al final:
- .users-table                   // Tabla con estilos modernos
- .badge, .badge-success, etc.   // Badges de estado
- .btn-reset-onboarding          // Botón de reset
- .no-results, .loading, .error-message  // Estados
- @media queries para responsividad
```

## 🔌 Integración con el Sistema Existente

### Flujo de Carga
```
dashboard.html
  ├─ Supabase JS
  ├─ dashboard.js (type="module")
  │   ├─ Valida sesión
  │   ├─ Obtiene rol del usuario
  │   ├─ Carga layout admin.html
  │   └─ Llama initAdminModules(userId)
  │       └─ Crea <script type="module" src="modules/admin/usuarios.js">
  │           └─ usuarios.js hace import dinámico:
  │               ├─ usuarios.api.js
  │               └─ usuarios.ui.js
  └─ nav.js
```

### Compatibilidad con RLS (Row Level Security)
- ✅ El módulo confía en que Supabase RLS controla permisos
- ✅ Solo admin puede leer/actualizar perfiles (configurado en RLS)
- ✅ No se valida rol en frontend (confiamos en RLS)

### Compatibilidad con Onboarding Existente
- ✅ No modifica el flujo `dashboard.js`
- ✅ Solo actualiza el campo `onboarding_completo` cuando admin lo requiere
- ✅ Cambios reflejados en próximo login del usuario

## 🎨 Interfaz de Usuario

### Tabla de Usuarios
```
┌─────────────────────────────────────────────────────────────────┐
│ Nombre      │ Email            │ Rol       │ Onboarding │ Acciones │
├─────────────────────────────────────────────────────────────────┤
│ Juan García │ juan@email.com   │ [Select]  │ ✓ Completado│ 🔄 Reset │
│ María López │ maria@email.com  │ [Select]  │ ⚠ Pendiente │ 🔄 Reset │
└─────────────────────────────────────────────────────────────────┘
```

### Controles
- **Input Búsqueda:** "Buscar usuario..." (nombre o email)
- **Select Filtro:** "Todos los roles" (Monitor, Estudiante, Facilitador, Admin)
- **Rol (Select editable):** Cambio inmediato con confirmación
- **Reset Button:** Resetea onboarding con confirmación

### Badges de Estado
- **✓ Completado** (verde): `badge-success`
- **⚠ Pendiente** (amarillo): `badge-warning`

## 🔐 Seguridad

### Medidas Implementadas
1. ✅ **RLS Supabase:** Solo admin puede leer/actualizar perfiles
2. ✅ **No hay validación en frontend:** Confía en RLS
3. ✅ **No modifica Auth:** El usuario sigue logueado después de cambios
4. ✅ **Confirmaciones UI:** Antes de cambios importantes
5. ✅ **Sin exposición de datos:** Solo muestra nombre, email, rol, onboarding_completo

### Nota Sobre Modificar Propio Usuario
- Actualmente permitido (opcional no hacerlo)
- Si se requiere, se puede añadir check: `if (userId !== userIdActual) { ... }`

## 📝 Ejemplos de Uso

### Cambiar rol de un usuario
```
1. Admin hace clic en el Select de Rol de una fila
2. Selecciona nuevo rol (ej: "facilitador")
3. Confirmación: "¿Cambiar el rol a "facilitador"?"
4. Se ejecuta cambiarRol(userId, "facilitador")
5. Supabase actualiza:
   - rol = "facilitador"
   - onboarding_completo = false
6. Badge de la fila cambia a "⚠ Pendiente"
7. Usuario ve onboarding en próximo login
```

### Resetear onboarding
```
1. Admin hace clic en botón "🔄 Reset"
2. Confirmación: "¿Resetear el onboarding de este usuario?"
3. Se ejecuta resetearOnboarding(userId)
4. Supabase actualiza: onboarding_completo = false
5. Badge cambia a "⚠ Pendiente"
6. Usuario ve onboarding en próximo login
```

### Buscar y filtrar
```
1. Escribe "juan" en búsqueda → Filtra por nombre/email
2. Selecciona "estudiante" en filtro → Solo muestra estudiantes
3. Combinado: busca "juan" + filtro "estudiante"
```

## 🚀 Mantenimiento y Extensión

### Para agregar más campos a la tabla
1. Actualizar tabla `perfiles` en Supabase
2. Modificar `select()` en `usuarios.api.js`
3. Agregar columna en `renderizarTablaUsuarios()` en `usuarios.ui.js`
4. Agregar estilos en `admin.css` si es necesario

### Para agregar más filtros
1. Agregar select/input en `admin.html` (sección users-controls)
2. Actualizar `aplicarFiltros()` en `usuarios.ui.js`

### Para cambiar comportamiento de cambio de rol
- Modificar `cambiarRol()` en `usuarios.api.js`
- O actualizar `handleRolChange()` en `usuarios.ui.js`

## ⚙️ Tecnología Usada

- **Lenguaje:** JavaScript vanilla (ES6+)
- **Backend:** Supabase (Auth + Perfiles table)
- **CSS:** Vanilla + variables CSS (ya definidas en base.css)
- **Módulos:** ES6 modules con imports dinámicos
- **Sin dependencias externas:** Solo Supabase JS que ya está en el proyecto

## ✅ Checklist de Implementación

- ✅ Módulo modular y desacoplado
- ✅ Sin modificar lo existente (dashboard, login, auth)
- ✅ Usa Supabase ya configurado
- ✅ RLS proporciona seguridad
- ✅ Código limpio y comentado
- ✅ Manejo de errores con console.error()
- ✅ UI actualiza sin recargar
- ✅ Responsive design
- ✅ No rompe compatibilidad con onboarding
- ✅ No cierra sesión del usuario
- ✅ Cambios reflejados en próximo login
- ✅ Validaciones UI (confirmaciones)

## 🐛 Solución de Problemas

### Si la tabla no se carga
1. Verificar console (F12) por errores
2. Verificar que el usuario es admin
3. Verificar que RLS permite leer tabla `perfiles`
4. Verificar conexión a Supabase

### Si los cambios no se reflejan en Supabase
1. Verificar que RLS permite UPDATE en `perfiles`
2. Verificar que admin es propietario de su propio registro
3. Revisar respuesta del servidor en Network tab

### Si hay error "usuarios.api.js not found"
1. Verificar que los 3 archivos estén en `modules/admin/`
2. Verificar que `usuarios.js` tiene `type="module"` en dashboard.js

## 📞 Contacto/Notas
- Implementación completada: 20 de enero de 2026
- Versión: 1.0 (Estable)
- Pronto para producción ✅
