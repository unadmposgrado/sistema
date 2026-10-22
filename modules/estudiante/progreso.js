/**
 * modules/estudiante/progreso.js
 *
 * Módulo para gestionar y mostrar el progreso académico del estudiante.
 * Responsabilidades:
 * - Cargar datos de progreso de la simulación
 * - Mostrar barra de avance general
 * - Mostrar información de cursos (en progreso y concluidos)
 * - Actualizar información personal
 */

const initializeStudentProgressModule = async () => {
  const demoStore = window.demoStore;

  // Obtener usuario actual
  const { data: { user }, error: userError } = await demoStore.auth.getUser();
  if (userError || !user) {
    console.error('❌ Error obteniendo usuario en módulo progreso');
    return;
  }

  const userId = user.id;
  console.log('📈 Módulo de PROGRESO inicializado');

  // ============================================================
  // CARGAR DATOS DEL ESTUDIANTE
  // ============================================================
  try {
    const { data: perfil, error: perfilError } = await demoStore
      .from('perfiles')
      .select('nombre, programaEducativo, tutorAsignado, matricula')
      .eq('id', userId)
      .single();

    if (perfilError) {
      console.error('❌ Error obteniendo perfil:', perfilError);
      return;
    }

    // Poblar información personal
    const welcomeName = document.getElementById('welcomeName');
    const programElem = document.querySelector('.program');
    const tutorElem = document.querySelector('.tutor');
    const matriculaElem = document.getElementById('matricula');

    if (welcomeName) welcomeName.textContent = perfil.nombre;
    if (programElem) programElem.textContent = perfil.programaEducativo || 'Por asignar';
    if (tutorElem) tutorElem.textContent = perfil.tutorAsignado || 'Por asignar';
    if (matriculaElem && perfil.matricula) matriculaElem.textContent = perfil.matricula;

    // ============================================================
    // CARGAR PROGRESO ACADÉMICO
    // ============================================================
    // Aquí irá la lógica cuando tengas la tabla de 'progreso'
    // Por ahora, mostrar valores por defecto
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    if (progressBar && progressText) {
      const progress = 0;
      progressBar.style.width = `${progress}%`;
      progressText.textContent = `${progress}%`;
    }

    // ============================================================
    // CARGAR CURSOS (PLACEHOLDER)
    // ============================================================
    const inProgressList = document.getElementById('inProgressCourses');
    const completedList = document.getElementById('completedCourses');

    if (inProgressList) {
      inProgressList.innerHTML = '<li class="placeholder">No hay cursos en progreso</li>';
    }

    if (completedList) {
      completedList.innerHTML = '<li class="placeholder">No hay cursos completados</li>';
    }

  } catch (err) {
    console.error('❌ Error en módulo progreso:', err);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeStudentProgressModule, { once: true });
} else {
  initializeStudentProgressModule();
}
