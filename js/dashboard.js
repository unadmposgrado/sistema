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
 * Roles soportados: 'aspirante', 'estudiante', 'formador', 'admin'
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
    // 2. OBTENER ROL DEL USUARIO
    // ============================================================
    const { data: perfil, error: perfilError } = await window.supabaseClient
      .from('perfiles')
      .select('rol, onboarding_completo')
      .eq('id', userId)
      .single();

    // Permitir que el onboarding maneje perfiles inexistentes
    // (los creará automáticamente)
    if (perfilError && perfilError.code !== 'PGRST116') {
      // Error distinto a "no rows found"
      console.error('❌ Error obteniendo perfil:', perfilError);
      alert('No se pudo acceder a los datos del usuario.');
      window.location.href = 'login.html';
      return;
    }

    const userRole = perfil?.rol || 'aspirante';
    const onboardingCompleto = perfil?.onboarding_completo || false;
    console.log('🎭 Rol del usuario:', userRole);
    console.log('✅ Onboarding completado:', onboardingCompleto);

    // ============================================================
    // 2.5. VALIDAR ESTADO DEL SISTEMA Y ROL (config.js)
    // ============================================================
    // Verificar si el sistema está en mantenimiento
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

    // Verificar si el rol está habilitado
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
    // 2.6. VERIFICAR ONBOARDING (si no es admin)
    // ============================================================
    if (userRole !== 'admin' && !onboardingCompleto) {
      console.log('📝 Onboarding pendiente. Mostrando formulario...');
      
      const layoutContainer = document.getElementById('layout-container');
      if (layoutContainer) {
        layoutContainer.innerHTML = '<div class="loading">Cargando formulario de completar perfil...</div>';
      }

      // Cargar módulo de onboarding con import dinámico
      try {
        const { startOnboarding } = await import('../modules/onboarding/index.js');
        await startOnboarding({ user: session.user, perfil });
      } catch (err) {
        console.error('❌ Error cargando onboarding:', err);
        alert('Error al cargar el formulario de completar perfil.');
        window.location.href = 'login.html';
      }
      return; // Detener aquí, el onboarding es bloqueante
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
    // 4. CARGAR CSS ESPECÍFICO DEL ROL
    // ============================================================
    const roleCssPath = `css/${userRole}.css`;
    const roleCssLink = document.getElementById('role-css');
    if (roleCssLink) {
      roleCssLink.href = roleCssPath;
      console.log('✅ CSS específico cargado:', roleCssPath);
    }

    // ============================================================
    // 5. ESPERAR A QUE NAV SE CARGUE (nav.js se ejecuta en paralelo)
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
    // 6. CONFIGURAR LOGOUT (busca en nav dinámico)
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
    // 7. INICIALIZAR MÓDULOS DEL ROL
    // ============================================================
    console.log(`📦 Inicializando módulos para rol: ${userRole}`);

    switch (userRole) {
      case 'aspirante':
        await initAspiranteModules(userId);
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
// ============================================================

/**
 * Inicializa módulos del rol 'aspirante'
 * Módulos: documentos, seguimiento
 */
async function initAspiranteModules(userId) {
  console.log('📦 Cargando módulos de ASPIRANTE...');

  // Importar y ejecutar módulo de documentos
  const documentsModule = document.createElement('script');
  documentsModule.src = 'modules/aspirante/documentos.js';
  document.body.appendChild(documentsModule);

  // Importar y ejecutar módulo de seguimiento
  const trackingModule = document.createElement('script');
  trackingModule.src = 'modules/aspirante/seguimiento.js';
  document.body.appendChild(trackingModule);

  console.log('✅ Módulos de ASPIRANTE cargados');
}

/**
 * Inicializa módulos del rol 'estudiante'
 * Módulos: progreso, evidencias, retroalimentación
 */
async function initEstudianteModules(userId) {
  console.log('📦 Cargando módulos de ESTUDIANTE...');

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

/**
 * Inicializa módulos del rol 'formador'
 * Módulos: grupos, evaluación, reportes
 */
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

/**
 * Inicializa módulos del rol 'admin'
 * Módulos: usuarios, contenido, métricas
 */
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
