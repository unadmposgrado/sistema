/**
 * EJEMPLO: Integración de config.js en Módulos
 * 
 * Este archivo muestra patrones recomendados para usar config.js
 * en los módulos específicos de cada rol.
 * 
 * Ubicación sugerida: docs/CONFIG_EXAMPLES.js (solo referencia)
 */

// ============================================================
// EJEMPLO 1: Validar rol al cargar módulo
// ============================================================

// modules/estudiante/progreso.js
import { isRoleEnabled, getRoleStatusMessage } from '../../config.js';

export async function initEstudianteProgreso(userId) {
  // Validar que el rol esté habilitado
  if (!isRoleEnabled('estudiante')) {
    console.warn('⛔ Rol estudiante deshabilitado');
    const message = getRoleStatusMessage('estudiante');
    // Mostrar alerta o redirigir
    return false;
  }

  console.log('✅ Rol estudiante habilitado. Cargando módulo de progreso...');
  // Continuar con la lógica normal
  return true;
}

// ============================================================
// EJEMPLO 2: Bloquear acciones específicas
// ============================================================

// modules/estudiante/evidencias.js
import { isActionAllowed } from '../../config.js';

export async function handleEvidenceUpload(file) {
  // Verificar si se permite enviar evidencias
  if (!isActionAllowed('estudiante', 'submitEvidence')) {
    alert('No puedes enviar evidencias en este momento.');
    return;
  }

  // Proceder con upload
  console.log('Enviando evidencia...');
  // ... lógica de upload
}

export async function handleFeedbackView() {
  if (!isActionAllowed('estudiante', 'viewFeedback')) {
    alert('La retroalimentación no está disponible aún.');
    return;
  }

  console.log('Mostrando retroalimentación...');
  // ... lógica de visualización
}

// ============================================================
// EJEMPLO 3: Módulo de Formador con validación
// ============================================================

// modules/formador/evaluacion.js
import {
  isRoleEnabled,
  isActionAllowed,
  getRoleStatusMessage,
} from '../../config.js';

export async function initFormadorEvaluacion(userId) {
  // 1. Verificar que el rol esté habilitado
  if (!isRoleEnabled('formador')) {
    console.warn('⛔ Rol formador no disponible');
    return false;
  }

  // 2. Verificar permisos específicos
  if (!isActionAllowed('formador', 'evaluateStudents')) {
    alert('No tienes permisos para evaluar estudiantes.');
    return false;
  }

  console.log('✅ Cargando módulo de evaluación');
  return true;
}

export function handleEvaluationSubmit(data) {
  if (!isActionAllowed('formador', 'evaluateStudents')) {
    alert('No puedes enviar evaluaciones en este momento.');
    return;
  }

  console.log('Registrando evaluación...');
  // ... lógica de envío
}

// ============================================================
// EJEMPLO 4: Módulo de Admin con control total
// ============================================================

// modules/admin/usuarios.js
import {
  getRolesSummary,
  disableRole,
  enableRole,
  pauseRole,
  isRoleEnabled,
} from '../../config.js';

export function loadUserManagement() {
  const summary = getRolesSummary();

  console.log('=== RESUMEN DE ROLES ===');
  Object.entries(summary).forEach(([role, status]) => {
    const indicator = status.enabled ? '✅' : '❌';
    console.log(`${indicator} ${status.label}: ${status.status}`);
  });
}

export function handleRoleToggle(roleName) {
  if (isRoleEnabled(roleName)) {
    console.log(`Deshabilitando ${roleName}...`);
    disableRole(roleName);
  } else {
    console.log(`Habilitando ${roleName}...`);
    enableRole(roleName);
  }

  // Actualizar UI
  refreshRoleStatus();
}

export function handleRolePause(roleName) {
  console.log(`Pausando ${roleName}...`);
  pauseRole(roleName);
  refreshRoleStatus();
}

// ============================================================
// EJEMPLO 5: Integración en dashboard.js
// ============================================================

/*
// Parte del archivo js/dashboard.js

import {
  isRoleEnabled,
  isSystemInMaintenance,
  getRoleStatusMessage,
  getMaintenanceMessage,
} from './config.js';

async function initDashboard() {
  const userRole = perfil.role;

  // Verificar mantenimiento
  if (isSystemInMaintenance()) {
    showMaintenancePage(getMaintenanceMessage());
    return;
  }

  // Verificar rol
  if (!isRoleEnabled(userRole)) {
    showRoleDisabledPage(getRoleStatusMessage(userRole));
    return;
  }

  // Continuar con carga normal
  loadLayoutForRole(userRole);
}
*/

// ============================================================
// EJEMPLO 6: Sistema de notificaciones por estado de rol
// ============================================================

// utils/roleNotifications.js
import {
  isRolePaused,
  getRoleStatusMessage,
  getEnabledRoles,
} from '../config.js';

export function showRoleNotification(roleName) {
  if (isRolePaused(roleName)) {
    const message = getRoleStatusMessage(roleName);
    console.warn(`⏸️  ${message}`);
    // Mostrar banner en UI
    return true;
  }
  return false;
}

