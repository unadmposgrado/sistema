/* js/registro.js
 * Flujo mínimo de registro con Supabase Auth.
 * - Valida campos básicos (email, password, confirmación)
 * - Registra en Auth: `auth.signUp({ email, password })`
 * - NO inserta ni actualiza perfiles desde el frontend (se espera trigger en Supabase)
 */

document.addEventListener('DOMContentLoaded', function () {
  try {
    console.log('registro.js cargado');
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
      // Asegurarse de que el mensaje sea visible (CSS usa .show para display:block)
      errorEl.classList.toggle('show', Boolean(msg));
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

    let submitHandlerAttached = false;

    async function handleSubmit(e) {
      e.preventDefault();
      clearError();

      try {
        const nombre = nombreInput ? (nombreInput.value || '').trim() : '';
        const email = emailInput ? (emailInput.value || '').trim() : '';
        const password = passwordInput ? (passwordInput.value || '') : '';
        const passwordConfirm = passwordConfirmInput ? (passwordConfirmInput.value || '') : '';

        // Validaciones básicas (email, password, confirmación)
        if (!email) {
          setError('El correo es obligatorio.');
          return;
        }
        const emailBasicRegex = /^\S+@\S+\.\S+$/;
        if (!emailBasicRegex.test(email)) {
          setError('Introduce un correo válido.');
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

        // Llamada mínima a Supabase Auth: solo signUp(email, password)
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
        if (error) {
          setError(error.message || 'Error al registrarse.');
          return;
        }

        // Éxito: mostrar mensaje claro al usuario. NO redirigir ni guardar perfil desde el frontend.
        alert('Registro exitoso. Revisa tu correo para confirmar tu cuenta.');

      } catch (err) {
        console.error(err);
        setError('Error inesperado. Intenta de nuevo más tarde.');
      } finally {
        setProcessing(false);
      }
    }
      } catch (err) {
        console.error(err);
        setError('Error inesperado. Intenta de nuevo más tarde.');
      } finally {
        setProcessing(false);
      }
    }

    form.addEventListener('submit', handleSubmit);
    submitHandlerAttached = true;




  } catch (err) {
    console.error('Inicialización de registro falló:', err);
  }
});