(function () {
  const placeholder = document.getElementById('nav-placeholder');
  if (!placeholder) return;

  const useLogged = placeholder.dataset.logged === 'true';
  const fileToLoad = useLogged ? 'nav-logged.html' : 'nav.html';

  fetch(fileToLoad)
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar ' + fileToLoad);
      return res.text();
    })
    .then(async html => {
      placeholder.innerHTML = html;

      // Marcar enlace activo
      const current = (location.pathname.split('/').pop() || 'index.html');
      const links = placeholder.querySelectorAll('a[href]');
      links.forEach(a => {
        const hrefFile = a.getAttribute('href')?.split('/').pop();
        if (hrefFile === current) a.classList.add('active');
      });

      if (!useLogged) return;

      // 🔐 Usuario autenticado
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session?.user) return;

      // 🎭 Obtener rol desde perfiles
      const { data: perfil, error } = await supabaseClient
        .from('perfiles')
        .select('rol')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error obteniendo rol:', error);
        return;
      }

      const role = perfil?.rol || 'monitor';

      const profileMenu = placeholder.querySelector('.profile-menu');
      const profileBtn = placeholder.querySelector('.profile-btn');

      if (!profileMenu || !profileBtn) return;

      // 🧱 Construcción del menú por rol
      let menuHTML = '';

      if (role === 'monitor') {
        menuHTML = `
          <a href="dashboard.html" role="menuitem">Inicio</a>
          <a href="#" id="logoutBtn" role="menuitem">Cerrar sesión</a>
        `;
      }

      if (role === 'estudiante') {
        menuHTML = `
          <a href="dashboard.html" role="menuitem">Inicio</a>
          <a href="#" id="logoutBtn" role="menuitem">Cerrar sesión</a>
        `;
      }

      if (role === 'facilitador') {
        menuHTML = `
          <a href="dashboard.html" role="menuitem">Inicio</a>
          <a href="#" id="logoutBtn" role="menuitem">Cerrar sesión</a>
        `;
      }

      if (role === 'admin') {
        menuHTML = `
          <a href="dashboard.html" role="menuitem">Inicio</a>
          <a href="#" id="logoutBtn" role="menuitem">Cerrar sesión</a>
        `;
      }

      profileMenu.innerHTML = menuHTML;

      // 🧠 Interacción menú
      profileBtn.addEventListener('click', () => {
        const expanded = profileBtn.getAttribute('aria-expanded') === 'true';
        profileBtn.setAttribute('aria-expanded', (!expanded).toString());
        profileMenu.classList.toggle('show', !expanded);
        profileMenu.setAttribute('aria-hidden', expanded.toString());
      });

      document.addEventListener('click', (e) => {
        if (!placeholder.contains(e.target)) {
          profileMenu.classList.remove('show');
          profileBtn.setAttribute('aria-expanded', 'false');
          profileMenu.setAttribute('aria-hidden', 'true');
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          profileMenu.classList.remove('show');
          profileBtn.setAttribute('aria-expanded', 'false');
          profileMenu.setAttribute('aria-hidden', 'true');
          profileBtn.focus();
        }
      });

      // 🚪 Logout
      const logoutBtn = profileMenu.querySelector('#logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
          await supabaseClient.auth.signOut();
          window.location.href = 'index.html';
        });
      }
    })
    .catch(err => console.error('Error cargando la cabecera:', err));
})();
