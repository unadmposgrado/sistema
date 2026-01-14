document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registroForm');
  if (!form) return;

  const nombreInput = document.getElementById('nombre');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password'); // Debes agregar este input
  const edadInput = document.getElementById('edad');
  const institucionInput = document.getElementById('institucion');
  const gradoInput = document.getElementById('grado');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = nombreInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const edad = parseInt(edadInput.value) || null;
    const institucion = institucionInput.value.trim() || null;
    const grado = gradoInput.value.trim() || null;

    if (!nombre || !email || !password) {
      alert('Nombre, correo y contraseña son obligatorios.');
      return;
    }

    try {
      // 1️⃣ Crear usuario en Authentication
      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email,
        password,
  options: {
    emailRedirectTo: null,
    shouldCreateUser: true
  }
      });

      if (authError) throw authError;

      // 2️⃣ Guardar datos extra en tabla perfiles usando el id de Auth
      const { data, error } = await supabaseClient
        .from('perfiles')
        .upsert([
          {
            id: authData.user.id,
            nombre,
            email,
            edad,
            institucion,
            grado
          }
        ])
        .select();

      if (error) throw error;

      alert('Registro exitoso. ¡Bienvenido! Por favor inicia sesión.');
      form.reset();

      // Redirigir a login
      window.location.href = 'login.html';

    } catch (err) {
      console.error('Error al registrar usuario:', err);
      alert(err.message || 'Ocurrió un error al registrar tus datos.');
    }
  });
});
