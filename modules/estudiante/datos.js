/**
 * modules/estudiante/datos.js
 * 
 * Carga y pinta datos reales del estudiante desde Supabase
 * Expone: window.cargarDatosEstudiante(userId)
 */

window.cargarDatosEstudiante = async function(userId) {
  if (!userId || !window.supabaseClient) return;

  try {
    // 1. Obtener perfil
    const { data: perfil, error: perfilError } = await window.supabaseClient
      .from('perfiles')
      .select('nombre')
      .eq('id', userId)
      .maybeSingle();

    if (perfilError) {
      console.error('Error obteniendo perfil:', perfilError);
      return;
    }

    // 2. Obtener datos de estudiante
    const { data: estudiante, error: estudianteError } = await window.supabaseClient
      .from('estudiantes')
      .select('matricula, grado')
      .eq('perfil_id', userId)
      .maybeSingle();

    if (estudianteError) {
      console.error('Error obteniendo estudiante:', estudianteError);
      return;
    }

    // 3. Pintar datos SOLO si existen los elementos
    const nombreEl = document.getElementById('welcomeName');
    const matriculaEl = document.getElementById('matricula');
    const gradoEl = document.getElementById('program');

    if (nombreEl && perfil?.nombre) {
      nombreEl.textContent = perfil.nombre;
    }

    if (matriculaEl && estudiante?.matricula) {
      matriculaEl.textContent = estudiante.matricula;
    }

    if (gradoEl && estudiante?.grado) {
      gradoEl.textContent = estudiante.grado;
    }

  } catch (err) {
    console.error('Error general cargando datos del estudiante:', err);
  }
};
