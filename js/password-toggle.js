(function(){
  // Toggle password visibility and basic matching validation
  const toggles = Array.from(document.querySelectorAll('.toggle-password'));
  toggles.forEach(btn => {
    const targetId = btn.dataset.target;
    const input = document.getElementById(targetId);
    if(!input) return;

    btn.addEventListener('click', () => {
      const visible = input.type === 'text';
      input.type = visible ? 'password' : 'text';
      btn.setAttribute('aria-pressed', (!visible).toString());
      btn.setAttribute('aria-label', input.type === 'text' ? 'Ocultar contraseña' : 'Mostrar contraseña');
      // update icon (open eye vs closed)
      setIcon(btn, input.type === 'text');
    });
  });

  function setIcon(btn, visible) {
    if(visible) {
      // ojo abierto
      btn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 5c-7 0-11 6.5-11 7s4 7 11 7 11-6.5 11-7-4-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/><circle cx="12" cy="12" r="3"/></svg>';
    } else {
      // ojo cerrado (con slash)
      btn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 5c-7 0-11 6.5-11 7s4 7 11 7 11-6.5 11-7-4-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/><path d="M2 2l20 20" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
    }
  }

  // Initialize icons to closed eye (false)
  toggles.forEach(btn => setIcon(btn, false));

  // Validate passwords match on submit
  const form = document.querySelector('.form-container form');
  const pass = document.getElementById('password');
  const passConfirm = document.getElementById('passwordConfirm');
  const passwordError = document.getElementById('passwordError');

  function showError(msg){
    if(!passwordError) return;
    passwordError.textContent = msg;
    passwordError.classList.add('show');
  }
  function clearError(){
    if(!passwordError) return;
    passwordError.textContent = '';
    passwordError.classList.remove('show');
    if(passConfirm) passConfirm.removeAttribute('aria-invalid');
  }

  if(form && pass && passConfirm) {
    form.addEventListener('submit', function(e){
      clearError();
      if(pass.value !== passConfirm.value) {
        e.preventDefault();
        showError('Las contraseñas no coinciden.');
        passConfirm.setAttribute('aria-invalid', 'true');
        passConfirm.focus();
      }
    });

    pass.addEventListener('input', clearError);
    passConfirm.addEventListener('input', clearError);
  }
})();