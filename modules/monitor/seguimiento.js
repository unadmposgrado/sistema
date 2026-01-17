/**
 * modules/monitor/seguimiento.js
 *
 * Módulo para mostrar el seguimiento del estado de solicitud del monitor.
 * Responsabilidades:
 * - Cargar información personal desde Supabase
 * - Mostrar estado actual de la solicitud
 * - Mostrar retroalimentación del evaluador (si disponible)
 */

document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabaseClient;

  // Obtener usuario actual
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('❌ Error obteniendo usuario en módulo seguimiento');
    return;
  }

  const userId = user.id;
  console.log('📊 Módulo de SEGUIMIENTO inicializado');

  // ============================================================
  // CARGAR DATOS DEL MONITOR
  // ============================================================
  try {
    const { data: perfil, error } = await supabase
      .from('perfiles')
      .select('nombre, institucion, interes_academico')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Error obteniendo perfil:', error);
      return;
    }

    // Poblar campos de información
    const welcomeName = document.getElementById('welcomeName');
    const institution = document.getElementById('institution');
    const interestArea = document.getElementById('interestArea');
    const academicInterest = document.getElementById('academicInterest');

    if (welcomeName) welcomeName.textContent = `Bienvenido, ${perfil.nombre}`;
    if (institution) institution.textContent = perfil.institucion || 'No especificada';
    if (academicInterest) academicInterest.textContent = perfil.interes_academico || 'No especificado';
    if (interestArea) interestArea.textContent = perfil.interes_academico || 'Área no especificada';

    // ============================================================
    // MOSTRAR ESTADO DE SOLICITUD
    // ============================================================
    // Por ahora, mostrar estado predeterminado
    // Cuando tengas tabla de 'solicitudes', reemplaza esto
    const applicationStatus = document.getElementById('applicationStatus');
    if (applicationStatus) {
      applicationStatus.innerHTML = `
        <span class="status-label">En revisión</span>
        <span class="status-detail">Tus documentos están siendo evaluados. Te notificaremos cuando haya cambios.</span>
      `;
    }

  } catch (err) {
    console.error('❌ Error en módulo seguimiento:', err);
  }
});
