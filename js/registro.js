document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registroForm');
  if (!form) return;

  const nombreInput = document.getElementById('nombre');
  const emailInput = document.getElementById('email');
  const edadInput = document.getElementById('edad');
  const institucionInput = document.getElementById('institucion');
  const gradoInput = document.getElementById('grado');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = nombreInput.value.trim();
    const email = emailInput.value.trim();
    const edad = parseInt(edadInput.value) || null;
    const institucion = institucionInput.value.trim() || null;
    const grado = gradoInput.value.trim() || null;

    if (!nombre || !email) {
      alert('Nombre y correo son obligatorios.');
      return;
    }

    try {
      const { data, error } = await supabaseClient
        .from('perfiles')
        .insert([
          {
            nombre,
            email,
            edad,
            institucion,
            grado
          }
        ])
        .select();

      if (error) throw error;

      alert('Registro exitoso. ¡Bienvenido!');
      form.reset();

      // Opcional: redirigir al dashboard o página de bienvenida
      window.location.href = 'dashboard.html';

    } catch (err) {
      console.error('Error al insertar perfil:', err);
      alert('Ocurrió un error al registrar tus datos.');
    }
  });
});
