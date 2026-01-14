document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registroForm');
  if (!form) return;

  const nombreInput = document.getElementById('nombre');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const passwordConfirmInput = document.getElementById('passwordConfirm');
  const edadInput = document.getElementById('edad');
  const institucionInput = document.getElementById('institucion');
  const gradoInput = document.getElementById('grado');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = nombreInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;
    const edad = edadInput.value.trim();
    const institucion = institucionInput.value.trim();
    const grado = gradoInput.value.trim();

    if (!nombre || !email || !password) {
      alert('Nombre, correo y contraseña son obligatorios.');
      return;
    }

    if (password !== passwordConfirm) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    // Guardar temporalmente datos extra en localStorage
    localStorage.setItem('pending_nombre', nombre);
    localStorage.setItem('pending_edad', edad || '');
    localStorage.setItem('pending_institucion', institucion || '');
    localStorage.setItem('pending_grado', grado || '');

    try {
      const { data, error } = await window.supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://tu-sitio.vercel.app/dashboard.html' // <- Cambia por tu URL de Vercel
        }
      });

      if (error) {
        console.error('Error en signUp:', error);
        alert('Error al registrarse: ' + error.message);
        return;
      }

      console.log('Registro exitoso:', data);
      alert('Registro exitoso. Revisa tu correo para confirmar la cuenta.');
    } catch (err) {
      console.error('Error inesperado:', err);
      alert('Ocurrió un error inesperado.');
    }
  });
});