/**
 * modules/admin/metricas.js
 *
 * Módulo para métricas e informes institucionales.
 * Responsabilidades:
 * - Mostrar estadísticas de la institución
 * - Generar reportes analíticos
 * - Permitir exportación de datos
 */

const initializeAdminMetricsModule = async () => {
  const demoStore = window.demoStore;

  // Obtener usuario actual
  const { data: { user }, error: userError } = await demoStore.auth.getUser();
  if (userError || !user) {
    console.error('❌ Error obteniendo usuario en módulo métricas');
    return;
  }

  const metricsDisplay = document.getElementById('metricsDisplay');
  const metricsRange = document.getElementById('metricsRange');
  const exportReportBtn = document.getElementById('exportReportBtn');

  console.log('📈 Módulo de MÉTRICAS inicializado');

  if (!metricsDisplay) {
    console.warn('⚠️ Elemento #metricsDisplay no encontrado');
    return;
  }

  // ============================================================
  // CARGAR MÉTRICAS
  // ============================================================
  async function loadMetrics(range = 'month') {
    try {
      metricsDisplay.innerHTML = `
        <div style="padding: 2rem;">
          <p>📊 Métricas para: ${range}</p>
          <p>Gráficos y estadísticas (en desarrollo)</p>
        </div>
      `;
    } catch (err) {
      console.error('❌ Error cargando métricas:', err);
    }
  }

  // Listener para cambiar rango
  if (metricsRange) {
    metricsRange.addEventListener('change', (e) => {
      loadMetrics(e.target.value);
    });
  }

  // Listener para exportar reporte
  if (exportReportBtn) {
    exportReportBtn.addEventListener('click', () => {
      alert('Función "Exportar reporte" en desarrollo');
    });
  }

  // Cargar métricas iniciales
  await loadMetrics('month');
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAdminMetricsModule, { once: true });
} else {
  initializeAdminMetricsModule();
}
