/**
 * modules/onboarding/onboarding-aspirante.js
 *
 * Onboarding para aspirantes
 * Campos: nombre_completo, interes_academico, institucion
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
        <h1>Completa tu perfil</h1>
        <p>Cuéntanos un poco más para continuar.</p>

        <form id="onboardingForm">
          <div class="form-group">
            <label for="interes">Área de interés *</label>
            <input
              type="text"
              id="interes"
              name="interes"
              required
              placeholder="Ej. Ciencias Sociales, Ingeniería, Artes..."
            />
          </div>

          <div class="form-group">
            <label for="institucion">Institución de procedencia</label>
            <input
              type="text"
              id="institucion"
              name="institucion"
              placeholder="Escuela o institución actual"
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

      if (!data.interes) {
        formError.textContent = 'El área de interés es obligatoria.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Completar onboarding';
        return;
      }

      try {
        const updateData = {
          interes_academico: data.interes.trim(),
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

        console.log('✅ Onboarding de aspirante completado');
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
    console.error('❌ Error general en onboarding-aspirante:', err);
    layoutContainer.innerHTML =
      `<p style="color:red;">Error inesperado: ${err.message}</p>`;
  }
}
