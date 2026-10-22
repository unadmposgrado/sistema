/**
 * modules/facilitador/reportes.js
 *
 * Módulo para generación de reportes y análisis.
 * Responsabilidades:
 * - Mostrar estadísticas de progreso grupal
 * - Mostrar métricas por estudiante
 * - Permitir exportación de datos
 */

const initializeFacilitatorReportsModule = async () => {
  const demoStore = window.demoStore;

  // Obtener usuario actual
  const { data: { user }, error: userError } = await demoStore.auth.getUser();
  if (userError || !user) {
    console.error('❌ Error obteniendo usuario en módulo reportes');
    return;
  }

  const reportsContent = document.getElementById('reportsContent');
  const reportTabs = document.querySelectorAll('.report-tab');

  console.log('📊 Módulo de REPORTES inicializado');

  if (!reportsContent) {
    console.warn('⚠️ Elemento #reportsContent no encontrado');
    return;
  }

  // ============================================================
  // MANEJO DE TABS DE REPORTES
  // ============================================================
  reportTabs.forEach(tab => {
    tab.addEventListener('click', async () => {
      reportTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const tabName = tab.dataset.tab;
      loadReportContent(tabName);
    });
  });

  function loadReportContent(tabName) {
    let content = '';

    switch (tabName) {
      case 'progress':
        content = '<p>Cargando gráficos de progreso...</p>';
        break;
      case 'metrics':
        content = '<p>Cargando métricas del grupo...</p>';
        break;
      case 'export':
        content = `
          <p>Selecciona el formato de exportación:</p>
          <button class="btn-secondary">Exportar a CSV</button>
          <button class="btn-secondary">Exportar a PDF</button>
        `;
        break;
      default:
        content = '<p>Reportes no disponibles</p>';
    }

    reportsContent.innerHTML = content;
  }

  // Cargar primer tab por defecto
  loadReportContent('progress');
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFacilitatorReportsModule, { once: true });
} else {
  initializeFacilitatorReportsModule();
}
