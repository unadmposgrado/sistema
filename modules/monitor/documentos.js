/**
 * modules/monitor/documentos.js
 *
 * Módulo para gestión de documentos del monitor.
 * Responsabilidades:
 * - Cargar documentos previamente subidos
 * - Gestionar subida de nuevos documentos a Supabase Storage
 * - Mostrar estado de validación de documentos
 */

document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabaseClient;

  // Obtener usuario actual
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('❌ Error obteniendo usuario en módulo documentos');
    return;
  }

  const userId = user.id;
  const uploadedFilesBox = document.getElementById('uploadedFiles');
  const uploadCards = document.querySelectorAll('.upload-card');

  if (!uploadedFilesBox || uploadCards.length === 0) {
    console.warn('⚠️ Elementos de documentos no encontrados en el DOM');
    return;
  }

  console.log('📄 Módulo de DOCUMENTOS inicializado');

  // ============================================================
  // LISTAR DOCUMENTOS SUBIDOS
  // ============================================================
  async function loadUploadedFiles() {
    try {
      const { data: files, error } = await supabase
        .storage
        .from('monitores')
        .list(userId);

      if (error) {
        console.error('❌ Error listando archivos:', error);
        return;
      }

      if (!files || files.length === 0) {
        uploadedFilesBox.classList.add('empty');
        uploadedFilesBox.innerHTML = '<p>Aún no has subido ningún archivo.</p>';
        return;
      }

      uploadedFilesBox.classList.remove('empty');
      uploadedFilesBox.innerHTML = files
        .map(file => `
          <div class="file-item">
            <span class="file-name">${file.name}</span>
            <span class="file-date">${new Date(file.created_at).toLocaleDateString('es-ES')}</span>
            <button class="btn-secondary" data-filename="${file.name}">Descargar</button>
          </div>
        `)
        .join('');

      // Agregar listeners para descargar archivos
      uploadedFilesBox.querySelectorAll('button[data-filename]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const filename = btn.dataset.filename;
          await downloadFile(filename, userId);
        });
      });
    } catch (err) {
      console.error('❌ Error en loadUploadedFiles:', err);
    }
  }

  // ============================================================
  // DESCARGAR ARCHIVO
  // ============================================================
  async function downloadFile(filename, userId) {
    try {
      const { data, error } = await supabase
        .storage
        .from('monitores')
        .download(`${userId}/${filename}`);

      if (error) throw error;

      // Crear enlace de descarga
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('❌ Error descargando archivo:', err);
      alert('Error al descargar el archivo');
    }
  }

  // ============================================================
  // SUBIDA DE ARCHIVOS
  // ============================================================
  uploadCards.forEach(card => {
    const type = card.dataset.type;
    const fileInput = card.querySelector('input[type="file"]');
    const uploadBtn = card.querySelector('.upload-btn');
    const cancelBtn = card.querySelector('.cancel-btn');

    if (!fileInput || !uploadBtn || !cancelBtn) {
      console.warn(`⚠️ Elementos faltantes en tarjeta: ${type}`);
      return;
    }

    // Botón cancelar
    cancelBtn.addEventListener('click', () => {
      fileInput.value = '';
    });

    // Botón subir
    uploadBtn.addEventListener('click', async () => {
      const file = fileInput.files[0];
      if (!file) {
        alert('Selecciona un archivo primero');
        return;
      }

      // Validar tamaño (máximo 10 MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('El archivo es muy grande (máximo 10 MB)');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${type}.${fileExt}`;

      uploadBtn.disabled = true;
      const originalText = uploadBtn.textContent;
      uploadBtn.textContent = 'Subiendo...';

      try {
        const { error: uploadError } = await supabase
          .storage
          .from('monitores')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        alert('✅ Archivo subido correctamente');
        fileInput.value = '';
        await loadUploadedFiles();
      } catch (err) {
        console.error('❌ Error en subida:', err);
        alert(`Error al subir el archivo: ${err.message}`);
      } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = originalText;
      }
    });
  });

  // Cargar archivos al inicializar
  await loadUploadedFiles();
});
