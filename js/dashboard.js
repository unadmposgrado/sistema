// js/dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Verificar sesión
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session?.user) {
      window.location.href = 'login.html';
      return;
    }

    console.log('Usuario logueado:', session.user);

    // Esperar a que se cargue el navbar dinámico
    const navPlaceholder = document.getElementById('nav-placeholder');
    const waitForNav = () => new Promise(resolve => {
      if (navPlaceholder.innerHTML.trim() !== '') resolve();
      else {
        const observer = new MutationObserver(() => {
          if (navPlaceholder.innerHTML.trim() !== '') {
            observer.disconnect();
            resolve();
          }
        });
        observer.observe(navPlaceholder, { childList: true });
      }
    });
    await waitForNav();

    // Configurar botón de logout si existe
    const logoutBtn = navPlaceholder.querySelector('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        try {
          await window.supabaseClient.auth.signOut();
          localStorage.removeItem('user');
          window.location.href = 'index.html';
        } catch (err) {
          console.error('Error cerrando sesión:', err);
          alert('No se pudo cerrar sesión. Intenta nuevamente.');
        }
      });
    }

  } catch (err) {
    console.error('Error cargando dashboard:', err);
    window.location.href = 'login.html';
  }
});