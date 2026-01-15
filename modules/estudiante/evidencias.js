/**
 * modules/estudiante/evidencias.js
 *
 * Módulo para gestión de evidencias académicas del estudiante.
 * Responsabilidades:
 * - Listar evidencias subidas por el estudiante
 * - Permitir descarga de evidencias
 * - Mostrar estado de validación
 */

document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabaseClient;

  // Obtener usuario actual
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('❌ Error obteniendo usuario en módulo evidencias');
    return;
  }

  const userId = user.id;
  const evidencesList = document.getElementById('evidencesList');

  console.log('📎 Módulo de EVIDENCIAS inicializado');

  if (!evidencesList) {
    console.warn('⚠️ Elemento #evidencesList no encontrado');
    return;
  }

  // ============================================================
  // CARGAR EVIDENCIAS (PLACEHOLDER)
  // ============================================================
  // Reemplazar con consulta real a tabla 'evidencias' cuando esté disponible
  try {
    evidencesList.innerHTML = `
      <p>No hay evidencias registradas aún.</p>
      <p style="font-size: 0.9em; color: #666;">
        Las evidencias que envíes a través de tus cursos aparecerán aquí.
      </p>
    `;
  } catch (err) {
    console.error('❌ Error en módulo evidencias:', err);
  }
});
