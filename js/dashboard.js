/**
 * dashboard.js
 *
 * Orquestador central del dashboard.
 * Responsabilidades:
 * - Validar sesión del usuario
 * - Detectar rol desde Supabase (perfiles.rol)
 * - Validar estado del rol en config.js
 * - Cargar dinámicamente el layout correspondiente desde /layouts/
 * - Inicializar módulos JavaScript específicos del rol
 * - Manejar cierre de sesión
 *
 * Roles soportados: 'monitor', 'estudiante', 'formador', 'admin'
 */

// Importar configuración centralizada
import {
  isRoleEnabled,
  isSystemInMaintenance,
  getRoleStatusMessage,
  getMaintenanceMessage,
} from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('🚀 Dashboard.js inicializando...');

    // ============================================================
    // 1. VALIDAR SESIÓN
    // ============================================================
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session?.user) {
      console.warn('❌ No hay sesión activa. Redirigiendo a login.');
      window.location.href = 'login.html';
      return;
    }

    const userId = session.user.id;
    console.log('✅ Sesión validada:', userId);

    // ============================================================
    // 2. OBTENER PERFIL DEL USUARIO
    // ============================================================
    const { data: perfil, error: perfilError } = await window.supabaseClient
      .from('perfiles')
      .select('id, rol, onboarding_completo') // <--- CORRECCIÓN: incluir id
      .eq('id', userId)
      .single();

    if (perfilError && perfilError.code !== 'PGRST116') {
      console.error('❌ Error obteniendo perfil:', perfilError);
      alert('No se pudo acceder a los datos del usuario.');
      window.location.href = 'login.html';
      return;
    }

    const userRole = perfil?.rol || 'monitor';
    const onboardingCompleto = perfil?.onboarding_completo || false;
    console.log('🎭 Rol del usuario:', userRole);
    console.log('✅ Onboarding completado:', onboardingCompleto);

    // ============================================================
    // 2.5. VALIDAR ESTADO DEL SISTEMA Y ROL (config.js)
    // ============================================================
    if (isSystemInMaintenance()) {
      const layoutContainer = document.getElementById('layout-container');
      if (layoutContainer) {
        layoutContainer.innerHTML = `
          <div style="padding: 2rem; text-align: center; background: #fff3cd; border-radius: 8px; margin: 2rem;">
            <h2>🔧 Mantenimiento del Sistema</h2>
            <p style="font-size: 1.1rem; color: #856404;">${getMaintenanceMessage()}</p>
            <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">Por favor, intenta nuevamente en unos momentos.</p>
          </div>
        `;
      }
      return;
    }

    if (!isRoleEnabled(userRole)) {
      const layoutContainer = document.getElementById('layout-container');
      if (layoutContainer) {
        const statusMessage = getRoleStatusMessage(userRole);
        layoutContainer.innerHTML = `
          <div style="padding: 2rem; text-align: center; background: #f8d7da; border-radius: 8px; margin: 2rem;">
            <h2>⚠️ Rol No Disponible</h2>
            <p style="font-size: 1.1rem; color: #721c24;">${statusMessage}</p>
            <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">Contacta con el administrador del sistema.</p>
          </div>
        `;
      }
      console.warn(`⛔ Rol ${userRole} deshabilitado. Acceso denegado.`);
      return;
    }

    console.log(`✅ Rol ${userRole} validado y habilitado`);

    // ============================================================
    // 2.6. ONBOARDING
    // ============================================================
    if (userRole !== 'admin' && !onboardingCompleto) {
      console.log('📝 Onboarding pendiente. Mostrando formulario...');
      
      const layoutContainer = document.getElementById('layout-container');
      if (layoutContainer) {
        layoutContainer.innerHTML = '<div class="loading">Cargando formulario de completar perfil...</div>';
      }

      try {
        const { startOnboarding } = await import('../modules/onboarding/index.js');
        await startOnboarding({ user: session.user, perfil });
      } catch (err) {
        console.error('❌ Error cargando onboarding:', err);
        alert('Error al cargar el formulario de completar perfil.');
        window.location.href = 'login.html';
      }
      return; // bloquear flujo mientras se completa onboarding
    }

    console.log(`✅ Onboarding verificado. Continuando con dashboard normal...`);

    // ============================================================
    // 3. CARGAR LAYOUT DINÁMICAMENTE
    // ============================================================
    const layoutPath = `layouts/${userRole}.html`;
    console.log(`📂 Cargando layout: ${layoutPath}`);

    const layoutContainer = document.getElementById('layout-container');
    if (!layoutContainer) {
      console.error('❌ No se encontró #layout-container');
      return;
    }

    try {
      const layoutResponse = await fetch(layoutPath);
      if (!layoutResponse.ok) {
        throw new Error(`HTTP ${layoutResponse.status}: ${layoutPath} no encontrado`);
      }
      const layoutHTML = await layoutResponse.text();
      layoutContainer.innerHTML = layoutHTML;
      console.log('✅ Layout cargado:', layoutPath);
    } catch (err) {
      console.error('❌ Error cargando layout:', err);
      layoutContainer.innerHTML = `
        <div style="padding: 2rem; text-align: center;">
          <h2>⚠️ Error cargando interfaz</h2>
          <p>${err.message}</p>
        </div>
      `;
      return;
    }

    // ============================================================
    // 4. CARGAR CSS DEL ROL
    // ============================================================
    const roleCssPath = `css/${userRole}.css`;
    const roleCssLink = document.getElementById('role-css');
    if (roleCssLink) {
      roleCssLink.href = roleCssPath;
      console.log('✅ CSS específico cargado:', roleCssPath);
    }

    // ============================================================
    // 5. ESPERAR NAV
    // ============================================================
    const navPlaceholder = document.getElementById('nav-placeholder');
    const waitForNav = () =>
      new Promise(resolve => {
        const checkNav = () => {
          if (navPlaceholder && navPlaceholder.innerHTML.trim() !== '') {
            resolve();
          } else {
            setTimeout(checkNav, 100);
          }
        };
        checkNav();
      });

    await waitForNav();
    console.log('✅ Navegación cargada');

    // ============================================================
    // 6. LOGOUT
    // ============================================================
    const logoutBtn = navPlaceholder.querySelector('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await window.supabaseClient.auth.signOut();
          localStorage.removeItem('user');
          window.location.href = 'index.html';
        } catch (err) {
          console.error('❌ Error en logout:', err);
          alert('Error al cerrar sesión. Intenta nuevamente.');
        }
      });
    }

    // ============================================================
    // 7. INICIALIZAR MÓDULOS POR ROL
    // ============================================================
    console.log(`📦 Inicializando módulos para rol: ${userRole}`);

    switch (userRole) {
      case 'monitor':
        await initMonitorModules(userId);
        break;
      case 'estudiante':
        await initEstudianteModules(userId);
        break;
      case 'formador':
        await initFormadorModules(userId);
        break;
      case 'admin':
        await initAdminModules(userId);
        break;
      default:
        console.warn(`⚠️ Rol desconocido: ${userRole}. No se cargan módulos.`);
    }

    console.log('✅ Dashboard completamente inicializado');

  } catch (err) {
    console.error('❌ Error fatal en dashboard:', err);
    window.location.href = 'login.html';
  }
});

