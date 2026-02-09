/**
 * modules/facilitador/perfil.js
 * 
 * Carga y pinta datos reales del facilitador desde Supabase
 * Expone: window.cargarDatosFacilitador(userId)
 */

window.cargarDatosFacilitador = async function(userId) {
  if (!userId || !window.supabaseClient) return;

  try {
    // 1. Obtener perfil del usuario (nombre)
    const { data: perfil, error: perfilError } = await window.supabaseClient
      .from('perfiles')
      .select('nombre')
      .eq('id', userId)
      .maybeSingle();

    if (perfilError) {
      console.error('❌ Error obteniendo perfil:', perfilError);
      return;
    }

    // 2. Obtener datos del facilitador (área, experiencia, institución)
    const { data: facilitador, error: facilitadorError } = await window.supabaseClient
      .from('facilitadores')
      .select('area_expertise, experiencia, institucion')
      .eq('perfil_id', userId)
      .maybeSingle();

    if (facilitadorError && facilitadorError.code !== 'PGRST116') {
      console.error('❌ Error obteniendo datos de facilitador:', facilitadorError);
      return;
    }

    // 3. Pintar nombre SOLO si existe el elemento
    const welcomeNameEl = document.getElementById('welcomeName');
    if (welcomeNameEl && perfil?.nombre) {
      welcomeNameEl.textContent = perfil.nombre;
    }

    // 4. Pintar datos del onboarding del facilitador SOLO si existen los elementos
    if (facilitador) {
      const specialtyEl = document.getElementById('specialty');
      const experienceEl = document.getElementById('experience');
      const institutionEl = document.getElementById('institution');

      if (specialtyEl && facilitador.area_expertise) {
        specialtyEl.textContent = facilitador.area_expertise;
      }

      if (experienceEl && facilitador.experiencia !== null && facilitador.experiencia !== undefined) {
        experienceEl.textContent = `${facilitador.experiencia} años`;
      }

      if (institutionEl && facilitador.institucion) {
        institutionEl.textContent = facilitador.institucion;
      } else if (institutionEl && !facilitador.institucion) {
        institutionEl.textContent = 'No especificada';
      }
    }

    console.log('✅ Datos del facilitador cargados correctamente');

  } catch (err) {
    console.error('❌ Error general cargando datos del facilitador:', err);
  }
};
