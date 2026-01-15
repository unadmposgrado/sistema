# 📚 Arquitectura Modular - Sistema de Seguimiento al Aprendizaje

## 🎯 Resumen Ejecutivo

Este proyecto ha sido reorganizado bajo una **arquitectura modular y escalable** con un único punto de entrada (`dashboard.html`), layouts dinámicos por rol y módulos JavaScript independientes.

**Beneficios clave:**
- ✅ Código modular y mantenible
- ✅ Sin duplicación de HTML/CSS
- ✅ Escalabilidad para nuevos roles
- ✅ Separación clara de responsabilidades
- ✅ Funcionalidad completamente preservada

---

## 📁 Estructura de Carpetas

```
Sistema/
├── dashboard.html                    # 🎯 Punto de entrada ÚNICO para todos los roles
├── login.html                        # Inicio de sesión
├── registro.html                     # Registro de usuarios
├── index.html                        # Página principal pública
├── nav.html / nav-logged.html        # Headers parciales
│
├── layouts/                          # 🎨 Layouts HTML dinámicos por rol
│   ├── aspirante.html
│   ├── estudiante.html
│   ├── formador.html
│   └── admin.html
│
├── modules/                          # 🧩 Módulos JavaScript por rol
│   ├── aspirante/
│   │   ├── documentos.js            # Gestión de archivos
│   │   └── seguimiento.js           # Seguimiento de solicitud
│   ├── estudiante/
│   │   ├── progreso.js              # Avance académico
│   │   ├── evidencias.js            # Evidencias de aprendizaje
│   │   └── retroalimentacion.js     # Feedback del tutor
│   ├── formador/
│   │   ├── grupos.js                # Gestión de grupos
│   │   ├── evaluacion.js            # Evaluación de estudiantes
│   │   └── reportes.js              # Análisis y reportes
│   └── admin/
│       ├── usuarios.js              # Gestión de usuarios
│       ├── contenido.js             # Programas, asignaturas, módulos
│       └── metricas.js              # Estadísticas institucionales
│
├── css/
│   ├── base.css                     # 🎨 Estilos comunes (todos los roles)
│   ├── aspirante.css                # Estilos específicos de aspirante
│   ├── estudiante.css               # Estilos específicos de estudiante
│   ├── formador.css                 # Estilos específicos de formador
│   ├── admin.css                    # Estilos específicos de admin
│   └── style.css                    # [LEGADO - Se puede mantener o fusionar]
│
├── js/
│   ├── supabase.js                  # Configuración de Supabase
│   ├── dashboard.js                 # 🚀 ORQUESTADOR central
│   ├── nav.js                       # Navegación dinámica
│   ├── login.js                     # Lógica de autenticación
│   ├── registro.js                  # Lógica de registro
│   ├── carousel.js                  # [LEGADO]
│   ├── password-toggle.js           # [LEGADO]
│   └── d-aspirante.js               # [LEGADO - Ya no se usa]
│
├── img/                             # Imágenes y activos
├── docs/
│   ├── supabase-auth.md             # Documentación Supabase
│   └── ARQUITECTURA.md              # 👈 Este archivo
└── sql/                             # Scripts SQL para tablas
```

---

## 🚀 Flujo de Carga

### 1. **Usuario inicia sesión en `login.html`**
```
login.html → js/login.js
   ↓
[Credenciales válidas]
   ↓
redirectByRole(userId)
   ↓
window.location.href = 'dashboard.html'  ✅ PUNTO ÚNICO DE ENTRADA
```

### 2. **Dashboard.html carga el orquestador**
```
dashboard.html
   ↓
<script src="js/dashboard.js"></script>  [Orquestador central]
   ↓
1. Validar sesión de usuario
2. Obtener rol de Supabase (perfiles.role)
3. Cargar layout dinámicamente (layouts/{role}.html)
4. Cargar CSS específico (css/{role}.css)
5. Inicializar módulos del rol
   ↓
Interfaz completamente renderizada y funcional ✅
```

### 3. **Estructura de cada Layout**
```html
<!-- layouts/estudiante.html (ejemplo) -->
<div class="container">
  <h1 id="welcomeName">Bienvenido, usuario</h1>
  <!-- Contenido específico del rol -->
  <div id="progressBar"></div>
  <div id="inProgressCourses"></div>
  <div id="feedbackList"></div>
  <!-- Los módulos llenan estas secciones -->
</div>
```

### 4. **Módulos inicializan la funcionalidad**
```javascript
// modules/estudiante/progreso.js
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Obtener datos de Supabase
  // 2. Poblar elementos del DOM
  // 3. Configurar listeners
});
```

---

## 🎭 Roles Soportados

