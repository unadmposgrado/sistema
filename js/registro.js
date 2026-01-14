const PENDING_PROFILE_KEY = 'pending_profile_v1';

document.addEventListener('DOMContentLoaded', function () {
  try {
    console.log('registro.js cargado');
    const form = document.getElementById('registroForm');
    if (!form) return;

    const nombreInput = document.getElementById('nombre');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('passwordConfirm');
    const edadInput = document.getElementById('edad');
    const institucionInput = document.getElementById('institucion');
    const gradoInput = document.getElementById('grado');
    const errorEl = document.getElementById('passwordError');
    const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('input[type="submit"]');

    function setError(msg) {
      if (!errorEl) return;
      errorEl.textContent = msg || '';
      errorEl.classList.toggle('show', Boolean(msg));
    }

    function clearError() { setError(''); }
    function setProcessing(isProcessing) {
      if (submitBtn) submitBtn.disabled = Boolean(isProcessing);
      form.setAttribute('aria-busy', isProcessing ? 'true' : 'false');
    }

    async function handleSubmit(e) {
      e.preventDefault();
      clearError();

      const nombre = nombreInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const passwordConfirm = passwordConfirmInput.value;
      const edadRaw = edadInput.value.trim();
      const edad = edadRaw ? parseInt(edadRaw, 10) : null;
      const institucion = institucionInput.value.trim();
      const grado = gradoInput.value.trim();

      // Validaciones
      if (!nombre) return setError('El nombre es obligatorio.');
      if (!email) return setError('El correo es obligatorio.');
      if (!password) return setError('La contraseña es obligatoria.');
      if (password !== passwordConfirm) return setError('Las contraseñas no coinciden.');
      if (edadRaw && (Number.isNaN(edad) || edad < 0)) return setError('La edad debe ser un número válido.');

      setProcessing(true);

      try {
        const { data, error } = await window.supabaseClient.auth.signUp({
          email,
          password
        });

        if (error) return setError(error.message || 'Error al registrarse.');

        // Guardar datos adicionales en localStorage para usar luego
        localStorage.setItem('pending_nombre', nombre);
        localStorage.setItem('pending_edad', edadRaw || '');
        localStorage.setItem('pending_institucion', institucion);
        localStorage.setItem('pending_grado', grado);

        alert('Registro enviado. Revisa tu correo para confirmar la cuenta.');

        // No redirigir aquí, se redirige automáticamente al confirmar el correo
      } catch (err) {
        console.error('Error en signUp:', err);
        setError('Ocurrió un error al registrarse. Intenta más tarde.');
      } finally {
        setProcessing(false);
      }
    }

    form.addEventListener('submit', handleSubmit);
  } catch (err) {
    console.error('Inicialización de registro falló:', err);
  }
});
