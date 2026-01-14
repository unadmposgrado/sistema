/* js/login.js
 * Login usando exclusivamente Supabase Auth v2.
 * - Espera DOMContentLoaded
 * - Valida campos
 * - Usa window.supabaseClient.auth.signInWithPassword()
 * - Muestra errores en #loginError
 * - Redirige a dashboard.html en caso de éxito
 */

document.addEventListener('DOMContentLoaded', function () {
  try {
    const form = document.getElementById('loginForm');
    if (!form) return; // salir silenciosamente si no existe

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorBox = document.getElementById('loginError');
    const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('input[type="submit"]');

    function setError(msg) {
      if (!errorBox) return;
      errorBox.textContent = msg || '';
      errorBox.classList.toggle('show', Boolean(msg));
    }

    function clearError() {
      setError('');
    }

    function setProcessing(isProcessing) {
      try {
        if (submitBtn) submitBtn.disabled = Boolean(isProcessing);
        form.setAttribute('aria-busy', isProcessing ? 'true' : 'false');
      } catch (e) {
        console.error('Error actualizando estado de procesamiento', e);
      }
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearError();

      try {
        const email = emailInput ? (emailInput.value || '').trim() : '';
        const password = passwordInput ? (passwordInput.value || '') : '';

        // Validaciones
        if (!email) {
          setError('El correo es obligatorio.');
          return;
        }
        // validación básica de formato de email
        const emailBasicRegex = /^\S+@\S+\.\S+$/;
        if (!emailBasicRegex.test(email)) {
          setError('Introduce un correo válido.');
          return;
        }
        if (!password) {
          setError('La contraseña es obligatoria.');
          return;
        }

        // Verificar cliente Supabase
        if (!window.supabaseClient || !window.supabaseClient.auth || typeof window.supabaseClient.auth.signInWithPassword !== 'function') {
          setError('Cliente Supabase no disponible. Contacta al administrador.');
          return;
        }

        setProcessing(true);

        // Llamada a Supabase Auth v2
        let result;
        try {
          result = await window.supabaseClient.auth.signInWithPassword({ email, password });
        } catch (err) {
          console.error('Error llamando a signInWithPassword:', err);
          setError('Error de conexión con el servicio de autenticación. Intenta más tarde.');
          return;
        }

        const error = result && result.error;
        const data = result && result.data;

        if (error) {
          // Mensaje de error proveniente de Supabase
          setError(error.message || 'Credenciales incorrectas.');
          return;
        }

        // Autenticación exitosa -> redirigir al dashboard
        window.location.href = 'dashboard.html';
        return;
      } catch (err) {
        console.error('Error en submit de login:', err);
        setError('Error inesperado. Intenta de nuevo más tarde.');
      } finally {
        setProcessing(false);
      }
    });
  } catch (err) {
    console.error('Inicialización de login falló:', err);
  }
});