// ============================================================
// INICIALIZADORES DE MÓDULOS POR ROL
// (sin cambios respecto a tu versión original)
// ============================================================

async function initMonitorModules(userId) {
  console.log('📦 Cargando módulos de MONITOR...');
  const documentsModule = document.createElement('script');
  documentsModule.src = 'modules/monitor/documentos.js';
  document.body.appendChild(documentsModule);

  const trackingModule = document.createElement('script');
  trackingModule.src = 'modules/monitor/seguimiento.js';
  document.body.appendChild(trackingModule);

  console.log('✅ Módulos de MONITOR cargados');
}

async function initEstudianteModules(userId) {
  console.log('📦 Cargando módulos de ESTUDIANTE...');
  
  // Cargar datos del estudiante
  const datosModule = document.createElement('script');
  datosModule.src = 'modules/estudiante/datos.js';
  datosModule.onload = () => {
    if (window.cargarDatosEstudiante) {
      window.cargarDatosEstudiante(userId);
    }
  };
  document.body.appendChild(datosModule);

  const progressModule = document.createElement('script');
  progressModule.src = 'modules/estudiante/progreso.js';
  document.body.appendChild(progressModule);

  const evidenciasModule = document.createElement('script');
  evidenciasModule.src = 'modules/estudiante/evidencias.js';
  document.body.appendChild(evidenciasModule);

  const feedbackModule = document.createElement('script');
  feedbackModule.src = 'modules/estudiante/retroalimentacion.js';
  document.body.appendChild(feedbackModule);

  console.log('✅ Módulos de ESTUDIANTE cargados');
}

async function initFormadorModules(userId) {
  console.log('📦 Cargando módulos de FORMADOR...');
  const gruposModule = document.createElement('script');
  gruposModule.src = 'modules/formador/grupos.js';
  document.body.appendChild(gruposModule);

  const evaluacionModule = document.createElement('script');
  evaluacionModule.src = 'modules/formador/evaluacion.js';
  document.body.appendChild(evaluacionModule);

  const reportesModule = document.createElement('script');
  reportesModule.src = 'modules/formador/reportes.js';
  document.body.appendChild(reportesModule);

  console.log('✅ Módulos de FORMADOR cargados');
}

async function initAdminModules(userId) {
  console.log('📦 Cargando módulos de ADMIN...');
  const usuariosModule = document.createElement('script');
  usuariosModule.src = 'modules/admin/usuarios.js';
  document.body.appendChild(usuariosModule);

  const contenidoModule = document.createElement('script');
  contenidoModule.src = 'modules/admin/contenido.js';
  document.body.appendChild(contenidoModule);

  const metricasModule = document.createElement('script');
  metricasModule.src = 'modules/admin/metricas.js';
  document.body.appendChild(metricasModule);

  console.log('✅ Módulos de ADMIN cargados');
}
