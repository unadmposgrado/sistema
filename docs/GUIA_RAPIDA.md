# 🚀 Guía Rápida - Arquitectura Modular

## 📍 Punto de Entrada
```
dashboard.html  ← ÚNICO punto de entrada para todos los roles
```

## 🎭 Roles y sus Componentes

| Rol | Layout | Módulos | CSS |
|-----|--------|---------|-----|
| **Aspirante** | `layouts/aspirante.html` | `documentos.js`, `seguimiento.js` | `aspirante.css` |
| **Estudiante** | `layouts/estudiante.html` | `progreso.js`, `evidencias.js`, `retroalimentacion.js` | `estudiante.css` |
| **Formador** | `layouts/formador.html` | `grupos.js`, `evaluacion.js`, `reportes.js` | `formador.css` |
| **Admin** | `layouts/admin.html` | `usuarios.js`, `contenido.js`, `metricas.js` | `admin.css` |

## 🚀 Flujo de Carga

```
1. Usuario inicia sesión en login.html
   ↓
2. Login valida con Supabase Auth
   ↓
3. Se obtiene el rol desde tabla 'perfiles'
   ↓
4. Redirige a dashboard.html (para TODOS los roles)
   ↓
5. dashboard.js (orquestador) ejecuta:
   - Validar sesión
   - Cargar layouts/{role}.html
   - Cargar css/{role}.css
   - Inicializar modules/{role}/*.js
   ↓
6. Módulos pueblan el DOM con datos de Supabase
   ↓
✅ Interfaz lista para el usuario
```

## 📁 Estructura de Directorios

```
layouts/
├── aspirante.html        ← HTML del rol aspirante
├── estudiante.html       ← HTML del rol estudiante
├── formador.html         ← HTML del rol formador
└── admin.html            ← HTML del rol admin

modules/
├── aspirante/
│   ├── documentos.js     ← Gestión de archivos
│   └── seguimiento.js    ← Estado de solicitud
├── estudiante/
│   ├── progreso.js       ← Avance académico
│   ├── evidencias.js     ← Evidencias
│   └── retroalimentacion.js
├── formador/
│   ├── grupos.js         ← Gestión de grupos
│   ├── evaluacion.js     ← Evaluación
│   └── reportes.js       ← Análisis
└── admin/
    ├── usuarios.js       ← Gestión de usuarios
    ├── contenido.js      ← Programas/asignaturas
    └── metricas.js       ← Estadísticas

css/
├── base.css              ← Común a todos
├── aspirante.css         ← Específico aspirante
├── estudiante.css        ← Específico estudiante
├── formador.css          ← Específico formador
└── admin.css             ← Específico admin

js/
├── dashboard.js          ← 🎯 ORQUESTADOR CENTRAL
├── login.js              ← Autenticación
├── nav.js                ← Navegación dinámica
├── supabase.js           ← Config Supabase
└── registro.js           ← Registro de usuarios
```

## 🔑 Archivos Clave

### `dashboard.html`
```html
<!-- Punto de entrada único -->
<!-- Contiene solo estructura base -->
<!-- Los módulos JS inyectan el contenido específico del rol -->
<div id="layout-container"></div>  ← Se llena dinámicamente
```

### `js/dashboard.js`
```javascript
// Orquestador central
// Responsabilidades:
// 1. Validar sesión
// 2. Obtener rol de Supabase
// 3. Cargar layout HTML dinámicamente
// 4. Cargar CSS específico
// 5. Inicializar módulos JavaScript
```

### `layouts/{role}.html`
```html
<!-- HTML específico del rol -->
<!-- Estructura visual única para cada rol -->
<!-- Los módulos JS pueblan los ID específicos -->
<div id="element-to-populate"></div>
```

### `modules/{role}/{feature}.js`
```javascript
// Módulo específico del rol
// Responsabilidades:
// 1. Consultar datos de Supabase
// 2. Poblar elementos del DOM
// 3. Manejar eventos y interactividad
// 4. Loguear acciones
```

## 🎨 Sistema de Estilos

### Jerarquía CSS
```
base.css (todos los roles)
   ↓
{role}.css (específico del rol)
   ↓
Inline styles (si es necesario)
```

