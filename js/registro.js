document.addEventListener('DOMContentLoaded', () => {
  console.log('registro.js cargado');

  const form = document.getElementById('registroForm');
  if (!form) return;

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const passwordConfirmInput = document.getElementById('passwordConfirm');
  const errorEl = document.getElementById('passwordError');
  const submitBtn = form.querySelector('button[type="submit"]');

  function setError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg || '';
    errorEl.classList.toggle('show', Boolean(msg));
  }

  function setProcessing(isProcessing) {
    if (submitBtn) submitBtn.disabled = isProcessing;
    form.setAttribute('aria-busy', isProcessing ? 'true' : 'false');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setError('');

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;

    if (!email || !password) {
      setError('Correo y contraseña son obligatorios.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setProcessing(true);

    try {
      const { error } = await window.supabaseClient.auth.signUp({
        email,
        password
      });

      if (error) {
        setError(error.message);
        return;
      }

      alert('Registro exitoso. Revisa tu correo para confirmar tu cuenta.');
      form.reset();

    } catch (err) {
      console.error(err);
      setError('Error inesperado. Intenta más tarde.');
    } finally {
      setProcessing(false);
    }
  });
});