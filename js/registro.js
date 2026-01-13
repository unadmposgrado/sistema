/* js/registro.js
 * Guardado automático de perfil tras registro en Supabase Auth.
 * - Valida campos obligatorios
 * - Registra en Auth (email, password)
 * - Si hay sesión: guarda/actualiza perfil en tabla `perfiles` (id = user.id)
 * - Si no hay sesión: guarda temporalmente en localStorage y lo reintenta en el login
 */

const PENDING_PROFILE_KEY = 'pending_profile_v1';

document.addEventListener('DOMContentLoaded', function () {
  try {
    const form = document.getElementById('registroForm');
    if (!form) return;

    const nombreInput = document.getElementById('nombre');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('passwordConfirm');
    const edadInput = document.getElementById('edad');
    const institucionInput = document.getElementById('institucion');
    const gradoInput = document.getElementById('grado');
    const errorEl = document.getElementById('passwordError');
    const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('input[type="submit"]');

    function setError(msg) {
      if (!errorEl) return;
      errorEl.textContent = msg || '';
    }

    function clearError() {
      setError('');
    }

    function setProcessing(isProcessing) {
      try {
        if (submitBtn) submitBtn.disabled = Boolean(isProcessing);
        form.setAttribute('aria-busy', isProcessing ? 'true' : 'false');
      } catch (e) {
        console.error('Error actualizando estado de procesamiento', e);
      }
    }

    function savePendingProfile(profile) {
      try {
        localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(profile));
      } catch (e) {
        console.warn('No se pudo guardar profile pendiente en localStorage', e);
      }
    }

    async function upsertProfile(profile) {
      // usa upsert para que no falle si ya existe
      return window.supabaseClient.from('perfiles').upsert([profile]);
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearError();

      try {
        const nombre = nombreInput ? (nombreInput.value || '').trim() : '';
        const email = emailInput ? (emailInput.value || '').trim() : '';
        const password = passwordInput ? (passwordInput.value || '') : '';
        const passwordConfirm = passwordConfirmInput ? (passwordConfirmInput.value || '') : '';
        const edadRaw = edadInput ? (edadInput.value || '') : '';
        const institucion = institucionInput ? (institucionInput.value || '').trim() : '';
        const grado = gradoInput ? (gradoInput.value || '').trim() : '';

        // Validaciones
        if (!nombre) {
          setError('El nombre es obligatorio.');
          return;
        }
        if (!email) {
          setError('El correo es obligatorio.');
          return;
        }
        if (!password) {
          setError('La contraseña es obligatoria.');
          return;
        }
        if (password !== passwordConfirm) {
          setError('Las contraseñas no coinciden.');
          return;
        }

        // validar edad si existe
        let edad = null;
        if (edadRaw) {
          const n = parseInt(edadRaw, 10);
          if (Number.isNaN(n) || n < 0) {
            setError('La edad debe ser un número válido.');
            return;
          }
          edad = n;
        }

        if (!window.supabaseClient || !window.supabaseClient.auth || typeof window.supabaseClient.auth.signUp !== 'function') {
          setError('Cliente Supabase no disponible. Comprueba la configuración.');
          return;
        }

        setProcessing(true);

        let result;
        try {
          result = await window.supabaseClient.auth.signUp({ email, password });
        } catch (err) {
          console.error('Error en signUp:', err);
          setError('Ocurrió un error al comunicarse con el servicio de autenticación. Intenta más tarde.');
          return;
        }

        const error = result && (result.error || (result.data && result.data.error));
        const data = result && (result.data || result);

        if (error) {
          setError(error.message || 'Error al registrarse.');
          return;
        }

        // Preparar perfil
        const userId = data && data.user && data.user.id ? data.user.id : null;
        const profile = {
          id: userId,
          email,
          nombre,
          edad,
          institucion,
          grado,
        };

        // Si existe sesión (usuario autenticado automáticamente), intentamos guardar inmediatamente
        if (data && data.session && userId) {
          try {
            const { error: upsertErr } = await upsertProfile(profile);
            if (upsertErr) {
              console.error('Error guardando perfil tras registro:', upsertErr);
              setError('Usuario creado, pero no se pudo guardar el perfil: ' + (upsertErr.message || upsertErr));
              return;
            }

            // Perfíl guardado, redirigir
            window.location.href = 'dashboard.html';
            return;
          } catch (err) {
            console.error('Excepción guardando perfil:', err);
            setError('Usuario creado, pero ocurrió un error guardando el perfil. Intenta iniciar sesión más tarde.');
            return;
          }
        }

        // Si no hay sesión, intentamos insertar (puede fallar por RLS). Si falla, guardamos en localStorage
        if (userId) {
          try {
            const { error: upsertErr } = await upsertProfile(profile);
            if (upsertErr) {
              // probable causa: no autenticación (sin sesión) o política RLS
              console.warn('No se pudo insertar perfil inmediatamente:', upsertErr);
              savePendingProfile(profile);
              setError('Registro recibido. Revisa tu correo para confirmar la cuenta. Tus datos se guardarán cuando inicies sesión.');
              return;
            }

            // Upsert sin error: redirigimos
            window.location.href = 'dashboard.html';
            return;
          } catch (err) {
            console.warn('Error al insertar perfil sin sesión:', err);
            savePendingProfile(profile);
            setError('Registro recibido. Revisa tu correo para confirmar la cuenta. Tus datos se guardarán cuando inicies sesión.');
            return;
          }
        }

        // No hay userId: informar y guardar pendiente por email
        savePendingProfile({ id: null, email, nombre, edad, institucion, grado });
        setError('Registro recibido. Revisa tu correo para confirmar la cuenta. Tus datos se guardarán cuando inicies sesión.');

      } catch (err) {
        console.error(err);
        setError('Error inesperado. Intenta de nuevo más tarde.');
      } finally {
        setProcessing(false);
      }
    });
  } catch (err) {
    console.error('Inicialización de registro falló:', err);
  }
});