export function getAvailableRolesForUser(userRoles) {
  const enabledRoles = getEnabledRoles();
  return userRoles.filter(role => enabledRoles.includes(role));
}

// ============================================================
// EJEMPLO 7: Gestión de características (features)
// ============================================================

// modules/admin/reportes.js
import { isFeatureEnabled } from '../../config.js';

export function renderReportingPanel() {
  const hasAdvancedReporting = isFeatureEnabled('advancedReporting');

  const features = {
    basicReports: true, // Siempre disponible
    advancedReports: hasAdvancedReporting,
    analytics: isFeatureEnabled('userAnalytics'),
    apiAccess: isFeatureEnabled('apiIntegration'),
  };

  console.log('Características disponibles:', features);

  // Renderizar UI según features
  if (features.advancedReports) {
    // Mostrar opciones avanzadas
  }
}

// ============================================================
// EJEMPLO 8: Patrón de Factory para inicializar módulos
// ============================================================

// modules/moduleInitializer.js
import { isRoleEnabled, ROLES } from '../config.js';

const MODULE_LOADERS = {
  aspirante: () => import('./aspirante/documentos.js'),
  estudiante: () => import('./estudiante/progreso.js'),
  formador: () => import('./formador/evaluacion.js'),
  admin: () => import('./admin/metricas.js'),
};

export async function initRoleModule(userRole, userId) {
  // Verificar que el rol esté habilitado
  if (!isRoleEnabled(userRole)) {
    console.warn(`Role ${userRole} is disabled. Module not loaded.`);
    return null;
  }

  // Verificar que hay un loader para este rol
  if (!MODULE_LOADERS[userRole]) {
    console.warn(`No module loader for role: ${userRole}`);
    return null;
  }

  try {
    // Cargar módulo dinámicamente
    const module = await MODULE_LOADERS[userRole]();
    const initFunction = module[`init${capitalize(userRole)}`];

    if (typeof initFunction === 'function') {
      await initFunction(userId);
      console.log(`✅ Módulo ${userRole} inicializado`);
      return module;
    }
  } catch (error) {
    console.error(`Error initializing ${userRole} module:`, error);
  }

  return null;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Uso:
// await initRoleModule('estudiante', userId);

// ============================================================
// EJEMPLO 9: Patrón de Guard para rutas (futuro con router)
// ============================================================

/*
// utils/roleGuard.js
import { isRoleEnabled, isActionAllowed } from '../config.js';

export function createRoleGuard(roleName, action = null) {
  return (next) => {
    if (!isRoleEnabled(roleName)) {
      // Redirigir a página de rol deshabilitado
      window.location.href = '/role-disabled.html';
      return false;
    }

    if (action && !isActionAllowed(roleName, action)) {
      // Redirigir a página sin permisos
      window.location.href = '/access-denied.html';
      return false;
    }

    next();
    return true;
  };
}

// Uso con futuro router:
// router.beforeEach(createRoleGuard('estudiante', 'submitEvidence'));
*/

// ============================================================
// EJEMPLO 10: Logging y debugging
// ============================================================

// utils/configDebug.js
import { getRolesSummary, getFullConfig, ROLES } from '../config.js';

export function logConfigStatus() {
  console.group('🔧 CONFIG STATUS');
  console.log('Roles Summary:', getRolesSummary());
  console.log('Available Roles:', ROLES);
  console.log('Full Config:', getFullConfig());
  console.groupEnd();
}

export function validateConfig() {
  const config = getFullConfig();
  const errors = [];

  ROLES.forEach(role => {
    const roleConfig = config.roles[role];
    if (!roleConfig) {
      errors.push(`Missing config for role: ${role}`);
    }
  });

  if (errors.length > 0) {
    console.error('❌ Config validation errors:', errors);
    return false;
  }

  console.log('✅ Config validation passed');
  return true;
}

// ============================================================
// PATRONES DE USO RECOMENDADOS
// ============================================================

/*
✅ RECOMENDADO: Usar helpers
import { isRoleEnabled } from './config.js';
if (isRoleEnabled('estudiante')) { ... }

✅ RECOMENDADO: Destructuring
import { isRoleEnabled, isActionAllowed } from './config.js';

✅ RECOMENDADO: Validar al inicio del módulo
export async function init(userId) {
  if (!isRoleEnabled('myRole')) return false;
  // ...
}

❌ NO RECOMENDADO: Acceso directo a SYSTEM_CONFIG
import { SYSTEM_CONFIG } from './config.js';
if (SYSTEM_CONFIG.roles.estudiante.enabled) { ... }

❌ NO RECOMENDADO: Duplicar validación
// Hacer esto en un solo lugar (dashboard.js)
if (!isRoleEnabled(role)) { ... }
// No repetir en cada módulo
*/

export default {
  // Para referencia
  patterns: {
    roleValidation: 'import { isRoleEnabled }',
    actionCheck: 'import { isActionAllowed }',
    statusMessage: 'import { getRoleStatusMessage }',
  },
};
