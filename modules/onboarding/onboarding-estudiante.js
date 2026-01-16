/**
 * modules/onboarding/onboarding-estudiante.js
 *
 * Módulo de onboarding para estudiantes
 * Campos: matricula, grado, institucion
 */

export async function renderOnboarding({ user, perfil, layoutContainer, supabase }) {
  try {
    // Validar parámetros requeridos
    if (!user || !user.id) {
      console.error('❌ usuario no válido');
      layoutContainer.innerHTML = '<p style="color: red;">Error: Usuario no válido.</p>';
      return;
    }

    if (!perfil || !perfil.id) {
      console.error('❌ perfil no válido');
      layoutContainer.innerHTML = '<p style="color: red;">Error: Perfil no válido.</p>';
      return;
    }

    if (!supabase) {
      console.error('❌ Supabase no disponible');
      layoutContainer.innerHTML = '<p style="color: red;">Error: Base de datos no disponible.</p>';
      return;
    }

    const userId = user.id;

  const html = `
    <div class="onboarding-container">
      <h1>Completa tu perfil</h1>
      <p>Necesitamos información adicional para personalizar tu experiencia.</p>

      <form id="onboardingForm" aria-label="Formulario de onboarding para estudiantes">
        <div class="form-group">
          <label for="matricula">Matrícula *</label>
          <input id="matricula" name="matricula" type="text" required placeholder="Ingresa tu matrícula...">
        </div>

        <div class="form-group">
          <label for="grado">Grado académico *</label>
          <select id="grado" name="grado" required>
            <option value="">Selecciona tu grado...</option>
            <option value="bachillerato">Bachillerato</option>
            <option value="licenciatura">Licenciatura</option>
            <option value="maestria">Maestría</option>
            <option value="doctorado">Doctorado</option>
          </select>
        </div>

        <div class="form-group">
          <label for="institucion">Institución *</label>
          <input id="institucion" name="institucion" type="text" required placeholder="Nombre de tu institución...">
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Completar Onboarding</button>
          <button type="button" class="btn btn-secondary" id="cancelBtn">Cancelar</button>
        </div>

        <div id="formError" class="form-error"></div>
      </form>
    </div>
  `;

  layoutContainer.innerHTML = html;

  const form = layoutContainer.querySelector('#onboardingForm');
  const cancelBtn = layoutContainer.querySelector('#cancelBtn');
  const formError = layoutContainer.querySelector('#formError');

  // Manejador de envío
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleFormSubmit(e, supabase, userId, formError);
  });

  // Manejador de cancelar
  cancelBtn.addEventListener('click', async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = 'index.html';
    } catch (err) {
      console.error('❌ Error en logout:', err);
      formError.textContent = 'Error al cerrar sesión.';
    }
  });

  } catch (err) {
    console.error('❌ Error en renderOnboarding (estudiante):', err);
    layoutContainer.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}

async function handleFormSubmit(e, supabase, userId, formError) {
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  // Validar campos obligatorios
  if (!data.matricula || !data.grado || !data.institucion) {
    formError.textContent = 'Todos los campos son obligatorios.';
    return;
  }

  try {
    formError.textContent = '';

    // Preparar datos para actualizar perfil
    const updateData = {
      matricula: data.matricula,
      grado: data.grado,
      institucion: data.institucion,
      onboarding_completo: true
    };

    // Actualizar perfil en Supabase
    const { error } = await supabase
      .from('perfiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('❌ Error guardando onboarding:', error);
      formError.textContent = 'Error al guardar los datos. Intenta de nuevo.';
      return;
    }

    console.log('✅ Onboarding completado para estudiante');
    
    // Redirigir al dashboard normal
    window.location.href = 'dashboard.html';

  } catch (err) {
    console.error('❌ Error en handleFormSubmit:', err);
    formError.textContent = 'Error inesperado. Intenta de nuevo.';
  }
}
