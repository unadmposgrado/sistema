/* js/auth-redirect.js
 * Maneja la redirección tras confirmación por correo (tokens en fragmento o query)
 * - Detecta access_token / refresh_token en la URL
 * - Llama a supabase.auth.setSession(...) para establecer sesión
 * - Maneja errores (por ejemplo otp_expired) mostrando un aviso y limpiando la URL
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    if (!window.supabaseClient) return;

    // Si ya hay sesión activa, redirigir inmediatamente
    try {
      const { data: { session: currentSession } = {} } = await window.supabaseClient.auth.getSession();
      if (currentSession && currentSession.user) {
        window.location.href = 'dashboard.html';
        return;
      }
    } catch (e) {
      // Ignorar si la llamada falla; seguimos con la detección en URL
    }

    const hash = window.location.hash ? window.location.hash.slice(1) : '';
    const query = window.location.search ? window.location.search.slice(1) : '';
    const params = new URLSearchParams(hash || query);

    const error = params.get('error') || params.get('error_description') || params.get('error_code');
    if (error) {
      console.warn('[auth-redirect] auth error:', error);
      // Mostrar mensaje discreto en la página (si existe body)
      try {
        const msg = document.createElement('div');
        msg.className = 'auth-redirect-message';
        msg.setAttribute('role', 'alert');
        msg.style.margin = '1rem';
        msg.textContent = 'Error en la confirmación: ' + error + '. Si persiste, solicita reenvío del correo.';
        document.body.insertBefore(msg, document.body.firstChild);
      } catch (e) {
        // si no se puede manipular DOM, solo logueamos
      }
      // Limpiar fragmento para evitar mensajes repetidos
      history.replaceState({}, document.title, location.pathname + location.search);
      return;
    }

    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (access_token && refresh_token) {
      try {
        // Establecer la sesión en Supabase
        const { error: setErr } = await window.supabaseClient.auth.setSession({ access_token, refresh_token });
        if (setErr) {
          console.error('[auth-redirect] setSession error', setErr);
          return;
        }

        // Limpiar URL y redirigir a dashboard
        history.replaceState({}, document.title, location.pathname + location.search);
        window.location.href = 'dashboard.html';
      } catch (e) {
        console.error('[auth-redirect] exception setSession', e);
      }
    }

  } catch (err) {
    console.error('[auth-redirect] unexpected error', err);
  }
});