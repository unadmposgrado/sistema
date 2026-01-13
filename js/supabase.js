/*
  js/supabase.js
  Inicializa el cliente de Supabase de forma SÍNCRONA.
  Debe incluirse **después** del CDN: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  y **antes** de cualquier script que use `window.supabaseClient`.
*/
(function () {
  // REEMPLAZA con tus credenciales públicas
  const SUPABASE_URL = 'https://vhjuggrimwnceoczwckj.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoanVnZ3JpbXduY2VvY3p3Y2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMzU3NTUsImV4cCI6MjA4MzkxMTc1NX0.LznulBDztffgKXvCeIipLFFepXZLGF2TgZjy64_3lbU';

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('Supabase JS no está cargado o la URL del CDN es incorrecta. Asegúrate de incluir el CDN correctamente antes de este script.');
    return;
  }

  // Inicializa el cliente de forma síncrona
  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.supabaseClient = supabaseClient;
})();

  // Nota: por ahora no guardamos datos de perfil en Auth; esos campos adicionales
  // se almacenarán después en una tabla de perfil desde otro flujo.