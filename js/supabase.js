// supabase.js
(() => {
  const SUPABASE_URL = 'https://vhjuggrimwnceoczwckj.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoanVnZ3JpbXduY2VvY3p3Y2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMzU3NTUsImV4cCI6MjA4MzkxMTc1NX0.LznulBDztffgKXvCeIipLFFepXZLGF2TgZjy64_3lbU';

  // Verifica que la librería esté cargada
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('Supabase JS no está cargado. Revisa el CDN.');
    return; // Esto está permitido dentro de la IIFE
  }

  // Inicializa cliente
  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.supabaseClient = supabaseClient;

  // Escuchar cambios de sesión (SIGN_IN tras confirmar correo)
  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      const user = session.user;

      const nombre = localStorage.getItem('pending_nombre');
      const edad = localStorage.getItem('pending_edad');
      const institucion = localStorage.getItem('pending_institucion');
      const grado = localStorage.getItem('pending_grado');

      if (nombre) {
        try {
          const { data, error } = await supabaseClient
            .from('perfiles')
            .upsert({
              id: user.id,
              email: user.email,
              nombre,
              edad: edad || null,
              institucion: institucion || null,
              grado: grado || null
            })
            .select();

          if (error) {
            console.error('Error al actualizar perfil tras confirmación:', error);
          } else {
            console.log('Perfil insertado o actualizado:', data);
            localStorage.removeItem('pending_nombre');
            localStorage.removeItem('pending_edad');
            localStorage.removeItem('pending_institucion');
            localStorage.removeItem('pending_grado');
          }

          window.location.href = 'dashboard.html';
        } catch (err) {
          console.error('Error inesperado al guardar perfil:', err);
        }
      }
    }
  });
})();