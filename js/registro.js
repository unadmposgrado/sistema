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

    try {
      // 1️⃣ Crear usuario en Auth
      const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://tu-sitio.vercel.app/dashboard.html'
        }
      });

      if (signUpError) throw signUpError;

      // 2️⃣ Insertar perfil inmediatamente con email_verified = false
      if (signUpData.user) {
        const { data: perfilData, error: perfilError } = await supabaseClient
          .from('perfiles')
          .upsert({
            id: signUpData.user.id,
            email,
            nombre,
            edad: edad || null,
            institucion: institucion || null,
            grado: grado || null,
            email_verified: false
          })
          .select();

        if (perfilError) throw perfilError;
        console.log('Perfil creado:', perfilData);
      }

      alert('Registro exitoso. Revisa tu correo para confirmar la cuenta.');
      form.reset();

    } catch (err) {
      console.error('Error en registro:', err);
      alert('Ocurrió un error: ' + err.message);
    }
  });
});