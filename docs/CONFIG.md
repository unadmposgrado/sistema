# config.js - Documentación Completa

## Descripción General

`config.js` es una capa de control centralizada que gestiona la activación, desactivación y pausa de roles sin modificar la lógica del sistema. Actúa como puente entre la aplicación y un futuro panel de administración.

## Características Principales

✅ **Independiente**: No tiene lógica de autenticación ni llamadas a Supabase  
✅ **Extensible**: Diseñado para recibir datos de API/Admin Panel en el futuro  
✅ **No invasivo**: Se integra sin romper la arquitectura existente  
✅ **Documentado**: Incluye ejemplos de uso en cada función  

---

## Estructura de Configuración

### Estados Globales

```javascript
system: {
  maintenance: false,                    // Activa mantenimiento general
  maintenanceMessage: "..."              // Mensaje visible al usuario
}
```

### Configuración por Rol

Cada rol tiene la siguiente estructura:

```javascript
aspirante: {
  enabled: true,                         // Rol habilitado/deshabilitado
  status: 'active',                      // Estado: 'active', 'disabled', 'paused'
  label: 'Aspirante',                    // Nombre visible
  description: '...',                    // Descripción del rol
  visibleInNav: true,                    // Mostrar en navegación
  
  allowedActions: {                      // Acciones permitidas por rol
    login: true,
    viewDashboard: true,
    uploadDocuments: true,
  },
  
  messages: {                            // Mensajes de estado
    disabled: '...',
    paused: '...',
  }
}
```

### Características del Sistema

```javascript
features: {
  advancedReporting: { enabled: true },
  userAnalytics: { enabled: true },
  apiIntegration: { enabled: false },
}
```

---

## API de Helpers

### Consultar Configuración

#### `getRoleConfig(roleName)`
Obtiene la configuración completa de un rol.

```javascript
import { getRoleConfig } from './config.js';

const studentConfig = getRoleConfig('estudiante');
console.log(studentConfig.label);      // "Estudiante"
console.log(studentConfig.enabled);    // true
```

#### `isRoleEnabled(roleName)`
Verifica si un rol está completamente habilitado.

```javascript
import { isRoleEnabled } from './config.js';

if (!isRoleEnabled('estudiante')) {
  console.log('Rol deshabilitado');
  return;
}
// Continuar con lógica normal
```

#### `isRolePaused(roleName)`
Verifica si un rol está pausado (pero puede recuperarse).

```javascript
import { isRolePaused } from './config.js';

if (isRolePaused('aspirante')) {
  showMessage('Este rol está en pausa. Vuelve más tarde.');
}
```

#### `getRoleStatusMessage(roleName)`
Obtiene el mensaje apropiado para mostrar al usuario.

```javascript
import { getRoleStatusMessage } from './config.js';

const message = getRoleStatusMessage('formador');
alert(message); // Muestra mensaje si está disabled/paused
```

#### `isActionAllowed(roleName, action)`
Verifica si una acción específica está permitida para un rol.

```javascript
import { isActionAllowed } from './config.js';

if (isActionAllowed('estudiante', 'submitEvidence')) {
  // Permitir envío de evidencias
} else {
  // Acción bloqueada
}
```

#### `getEnabledRoles()`
Obtiene todos los roles habilitados en el sistema.

```javascript
import { getEnabledRoles } from './config.js';

const enabledRoles = getEnabledRoles();
console.log(enabledRoles); // ['aspirante', 'estudiante', 'formador', 'admin']
```

#### `getVisibleRoles()`
Obtiene roles visibles en la navegación con información básica.

```javascript
import { getVisibleRoles } from './config.js';

const roles = getVisibleRoles();
// [
//   { name: 'aspirante', label: 'Aspirante', enabled: true },
//   { name: 'estudiante', label: 'Estudiante', enabled: true },
//   ...
// ]
```

### Validar Estado del Sistema

#### `isSystemInMaintenance()`
Verifica si el sistema está en modo mantenimiento.

```javascript
import { isSystemInMaintenance, getMaintenanceMessage } from './config.js';

if (isSystemInMaintenance()) {
  console.log(getMaintenanceMessage());
  // Mostrar página de mantenimiento
}
```

