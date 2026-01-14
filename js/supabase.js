(function () {
  const SUPABASE_URL = 'https://vhjuggrimwnceoczwckj.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoanVnZ3JpbXduY2VvY3p3Y2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMzU3NTUsImV4cCI6MjA4MzkxMTc1NX0.LznulBDztffgKXvCeIipLFFepXZLGF2TgZjy64_3lbU';

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('Supabase JS no está cargado. Revisa el CDN.');
    return;
  }

  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.supabaseClient = supabaseClient;

  // Manejar cambios de estado de autenticación (útil al volver desde el link de confirmación)
  if (supabaseClient && supabaseClient.auth && typeof supabaseClient.auth.onAuthStateChange === 'function') {
    supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log('[supabase] onAuthStateChange', event, session);
      // Si hay sesión activa y estamos en la raíz, redirigimos al dashboard
      try {
        if (session && session.user) {
          if (location.pathname === '/' || location.pathname.endsWith('index.html')) {
            window.location.href = 'dashboard.html';
          }
        }
      } catch (e) {
        console.warn('[supabase] onAuthStateChange handler error', e);
      }
    });
  }
})();
