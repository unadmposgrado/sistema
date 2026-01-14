# Supabase Auth — notas y recomendaciones (Resumen)

## Resumen rápido
- La tabla `auth.users` **es interna** y la gestiona **automáticamente Supabase**.
- **No** debes crear ni modificar manualmente `auth.users` desde SQL. Los usuarios se registran ahí cuando se hace `signUp` y inicialmente quedan en estado **unconfirmed** hasta que validan el correo.

## Configuración de URLs (IMPORTANTE)
- En el panel de Supabase → Authentication → Settings:
  - `Site URL` debe apuntar a la URL pública de producción (ejemplo): `https://sistema-gules-psi.vercel.app/`.
  - `Redirect URLs` debe incluir la URL pública de producción y, en desarrollo, las URLs locales que uses (ej.: `http://127.0.0.1:5500/`, `http://localhost:5500/`).
  - **No** uses `127.0.0.1` como redirect en producción; quítalo de `Redirect URLs` cuando despliegues.

## Flujo de confirmación
1. Al registrar un usuario con `signUp(email, password)` (o `signUp(..., { emailRedirectTo })`) Supabase envía un email con un enlace.
2. El enlace redirige a la URL configurada (y puede incluir tokens en el fragmento `#access_token=...&refresh_token=...` o parámetros `?error=...`).
3. La aplicación debe leer esos tokens y **establecer la sesión en el cliente** (ej.: `auth.setSession` o mediante `getSessionFromUrl`/`onAuthStateChange`) para que el usuario quede autenticado automáticamente.

## Recomendaciones implementadas en este repositorio
- `registro.js` ahora realiza únicamente `auth.signUp({ email, password })` (no guarda perfiles ni usa workarounds con localStorage). Asegúrate de que en Supabase la `Site URL` y `Redirect URLs` estén correctamente configuradas a tu dominio de producción (Vercel).
- Se agregó `js/auth-redirect.js` para detectar tokens en la URL, llamar a `supabase.auth.setSession(...)`, limpiar la URL y redirigir al `dashboard.html`.
- `js/supabase.js` registra un `onAuthStateChange` para reaccionar a cambios de sesión y, cuando corresponde, redirigir al dashboard.

## Diagnóstico de errores comunes
- `#error=access_denied&error_code=otp_expired` suele indicar que el enlace venció **o** que la URL de redirección en Supabase no coincide con la URL a la que fue dirigida la petición. Verifica:
  - Que la URL en el enlace (y en `emailRedirectTo`) corresponda a una `Redirect URL` permitida en Supabase.
  - Que la hora del servidor/cliente no sea incorrecta (casos raros de expiración).

---
Si quieres, puedo hacer una comprobación guiada: 1) revisar los Redirect URLs en tu proyecto Supabase (tú me los copias) o 2) generar instrucciones paso a paso para configurar en el panel de Supabase y probar la confirmación en producción en Vercel.