### Componentes reutilizables
```css
.btn, .btn-primary, .btn-secondary    ← Botones
.info-section                          ← Secciones de información
.progress-container                    ← Barras de progreso
.course-list, .files-list             ← Listas
.status-badge, .role-badge            ← Insignias de estado
```

## 🔄 Variables Globales (en base.css)

```css
/* Colores */
--primary-color: #0066cc
--success-color: #28a745
--danger-color: #dc3545

/* Espaciado */
--spacing-md: 1rem
--spacing-lg: 1.5rem
--spacing-xl: 2rem

/* Tipografía */
--font-family: 'Segoe UI', Tahoma...
--font-size-base: 16px
--font-weight-bold: 700
```

## 📊 Tabla en Supabase

### Tabla `perfiles`
```sql
id          (UUID, PK)
email       (VARCHAR)
nombre      (VARCHAR)
role        (VARCHAR: 'aspirante'|'estudiante'|'formador'|'admin')
matricula   (VARCHAR, opcional)
-- Más columnas según rol
```

## 🧪 Testing Checklist

```
□ Login redirige a dashboard.html
□ Aspirante ve su layout
□ Estudiante ve su layout
□ Formador ve su layout
□ Admin ve su layout
□ Módulos cargan (revisar console)
□ CSS carga correctamente
□ Logout funciona
□ No hay errores en console (F12)
```

## 🐛 Debugging

### Ver logs en consola
```javascript
// Abre F12 → Console
// Deberías ver logs como:
// 🚀 Dashboard.js inicializando...
// ✅ Sesión validada: {userId}
// 🎭 Rol del usuario: estudiante
// 📂 Cargando layout: layouts/estudiante.html
// 📦 Cargando módulos de ESTUDIANTE...
// ✅ Dashboard completamente inicializado
```

### Verificar sesión
```javascript
// En consola:
window.supabaseClient.auth.getSession()
```

### Verificar rol
```javascript
// En consola (después de loguearse):
const { data: { session } } = await window.supabaseClient.auth.getSession();
const { data: perfil } = await window.supabaseClient
  .from('perfiles')
  .select('role')
  .eq('id', session.user.id)
  .single();
console.log(perfil.role);  // Debería mostrar el rol
```

## 🆕 Agregar Nuevo Rol (Pasos Rápidos)

### 1. Crear layout
```html
<!-- layouts/mi-rol.html -->
<div class="container">
  <h1>Bienvenido, mi-rol</h1>
  <!-- Contenido específico -->
</div>
```

### 2. Crear módulos
```javascript
// modules/mi-rol/modulo1.js
// modules/mi-rol/modulo2.js
```

### 3. Crear CSS
```css
/* css/mi-rol.css */
```

### 4. Actualizar dashboard.js
```javascript
case 'mi-rol':
  await initMiRolModules(userId);
  break;

async function initMiRolModules(userId) {
  // Cargar módulos...
}
```

### 5. Actualizar nav.js (opcional)
```javascript
if (role === 'mi-rol') {
  menuHTML = `...`;
}
```

### 6. Actualizar BD
```sql
UPDATE perfiles SET role = 'mi-rol' WHERE email = 'usuario@example.com';
```

## 💾 Migrando Código Antiguo

### ❌ Código antiguo (no usar)
```html
<!-- Redireccionaba a d-aspirante.html -->
<!-- Estructura hardcodeada en HTML -->
```

### ✅ Código nuevo (usar siempre)
```html
<!-- dashboard.html es el único punto de entrada -->
<!-- Estructura se carga dinámicamente en dashboard.js -->
```

## ⚡ Optimizaciones Implementadas

✅ **Modularidad:** Cada rol tiene su código separado
✅ **DRY:** No hay duplicación de HTML/CSS común
✅ **Escalabilidad:** Fácil agregar nuevos roles
✅ **Rendimiento:** CSS se carga solo del rol necesario
✅ **Mantenibilidad:** Cambios centralizados en orquestador

## 📞 Soporte

Para dudas sobre la arquitectura, revisar:
1. `docs/ARQUITECTURA.md` - Documentación completa
2. Console del navegador (F12) - Logs detallados
3. `js/dashboard.js` - Código fuente del orquestador
4. `js/nav.js` - Lógica de navegación

---

**Última actualización:** 15 de enero de 2026
**Versión:** 2.0 (Modular)
