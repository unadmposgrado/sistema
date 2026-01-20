/**
 * modules/estudiante/retroalimentacion.js
 *
 * Módulo para mostrar retroalimentación del tutor/facilitador.
 * Responsabilidades:
 * - Cargar feedback desde Supabase
 * - Mostrar retroalimentación pendiente
 * - Mostrar historial de retroalimentación
 */

document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabaseClient;

  // Obtener usuario actual
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('❌ Error obteniendo usuario en módulo retroalimentación');
    return;
  }

  const feedbackList = document.getElementById('feedbackList');

  console.log('💬 Módulo de RETROALIMENTACIÓN inicializado');

  if (!feedbackList) {
    console.warn('⚠️ Elemento #feedbackList no encontrado');
    return;
  }

  // ============================================================
  // CARGAR RETROALIMENTACIÓN (PLACEHOLDER)
  // ============================================================
  // Reemplazar con consulta real a tabla 'feedback' cuando esté disponible
  try {
    feedbackList.innerHTML = `
      <p>No hay retroalimentación disponible aún.</p>
      <p style="font-size: 0.9em; color: #666;">
        Tu tutor dejará aquí sus comentarios sobre tu desempeño.
      </p>
    `;
  } catch (err) {
    console.error('❌ Error en módulo retroalimentación:', err);
  }
});
