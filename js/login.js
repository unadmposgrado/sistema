document.addEventListener('DOMContentLoaded', function () {
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
    const emailBasicRegex = /^\S+@\S+\.\S+$/;
    if (!emailBasicRegex.test(email)) {
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
      const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message || 'Credenciales incorrectas.');
        return;
      }

      // Guardar sesión o usuario para usar en dashboard
      window.localStorage.setItem('user', JSON.stringify(data.user));

      // Redirigir al dashboard
      window.location.href = 'dashboard.html';

    } catch (err) {
      console.error('Error en login:', err);
      setError('Error inesperado. Intenta de nuevo más tarde.');
    } finally {
      setProcessing(false);
    }
  });
});
