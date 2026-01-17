document.addEventListener('DOMContentLoaded', async function () {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorBox = document.getElementById('loginError');
  const submitBtn = form.querySelector('button[type="submit"]');

  function setError(msg) {
    if (!errorBox) return;
    errorBox.textContent = msg || '';
    errorBox.classList.toggle('show', Boolean(msg));
  }

  function clearError() {
    setError('');
  }

  function setProcessing(isProcessing) {
    if (submitBtn) submitBtn.disabled = Boolean(isProcessing);
    form.setAttribute('aria-busy', isProcessing ? 'true' : 'false');
  }

  /* =========================================================
     Si ya hay sesión activa → redirigir según rol
  ========================================================= */
  try {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (session?.user) {
      await redirectByRole(session.user.id);
      return;
    }
  } catch (err) {
    console.error('Error verificando sesión existente:', err);
  }

  /* =========================================================
     Submit del formulario
  ========================================================= */
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearError();
    setProcessing(true);

    const email = (emailInput.value || '').trim();
    const password = passwordInput.value || '';

    if (!email) {
      setError('El correo es obligatorio.');
      setProcessing(false);
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setError('Introduce un correo válido.');
      setProcessing(false);
      return;
    }

    if (!password) {
      setError('La contraseña es obligatoria.');
      setProcessing(false);
      return;
    }

    try {
      const { data, error } =
        await window.supabaseClient.auth.signInWithPassword({ email, password });

      if (error) {
        // Mensajes personalizados (los tuyos, intactos)
        let friendlyMessage = 'Credenciales incorrectas.';

        if (error.message?.includes('Email not confirmed')) {
          friendlyMessage = 'Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada.';
        } else if (error.message?.includes('Invalid login credentials')) {
          friendlyMessage = 'Correo o contraseña incorrectos.';
        } else if (error.message?.includes('User not found')) {
          friendlyMessage = 'No existe una cuenta con ese correo.';
        }

        setError(friendlyMessage);
        return;
      }

      // Login correcto → redirigir por rol
      await redirectByRole(data.user.id);

    } catch (err) {
      console.error('Error en login:', err);
      setError('Error inesperado. Intenta de nuevo más tarde.');
    } finally {
      setProcessing(false);
    }
  });

  /* =========================================================
     Redirección centralizada por rol
  ========================================================= */
  async function redirectByRole(userId) {
    try {
      // Validación defensiva: verificar que userId exista
      if (!userId) {
        throw new Error('❌ Error crítico: No se pudo obtener el ID del usuario.');
      }

      // Consultar perfil con maybeSingle() para evitar error 406
      const { data: perfil, error } = await window.supabaseClient
        .from('perfiles')
        .select('rol, onboarding_completo')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error obteniendo rol:', error);
        setError('No se pudo determinar el tipo de usuario.');
        return;
      }

      if (!perfil) {
        console.error('❌ Perfil no encontrado para usuario:', userId);
        setError('Tu perfil no está registrado. Contacta al administrador.');
        return;
      }

      // 2️⃣ Si es estudiante sin onboarding, crear registro en tabla estudiantes
      if (perfil.rol === 'estudiante' && perfil.onboarding_completo === false) {
        const { data: estudianteExistente, error: errorVerificacion } = await window.supabaseClient
          .from('estudiantes')
          .select('perfil_id')
          .eq('perfil_id', userId)
          .maybeSingle();

        if (errorVerificacion) {
          console.warn('⚠️ Error verificando registro de estudiante:', errorVerificacion);
        }

        // Si no existe, insertar el registro
        if (!estudianteExistente) {
          const { error: errorInsercion } = await window.supabaseClient
            .from('estudiantes')
            .insert([{
              perfil_id: userId
            }]);

          if (errorInsercion) {
            console.warn('⚠️ Error creando registro en estudiantes:', errorInsercion);
            // No interrumpimos el login si falla esta inserción
          }
        }
      }

      // ✅ NUEVA ARQUITECTURA: Todos los roles usan dashboard.html
      // El orquestador (dashboard.js) carga el layout correspondiente
      if (perfil.rol === 'monitor') {
        window.location.href = 'dashboard.html';  // Usa dashboard genérico
      } else if (perfil.rol === 'estudiante') {
        window.location.href = 'dashboard.html';  // Usa dashboard genérico
      } else if (perfil.rol === 'formador') {
        window.location.href = 'dashboard.html';  // Usa dashboard genérico
      } else if (perfil.rol === 'admin') {
        window.location.href = 'dashboard.html';  // Usa dashboard genérico
      } else {
        // Fallback seguro
        window.location.href = 'dashboard.html';
      }

    } catch (err) {
      console.error('❌ Error redirigiendo por rol:', err);
      setError('Error al redirigir al dashboard.');
    }
  }
});