#### `getMaintenanceMessage()`
Obtiene el mensaje de mantenimiento.

```javascript
import { getMaintenanceMessage } from './config.js';

const msg = getMaintenanceMessage();
```

#### `isFeatureEnabled(featureName)`
Verifica si una característica del sistema está habilitada.

```javascript
import { isFeatureEnabled } from './config.js';

if (isFeatureEnabled('advancedReporting')) {
  // Mostrar opciones de reportes avanzados
}
```

---

## API de Control Administrativo

**⚠️ NOTA**: Estos helpers están diseñados para futuros paneles de admin. En producción, los cambios deberán venir de una API o Supabase, no del cliente.

### `setRoleState(roleName, newState)`
Cambia el estado de un rol.

```javascript
import { setRoleState, ROLE_STATES } from './config.js';

// Estados válidos: 'active', 'disabled', 'paused'
setRoleState('estudiante', ROLE_STATES.PAUSED);
```

### `enableRole(roleName)`
Habilita un rol completamente.

```javascript
import { enableRole } from './config.js';

enableRole('aspirante');
```

### `disableRole(roleName)`
Deshabilita un rol completamente.

```javascript
import { disableRole } from './config.js';

disableRole('formador');
```

### `pauseRole(roleName)`
Pausa un rol temporalmente (mantiene `enabled: true`).

```javascript
import { pauseRole } from './config.js';

pauseRole('aspirante');
```

### `setMaintenanceMode(maintenance, message)`
Activa o desactiva el modo mantenimiento.

```javascript
import { setMaintenanceMode } from './config.js';

// Activar mantenimiento
setMaintenanceMode(true, 'Actualizando base de datos. Vuelve en 30 min.');

// Desactivar
setMaintenanceMode(false);
```

---

## Constantes Exportadas

### `ROLES`
Array congelado con todos los roles válidos.

```javascript
import { ROLES } from './config.js';

console.log(ROLES); // ['aspirante', 'estudiante', 'formador', 'admin']
```

### `ROLE_STATES`
Estados válidos de un rol.

```javascript
import { ROLE_STATES } from './config.js';

console.log(ROLE_STATES.ACTIVE);    // 'active'
console.log(ROLE_STATES.DISABLED);  // 'disabled'
console.log(ROLE_STATES.PAUSED);    // 'paused'
```

### `SYSTEM_CONFIG`
Configuración completa del sistema (solo lectura recomendada).

```javascript
import { SYSTEM_CONFIG } from './config.js';

console.log(SYSTEM_CONFIG.roles);
```

---

## Ejemplos de Uso Real

### Ejemplo 1: Validar Rol en Dashboard

**Ubicación**: `js/dashboard.js`

```javascript
import { isRoleEnabled, getRoleStatusMessage } from './config.js';

const userRole = perfil.role; // 'estudiante'

if (!isRoleEnabled(userRole)) {
  layoutContainer.innerHTML = `
    <div class="alert">
      <h2>⚠️ Rol No Disponible</h2>
      <p>${getRoleStatusMessage(userRole)}</p>
    </div>
  `;
  return;
}

// Continuar cargando dashboard
```

### Ejemplo 2: Permitir/Bloquear Acciones

**Ubicación**: `modules/estudiante/evidencias.js`

```javascript
import { isActionAllowed } from '../config.js';

function handleEvidenceUpload() {
  if (!isActionAllowed('estudiante', 'submitEvidence')) {
    alert('No puedes enviar evidencias en este momento.');
    return;
  }

  // Proceder con el envío
  uploadEvidence();
}
```

### Ejemplo 3: Cargar Menú Dinámico por Rol

**Ubicación**: `js/nav.js` (futuro)

```javascript
import { getVisibleRoles, isRoleEnabled } from './config.js';

function buildRoleMenu() {
  const roles = getVisibleRoles();
  
  return roles
    .filter(r => isRoleEnabled(r.name))
    .map(r => `<li><a href="#${r.name}">${r.label}</a></li>`)
    .join('');
}
```

### Ejemplo 4: Panel de Admin (Futuro)

