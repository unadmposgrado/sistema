# Guía Rápida: config.js

## ¿Qué es config.js?

Una capa de control centralizada que permite **activar, desactivar o pausar roles** sin modificar código lógico ni de autenticación.

**Ubicación**: `js/config.js`

---

## Inicio Rápido

### 1. Consultar Estado de un Rol

```javascript
import { isRoleEnabled } from './config.js';

if (!isRoleEnabled('estudiante')) {
  console.log('Rol deshabilitado');
  return;
}
```

### 2. Obtener Mensaje de Estado

```javascript
import { getRoleStatusMessage } from './config.js';

const msg = getRoleStatusMessage('aspirante');
// "El rol de aspirante está temporalmente deshabilitado."
```

### 3. Verificar Acción Permitida

```javascript
import { isActionAllowed } from './config.js';

if (isActionAllowed('estudiante', 'submitEvidence')) {
  // Permitir envío de evidencias
}
```

### 4. Obtener Todos los Roles Habilitados

```javascript
import { getEnabledRoles } from './config.js';

const roles = getEnabledRoles();
// ['aspirante', 'estudiante', 'formador', 'admin']
```

---

## Funciones Principales

| Función | Retorna | Uso |
|---------|---------|-----|
| `isRoleEnabled(role)` | `boolean` | ¿El rol está habilitado? |
| `isRolePaused(role)` | `boolean` | ¿El rol está pausado? |
| `isActionAllowed(role, action)` | `boolean` | ¿Se permite esta acción? |
| `getRoleStatusMessage(role)` | `string` | Mensaje para mostrar |
| `getEnabledRoles()` | `array` | Todos los roles activos |
| `getVisibleRoles()` | `array` | Roles visibles en nav |
| `isSystemInMaintenance()` | `boolean` | ¿Sistema en mantenimiento? |

---

## Estados de un Rol

```
┌─────────────────────────────────────┐
│ enabled: true                       │
│ status: 'active'                    │
└─────────────────────────────────────┘
         ↓
    Rol completamente disponible
    
┌─────────────────────────────────────┐
│ enabled: true                       │
│ status: 'paused'                    │
└─────────────────────────────────────┘
         ↓
    Rol pausado (mantenimiento temporal)
    Usuario ve mensaje de pausa
    
┌─────────────────────────────────────┐
│ enabled: false                      │
│ status: 'disabled'                  │
└─────────────────────────────────────┘
         ↓
    Rol completamente deshabilitado
    Acceso bloqueado
```

---

## Integración en dashboard.js

Ya está integrado automáticamente:

```javascript
// dashboard.html carga config.js automáticamente
// dashboard.js valida el rol usando config
if (!isRoleEnabled(userRole)) {
  showAlert(getRoleStatusMessage(userRole));
  return;
}
```

---

## Cambiar Estado de un Rol (Admin)

```javascript
import { enableRole, disableRole, pauseRole } from './config.js';

// Deshabilitar
disableRole('aspirante');

// Habilitar
enableRole('aspirante');

// Pausar temporalmente
pauseRole('estudiante');
```

---

## Activar Mantenimiento del Sistema

```javascript
import { setMaintenanceMode } from './config.js';

// Activar
setMaintenanceMode(true, 'Actualizaciones en progreso...');

// Desactivar
setMaintenanceMode(false);
```

---

## Estructura del archivo

```javascript
SYSTEM_CONFIG
  ├── system
  │   ├── maintenance: boolean
  │   └── maintenanceMessage: string
  └── roles
      ├── aspirante
      ├── estudiante
      ├── formador
      └── admin
          ├── enabled: boolean
          ├── status: 'active' | 'disabled' | 'paused'
          ├── label: string
          ├── allowedActions: { ... }
          └── messages: { ... }
```

---

## Ejemplos Frecuentes

### Bloquear Acceso en Módulo

```javascript
// modules/estudiante/evidencias.js
import { isRoleEnabled } from '../../config.js';

export async function init() {
  if (!isRoleEnabled('estudiante')) return false;
  // ... cargar módulo
}
```

### Mostrar Menú Condicional

```javascript
import { getVisibleRoles } from './config.js';

function renderRoleMenu() {
  return getVisibleRoles()
    .map(r => `<li>${r.label}</li>`)
    .join('');
}
```

### Proteger Acción

```javascript
import { isActionAllowed } from './config.js';

function handleSubmit() {
  if (!isActionAllowed('estudiante', 'submitEvidence')) {
    alert('Acción no permitida');
    return;
  }
  // ... proceder
}
```

---

## Documentación Completa

Para más detalles, ver: [docs/CONFIG.md](CONFIG.md)

Para ejemplos avanzados, ver: [docs/CONFIG_EXAMPLES.js](CONFIG_EXAMPLES.js)

---

## Checklist de Integración

- ✅ `config.js` creado en `js/`
- ✅ Integrado en `dashboard.js`
- ✅ `dashboard.html` usa módulos ES6
- ✅ Documentación completa disponible
- ⭕ *Próximo paso*: Usar en módulos de roles específicos

---

## Soporte

Para preguntas o sugerencias, consulta la documentación completa en `docs/CONFIG.md`

**Última actualización**: 15 de enero de 2026
