// js/dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1️⃣ Verificar sesión
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session?.user) {
      window.location.href = 'login.html';
      return;
    }

    const userId = session.user.id;
    console.log('Usuario logueado:', session.user);

    // 2️⃣ Esperar a que se cargue el navbar dinámico
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

    // 3️⃣ Configurar botón de logout si existe
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

    // 4️⃣ Traer datos del usuario desde la tabla "perfiles"
    const { data: perfilData, error: perfilError } = await window.supabaseClient
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (perfilError) {
      console.error('Error obteniendo datos del perfil:', perfilError);
      alert('No se pudieron cargar los datos del usuario.');
      return;
    }

    // 5️⃣ Inyectar datos en el HTML
    // Suponiendo que tu HTML tiene contenedores con estos IDs
    const nameElem = document.querySelector('.student-name');
    const programElem = document.querySelector('.program');
    const tutorElem = document.querySelector('.tutor'); // Por ahora puedes dejar vacío o estático

    if (nameElem) nameElem.textContent = `Bienvenido, ${perfilData.nombre}`;
    if (programElem) programElem.textContent = `Programa educativo: ${perfilData.grado || ''}`;
    if (tutorElem) tutorElem.textContent = `Tutor: ${perfilData.institucion || 'Por asignar'}`;

    // Opcional: podrías actualizar progreso y otros datos cuando tengas otras tablas

  } catch (err) {
    console.error('Error cargando dashboard:', err);
    window.location.href = 'login.html';
  }
});
