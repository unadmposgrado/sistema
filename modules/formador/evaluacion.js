/**
 * modules/formador/evaluacion.js
 *
 * Módulo para evaluación de estudiantes.
 * Responsabilidades:
 * - Cargar lista de estudiantes del grupo seleccionado
 * - Permitir calificación y retroalimentación
 * - Guardar evaluaciones en Supabase
 */

document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabaseClient;

  // Obtener usuario actual
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('❌ Error obteniendo usuario en módulo evaluación');
    return;
  }

  const evaluationList = document.getElementById('evaluationList');

  console.log('⭐ Módulo de EVALUACIÓN inicializado');

  if (!evaluationList) {
    console.warn('⚠️ Elemento #evaluationList no encontrado');
    return;
  }

  // ============================================================
  // CARGAR EVALUACIÓN (PLACEHOLDER)
  // ============================================================
  try {
    evaluationList.innerHTML = `
      <p>Selecciona un grupo en el menú superior para evaluar a sus estudiantes.</p>
    `;
  } catch (err) {
    console.error('❌ Error en módulo evaluación:', err);
  }
});
