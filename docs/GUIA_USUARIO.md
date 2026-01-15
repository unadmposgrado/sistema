# 🚀 Cómo Empezar - Guía de Usuario

## 📌 Punto de Entrada

La plataforma tiene tres puntos de acceso públicos:

### 1. **Página Principal** (`index.html`)
```
http://tu-dominio.com/
- Información general
- Carrusel de imágenes
- Botones para Login/Registro
```

### 2. **Login** (`login.html`)
```
http://tu-dominio.com/login.html
- Para usuarios registrados
- Valida contra Supabase Auth
- Redirige a dashboard.html automáticamente
```

### 3. **Registro** (`registro.html`)
```
http://tu-dominio.com/registro.html
- Para nuevos usuarios
- Crea usuario en Auth + perfil
- Role por defecto: 'aspirante'
```

### 4. **Dashboard** (`dashboard.html`) ⭐ NUEVO
```
http://tu-dominio.com/dashboard.html
- Punto de entrada único para usuarios logueados
- Adapta interfaz según rol
- Carga dinámicamente layout y módulos
```

---

## 🔐 Flujo de Autenticación

### Primer Acceso: Nuevo Usuario

```
1. Acceder a index.html
   ↓
2. Click "Regístrate"
   ↓
3. Completar formulario (registro.html)
   - Email
   - Contraseña
   - Nombre
   - Rol (aspirante, estudiante, etc.)
   - Datos adicionales según rol
   ↓
4. Submit crea:
   - Usuario en Supabase Auth
   - Perfil en tabla 'perfiles'
   ↓
5. Redirecciona a login.html
   ↓
6. Usuario inicia sesión con credenciales nuevas
```

### Acceso Habitual: Usuario Existente

```
1. Acceder a login.html
   ↓
2. Ingresar email y contraseña
   ↓
3. Click "Iniciar sesión"
   ↓
4. Supabase valida credenciales
   ↓
5. Sistema obtiene rol de tabla 'perfiles'
   ↓
6. Redirecciona a dashboard.html
   ↓
7. Dashboard.js:
   - Carga layouts/{role}.html
   - Carga css/{role}.css
   - Inicializa modules/{role}/*.js
   ↓
8. Interfaz lista ✅
```

---

## 👥 Experiencias por Rol

### 👨‍🎓 Aspirante (Pre-Matrícula)

**Acceso:**
```
login.html → dashboard.html (layout aspirante)
```

**Interfaz:**
- Tu información (nivel estudios, institución, grado)
- Estado de tu solicitud (en revisión, aceptado, rechazado)
- Documentos que debes subir:
  - Carta de motivos
  - Currículum Vitae (CV)
  - Anteproyecto de investigación

**Acciones:**
- 📤 Subir documentos requeridos
- 📊 Ver estado de evaluación
- 📥 Descargar archivos ya subidos

---

### 👨‍🎓 Estudiante (Matriculado)

**Acceso:**
```
login.html → dashboard.html (layout estudiante)
```

**Interfaz:**
- Tu información (programa, tutor, matrícula)
- Avance académico (barra de progreso)
- Tus asignaturas:
  - En progreso
  - Completadas
- Evidencias de aprendizaje
- Retroalimentación del tutor

**Acciones:**
- 📈 Ver tu progreso
- 📚 Consultar cursos
- 📎 Ver evidencias
- 💬 Leer feedback

---

### 👨‍🏫 Formador/Monitor (Instructor)

**Acceso:**
```
login.html → dashboard.html (layout formador)
```

**Interfaz:**
- Tu información (especialidad, grupos)
- Gestión de grupos:
  - Lista de grupos asignados
  - Búsqueda y filtrado
- Evaluación de estudiantes:
  - Seleccionar grupo
  - Ver lista de estudiantes
  - Asignar calificaciones
- Reportes y análisis:
  - Progreso grupal
  - Métricas individuales
  - Exportar datos

