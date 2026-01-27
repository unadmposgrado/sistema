/**
 * js/footer.js
 * Carga el footer en todas las páginas
 */

document.addEventListener('DOMContentLoaded', function() {
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    fetch('footer.html')
      .then(response => response.text())
      .then(html => {
        footerPlaceholder.innerHTML = html;
      })
      .catch(error => {
        console.error('Error cargando el footer:', error);
      });
  }
});
