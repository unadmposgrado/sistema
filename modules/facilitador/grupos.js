/**
 * modules/facilitador/grupos.js
 *
 * Módulo para gestión de grupos del facilitador.
 * Responsabilidades:
 * - Listar grupos asignados al facilitador
 * - Permitir filtrado y búsqueda
 * - Acceder a detalles de cada grupo
 */

document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabaseClient;

  // Obtener usuario actual
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('❌ Error obteniendo usuario en módulo grupos');
    return;
  }

  const groupsList = document.getElementById('groupsList');
  const groupSearch = document.getElementById('groupSearch');
  const groupFilter = document.getElementById('groupFilter');

  console.log('👥 Módulo de GRUPOS inicializado');

  if (!groupsList) {
    console.warn('⚠️ Elemento #groupsList no encontrado');
    return;
  }

  // ============================================================
  // CARGAR GRUPOS (PLACEHOLDER)
  // ============================================================
  try {
    groupsList.innerHTML = `
      <div style="padding: 2rem; text-align: center;">
        <p>No tienes grupos asignados aún.</p>
      </div>
    `;
  } catch (err) {
    console.error('❌ Error en módulo grupos:', err);
  }
});