**Acciones:**
- 👥 Gestionar grupos
- ⭐ Evaluar estudiantes
- 📊 Ver reportes
- 📤 Exportar datos

---

### 👨‍💼 Administrador

**Acceso:**
```
login.html → dashboard.html (layout admin)
```

**Interfaz:**
- Estadísticas generales:
  - Total usuarios
  - Estudiantes activos
  - Formadores
  - Aspirantes en revisión
- Gestión de usuarios:
  - Crear/editar usuarios
  - Asignar roles
  - Buscar usuarios
  - Filtrar por rol
- Gestión de contenido:
  - Programas educativos
  - Asignaturas/cursos
  - Módulos y temas
- Métricas e informes:
  - Estadísticas por período
  - Exportar reportes
- Configuración:
  - Plantillas de email
  - Respaldos
  - Registros de actividad

**Acciones:**
- 👨‍💼 Administrar usuarios
- 📚 Gestionar programas
- 📊 Ver métricas
- ⚙️ Configurar sistema

---

## 🔄 Navegación

### Header Común
Todos los roles tienen:
```
[Logo SSA]     Título Sistema     [Perfil ▼]
                                  ├ Inicio
                                  ├ [Opciones por rol]
                                  └ Cerrar sesión
```

### Cambiar de Rol (Admin)
Si eres admin:
1. Ir a panel de administración
2. Buscar usuario
3. Cambiar su rol en BD
4. Usuario refrescar página
5. Verá nuevo layout

---

## 📱 Dispositivos Soportados

### Desktop (Recomendado)
- Resolución: 1920x1080 o superior
- Navegador: Chrome, Firefox, Safari, Edge
- Experiencia: Óptima

### Tablet
- Resolución: 768x1024
- Navegador: Chrome, Safari
- Experiencia: Buena (responsive)

### Mobile
- Resolución: 375x812 (iPhone)
- Navegador: Chrome, Safari
- Experiencia: Funcional (responsive)

---

## ⌨️ Atajos de Teclado

### Globales
```
Tab          → Navegar entre elementos
Enter        → Activar botón/formulario
Escape       → Cerrar menús
Ctrl+F       → Buscar en página
F12          → Developer tools (debugging)
```

### Formularios
```
Tab          → Siguiente campo
Shift+Tab    → Campo anterior
Enter        → Submit formulario
Ctrl+A       → Seleccionar todo
```

---

## 🐛 Solución de Problemas

### "Me redirige a login infinitamente"
```
1. Limpiar cache y cookies
   - Ctrl+Shift+Supr (Chrome)
2. Cerrar todas las pestañas del sitio
3. Abrir incógnito e intentar
4. Si persiste: contactar soporte
```

### "No veo mi contenido"
```
1. Abrir consola (F12)
2. Revisar si hay errores (rojo)
3. Si hay errores:
   - Tomar nota del mensaje
   - Contactar soporte con screenshot
4. Si no hay errores:
   - Esperar a que carguen módulos
   - Refrescar página
```

### "El diseño se ve mal"
```
1. Refrescar página (Ctrl+F5)
2. Limpiar cache del navegador
3. Probar en otro navegador
4. Probar en versión mobile del navegador (F12)
```

### "Logout no funciona"
```
1. Abrir consola (F12)
2. Click en logout
3. Si hay error: tomar nota
4. Si se cierra sesión pero no redirecciona:
   - Ir manualmente a index.html
   - Verificar que no haya token
```

---

## 🔒 Seguridad y Privacidad

### Contraseñas
- ✅ Mínimo 8 caracteres recomendado
- ✅ Combinación de mayúsculas, minúsculas, números
- ✅ No compartir tu contraseña
- ✅ Cambiar regularmente

### Sesión
- ✅ Logout siempre cuando termines
- ✅ No dejar sesión abierta en PC compartida
- ✅ Usar contraseña fuerte
- ✅ No acceder desde redes públicas (WiFi)

### Datos
- ✅ Tu información está encriptada
- ✅ Solo tú puedes ver tus datos
- ✅ Formadores solo ven sus grupos
- ✅ Admin ve todo (respeta privacidad)

