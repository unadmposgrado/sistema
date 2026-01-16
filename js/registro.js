document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registroForm');
  if (!form) return;

  const nombreInput = document.getElementById('nombre');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const edadInput = document.getElementById('edad');
  const institucionInput = document.getElementById('institucion');
  const gradoInput = document.getElementById('grado');
  const rolInput = document.getElementById('rol');
  const matriculaContainer = document.getElementById('matricula-container');
  const matriculaInput = document.getElementById('matricula');

  // Mostrar/ocultar matrícula según rol
  rolInput.addEventListener('change', () => {
    if (rolInput.value === 'estudiante') {
      matriculaContainer.style.display = 'block';
      matriculaInput.required = true;
    } else {
      matriculaContainer.style.display = 'none';
      matriculaInput.required = false;
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = nombreInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const edad = parseInt(edadInput.value) || null;
    const institucion = institucionInput.value.trim() || null;
    const grado = gradoInput.value.trim() || null;
    const rol = rolInput.value || 'aspirante';
    const matricula = rol === 'estudiante' ? matriculaInput.value.trim() : null;

    if (!nombre || !email || !password) {
      alert('Nombre, correo y contraseña son obligatorios.');
      return;
    }

    try {
      // 1️⃣ Crear usuario en Authentication
      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { shouldCreateUser: true }
      });
      if (authError) throw authError;

      // 2️⃣ Guardar datos extra en tabla perfiles
      const { data, error } = await supabaseClient
        .from('perfiles')
        .upsert([{
          id: authData.user.id,
          nombre,
          email,
          edad,
          institucion,
          grado,
          rol,
          matricula
        }])
        .select();
      if (error) throw error;

      alert('Registro exitoso. ¡Bienvenido! Por favor revisa tu correo y después inicia sesión.');
      form.reset();

      // Redirigir a login
      window.location.href = 'login.html';

    } catch (err) {
      console.error('Error al registrar usuario:', err);
      alert(err.message || 'Ocurrió un error al registrar tus datos.');
    }
  });
});
