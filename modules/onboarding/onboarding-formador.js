/**
 * modules/onboarding/onboarding-formador.js
 *
 * Onboarding para formadores
 * Campos: area_expertise, experiencia, institucion
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
        <h1>Perfil de formador</h1>
        <p>Necesitamos algunos datos profesionales.</p>

        <form id="onboardingForm">
          <div class="form-group">
            <label for="area">Área de especialidad *</label>
            <input
              type="text"
              id="area"
              name="area"
              required
              placeholder="Ej. Matemáticas, Pedagogía, Programación..."
            />
          </div>

          <div class="form-group">
            <label for="experiencia">Años de experiencia *</label>
            <input
              type="number"
              id="experiencia"
              name="experiencia"
              min="0"
              required
            />
          </div>

          <div class="form-group">
            <label for="institucion">Institución actual</label>
            <input
              type="text"
              id="institucion"
              name="institucion"
              placeholder="Universidad, centro educativo, etc."
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

      if (!data.area || data.experiencia === '') {
        formError.textContent = 'Área y experiencia son obligatorias.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Completar onboarding';
        return;
      }

      try {
        const updateData = {
          area_expertise: data.area.trim(),
          experiencia: parseInt(data.experiencia, 10),
          institucion: data.institucion?.trim() || null,
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

        console.log('✅ Onboarding de formador completado');
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
    console.error('❌ Error general en onboarding-formador:', err);
    layoutContainer.innerHTML =
      `<p style="color:red;">Error inesperado: ${err.message}</p>`;
  }
}
