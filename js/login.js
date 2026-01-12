(function(){
  const VALID_EMAIL = 'posgradounadm@gmail.com';
  const VALID_PASSWORD = 'posgrado';

  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorBox = document.getElementById('loginError');

  function showError(msg){
    errorBox.textContent = msg;
    errorBox.classList.add('show');
  }
  function clearError(){
    errorBox.textContent = '';
    errorBox.classList.remove('show');
  }

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    clearError();
    const email = (emailInput.value || '').trim();
    const pwd = (passwordInput.value || '').trim();

    if(!email || !pwd){
      showError('Por favor completa ambos campos.');
      return;
    }

    // Si SUPABASE está disponible, usar la autenticación remota
    if (window.SUPABASE && typeof window.SUPABASE.signIn === 'function') {
      try {
        await window.SUPABASE.signIn({ email, password: pwd });
        window.location.href = 'usuario_unadm.html';
        return;
      } catch (err) {
        console.error(err);
        showError(err.message || 'Credenciales incorrectas. Intenta de nuevo.');
        return;
      }
    }

    // Fallback a credenciales locales (solo para desarrollo sin Supabase)
    if(email.toLowerCase() === VALID_EMAIL && pwd === VALID_PASSWORD){
      window.location.href = 'usuario_unadm.html';
      return;
    }

    showError('Credenciales incorrectas. Intenta de nuevo.');
    passwordInput.focus();
  });
})();