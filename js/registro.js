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
      // 1️⃣ Registrar en Auth
      const { data: signUpData, error: signUpError } = await window.supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://tu-sitio.vercel.app/dashboard.html' // <- tu URL real
        }
      });

      if (signUpError) throw signUpError;
      console.log('Usuario creado en Auth:', signUpData);

      // 2️⃣ Insertar en tabla perfiles usando el ID del usuario
      if (signUpData.user) {
        const { data: perfilData, error: perfilError } = await window.supabaseClient
          .from('perfiles')
          .insert([{
            id: signUpData.user.id, // ID vinculado al Auth
            email,
            nombre,
            edad: edad || null,
            institucion: institucion || null,
            grado: grado || null
          }]);

        if (perfilError) throw perfilError;
        console.log('Perfil insertado:', perfilData);
      }

      alert('Registro exitoso. Revisa tu correo para confirmar la cuenta.');

      // Opcional: limpiar el formulario
      form.reset();

    } catch (err) {
      console.error('Error en registro:', err);
      alert('Ocurrió un error: ' + err.message);
    }
  });
});