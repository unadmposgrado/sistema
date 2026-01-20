/**
 * usuarios.ui.js
 *
 * Capa de presentación para gestión de usuarios.
 * Responsabilidades:
 * - Renderizar tabla de usuarios
 * - Manejar eventos de búsqueda y filtrado
 * - Manejar cambios de rol
 * - Manejar reset de onboarding
 * - Actualizar UI sin recargar la página
 */

import {
  obtenerPerfiles,
  cambiarRol,
  resetearOnboarding,
  filtrarPerfiles,
} from './usuarios.api.js';

/**
 * Renderizar la tabla de usuarios
 * @param {Array} perfiles - Array de perfiles a mostrar
 */
export function renderizarTablaUsuarios(perfiles) {
  const usersList = document.getElementById('usersList');

  if (!usersList) {
    console.warn('⚠️ No se encontró #usersList');
    return;
  }

  // Si no hay usuarios
  if (perfiles.length === 0) {
    usersList.innerHTML = '<p class="no-results">No se encontraron usuarios.</p>';
    return;
  }

  // Construir tabla
  const tabla = document.createElement('table');
  tabla.className = 'users-table';

  // Header
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Nombre</th>
      <th>Email</th>
      <th>Rol</th>
      <th>Onboarding</th>
      <th>Acciones</th>
    </tr>
  `;
  tabla.appendChild(thead);

  // Body
  const tbody = document.createElement('tbody');
  perfiles.forEach((perfil) => {
    const tr = document.createElement('tr');
    tr.dataset.userId = perfil.id;

    // Badge de onboarding
    const onboardingBadge = perfil.onboarding_completo
      ? '<span class="badge badge-success">✓ Completado</span>'
      : '<span class="badge badge-warning">⚠ Pendiente</span>';

    tr.innerHTML = `
      <td>${perfil.nombre || 'N/A'}</td>
      <td>${perfil.email || 'N/A'}</td>
      <td>
        <select class="rol-select" data-user-id="${perfil.id}" data-current-rol="${perfil.rol}">
          <option value="monitor" ${perfil.rol === 'monitor' ? 'selected' : ''}>Monitor</option>
          <option value="estudiante" ${perfil.rol === 'estudiante' ? 'selected' : ''}>Estudiante</option>
          <option value="facilitador" ${perfil.rol === 'facilitador' ? 'selected' : ''}>Facilitador</option>
          <option value="admin" ${perfil.rol === 'admin' ? 'selected' : ''}>Admin</option>
        </select>
      </td>
      <td>${onboardingBadge}</td>
      <td>
        <button class="btn-reset-onboarding" data-user-id="${perfil.id}" title="Resetear onboarding">
          🔄 Reset
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  tabla.appendChild(tbody);
  usersList.innerHTML = '';
  usersList.appendChild(tabla);

  // Agregar event listeners
  attachEventListeners();
}

/**
 * Adjuntar event listeners a los controles
 */
function attachEventListeners() {
  // Event listener para cambios de rol
  document.querySelectorAll('.rol-select').forEach((select) => {
    select.addEventListener('change', handleRolChange);
  });

  // Event listener para reset de onboarding
  document.querySelectorAll('.btn-reset-onboarding').forEach((btn) => {
    btn.addEventListener('click', handleResetOnboarding);
  });
}

/**
 * Manejar cambio de rol
 * @param {Event} e - Evento de cambio
 */
async function handleRolChange(e) {
  const select = e.target;
  const userId = select.dataset.userId;
  const nuevoRol = select.value;
  const rolAnterior = select.dataset.currentRol;

  // Confirmación
  const confirmar = confirm(
    `¿Cambiar el rol a "${nuevoRol}"? Esto reseteará el onboarding del usuario.`
  );
  if (!confirmar) {
    select.value = rolAnterior;
    return;
  }

  try {
    select.disabled = true;
    console.log(`📝 Cambiando rol de ${userId} a ${nuevoRol}...`);

    const perfilActualizado = await cambiarRol(userId, nuevoRol);

    if (perfilActualizado) {
      // Actualizar atributo de datos
      select.dataset.currentRol = nuevoRol;

      // Actualizar badge de onboarding en la fila
      const fila = select.closest('tr');
      const badgeCell = fila.querySelector('td:nth-child(4)');
      badgeCell.innerHTML =
        '<span class="badge badge-warning">⚠ Pendiente</span>';

      console.log('✅ Rol actualizado exitosamente');
      alert(`Rol cambiado a "${nuevoRol}". El usuario deberá completar el onboarding en su próximo login.`);
    }
  } catch (err) {
    console.error('❌ Error cambiando rol:', err);
    alert(`Error al cambiar el rol: ${err.message}`);
    select.value = rolAnterior;
  } finally {
    select.disabled = false;
  }
}

/**
 * Manejar reset de onboarding
 * @param {Event} e - Evento de clic
 */
async function handleResetOnboarding(e) {
  const btn = e.target;
  const userId = btn.dataset.userId;

  // Confirmación
  const confirmar = confirm(
    '¿Resetear el onboarding de este usuario? Deberá completarlo nuevamente en su próximo login.'
  );
  if (!confirmar) return;

  try {
    btn.disabled = true;
    console.log(`🔄 Reseteando onboarding de ${userId}...`);

    const perfilActualizado = await resetearOnboarding(userId);

    if (perfilActualizado) {
      // Actualizar badge de onboarding en la fila
      const fila = btn.closest('tr');
      const badgeCell = fila.querySelector('td:nth-child(4)');
      badgeCell.innerHTML =
        '<span class="badge badge-warning">⚠ Pendiente</span>';

      console.log('✅ Onboarding reseteado exitosamente');
      alert('Onboarding reseteado. El usuario deberá completarlo en su próximo login.');
    }
  } catch (err) {
    console.error('❌ Error reseteando onboarding:', err);
    alert(`Error al resetear onboarding: ${err.message}`);
  } finally {
    btn.disabled = false;
  }
}

/**
 * Inicializar controles de búsqueda y filtrado
 * @param {Array} perfilesOriginales - Array original de perfiles
 */
export function inicializarControles(perfilesOriginales) {
  const searchInput = document.getElementById('userSearch');
  const roleFilter = document.getElementById('roleFilter');

  if (!searchInput || !roleFilter) {
    console.warn('⚠️ No se encontraron los controles de búsqueda/filtrado');
    return;
  }

  /**
   * Aplicar filtros y búsqueda
   */
  const aplicarFiltros = () => {
    const searchTerm = searchInput.value;
    const rolFiltro = roleFilter.value;

    const perfilesFiltrados = filtrarPerfiles(
      perfilesOriginales,
      searchTerm,
      rolFiltro
    );

    renderizarTablaUsuarios(perfilesFiltrados);
  };

  // Event listeners
  searchInput.addEventListener('input', aplicarFiltros);
  roleFilter.addEventListener('change', aplicarFiltros);
}

/**
 * Mostrar mensaje de carga
 */
export function mostrarCargando() {
  const usersList = document.getElementById('usersList');
  if (usersList) {
    usersList.innerHTML =
      '<p class="loading">Cargando usuarios...</p>';
  }
}

/**
 * Mostrar mensaje de error
 * @param {string} mensaje - Mensaje de error
 */
export function mostrarError(mensaje) {
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
