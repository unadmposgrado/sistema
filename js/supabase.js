/*
  js/supabase.js
  Inicializa el cliente de Supabase (versión UMD desde CDN) y expone
  window.supabaseClient para que otros scripts (no-modulares) lo usen.

  RECUERDA: coloca tus credenciales públicas aquí (no en meta tags).
*/
(function () {
  // TODO: reemplaza con tus credenciales públicas
  const SUPABASE_URL = 'https://vhjuggrimwnceoczwckj.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoanVnZ3JpbXduY2VvY3p3Y2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMzU3NTUsImV4cCI6MjA4MzkxMTc1NX0.LznulBDztffgKXvCeIipLFFepXZLGF2TgZjy64_3lbU';

  if (!window.supabase || !window.supabase.createClient) {
    console.error('Supabase JS no está cargado. Asegúrate de incluir el CDN antes de este script.');
    return;
  }

  // Inicializa y expone el cliente como global
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Nota: por ahora no guardamos datos de perfil en Auth; esos campos adicionales
  // se almacenarán después en una tabla de perfil desde otro flujo.
})();
