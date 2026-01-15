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
      const { data: perfil, error } = await window.supabaseClient
        .from('perfiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !perfil) {
        console.error('Error obteniendo rol:', error);
        setError('No se pudo determinar el tipo de usuario.');
        return;
      }

      // ✅ NUEVA ARQUITECTURA: Todos los roles usan dashboard.html
      // El orquestador (dashboard.js) carga el layout correspondiente
      if (perfil.role === 'aspirante') {
        window.location.href = 'dashboard.html';  // Usa dashboard genérico
      } else if (perfil.role === 'estudiante') {
        window.location.href = 'dashboard.html';  // Usa dashboard genérico
      } else if (perfil.role === 'formador') {
        window.location.href = 'dashboard.html';  // Usa dashboard genérico
      } else if (perfil.role === 'admin') {
        window.location.href = 'dashboard.html';  // Usa dashboard genérico
      } else {
        // Fallback seguro
        window.location.href = 'dashboard.html';
      }

    } catch (err) {
      console.error('Error redirigiendo por rol:', err);
      setError('Error al redirigir al dashboard.');
    }
  }
});
