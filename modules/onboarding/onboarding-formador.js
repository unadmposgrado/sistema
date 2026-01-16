/**
 * modules/onboarding/onboarding-formador.js
 *
 * Módulo de onboarding para formadores
 * Campos: area, nivel_academico, tipo_contrato
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

      <form id="onboardingForm" aria-label="Formulario de onboarding para formadores">
        <div class="form-group">
          <label for="area">Área de especialización *</label>
          <input id="area" name="area" type="text" required placeholder="Ej: Matemáticas, Programación...">
        </div>

        <div class="form-group">
          <label for="nivel_academico">Nivel académico *</label>
          <select id="nivel_academico" name="nivel_academico" required>
            <option value="">Selecciona tu nivel...</option>
            <option value="licenciatura">Licenciatura</option>
            <option value="maestria">Maestría</option>
            <option value="doctorado">Doctorado</option>
            <option value="especialidad">Especialidad</option>
          </select>
        </div>

        <div class="form-group">
          <label for="tipo_contrato">Tipo de contrato *</label>
          <select id="tipo_contrato" name="tipo_contrato" required>
            <option value="">Selecciona tipo de contrato...</option>
            <option value="tiempo_completo">Tiempo completo</option>
            <option value="tiempo_parcial">Tiempo parcial</option>
            <option value="temporal">Temporal</option>
            <option value="freelance">Freelance</option>
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
    console.error('❌ Error en renderOnboarding (formador):', err);
    layoutContainer.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
  }
}

async function handleFormSubmit(e, supabase, userId, formError) {
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  // Validar campos obligatorios
  if (!data.area || !data.nivel_academico || !data.tipo_contrato) {
    formError.textContent = 'Todos los campos son obligatorios.';
    return;
  }

  try {
    formError.textContent = '';

    // Preparar datos para actualizar perfil
    const updateData = {
      area: data.area,
      nivel_academico: data.nivel_academico,
      tipo_contrato: data.tipo_contrato,
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

    console.log('✅ Onboarding completado para formador');
    
    // Redirigir al dashboard normal
    window.location.href = 'dashboard.html';

  } catch (err) {
    console.error('❌ Error en handleFormSubmit:', err);
    formError.textContent = 'Error inesperado. Intenta de nuevo.';
  }
}
