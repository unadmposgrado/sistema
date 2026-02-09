/**
 * usuarios.js
 *
 * Módulo orquestador para gestión de usuarios.
 * Responsabilidades:
 * - Inicializar el módulo cuando el dashboard carga
 * - Obtener datos de Supabase
 * - Coordinar entre UI y API
 * - Manejar errores globales
 * - Actualizar estadísticas
 * 
 * Nota: Este módulo carga las APIs y UI como módulos ES6 dinámicamente
 */

/**
 * Actualizar estadísticas del panel admin
 * @param {Array} perfiles - Array de todos los perfiles
 */
function actualizarEstadisticas(perfiles) {
  const totalUsers = document.getElementById('totalUsers');
  const activeStudents = document.getElementById('activeStudents');
  const trainers = document.getElementById('trainers');
  const monitors = document.getElementById('monitors');

  if (totalUsers) totalUsers.textContent = perfiles.length;
  if (activeStudents)
    activeStudents.textContent = perfiles.filter((u) => u.rol === 'estudiante').length;
  if (trainers)
    trainers.textContent = perfiles.filter((u) => u.rol === 'facilitador').length;
  if (monitors)
    monitors.textContent = perfiles.filter((u) => u.rol === 'monitor').length;
}

/**
 * Mostrar mensaje de carga
 */
function mostrarCargando() {
  const usersList = document.getElementById('usersList');
  if (usersList) {
    usersList.innerHTML = '<p class="loading">Cargando usuarios...</p>';
  }
}

/**
 * Mostrar mensaje de error
 * @param {string} mensaje - Mensaje de error
 */
function mostrarError(mensaje) {
  const usersList = document.getElementById('usersList');
  if (usersList) {
    usersList.innerHTML = `
      <div class="error-message">
        <p>❌ ${mensaje}</p>
        <button onclick="location.reload()" class="btn-secondary">Reintentar</button>
      </div>
    `;
  }
}

/**
 * Inicializar el módulo de usuarios
 * Se ejecuta cuando dashboard carga el rol admin
 */
export async function inicializarModuloUsuarios() {
  console.log('📦 Inicializando módulo de usuarios admin...');

  // Verificar que el contenedor existe
  const usersList = document.getElementById('usersList');
  if (!usersList) {
    console.warn('⚠️ No se encontró #usersList. El módulo no se inicializará.');
    return;
  }

  try {
    // Mostrar estado de carga
    mostrarCargando();

    // Cargar módulos dinámicamente
    const { obtenerPerfiles, ordenarPerfiles } = await import('./usuarios.api.js');
    const {
      renderizarTablaUsuarios,
      inicializarControles,
    } = await import('./usuarios.ui.js');

    // Obtener perfiles de Supabase
    let perfiles = await obtenerPerfiles();
    console.log(`✅ Se obtuvieron ${perfiles.length} usuarios`);

    // Aplicar ordenamiento según roles y nombre alfabético
    perfiles = ordenarPerfiles(perfiles);

    // Actualizar estadísticas
    actualizarEstadisticas(perfiles);

    // Renderizar tabla inicial
    renderizarTablaUsuarios(perfiles);

    // Inicializar controles de búsqueda y filtrado
    inicializarControles(perfiles);

    console.log('✅ Módulo de usuarios inicializado correctamente');
  } catch (err) {
    console.error('❌ Error inicializando módulo de usuarios:', err);
    mostrarError('No se pudieron cargar los usuarios. Intenta nuevamente.');
  }
}

// Hacer la función disponible globalmente para dashboard.js
window.inicializarModuloUsuarios = inicializarModuloUsuarios;