### **Aspirante** (pre-matrícula)
- **Layout:** `layouts/aspirante.html`
- **Módulos:** `documentos.js`, `seguimiento.js`
- **Acciones:**
  - Ver estado de solicitud
  - Subir documentos requeridos
  - Seguimiento de evaluación

### **Estudiante** (matriculado)
- **Layout:** `layouts/estudiante.html`
- **Módulos:** `progreso.js`, `evidencias.js`, `retroalimentacion.js`
- **Acciones:**
  - Ver progreso académico
  - Ver asignaturas inscritas
  - Ver evidencias y entregas
  - Recibir retroalimentación del tutor

### **Formador/Monitor** (instructor)
- **Layout:** `layouts/formador.html`
- **Módulos:** `grupos.js`, `evaluacion.js`, `reportes.js`
- **Acciones:**
  - Gestionar grupos asignados
  - Evaluar estudiantes
  - Ver reportes de progreso
  - Exportar datos

### **Administrador** (gestión institucional)
- **Layout:** `layouts/admin.html`
- **Módulos:** `usuarios.js`, `contenido.js`, `metricas.js`
- **Acciones:**
  - Crear y editar usuarios
  - Gestionar contenido (programas, asignaturas)
  - Ver métricas institucionales
  - Exportar reportes

---

## 💾 Base de Datos (Supabase)

### Tabla: `perfiles`
```sql
- id (UUID, PK)
- email (VARCHAR)
- nombre (VARCHAR)
- role (VARCHAR: 'aspirante'|'estudiante'|'formador'|'admin')
- matricula (VARCHAR, opcional para estudiantes)
- programaEducativo (VARCHAR)
- tutorAsignado (VARCHAR)
- institucion (VARCHAR)
- grado (VARCHAR)
- created_at (TIMESTAMP)
```

### Tablas adicionales (por implementar)
- `cursos` - Catálogo de asignaturas
- `inscripciones` - Registro de estudiantes en cursos
- `evaluaciones` - Calificaciones y retroalimentación
- `solicitudes_aspirantes` - Estado de solicitudes
- `reportes` - Datos analíticos

---

## 🔐 Autenticación y Autorización

### Flujo de autenticación
1. **Registro** (`registro.html` → `registro.js`)
   - Crear usuario en `auth.users` (Supabase Auth)
   - Crear perfil en tabla `perfiles` con rol `'aspirante'` por defecto

2. **Login** (`login.html` → `login.js`)
   - Validar credenciales con Supabase Auth
   - Obtener rol del usuario desde tabla `perfiles`
   - Redirigir a `dashboard.html` (para todos los roles)

3. **Dashboard** (`dashboard.js`)
   - Validar sesión (debe existir token de autenticación)
   - Cargar layout según rol
   - Inicializar módulos específicos

### Seguridad RLS (Row-Level Security)
Se recomienda configurar políticas RLS en Supabase para:
- ✅ Estudiantes solo vean sus propios datos
- ✅ Formadores solo vean sus grupos asignados
- ✅ Admins tengan acceso total

---

## 🧩 Cómo Agregar un Nuevo Rol

### Ejemplo: Agregar rol "Coordinador"

**1. Crear layout**
```html
<!-- layouts/coordinador.html -->
<div class="container">
  <h1 id="welcomeName">Bienvenido, coordinador</h1>
  <!-- Contenido específico -->
</div>
```

**2. Crear módulos**
```javascript
// modules/coordinador/supervision.js
// modules/coordinador/reportes.js
```

**3. Crear CSS**
```css
/* css/coordinador.css */
```

**4. Actualizar dashboard.js**
```javascript
// Agregar caso en switch:
case 'coordinador':
  await initCoordinadorModules(userId);
  break;

// Crear función inicializadora:
async function initCoordinadorModules(userId) {
  // Cargar módulos...
}
```

**5. Actualizar nav.js (opcional)**
```javascript
// Agregar menú específico si es necesario
if (role === 'coordinador') {
  menuHTML = `
    <a href="dashboard.html">Inicio</a>
    <a href="#" id="logoutBtn">Cerrar sesión</a>
  `;
}
```

**6. En la BD**: Actualizar valor de `role` en tabla `perfiles`

---

## 🎨 Sistema de Estilos

### Arquitectura CSS
```
base.css (común a todos)
   ↓
{role}.css (específico del rol)
   ↓
Estilos HTML inyectados dinámicamente
```

### Variables CSS globales (en `base.css`)
```css
:root {
  --primary-color: #0066cc;
  --secondary-color: #666666;
  --success-color: #28a745;
  --danger-color: #dc3545;
  /* ... más variables */
}
```

