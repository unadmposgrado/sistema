document.addEventListener('DOMContentLoaded', async function () {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorBox = document.getElementById('loginError');
  const submitBtn = form.querySelector('button[type="submit"]');

  function setError(message) {
    if (!errorBox) return;
    errorBox.textContent = message || '';
    errorBox.classList.toggle('show', Boolean(message));
  }

  async function redirectToDashboard() {
    window.location.href = 'dashboard.html';
  }

  try {
    const { data: { session } } = await window.demoStore.auth.getSession();
    if (session?.user) {
      await redirectToDashboard();
      return;
    }
  } catch (error) {
    console.error('Error verificando la sesión local:', error);
    setError('No se pudo verificar la sesión local.');
  }

  document.querySelectorAll('[data-demo-email]').forEach(button => {
    button.addEventListener('click', () => {
      emailInput.value = button.dataset.demoEmail;
      passwordInput.value = 'posgrado';
      form.requestSubmit();
    });
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    setError('');
    if (submitBtn) submitBtn.disabled = true;
    form.setAttribute('aria-busy', 'true');

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Introduce un correo válido.');
      if (submitBtn) submitBtn.disabled = false;
      form.setAttribute('aria-busy', 'false');
      return;
    }
    if (!password) {
      setError('La contraseña es obligatoria.');
      if (submitBtn) submitBtn.disabled = false;
      form.setAttribute('aria-busy', 'false');
      return;
    }

    try {
      const { data, error } = await window.demoStore.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        setError('Correo o contraseña incorrectos. Usa una de las cuentas de simulación.');
        return;
      }
      await redirectToDashboard();
    } catch (error) {
      console.error('Error en el inicio de sesión local:', error);
      setError('No se pudo iniciar sesión. Intenta nuevamente.');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      form.setAttribute('aria-busy', 'false');
    }
  });
});
