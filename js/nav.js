(function(){
  const placeholder = document.getElementById('nav-placeholder');
  if(!placeholder) return;

  const useLogged = placeholder.dataset.logged === 'true';
  const fileToLoad = useLogged ? 'nav-logged.html' : 'nav.html';

  fetch(fileToLoad)
    .then(res => {
      if(!res.ok) throw new Error('No se pudo cargar ' + fileToLoad);
      return res.text();
    })
    .then(html => {
      placeholder.innerHTML = html;

      // Marcar enlace activo (por nombre de fichero)
      const current = (location.pathname.split('/').pop() || 'index.html');
      const links = placeholder.querySelectorAll('a[href]');
      links.forEach(a => {
        const href = a.getAttribute('href') || '';
        const hrefFile = href.split('/').pop();
        if(hrefFile === current) a.classList.add('active');
      });

      // Si se cargó la versión para usuarios autenticados, inicializar menú de perfil
      if(useLogged){
        const profileBtn = placeholder.querySelector('.profile-btn');
        const profileMenu = placeholder.querySelector('.profile-menu');
        if(profileBtn && profileMenu){
          profileBtn.addEventListener('click', (e) => {
            const expanded = profileBtn.getAttribute('aria-expanded') === 'true';
            profileBtn.setAttribute('aria-expanded', (!expanded).toString());
            profileMenu.classList.toggle('show', !expanded);
            profileMenu.setAttribute('aria-hidden', expanded.toString());
            if(!expanded){
              // focus to first menu item when opened
              const first = profileMenu.querySelector('[role="menuitem"]');
              if(first) setTimeout(()=> first.focus(), 0);
            }
          });

          // Close menu on outside click
          document.addEventListener('click', (e) => {
            if(!placeholder.contains(e.target)){
              profileMenu.classList.remove('show');
              profileBtn.setAttribute('aria-expanded', 'false');
              profileMenu.setAttribute('aria-hidden', 'true');
            }
          });

          // Close on Escape
          document.addEventListener('keydown', (e) => {
            if(e.key === 'Escape'){
              profileMenu.classList.remove('show');
              profileBtn.setAttribute('aria-expanded', 'false');
              profileMenu.setAttribute('aria-hidden', 'true');
              profileBtn.focus();
            }
          });
        }
      }
    })
    .catch(err => console.error('Error cargando la cabecera:', err));
})();