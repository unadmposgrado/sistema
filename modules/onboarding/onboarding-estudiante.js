/**
 * modules/onboarding/onboarding-estudiante.js
 *
 * Onboarding para estudiantes
 * Campos: matricula, grado, institucion
 * Supone RLS DESACTIVADO (modo pruebas)
 */

export async function renderOnboarding({ user, layoutContainer, supabase }) {
  try {
    // ================================
    // Validaciones mínimas
    // ================================
    if (!user || !user.id) {
      console.error('❌ Usuario no válido');
      layoutContainer.innerHTML =
        '<p style="color:red;">Error: usuario no válido.</p>';
      return;
    }

    if (!supabase) {
      console.error('❌ Supabase no disponible');
      layoutContainer.innerHTML =
        '<p style="color:red;">Error: conexión a base de datos no disponible.</p>';
      return;
    }

    const userId = user.id;

    // ================================
    // Render HTML
    // ================================
    layoutContainer.innerHTML = `
      <div class="onboarding-container">
        <h1>Completa tu perfil de estudiante</h1>
        <p>Esta información es necesaria para continuar.</p>

        <form id="onboardingForm">
          <div class="form-group">
            <label for="matricula">Matrícula *</label>
            <input
              type="text"
              id="matricula"
              name="matricula"
              required
              placeholder="Ingresa tu matrícula"
            />
          </div>

          <div class="form-group">
            <label for="grado">Grado académico *</label>
            <select id="grado" name="grado" required>
              <option value="">Selecciona una opción</option>
              <option value="bachillerato">Bachillerato</option>
              <option value="licenciatura">Licenciatura</option>
              <option value="maestria">Maestría</option>
              <option value="doctorado">Doctorado</option>
            </select>
          </div>

          <div class="form-group">
            <label for="institucion">Institución *</label>
            <input
              type="text"
              id="institucion"
              name="institucion"
              required
              placeholder="Nombre de la institución"
            />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">
              Completar onboarding
            </button>
            <button type="button" id="cancelBtn" class="btn btn-secondary">
              Cancelar
            </button>
          </div>

          <div id="formError" class="form-error"></div>
        </form>
      </div>
    `;

    // ================================
    // Referencias DOM
    // ================================
    const form = layoutContainer.querySelector('#onboardingForm');
    const cancelBtn = layoutContainer.querySelector('#cancelBtn');
    const formError = layoutContainer.querySelector('#formError');
    const submitBtn = form.querySelector('button[type="submit"]');

    // ================================
    // Submit
    // ================================
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      formError.textContent = '';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Guardando...';

      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      if (!data.matricula || !data.grado || !data.institucion) {
        formError.textContent = 'Todos los campos son obligatorios.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Completar onboarding';
        return;
      }

      try {
        const updateData = {
          matricula: data.matricula.trim(),
          grado: data.grado,
          institucion: data.institucion.trim(),
          onboarding_completo: true
        };

        const { data: updated, error } = await supabase
          .from('perfiles')
          .update(updateData)
          .eq('id', userId)
          .select();

        if (error || !updated || updated.length === 0) {
          console.error('❌ Error actualizando perfil:', error);
          formError.textContent =
            'No se pudo actualizar el perfil. Intenta de nuevo.';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Completar onboarding';
          return;
        }

        console.log('✅ Onboarding de estudiante completado');

        // Redirigir al dashboard normal
        window.location.href = 'dashboard.html';

      } catch (err) {
        console.error('❌ Error inesperado en onboarding:', err);
        formError.textContent = 'Error inesperado. Intenta nuevamente.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Completar onboarding';
      }
    });

    // ================================
    // Cancelar → logout
    // ================================
    cancelBtn.addEventListener('click', async () => {
      try {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
      } catch (err) {
        console.error('❌ Error al cerrar sesión:', err);
        formError.textContent = 'Error al cerrar sesión.';
      }
    });

  } catch (err) {
    console.error('❌ Error general en onboarding-estudiante:', err);
    layoutContainer.innerHTML =
      `<p style="color:red;">Error inesperado: ${err.message}</p>`;
  }
}
