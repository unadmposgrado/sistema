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

    // Guardar temporalmente datos para usar tras confirmación
    localStorage.setItem('pending_nombre', nombre);
    localStorage.setItem('pending_edad', edad || '');
    localStorage.setItem('pending_institucion', institucion || '');
    localStorage.setItem('pending_grado', grado || '');

    try {
      // Registrar usuario en Auth y guardar user_metadata como respaldo
      const signUpResult = await window.supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://sistema-gules-psi.vercel.app/dashboard.html', // tu URL real
          data: { nombre, edad: edad || null, institucion: institucion || null, grado: grado || null }
        }
      });

      if (signUpResult.error) {
        console.error('Error en signUp:', signUpResult.error);
        alert('Error al registrarse: ' + signUpResult.error.message);
        return;
      }

      const user = signUpResult.data?.user;
      console.log('Registro exitoso:', signUpResult.data);
      alert('Registro exitoso. Revisa tu correo para confirmar la cuenta.');

      // Intentar insertar perfil en la tabla 'perfiles' inmediatamente, antes de la confirmación
      if (user && user.id) {
        try {
          const edadInt = edad ? parseInt(edad, 10) : null;
          const { data: perfilData, error: perfilError } = await window.supabaseClient
            .from('perfiles')
            .upsert({
              id: user.id,
              email: user.email,
              nombre,
              edad: edadInt,
              institucion: institucion || null,
              grado: grado || null
            })
            .select();

          if (perfilError) {
            console.error('Error al insertar perfil antes de confirmar:', perfilError);
            // dejamos los datos en localStorage como respaldo
          } else {
            console.log('Perfil insertado o actualizado precocemente:', perfilData);
            // limpiar datos pendientes
            localStorage.removeItem('pending_nombre');
            localStorage.removeItem('pending_edad');
            localStorage.removeItem('pending_institucion');
            localStorage.removeItem('pending_grado');
          }
        } catch (err) {
          console.error('Error inesperado al insertar perfil:', err);
        }
      }

      // Limpiar formulario
      form.reset();

    } catch (err) {
      console.error('Error inesperado:', err);
      alert('Ocurrió un error inesperado.');
    }
  });
});