---

## 📞 Soporte y Ayuda

### Centro de Ayuda
Para dudas sobre:
- **Funcionalidad:** Revisar `/docs/GUIA_RAPIDA.md`
- **Técnica:** Revisar `/docs/ARQUITECTURA.md`
- **Cambios:** Revisar `/docs/CAMBIOS.md`
- **Problemas:** Revisar `/docs/VERIFICACION.md`

### Contactar Soporte
- 📧 Email: soporte@institucion.edu
- 📞 Teléfono: +XX XXX XXXX
- 💬 Chat: plataforma.institucion.edu/chat
- 🕐 Horario: Lunes-Viernes 8:00-17:00

### Reportar Errores
Cuando reportes error, incluir:
1. Rol del usuario
2. Qué intentabas hacer
3. Qué pasó exactamente
4. Screenshot del error
5. Mensaje de consola (F12)

---

## 🎓 Training y Capacitación

### Para Estudiantes
**Duración:** 30 minutos
**Contenido:**
- Cómo acceder
- Navegar el dashboard
- Ver calificaciones
- Consultar horarios
- Enviar tareas

### Para Formadores
**Duración:** 1 hora
**Contenido:**
- Cómo acceder
- Ver grupos asignados
- Calificar estudiantes
- Ver reportes
- Exportar datos

### Para Administradores
**Duración:** 2 horas
**Contenido:**
- Panel completo
- Gestión de usuarios
- Crear programas
- Ver métricas
- Configurar sistema

---

## 📅 Calendario Académico

### Periodos de Uso
- **Inicio año:** Registro y setup
- **Durante semestre:** Uso diario
- **Fin semestre:** Evaluación final
- **Vacaciones:** Mantenimiento

### Horarios de Disponibilidad
- **Operativo:** 24/7
- **Mantenimiento:** Fin de semana 22:00-02:00
- **Respaldo:** Cada media hora
- **Disponibilidad SLA:** 99.5%

---

## ✨ Consejos y Trucos

### Para Mejor Rendimiento
1. Usar Chrome o Firefox (más rápido)
2. Tener máximo 5 pestañas abiertas
3. Limpiar cache mensualmente
4. Actualizar navegador regularmente
5. Usar conexión de 10+ Mbps

### Para Mejor Organización
1. Completar perfil 100%
2. Actualizar información mensualmente
3. Revisar mensajes regularmente
4. Hacer backup de evidencias
5. Guardar contraseña en gestor seguro

### Para Mejor Aprendizaje
1. Revisar retroalimentación regularmente
2. Hacer seguimiento de progreso
3. Contactar tutor si es necesario
4. Organizar documentos
5. Mantener seguimiento actualizado

---

## 🎯 Objetivos y Metas

### Personal
- Cumplir metas académicas
- Mantener buen desempeño
- Estar en contacto con tutor
- Completar a tiempo

### Institucional
- Mejorar retención
- Aumentar egresados
- Mejor seguimiento
- Datos para decisiones

---

## 📊 Recursos Disponibles

### Documentos Técnicos
- `/docs/ARQUITECTURA.md` - Detalles técnicos
- `/docs/GUIA_RAPIDA.md` - Referencia rápida
- `/docs/CAMBIOS.md` - Qué cambió

### Herramientas
- Navegador: Chrome, Firefox, Safari, Edge
- Editor: Cualquiera (no necesario para usuarios)
- Comunicación: Email, chat, teléfono

### Contactos
- Soporte técnico
- Tutor académico
- Coordinador de programa
- Administrador

---

## 🌟 Conclusión

La nueva plataforma es:
- ✅ Fácil de usar
- ✅ Intuitiva
- ✅ Rápida
- ✅ Segura
- ✅ Accesible

¡Bienvenido a la plataforma de seguimiento!

**¿Preguntas? Contactar soporte en:**
📧 soporte@institucion.edu
📞 +XX XXX XXXX

