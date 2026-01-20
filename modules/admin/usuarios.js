/**
 * modules/admin/usuarios.js
 *
 * Módulo para gestión de usuarios (administrador).
 * Responsabilidades:
 * - Listar todos los usuarios del sistema
 * - Permitir crear, editar y eliminar usuarios
 * - Filtrar por rol
 * - Buscar usuarios
 */

document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabaseClient;

  // Obtener usuario actual
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('❌ Error obteniendo usuario en módulo usuarios');
    return;
  }

  const usersList = document.getElementById('usersList');
  const addUserBtn = document.getElementById('addUserBtn');
  const userSearch = document.getElementById('userSearch');
  const roleFilter = document.getElementById('roleFilter');

  console.log('👨‍💼 Módulo de USUARIOS inicializado');

  if (!usersList) {
    console.warn('⚠️ Elemento #usersList no encontrado');
    return;
  }

  // ============================================================
  // CARGAR LISTA DE USUARIOS
  // ============================================================
  async function loadUsers() {
    try {
      const { data: usuarios, error } = await supabase
        .from('perfiles')
        .select('id, nombre, email, rol')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!usuarios || usuarios.length === 0) {
        usersList.innerHTML = '<p>No hay usuarios registrados.</p>';
        return;
      }

      // Actualizar estadísticas
      updateStats(usuarios);

      // Renderizar lista
      usersList.innerHTML = usuarios
        .map(user => `
          <div class="user-item">
            <div class="user-info">
              <strong>${user.nombre}</strong>
              <small>${user.email}</small>
              <span class="role-badge">${user.rol}</span>
            </div>
            <div class="user-actions">
              <button class="btn-secondary" data-user-id="${user.id}">Editar</button>
              <button class="btn-danger" data-user-id="${user.id}">Eliminar</button>
            </div>
          </div>
        `)
        .join('');
    } catch (err) {
      console.error('❌ Error cargando usuarios:', err);
      usersList.innerHTML = '<p>Error al cargar usuarios.</p>';
    }
  }

  // ============================================================
  // ACTUALIZAR ESTADÍSTICAS
  // ============================================================
  function updateStats(usuarios) {
    const totalUsers = document.getElementById('totalUsers');
    const activeStudents = document.getElementById('activeStudents');
    const trainers = document.getElementById('trainers');
    const monitors = document.getElementById('monitors');

    if (totalUsers) totalUsers.textContent = usuarios.length;
    if (activeStudents) activeStudents.textContent = usuarios.filter(u => u.rol === 'estudiante').length;
    if (trainers) trainers.textContent = usuarios.filter(u => u.rol === 'facilitador').length;
    if (monitors) monitors.textContent = usuarios.filter(u => u.rol === 'monitor').length;
  }

  // Listener para agregar usuario
  if (addUserBtn) {
    addUserBtn.addEventListener('click', () => {
      alert('Función "Agregar usuario" en desarrollo');
    });
  }

  // Listener para búsqueda
  if (userSearch) {
    userSearch.addEventListener('input', () => {
      // Implementar filtrado en tiempo real
      loadUsers();
    });
  }

  // Listener para filtro de rol
  if (roleFilter) {
    roleFilter.addEventListener('change', () => {
      loadUsers();
    });
  }

  // Cargar usuarios al inicializar
  await loadUsers();
});
