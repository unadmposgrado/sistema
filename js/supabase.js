(function () {
  const SUPABASE_URL = 'https://vhjuggrimwnceoczwckj.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoanVnZ3JpbXduY2VvY2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMzU3NTUsImV4cCI6MjA4MzkxMTc1NX0.LznulBDztffgKXvCeIipLFFepXZLGF2TgZjy64_3lbU';

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('Supabase JS no está cargado. Revisa el CDN.');
    return;
  }

  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.supabaseClient = supabaseClient;

  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    console.log('[Supabase] Auth event:', event, session);

    if (event === 'SIGNED_IN' && session?.user) {
      const user = session.user;

      // Leer datos extra del registro desde localStorage
      const nombre = localStorage.getItem('pending_nombre') || null;
      const edadRaw = localStorage.getItem('pending_edad');
      const edad = edadRaw ? parseInt(edadRaw, 10) : null;
      const institucion = localStorage.getItem('pending_institucion') || null;
      const grado = localStorage.getItem('pending_grado') || null;

      const profile = {
        id: user.id,
        email: user.email,
        nombre,
        edad,
        institucion,
        grado
      };

      try {
        const { data, error } = await supabaseClient
          .from('perfiles')
          .upsert([profile])
          .select();

        if (error) {
          console.error('Error insertando perfil tras confirmación:', error);
        } else {
          console.log('Perfil insertado o actualizado:', data);

          // Limpiar datos temporales
          localStorage.removeItem('pending_nombre');
          localStorage.removeItem('pending_edad');
          localStorage.removeItem('pending_institucion');
          localStorage.removeItem('pending_grado');
        }

        // Redirigir al dashboard
        window.location.href = 'dashboard.html';

      } catch (err) {
        console.error('Excepción insertando perfil tras confirmación:', err);
      }
    }
  });
})();
