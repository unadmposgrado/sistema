/**
 * usuarios.api.js
 *
 * Capa de datos para gestión de usuarios.
 * Responsabilidades:
 * - Consultar tabla perfiles en Supabase
 * - Actualizar rol y onboarding_completo
 * - Manejar errores de Supabase
 */

const supabaseClient = window.supabaseClient;

/**
 * Obtener todos los perfiles de usuarios
 * @returns {Promise<Array>} Array de perfiles
 */
export async function obtenerPerfiles() {
  try {
    const { data, error } = await supabaseClient
      .from('perfiles')
      .select('id, nombre, email, rol, onboarding_completo')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('❌ Error obteniendo perfiles:', error);
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }

    return data || [];
  } catch (err) {
    console.error('❌ Error en obtenerPerfiles:', err);
    throw err;
  }
}

/**
 * Cambiar el rol de un usuario
 * Al cambiar rol, se fuerza automáticamente onboarding_completo = false
 * @param {string} userId - ID del usuario
 * @param {string} nuevoRol - Nuevo rol (monitor, estudiante, facilitador, admin)
 * @returns {Promise<Object>} Perfil actualizado
 */
export async function cambiarRol(userId, nuevoRol) {
  try {
    const { data, error } = await supabaseClient
      .from('perfiles')
      .update({
        rol: nuevoRol,
        onboarding_completo: false, // Forzar reinicio de onboarding
      })
      .eq('id', userId)
      .select('id, nombre, email, rol, onboarding_completo');

    if (error) {
      console.error('❌ Error cambiando rol:', error);
      throw new Error(`Error al cambiar rol: ${error.message}`);
    }

    return data?.[0] || null;
  } catch (err) {
    console.error('❌ Error en cambiarRol:', err);
    throw err;
  }
}

/**
 * Resetear el onboarding de un usuario
 * Solo actualiza onboarding_completo = false
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Perfil actualizado
 */
export async function resetearOnboarding(userId) {
  try {
    const { data, error } = await supabaseClient
      .from('perfiles')
      .update({
        onboarding_completo: false,
      })
      .eq('id', userId)
      .select('id, nombre, email, rol, onboarding_completo');

    if (error) {
      console.error('❌ Error reseteando onboarding:', error);
      throw new Error(`Error al resetear onboarding: ${error.message}`);
    }

    return data?.[0] || null;
  } catch (err) {
    console.error('❌ Error en resetearOnboarding:', err);
    throw err;
  }
}

/**
 * Filtrar y buscar perfiles
 * @param {Array} perfiles - Array de perfiles
 * @param {string} searchTerm - Término de búsqueda (nombre o email)
 * @param {string} rolFiltro - Rol a filtrar (opcional)
 * @returns {Array} Perfiles filtrados
 */
export function filtrarPerfiles(perfiles, searchTerm, rolFiltro) {
  let resultado = [...perfiles];

  // Filtrar por búsqueda (nombre o email)
  if (searchTerm?.trim()) {
    const termino = searchTerm.toLowerCase();
    resultado = resultado.filter(
      (perfil) =>
        (perfil.nombre?.toLowerCase().includes(termino) ||
          perfil.email?.toLowerCase().includes(termino))
    );
  }

  // Filtrar por rol
  if (rolFiltro?.trim()) {
    resultado = resultado.filter((perfil) => perfil.rol === rolFiltro);
  }

  return resultado;
}
