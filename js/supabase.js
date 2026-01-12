/* js/supabase.js
 * Módulo para conectar la app a Supabase y manejar registro/inicio de sesión.
 * Instrucciones:
 * - Agrega en tus páginas HEAD dos meta tags con tu configuración de Supabase:
 *   <meta name="supabase-url" content="https://xxx.supabase.co">
 *   <meta name="supabase-key" content="public-anon-key">
 * - Incluye este script como módulo en las páginas que lo necesiten:
 *   <script type="module" src="js/supabase.js"></script>
 * - Ajusta `PROFILE_TABLE` con el nombre de la tabla donde guardarás datos de perfil (por defecto: "profiles").
 *
 * Este archivo: inicializa el cliente, exporta funciones y conecta automáticamente
 * con los formularios de registro y login si existen en la página.
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const PROFILE_TABLE = 'profiles'; // Cambia si tu tabla tiene otro nombre

function getConfigFromMeta() {
  const urlMeta = document.querySelector('meta[name="supabase-url"]');
  const keyMeta = document.querySelector('meta[name="supabase-key"]');
  return {
    url: urlMeta ? urlMeta.content.trim() : null,
    key: keyMeta ? keyMeta.content.trim() : null,
  };
}

// Inicializa supabase usando meta tags, o valores reemplazables aquí
const meta = getConfigFromMeta();
const SUPABASE_URL = meta.url || 'TU_SUPABASE_URL_AQUI';
const SUPABASE_ANON_KEY = meta.key || 'TU_SUPABASE_ANON_KEY_AQUI';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.startsWith('TU_SUPABASE')) {
  console.warn('Supabase: URL o KEY no configurados. Añade <meta name="supabase-url"> y <meta name="supabase-key"> en tu HTML o edita js/supabase.js');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exponer helpers globalmente para que otros scripts no-modulares los usen
window.SUPABASE = {
  client: supabase,
  async signUp({ email, password, profile = {} } = {}) {
    // Crea usuario en Auth
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    // si se creó el user (puede requerir confirmación por email), guardamos perfil
    const userId = data.user ? data.user.id : null;
    if (userId && Object.keys(profile).length) {
      const { error: insertErr } = await supabase.from(PROFILE_TABLE).insert([{ id: userId, email, ...profile }]);
      if (insertErr) throw insertErr;
    }
    return data;
  },

  async signIn({ email, password } = {}) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getProfile(userId) {
    const { data, error } = await supabase.from(PROFILE_TABLE).select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
  },

  getUser() {
    return supabase.auth.getUser();
  }
};

// Helpers UI
function showMessage(el, msg, isError = true) {
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('show', Boolean(msg));
}

// Conectar formulario de registro si existe
function attachRegisterHandler() {
  const form = document.querySelector('form[aria-label="Formulario de registro"]');
  if (!form) return;
  const email = form.querySelector('#email');
  const password = form.querySelector('#password');
  const passwordConfirm = form.querySelector('#passwordConfirm');
  const nombre = form.querySelector('#nombre');
  const edad = form.querySelector('#edad');
  const institucion = form.querySelector('#institucion');
  const grado = form.querySelector('#grado');
  const errorBox = document.getElementById('passwordError') || document.createElement('div');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showMessage(errorBox, '');

    if (!email || !password || !passwordConfirm) {
      showMessage(errorBox, 'Faltan campos obligatorios.');
      return;
    }

    if (password.value !== passwordConfirm.value) {
      showMessage(errorBox, 'Las contraseñas no coinciden.');
      return;
    }

    try {
      const profile = {
        nombre: nombre?.value || null,
        edad: edad?.value || null,
        institucion: institucion?.value || null,
        grado: grado?.value || null,
      };

      await window.SUPABASE.signUp({ email: email.value.trim(), password: password.value, profile });

      // Registro exitoso: informar y redirigir / limpiar
      showMessage(errorBox, 'Registro enviado. Revisa tu correo si requiere confirmación.', false);
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1200);
    } catch (err) {
      console.error(err);
      showMessage(errorBox, err.message || 'Ocurrió un error al registrarse.');
    }
  });
}

// Conectar formulario de login si existe
function attachLoginHandler() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  const email = form.querySelector('#email');
  const password = form.querySelector('#password');
  const errorBox = document.getElementById('loginError') || document.createElement('div');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showMessage(errorBox, '');

    if (!email.value || !password.value) {
      showMessage(errorBox, 'Por favor completa ambos campos.');
      return;
    }

    try {
      await window.SUPABASE.signIn({ email: email.value.trim(), password: password.value });
      // Login exitoso
      window.location.href = 'usuario_unadm.html';
    } catch (err) {
      console.error(err);
      showMessage(errorBox, err.message || 'Credenciales incorrectas.');
    }
  });
}

// Ejecutar enlazadores después de DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    attachRegisterHandler();
    attachLoginHandler();
  });
} else {
  attachRegisterHandler();
  attachLoginHandler();
}

export default window.SUPABASE;
