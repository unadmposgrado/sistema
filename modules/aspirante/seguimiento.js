/**
 * modules/aspirante/seguimiento.js
 *
 * Módulo para mostrar el seguimiento del estado de solicitud del aspirante.
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
  // CARGAR DATOS DEL ASPIRANTE
  // ============================================================
  try {
    const { data: perfil, error } = await supabase
      .from('perfiles')
      .select('nombre, institucion, grado')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Error obteniendo perfil:', error);
      return;
    }

    // Poblar campos de información
    const welcomeName = document.getElementById('welcomeName');
    const institution = document.getElementById('institution');
    const studyLevel = document.getElementById('studyLevel');
    const academicDegree = document.getElementById('academicDegree');

    if (welcomeName) welcomeName.textContent = `Bienvenido, ${perfil.nombre}`;
    if (institution) institution.textContent = perfil.institucion || 'No especificada';
    if (academicDegree) academicDegree.textContent = perfil.grado || 'No especificado';
    if (studyLevel) studyLevel.textContent = 'Posgrado'; // Puedes hacerlo dinámico

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
