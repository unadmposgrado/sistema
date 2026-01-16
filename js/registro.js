document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registroForm');
  if (!form) return;

  const nombreInput = document.getElementById('nombre');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rolInput = document.getElementById('rol');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = nombreInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const rol = rolInput?.value || 'aspirante';

    if (!nombre || !email || !password) {
      alert('Nombre, correo y contraseña son obligatorios.');
      return;
    }

    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Registrando...';

    try {
      // Paso 1: Registrar usuario en Supabase Auth
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
            rol
          }
        }
      });

      if (error) throw error;

      // Paso 2: Insertar perfil en tabla 'perfiles'
      const userId = data.user.id;
      const { error: profileError } = await supabaseClient
        .from('perfiles')
        .insert([
          {
            id: userId,
            nombre,
            email,
            rol
          }
        ]);

      if (profileError) {
        console.error('❌ Error al insertar perfil:', profileError);
        alert('Aviso: El usuario fue registrado pero hubo un error al guardar el perfil. Por favor contacta al administrador.');
        throw profileError;
      }

      alert(
        'Registro exitoso.\n\n' +
        '1️⃣ Revisa tu correo para confirmar tu cuenta.\n' +
        '2️⃣ Luego inicia sesión.\n' +
        '3️⃣ Completa tu perfil en el primer acceso.'
      );

      form.reset();
      window.location.href = 'login.html';

    } catch (err) {
      console.error('❌ Error al registrar usuario:', err);

      let message = 'Ocurrió un error al registrar.';
      if (err.message?.includes('User already registered')) {
        message = 'Este correo ya está registrado.';
      }

      alert(message);

    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Registrarse';
    }
  });
});
