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
    console.log('🎯 startOnboarding iniciado para usuario:', user?.id);

    // Validar que Supabase esté disponible
    if (!window.supabaseClient) {
      console.error('❌ Supabase no disponible en window.supabaseClient');
      const layoutContainer = document.getElementById('layout-container');
      if (layoutContainer) {
        layoutContainer.innerHTML = '<p style="color: red;">Error: No se pudo conectar a la base de datos.</p>';
      }
      return;
    }

    // Validar usuario
    if (!user || !user.id) {
      console.error('❌ Usuario no válido');
      const layoutContainer = document.getElementById('layout-container');
      if (layoutContainer) {
        layoutContainer.innerHTML = '<p style="color: red;">Error: Usuario no válido.</p>';
      }
      return;
    }

    const userId = user.id;
    const supabase = window.supabaseClient;

    // Obtener o crear perfil
    let userPerfil = perfil;
    
    if (!userPerfil) {
      console.log('📝 Perfil no proporcionado. Buscando en BD...');
      
      const { data: existingPerfil, error: searchError } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (searchError && searchError.code !== 'PGRST116') {
        // Error distinto a "no rows found"
        console.error('❌ Error buscando perfil:', searchError);
        const layoutContainer = document.getElementById('layout-container');
        if (layoutContainer) {
          layoutContainer.innerHTML = '<p style="color: red;">Error al acceder a la base de datos.</p>';
        }
        return;
      }

      if (!existingPerfil) {
        // Perfil no existe, crearlo
        console.log('📝 Perfil no existe. Creando uno nuevo...');
        
        const { data: newPerfil, error: createError } = await supabase
          .from('perfiles')
          .insert([{
            id: userId
          }])
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creando perfil:', createError);
          const layoutContainer = document.getElementById('layout-container');
          if (layoutContainer) {
            layoutContainer.innerHTML = '<p style="color: red;">Error al crear el perfil.</p>';
          }
          return;
        }

        userPerfil = newPerfil;
        console.log('✅ Perfil creado:', userPerfil);
      } else {
        userPerfil = existingPerfil;
        console.log('✅ Perfil encontrado:', userPerfil);
      }
    }

    // Validar que ahora tenemos perfil válido
    if (!userPerfil || !userPerfil.id) {
      console.error('❌ No se pudo obtener/crear perfil válido');
      const layoutContainer = document.getElementById('layout-container');
      if (layoutContainer) {
        layoutContainer.innerHTML = '<p style="color: red;">Error: No se pudo obtener perfil válido.</p>';
      }
      return;
    }

    const userRole = userPerfil.rol || 'monitor';
    console.log('🎭 Rol del usuario:', userRole);

    const layoutContainer = document.getElementById('layout-container');
    if (!layoutContainer) {
      console.error('❌ #layout-container no encontrado');
      return;
    }

    // Cargar el módulo de onboarding específico del rol
    let onboardingModule;

    switch (userRole) {
      case 'monitor':
        onboardingModule = await import('./onboarding-monitor.js');
        break;
      case 'estudiante':
        onboardingModule = await import('./onboarding-estudiante.js');
        break;
      case 'facilitador':
        onboardingModule = await import('./onboarding-facilitador.js');
        break;
      default:
        console.error('❌ Rol desconocido:', userRole);
        layoutContainer.innerHTML = '<p style="color: red;">Error: rol no reconocido.</p>';
        return;
    }

    // Cargar CSS del onboarding
    loadOnboardingCSS();

    // Ejecutar el módulo de onboarding del rol
    if (onboardingModule.renderOnboarding) {
      await onboardingModule.renderOnboarding({
        user,
        perfil: userPerfil,
        layoutContainer,
        supabase
      });
    } else {
      console.error('❌ El módulo no exporta renderOnboarding');
      layoutContainer.innerHTML = '<p style="color: red;">Error en el módulo de onboarding.</p>';
    }

  } catch (err) {
    console.error('❌ Error en startOnboarding:', err);
    const layoutContainer = document.getElementById('layout-container');
    if (layoutContainer) {
      layoutContainer.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
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
