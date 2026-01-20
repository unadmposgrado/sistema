/**
 * modules/onboarding/onboarding-monitor.js
 *
 * Onboarding para monitores (antes llamados aspirantes)
 * Campos específicos guardados en tabla 'monitores':
 * - perfil_id, interes_academico, institucion
 * 
 * Flujo:
 * 1. Verificar/crear registro en tabla 'monitores' (si no existe)
 * 2. Guardar datos del formulario en tabla 'monitores'
 * 3. Actualizar 'perfiles.onboarding_completo = true'
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
              Completar información
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
        // Paso 1: Verificar si existe registro en tabla 'monitores'
        const { data: monitorExistente, error: errorVerificacion } = await supabase
          .from('monitores')
          .select('perfil_id')
          .eq('perfil_id', userId)
          .maybeSingle();

        if (errorVerificacion) {
          console.error('❌ Error verificando registro en monitores:', errorVerificacion);
          formError.textContent = 'Error al verificar datos. Intenta de nuevo.';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Completar onboarding';
          return;
        }

        // Paso 2: Si no existe, crear el registro en 'monitores'
        if (!monitorExistente) {
          const { error: errorCreacion } = await supabase
            .from('monitores')
            .insert([{
              perfil_id: userId,
              interes_academico: data.interes.trim(),
              institucion: data.institucion?.trim() || null
            }]);

          if (errorCreacion) {
            console.error('❌ Error creando registro en monitores:', errorCreacion);
            formError.textContent = 'Error al guardar datos. Intenta de nuevo.';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Completar onboarding';
            return;
          }
        } else {
          // Paso 2B: Si existe, actualizar datos en 'monitores'
          const { error: errorActualizacion } = await supabase
            .from('monitores')
            .update({
              interes_academico: data.interes.trim(),
              institucion: data.institucion?.trim() || null
            })
            .eq('perfil_id', userId);

          if (errorActualizacion) {
            console.error('❌ Error actualizando registro en monitores:', errorActualizacion);
            formError.textContent = 'Error al actualizar datos. Intenta de nuevo.';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Completar onboarding';
            return;
          }
        }

        // Paso 3: Actualizar 'perfiles.onboarding_completo = true' (operación SEPARADA)
        const { error: errorPerfil } = await supabase
          .from('perfiles')
          .update({ onboarding_completo: true })
          .eq('id', userId);

        if (errorPerfil) {
          console.error('❌ Error actualizando onboarding_completo:', errorPerfil);
          formError.textContent = 'Error al finalizar. Por favor contacta al administrador.';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Completar onboarding';
          return;
        }

        console.log('✅ Onboarding de monitor completado');
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
    console.error('❌ Error general en onboarding-monitor:', err);
    layoutContainer.innerHTML =
      `<p style="color:red;">Error inesperado: ${err.message}</p>`;
  }
}
