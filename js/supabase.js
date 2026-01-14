(function () {
  // Tus credenciales públicas
  const SUPABASE_URL = 'https://vhjuggrimwnceoczwckj.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoanVnZ3JpbXduY2VvY3p3Y2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMzU3NTUsImV4cCI6MjA4MzkxMTc1NX0.LznulBDztffgKXvCeIipLFFepXZLGF2TgZjy64_3lbU';

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('Supabase JS no está cargado. Revisa el CDN.');
    return;
  }

  // Inicializa cliente
  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.supabaseClient = supabaseClient;

  // Detectar sesión activa (cuando usuario confirma correo)
  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    console.log('[Supabase] Auth event:', event, session);

    if (event === 'SIGNED_IN' && session?.user) {
      const user = session.user;

      // Insertar o actualizar perfil usando datos guardados en localStorage
      const { data, error } = await supabaseClient
        .from('perfiles')
        .upsert({
          id: user.id,
          email: user.email,
          nombre: localStorage.getItem('pending_nombre') || null,
          edad: localStorage.getItem('pending_edad') || null,
          institucion: localStorage.getItem('pending_institucion') || null,
          grado: localStorage.getItem('pending_grado') || null
        })
        .select();

      if (error) {
        console.error('Error insertando perfil tras confirmación:', error);
      } else {
        console.log('Perfil insertado o actualizado:', data);
        // Limpiar almacenamiento temporal
        localStorage.removeItem('pending_nombre');
        localStorage.removeItem('pending_edad');
        localStorage.removeItem('pending_institucion');
        localStorage.removeItem('pending_grado');
      }

      // Redirigir al dashboard
      window.location.href = 'dashboard.html';
    }
  });
})();