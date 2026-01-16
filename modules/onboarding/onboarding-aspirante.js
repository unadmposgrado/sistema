/**
 * modules/onboarding/onboarding-aspirante.js
 *
 * Módulo de onboarding para aspirantes
 * Campos: intereses, modalidad
 */

export async function renderOnboarding({ user, perfil, layoutContainer, supabase }) {
  try {
    // Validar parámetros requeridos
    if (!user || !user.id) {
      console.error('❌ usuario no válido');
      layoutContainer.innerHTML = '<p style="color: red;">Error: Usuario no válido.</p>';
      return;
    }

    // El perfil debería haber sido creado por index.js si no existía
    // Pero validamos su existencia de todas formas
    if (!perfil) {
      console.error('❌ perfil no válido después de procesamiento');
      layoutContainer.innerHTML = '<p style="color: red;">Error: No se pudo obtener perfil válido.</p>';
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

      <form id="onboardingForm" aria-label="Formulario de onboarding para aspirantes">
        <div class="form-group">
          <label for="intereses">Intereses principales *</label>
          <textarea id="intereses" name="intereses" required placeholder="Describe tus áreas de interés..."></textarea>
        </div>

        <div class="form-group">
          <label for="modalidad">Modalidad preferida *</label>
          <select id="modalidad" name="modalidad" required>
            <option value="">Selecciona una modalidad...</option>
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
            <option value="hibrida">Híbrida</option>
          </select>
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
    console.error('❌ Error en renderOnboarding (aspirante):', err);
    layoutContainer.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}

async function handleFormSubmit(e, supabase, userId, formError) {
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  // Validar campos obligatorios
  if (!data.intereses || !data.modalidad) {
    formError.textContent = 'Todos los campos son obligatorios.';
    return;
  }

  try {
    formError.textContent = '';

    // Preparar datos para actualizar perfil
    const updateData = {
      intereses: data.intereses,
      modalidad: data.modalidad,
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

    console.log('✅ Onboarding completado para aspirante');
    
    // Redirigir al dashboard normal
    window.location.href = 'dashboard.html';

  } catch (err) {
    console.error('❌ Error en handleFormSubmit:', err);
    formError.textContent = 'Error inesperado. Intenta de nuevo.';
  }
}
