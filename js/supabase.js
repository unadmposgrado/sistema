/*
  js/supabase.js
  Inicializa el cliente de Supabase (versión UMD desde CDN) y expone
  window.supabaseClient para que otros scripts (no-modulares) lo usen.

  RECUERDA: coloca tus credenciales públicas aquí (no en meta tags).
*/
(function () {
  // TODO: reemplaza con tus credenciales públicas
  const SUPABASE_URL = 'https://TU_SUPABASE_URL_AQUI';
  const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY_AQUI';

  if (!window.supabase || !window.supabase.createClient) {
    console.error('Supabase JS no está cargado. Asegúrate de incluir el CDN antes de este script.');
    return;
  }

  // Inicializa y expone el cliente como global
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Nota: por ahora no guardamos datos de perfil en Auth; esos campos adicionales
  // se almacenarán después en una tabla de perfil desde otro flujo.
})();
