/**
 * js/config.js
 *
 * Capa de control centralizada del sistema.
 * 
 * Responsabilidades:
 * - Definir estado de roles (habilitado/deshabilitado)
 * - Proporcionador de helpers para consultar configuración
 * - Servir como base para futuras integraciones del sistema
 * - NO contiene lógica de autenticación
 * - NO contiene lógica de autenticación
 * 
 * Uso:
 *   import { isRoleEnabled, getRoleConfig, ROLES } from './config.js';
 *   
 *   if (!isRoleEnabled('estudiante')) {
 *     console.log('Rol deshabilitado');
 *     return;
 *   }
 */

// ============================================================
// CONFIGURACIÓN GLOBAL DEL SISTEMA
// ============================================================

/**
 * Estados de roles del sistema
 * Estructura extensible para futuras migraciones de datos
 */
const SYSTEM_CONFIG = {
  // Estado global del sistema
  system: {
    maintenance: false,
    maintenanceMessage: 'El sistema está en mantenimiento. Intenta más tarde.',
  },

  // Configuración por rol
  roles: {
    monitor: {
      enabled: true,
      status: 'active', // 'active', 'disabled', 'paused'
      label: 'Monitor',
      description: 'Usuarios en proceso de candidatura',
      visibleInNav: true,
      allowedActions: {
        login: true,
        viewDashboard: true,
        uploadDocuments: true,
      },
      messages: {
        disabled: 'El rol de monitor está temporalmente deshabilitado.',
        paused: 'El rol de monitor está pausado por mantenimiento.',
      },
    },

    estudiante: {
      enabled: true,
      status: 'active',
      label: 'Estudiante',
      description: 'Usuarios matriculados en programas',
      visibleInNav: true,
      allowedActions: {
        login: true,
        viewDashboard: true,
        submitEvidence: true,
        viewFeedback: true,
      },
      messages: {
        disabled: 'El rol de estudiante está temporalmente deshabilitado.',
        paused: 'El rol de estudiante está pausado por mantenimiento.',
      },
    },

    facilitador: {
      enabled: true,
      status: 'active',
      label: 'Facilitador',
      description: 'Docentes y tutores',
      visibleInNav: true,
      allowedActions: {
        login: true,
        viewDashboard: true,
        evaluateStudents: true,
        createGroups: true,
        generateReports: true,
      },
      messages: {
        disabled: 'El rol de facilitador está temporalmente deshabilitado.',
        paused: 'El rol de facilitador está pausado por mantenimiento.',
      },
    },

    admin: {
      enabled: true,
      status: 'active',
      label: 'Administrador',
      description: 'Administradores del sistema',
      visibleInNav: true,
      allowedActions: {
        login: true,
        viewDashboard: true,
        manageUsers: true,
        viewMetrics: true,
        modifyConfig: true,
      },
      messages: {
        disabled: 'El rol de administrador está temporalmente deshabilitado.',
        paused: 'El rol de administrador está pausado por mantenimiento.',
      },
    },
  },

  // Módulos y características (para futuras expansiones)
  features: {
    advancedReporting: { enabled: true },
    userAnalytics: { enabled: true },
    apiIntegration: { enabled: false },
  },
};

// ============================================================
// CONSTANTES
// ============================================================

/**
 * Lista de roles válidos del sistema
 */
export const ROLES = Object.freeze(['monitor', 'estudiante', 'facilitador', 'admin']);

/**
 * Estados válidos de un rol
 */
export const ROLE_STATES = Object.freeze({
  ACTIVE: 'active',
  DISABLED: 'disabled',
  PAUSED: 'paused',
});

// ============================================================
// HELPERS: CONSULTAR CONFIGURACIÓN
// ============================================================

/**
 * Obtiene la configuración completa de un rol
 * @param {string} roleName - Nombre del rol ('monitor', 'estudiante', etc.)
 * @returns {Object} Configuración del rol o null si no existe
 */
