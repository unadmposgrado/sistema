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

  form.addEventListener('submit', function(e){
    e.preventDefault();
    clearError();
    const email = (emailInput.value || '').trim();
    const pwd = (passwordInput.value || '').trim();

    if(!email || !pwd){
      showError('Por favor completa ambos campos.');
      return;
    }

    if(email.toLowerCase() === VALID_EMAIL && pwd === VALID_PASSWORD){
      // credenciales correctas: redirigir a usuario_unadm.html
      window.location.href = 'usuario_unadm.html';
      return;
    }

    showError('Credenciales incorrectas. Intenta de nuevo.');
    passwordInput.focus();
  });
})();