document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registroForm');
  if (!form) return;

  const nombreInput = document.getElementById('nombre');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const passwordConfirmInput = document.getElementById('passwordConfirm');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = nombreInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;

    if (!nombre || !email || !password || !passwordConfirm) {
      alert('Todos los campos son obligatorios.');
      return;
    }

    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== passwordConfirm) {
      alert('Las contraseñas no coinciden.');
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
            nombre
          }
        }
      });

      // Validación defensiva: Detectar email ya registrado o error en signUp
      if (error) {
        if (
          error.message?.toLowerCase().includes('already') ||
          error.message?.toLowerCase().includes('registered')
        ) {
          throw new Error('Este correo ya está registrado. Si ya tienes una cuenta, inicia sesión.');
        } else {
          throw error;
        }
      }

      // Validación defensiva: Verificar que data.user existe
      if (!data || !data.user) {
        throw new Error('Este correo ya está registrado. Si ya tienes una cuenta, inicia sesión.');
      }

      if (!data.user.id) {
        throw new Error('❌ Error crítico: No se pudo obtener el ID del usuario registrado.');
      }

      // Paso 3: Crear/actualizar perfil en tabla 'perfiles' usando upsert()
      const userId = data.user.id;
      const { error: profileError } = await supabaseClient
        .from('perfiles')
        .upsert([
          {
            id: userId,
            nombre,
            email,
            rol: 'estudiante',
            onboarding_completo: false
          }
        ], { onConflict: 'id' });

      if (profileError) {
        console.error('❌ Error al crear/actualizar perfil:', profileError);
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

      let message = 'Ocurrió un error al registrar. Intenta más tarde.';
      if (err.message?.includes('Este correo ya está registrado')) {
        message = err.message;
      } else if (err.message?.toLowerCase().includes('user already registered')) {
        message = 'Este correo ya está registrado. Si ya tienes una cuenta, inicia sesión.';
      }

      alert(message);

    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Registrarse';
    }
  });
});
