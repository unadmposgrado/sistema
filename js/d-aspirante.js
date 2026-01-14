document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabaseClient;

  const welcomeName = document.getElementById('welcomeName');
  const studyLevel = document.getElementById('studyLevel');
  const uploadedFilesBox = document.getElementById('uploadedFiles');

  /* =========================
     OBTENER USUARIO
  ========================= */
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.error('No hay usuario autenticado');
    return;
  }

  // Mostrar nombre (ajusta según tu tabla perfiles)
  welcomeName.textContent = `Bienvenido, ${user.email}`;
  studyLevel.textContent = 'Licenciatura'; // placeholder

  /* =========================
     LISTAR ARCHIVOS (placeholder)
  ========================= */
  function renderEmptyFiles() {
    uploadedFilesBox.classList.add('empty');
    uploadedFilesBox.innerHTML = '<p>Aún no has subido ningún archivo.</p>';
  }

  renderEmptyFiles();

  /* =========================
     SUBIDA DE ARCHIVOS
  ========================= */
  document.querySelectorAll('.upload-card').forEach(card => {
    const type = card.dataset.type;
    const fileInput = card.querySelector('input[type="file"]');
    const uploadBtn = card.querySelector('.upload-btn');
    const cancelBtn = card.querySelector('.cancel-btn');

    cancelBtn.addEventListener('click', () => {
      fileInput.value = '';
    });

    uploadBtn.addEventListener('click', async () => {
      const file = fileInput.files[0];
      if (!file) {
        alert('Selecciona un archivo primero');
        return;
      }

      const filePath = `${user.id}/${type}.${file.name.split('.').pop()}`;

      uploadBtn.disabled = true;
      uploadBtn.textContent = 'Subiendo...';

      const { error: uploadError } = await supabase
        .storage
        .from('aspirantes')
        .upload(filePath, file, { upsert: true });

      uploadBtn.disabled = false;
      uploadBtn.textContent = 'Cargar';

      if (uploadError) {
        console.error(uploadError);
        alert('Error al subir el archivo');
        return;
      }

      alert('Archivo subido correctamente');
      fileInput.value = '';
    });
  });
});