export function getRoleConfig(roleName) {
  if (!SYSTEM_CONFIG.roles[roleName]) {
    console.warn(`⚠️ Rol desconocido: ${roleName}`);
    return null;
  }
  return SYSTEM_CONFIG.roles[roleName];
}

/**
 * Verifica si un rol está habilitado
 * @param {string} roleName - Nombre del rol
 * @returns {boolean} true si el rol está habilitado
 */
export function isRoleEnabled(roleName) {
  const config = getRoleConfig(roleName);
  return config ? config.enabled && config.status === ROLE_STATES.ACTIVE : false;
}

/**
 * Verifica si un rol está pausado
 * @param {string} roleName - Nombre del rol
 * @returns {boolean} true si el rol está pausado
 */
export function isRolePaused(roleName) {
  const config = getRoleConfig(roleName);
  return config ? config.status === ROLE_STATES.PAUSED : false;
}

/**
 * Obtiene el mensaje apropiado para un rol deshabilitado
 * @param {string} roleName - Nombre del rol
 * @returns {string} Mensaje de estado
 */
export function getRoleStatusMessage(roleName) {
  const config = getRoleConfig(roleName);
  if (!config) return 'Rol desconocido.';

  if (config.status === ROLE_STATES.DISABLED) {
    return config.messages.disabled;
  }
  if (config.status === ROLE_STATES.PAUSED) {
    return config.messages.paused;
  }
  return '';
}

/**
 * Verifica si una acción está permitida para un rol
 * @param {string} roleName - Nombre del rol
 * @param {string} action - Nombre de la acción (ej: 'viewDashboard')
 * @returns {boolean} true si la acción está permitida
 */
export function isActionAllowed(roleName, action) {
  const config = getRoleConfig(roleName);
  if (!config || !isRoleEnabled(roleName)) return false;

  return config.allowedActions?.[action] ?? true;
}

/**
 * Obtiene todos los roles habilitados
 * @returns {Array<string>} Lista de roles activos
 */
export function getEnabledRoles() {
  return ROLES.filter(role => isRoleEnabled(role));
}

/**
 * Obtiene todos los roles visibles en la navegación
 * @returns {Array<Object>} Lista de roles con su configuración
 */
export function getVisibleRoles() {
  return ROLES
    .filter(role => {
      const config = getRoleConfig(role);
      return config?.visibleInNav;
    })
    .map(role => ({
      name: role,
      label: getRoleConfig(role).label,
      enabled: isRoleEnabled(role),
    }));
}

// ============================================================
// HELPERS: VALIDAR ESTADO DEL SISTEMA
// ============================================================

/**
 * Verifica si el sistema está en mantenimiento
 * @returns {boolean} true si está en mantenimiento
 */
export function isSystemInMaintenance() {
  return SYSTEM_CONFIG.system.maintenance;
}

/**
 * Obtiene el mensaje de mantenimiento
 * @returns {string} Mensaje del sistema
 */
export function getMaintenanceMessage() {
  return SYSTEM_CONFIG.system.maintenanceMessage;
}

/**
 * Verifica si una característica está habilitada
 * @param {string} featureName - Nombre de la característica
 * @returns {boolean} true si está habilitada
 */
export function isFeatureEnabled(featureName) {
  return SYSTEM_CONFIG.features?.[featureName]?.enabled ?? false;
}

// ============================================================
// HELPERS: MODIFICAR CONFIGURACIÓN (Admin)
// ============================================================

/**
 * Cambia el estado de un rol (uso interno/admin)
 * NOTA: La simulación actual almacena los datos en el navegador
 * 
 * @param {string} roleName - Nombre del rol
 * @param {string} newState - Nuevo estado ('active', 'disabled', 'paused')
 * @returns {boolean} true si la operación fue exitosa
 */