### Componentes reutilizables
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`
- `.info-section`, `.progress-container`
- `.course-list`, `.files-list`
- `.status-badge`, `.role-badge`

---

## ⚡ Inicialización de Módulos

Cada módulo JavaScript:
1. Espera a `DOMContentLoaded`
2. Obtiene el usuario actual de Supabase
3. Consulta datos específicos del rol
4. Puebla elementos HTML del layout
5. Configura event listeners
6. Log en consola para debugging

### Ejemplo: `modules/estudiante/progreso.js`
```javascript
document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabaseClient;
  
  // 1. Obtener usuario
  const { data: { user } } = await supabase.auth.getUser();
  
  // 2. Obtener datos
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, programaEducativo')
    .eq('id', user.id)
    .single();
  
  // 3. Poblar DOM
  document.getElementById('welcomeName').textContent = perfil.nombre;
  
  // 4. Listeners
  // ...
});
```

---

## 🔄 Migrando de la Arquitectura Antigua

### Archivos LEGADO (aún funcionales)
- `d-aspirante.html` - Reemplazado por `layouts/aspirante.html` en `dashboard.html`
- `js/d-aspirante.js` - Reemplazado por `modules/aspirante/`
- `css/d-aspirante.css` - Funcionalidad en `css/aspirante.css`

### Pasos para migrar completamente
1. ✅ Usar siempre `dashboard.html` como punto de entrada
2. ✅ Crear layouts y módulos para cada rol
3. ✅ Actualizar `login.js` para redirigir a `dashboard.html`
4. 🔄 [Opcional] Eliminar archivos legado después de validar

---

## 📊 Flujo de Datos

```
Usuario (Navegador)
   ↓
login.html (autenticación)
   ↓
dashboard.html (shell único)
   ↓
dashboard.js (orquestador)
   ├→ Obtiene rol de Supabase
   ├→ Carga layouts/{role}.html
   ├→ Carga css/{role}.css
   └→ Inicializa modules/{role}/*.js
      ├→ Consulta Supabase
      ├→ Puebla DOM
      └→ Configura interactividad
```

---

## 🧪 Testing Manual

### Checklist de verificación
- [ ] Login redirige a `dashboard.html`
- [ ] Aspirante ve layout correcto
- [ ] Estudiante ve layout correcto
- [ ] Formador ve layout correcto
- [ ] Admin ve layout correcto
- [ ] Módulos cargan sin errores (ver consola)
- [ ] Logout funciona en todos los roles
- [ ] CSS específico se carga correctamente
- [ ] Botones y formularios son interactivos

### Debugging en Console
```javascript
// En la consola del navegador (F12)
console.log(window.supabaseClient)  // Verificar Supabase
window.supabaseClient.auth.getSession()  // Ver sesión actual
// Módulos logean con emojis:
// 🚀, 📦, ✅, ❌, ⚠️
```

---

## 📦 Dependencias Externas

- **Supabase JS SDK** - Autenticación y base de datos
  ```html
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  ```
- **HTML/CSS/JavaScript puro** - Sin frameworks

---

## 🚀 Próximas Mejoras

1. **Carga perezosa (Lazy Loading)**
   - Cargar módulos solo cuando se necesiten
   - Mejora performance en layouts complejos

2. **Service Workers**
   - Cacheo offline
   - Sincronización en background

3. **Notificaciones en tiempo real**
   - WebSockets de Supabase
   - Push notifications

4. **Internacionalización (i18n)**
   - Soporte para múltiples idiomas
   - Basado en usuario o navegador

5. **Temas personalizables**
   - Dark mode
   - Temas institucionales

---

## 📝 Notas Importantes

### ⚠️ Puntos críticos
- **No cambiar estructura de carpetas sin actualizar rutas**
- **Cada módulo debe esperar a `DOMContentLoaded`**
- **El orquestador (`dashboard.js`) es el único responsable de cargar layouts**
- **No duplicar funcionalidad entre módulos**

### 💡 Mejores prácticas
- ✅ Usar variables CSS para consistencia
- ✅ Comentar código complejo
- ✅ Loguear acciones importantes con emojis
- ✅ Validar datos de Supabase antes de usarlos
- ✅ Manejar errores gracefully

---

## 📚 Referencias

- [Supabase Documentation](https://supabase.com/docs)
- [MDN Web Docs - JavaScript](https://developer.mozilla.org/docs/Web/JavaScript)
- [CSS Variables](https://developer.mozilla.org/docs/Web/CSS/--*)
- [Fetch API](https://developer.mozilla.org/docs/Web/API/Fetch_API)

---

**Última actualización:** 15 de enero de 2026
**Versión de arquitectura:** 2.0 (Modular)
**Estado:** ✅ Producción
