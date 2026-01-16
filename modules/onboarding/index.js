/**
 * modules/onboarding/index.js
 *
 * Orquestador del flujo de onboarding por rol
 * Responsabilidades:
 * - Recibir datos del usuario
 * - Detectar rol
 * - Cargar dinámicamente el módulo de onboarding correspondiente
 * - Renderizar formulario específico del rol
 */

/**
 * Inicia el flujo de onboarding
 * @param {Object} options - { user: AuthUser, perfil: PerfilDB }
 */
export async function startOnboarding({ user, perfil }) {
  try {
    console.log('🎯 startOnboarding iniciado para rol:', perfil.rol);

    // Validar que Supabase esté disponible
    if (!window.supabaseClient) {
      console.error('❌ Supabase no disponible en window.supabaseClient');
      const layoutContainer = document.getElementById('layout-container');
      if (layoutContainer) {
        layoutContainer.innerHTML = '<p style="color: red;">Error: No se pudo conectar a la base de datos.</p>';
      }
      return;
    }

    const userRole = perfil.rol || 'aspirante';
    const layoutContainer = document.getElementById('layout-container');

    if (!layoutContainer) {
      console.error('❌ #layout-container no encontrado');
      return;
    }

    // Cargar el módulo de onboarding específico del rol
    let onboardingModule;

    switch (userRole) {
      case 'aspirante':
        onboardingModule = await import('./onboarding-aspirante.js');
        break;
      case 'estudiante':
        onboardingModule = await import('./onboarding-estudiante.js');
        break;
      case 'formador':
        onboardingModule = await import('./onboarding-formador.js');
        break;
      default:
        console.error('❌ Rol desconocido:', userRole);
        layoutContainer.innerHTML = '<p>Error: rol no reconocido.</p>';
        return;
    }

    // Cargar CSS del onboarding
    loadOnboardingCSS();

    // Ejecutar el módulo de onboarding del rol
    if (onboardingModule.renderOnboarding) {
      await onboardingModule.renderOnboarding({
        user,
        perfil,
        layoutContainer,
        supabase: window.supabaseClient
      });
    } else {
      console.error('❌ El módulo no exporta renderOnboarding');
      layoutContainer.innerHTML = '<p>Error en el módulo de onboarding.</p>';
    }

  } catch (err) {
    console.error('❌ Error en startOnboarding:', err);
    const layoutContainer = document.getElementById('layout-container');
    if (layoutContainer) {
      layoutContainer.innerHTML = `<p>Error: ${err.message}</p>`;
    }
  }
}

/**
 * Carga el CSS del onboarding dinámicamente
 * Evita duplicados usando un id único
 */
function loadOnboardingCSS() {
  // Verificar si ya fue cargado
  if (document.getElementById('onboarding-css')) {
    console.log('✅ CSS de onboarding ya estaba cargado');
    return;
  }

  const link = document.createElement('link');
  link.id = 'onboarding-css';
  link.rel = 'stylesheet';
  link.href = './onboarding.css';
  document.head.appendChild(link);
  console.log('✅ CSS de onboarding cargado');
}
