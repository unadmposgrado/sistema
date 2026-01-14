// supabase.js
(() => {
  const SUPABASE_URL = 'https://vhjuggrimwnceoczwckj.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoanVnZ3JpbXduY2VvY3p3Y2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMzU3NTUsImV4cCI6MjA4MzkxMTc1NX0.LznulBDztffgKXvCeIipLFFepXZLGF2TgZjy64_3lbU';

  // Verifica que la librería esté cargada
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('Supabase JS no está cargado. Revisa el CDN.');
    return;
  }

  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.supabaseClient = supabaseClient;

  // Detectar sesión tras confirmación de correo
  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      const user = session.user;

      try {
        // Actualizar email_verified a true
        const { data, error } = await supabaseClient
          .from('perfiles')
          .update({ email_verified: true })
          .eq('id', user.id)
          .select();

        if (error) {
          console.error('Error al actualizar email_verified:', error);
        } else {
          console.log('Email verificado:', data);
        }

        // Redirigir al dashboard
        window.location.href = 'dashboard.html';

      } catch (err) {
        console.error('Error inesperado al actualizar verificación:', err);
      }
    }
  });
})();