**Ubicación**: `modules/admin/config-manager.js` (futuro)

```javascript
import {
  enableRole,
  disableRole,
  pauseRole,
  setMaintenanceMode,
  getRolesSummary,
} from '../config.js';

function toggleRoleStatus(roleName) {
  if (isRoleEnabled(roleName)) {
    disableRole(roleName);
  } else {
    enableRole(roleName);
  }
  
  updateUI(getRolesSummary());
}

function pauseForMaintenance() {
  setMaintenanceMode(
    true,
    'Sistema en mantenimiento. Volverá en 1 hora.'
  );
}
```

---

## Migración Futura: De Cliente a Servidor

### Fase Actual (Cliente)
```javascript
// config.js define todo estáticamente
const SYSTEM_CONFIG = { ... };
```

### Fase Futura (Con Admin Panel)
```javascript
// Option 1: Cargar desde API al iniciar
async function loadConfigFromAPI() {
  const response = await fetch('/api/config');
  const config = await response.json();
  Object.assign(SYSTEM_CONFIG, config);
}

// Option 2: Supabase
async function loadConfigFromSupabase() {
  const { data } = await supabaseClient
    .from('system_config')
    .select('*')
    .single();
  Object.assign(SYSTEM_CONFIG, data);
}

// El resto del código sigue siendo igual
```

**Ventaja**: Cambias solo la fuente de datos, no la API pública.

---

## Integración en Otros Módulos

### Módulo de Estudiante

```javascript
// modules/estudiante/progreso.js
import { isRoleEnabled, isActionAllowed } from '../../config.js';

export async function initProgreso(userId) {
  if (!isRoleEnabled('estudiante')) {
    console.log('Rol no disponible');
    return;
  }

  if (isActionAllowed('estudiante', 'viewDashboard')) {
    // Cargar progreso
  }
}
```

### Módulo de Formador

```javascript
// modules/formador/evaluacion.js
import { isRoleEnabled, isActionAllowed } from '../../config.js';

export async function initEvaluacion(userId) {
  if (!isRoleEnabled('formador')) {
    return;
  }

  if (!isActionAllowed('formador', 'evaluateStudents')) {
    showMessage('No tienes permisos para evaluar');
    return;
  }

  // Cargar módulo de evaluación
}
```

---

## Checklist de Implementación

- [x] Crear `config.js` con estructura clara
- [x] Exportar helpers de consulta
- [x] Exportar helpers de administración
- [x] Integrar en `dashboard.js`
- [x] Actualizar `dashboard.html` para módulos ES6
- [x] Documentar API completa
- [x] Proporcionar ejemplos de uso
- [ ] Crear panel de administrador (futuro)
- [ ] Integrar con API/Supabase (futuro)

---

## Preguntas Frecuentes

### ¿Cómo cambio el estado de un rol?

```javascript
import { setRoleState } from './config.js';

setRoleState('aspirante', 'disabled');
```

### ¿Puedo acceder a SYSTEM_CONFIG directamente?

Sí, pero es mejor usar los helpers:

```javascript
// ✅ Recomendado
import { isRoleEnabled } from './config.js';
if (isRoleEnabled('estudiante')) { ... }

// ❌ No recomendado (acceso directo)
import { SYSTEM_CONFIG } from './config.js';
if (SYSTEM_CONFIG.roles.estudiante.enabled) { ... }
```

### ¿Cómo agrego un nuevo rol?

Edita `SYSTEM_CONFIG.roles` en `config.js` y agrega:

```javascript
especialista: {
  enabled: true,
  status: 'active',
  label: 'Especialista',
  // ... resto de propiedades
}
```

### ¿Los cambios en config.js son persistentes?

No. Los cambios en memoria se pierden al recargar. Usa localStorage o una API para persistencia:

```javascript
// Guardar en localStorage
localStorage.setItem('roleStatus', JSON.stringify(SYSTEM_CONFIG.roles));

// O usa Supabase en el futuro
```

---

## Soporte y Contribuciones

Para sugerencias o mejoras, contacta al equipo de desarrollo.

**Última actualización**: 15 de enero de 2026
