/**
 * modules/admin/contenido.js
 *
 * Módulo para gestión de contenido del sistema.
 * Responsabilidades:
 * - Gestionar programas educativos
 * - Gestionar asignaturas/cursos
 * - Gestionar módulos y temas
 */

const initializeAdminContentModule = async () => {
  const demoStore = window.demoStore;

  // Obtener usuario actual
  const { data: { user }, error: userError } = await demoStore.auth.getUser();
  if (userError || !user) {
    console.error('❌ Error obteniendo usuario en módulo contenido');
    return;
  }

  const contentArea = document.getElementById('contentArea');
  const contentTabs = document.querySelectorAll('.content-tab');
  const addContentBtn = document.getElementById('addContentBtn');

  console.log('📚 Módulo de CONTENIDO inicializado');

  if (!contentArea) {
    console.warn('⚠️ Elemento #contentArea no encontrado');
    return;
  }

  // ============================================================
  // MANEJO DE TABS DE CONTENIDO
  // ============================================================
  contentTabs.forEach(tab => {
    tab.addEventListener('click', async () => {
      contentTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const tabName = tab.dataset.tab;
      await loadContentTab(tabName);
    });
  });

  async function loadContentTab(tabName) {
    let content = '';

    try {
      switch (tabName) {
        case 'programs':
          content = '<p>Gestión de programas educativos (en desarrollo)</p>';
          break;
        case 'courses':
          content = '<p>Gestión de asignaturas (en desarrollo)</p>';
          break;
        case 'modules':
          content = '<p>Gestión de módulos y temas (en desarrollo)</p>';
          break;
        default:
          content = '<p>Contenido no disponible</p>';
      }
      contentArea.innerHTML = content;
    } catch (err) {
      console.error('❌ Error cargando contenido:', err);
      contentArea.innerHTML = '<p>Error al cargar contenido.</p>';
    }
  }

  // Listener para agregar contenido
  if (addContentBtn) {
    addContentBtn.addEventListener('click', () => {
      alert('Función "Agregar contenido" en desarrollo');
    });
  }

  // Cargar primer tab por defecto
  await loadContentTab('programs');
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAdminContentModule, { once: true });
} else {
  initializeAdminContentModule();
}