export function setRoleState(roleName, newState) {
  if (!SYSTEM_CONFIG.roles[roleName]) {
    console.warn(`⚠️ Rol desconocido: ${roleName}`);
    return false;
  }

  if (!Object.values(ROLE_STATES).includes(newState)) {
    console.warn(`⚠️ Estado inválido: ${newState}`);
    return false;
  }

  SYSTEM_CONFIG.roles[roleName].status = newState;
  console.log(`✅ Rol ${roleName} cambiado a: ${newState}`);
  return true;
}

/**
 * Habilita un rol completamente
 * @param {string} roleName - Nombre del rol
 */
export function enableRole(roleName) {
  if (SYSTEM_CONFIG.roles[roleName]) {
    SYSTEM_CONFIG.roles[roleName].enabled = true;
    SYSTEM_CONFIG.roles[roleName].status = ROLE_STATES.ACTIVE;
    console.log(`✅ Rol ${roleName} habilitado`);
  }
}

/**
 * Deshabilita un rol completamente
 * @param {string} roleName - Nombre del rol
 */
export function disableRole(roleName) {
  if (SYSTEM_CONFIG.roles[roleName]) {
    SYSTEM_CONFIG.roles[roleName].enabled = false;
    SYSTEM_CONFIG.roles[roleName].status = ROLE_STATES.DISABLED;
    console.log(`✅ Rol ${roleName} deshabilitado`);
  }
}

/**
 * Pausa un rol temporalmente
 * @param {string} roleName - Nombre del rol
 */
export function pauseRole(roleName) {
  if (SYSTEM_CONFIG.roles[roleName]) {
    SYSTEM_CONFIG.roles[roleName].status = ROLE_STATES.PAUSED;
    console.log(`⏸️  Rol ${roleName} pausado`);
  }
}

/**
 * Activa el modo mantenimiento del sistema
 * @param {boolean} maintenance - true para activar, false para desactivar
 * @param {string} message - Mensaje personalizado (opcional)
 */
export function setMaintenanceMode(maintenance, message = null) {
  SYSTEM_CONFIG.system.maintenance = maintenance;
  if (message) {
    SYSTEM_CONFIG.system.maintenanceMessage = message;
  }
  console.log(
    maintenance
      ? `🔧 Mantenimiento ACTIVADO`
      : `✅ Mantenimiento DESACTIVADO`
  );
}

// ============================================================
// HELPERS: OBTENER TODA LA CONFIGURACIÓN
// ============================================================

/**
 * Obtiene la configuración completa del sistema
 * (Útil para paneles de administración)
 * @returns {Object} Configuración completa
 */
export function getFullConfig() {
  return JSON.parse(JSON.stringify(SYSTEM_CONFIG));
}

/**
 * Obtiene un resumen del estado de todos los roles
 * @returns {Object} Resumen de estados
 */
export function getRolesSummary() {
  const summary = {};
  ROLES.forEach(role => {
    const config = getRoleConfig(role);
    summary[role] = {
      label: config.label,
      enabled: config.enabled,
      status: config.status,
      visibleInNav: config.visibleInNav,
    };
  });
  return summary;
}

// ============================================================
// EXPORTAR CONFIGURACIÓN COMPLETA PARA ADMIN
// ============================================================

export { SYSTEM_CONFIG };

/**
 * Ejemplo de uso en otros archivos:
 *
 * ❌ ANTES (sin config):
 * ═════════════════════════════════════════
 *   const userRole = 'estudiante';
 *   if (userRole === 'estudiante') {
 *     // cargar layout
 *   }
 *
 * ✅ DESPUÉS (con config):
 * ═════════════════════════════════════════
 *   import { isRoleEnabled, getRoleStatusMessage } from './config.js';
 *
 *   const userRole = 'estudiante';
 *
 *   if (!isRoleEnabled(userRole)) {
 *     showAlert(getRoleStatusMessage(userRole));
 *     return;
 *   }
 *
 *   // cargar layout
 */
