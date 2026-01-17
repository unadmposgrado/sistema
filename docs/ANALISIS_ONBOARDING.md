# 📋 ANÁLISIS COMPLETO: Columnas de Onboarding en tabla `perfiles`

**Fecha**: 16 de enero de 2026  
**Objetivo**: Identificar columnas imprescindibles, opcionales y no utilizadas para el registro e onboarding inicial.

---

## 🔍 MAPEO DE FLUJOS

### 1. REGISTRO INICIAL (`registro.js`)
**Acción**: El usuario se registra por primera vez en `registro.html`

```javascript
// ✅ COLUMNAS INSERTADAS EN registro.js (línea 54-60)
{
  id: userId,        // UUID del usuario (FK a auth.users)
  nombre,            // Nombre ingresado en el formulario
  email              // Email ingresado en el formulario
}
```

**Campos esperados en el formulario**: nombre, email, password  
**Campos insertados en `perfiles`**: `id`, `nombre`, `email` (solo 3 columnas)  
**Columnas de rol/onboarding**: ❌ **NO se insertan**

**Flujo post-registro**:
```
Registro exitoso → Verificación de email → Usuario inicia sesión (login.html)
```

---

### 2. LOGIN CON REDIRECCIÓN (`login.js`)
**Acción**: Usuario inicia sesión después de confirmar email

```javascript
// ✅ COLUMNA CONSULTADA EN login.js (línea 106)
.select('rol')
.eq('id', userId)
```

**Columnas consultadas**: Solo `rol`  
**Propósito**: Determinar a qué dashboard redirigir  
**Problema detectado**: Si `rol` es NULL (usuario acaba de registrarse), ¿qué ocurre?

**Observación importante**:
- El login NO verifica `onboarding_completo`
- El rol no se asigna en registro
- La redirección se hace a `dashboard.html` para todos los roles

---

### 3. DASHBOARD CON DETECTOR DE ONBOARDING (`dashboard.js`)
**Acción**: Usuario accede al dashboard después del login

```javascript
// ✅ COLUMNAS CONSULTADAS EN dashboard.js (línea 46)
.select('id, rol, onboarding_completo')
```

**Columnas consultadas**: `id`, `rol`, `onboarding_completo`

**Lógica crítica (línea 102-118)**:
```javascript
if (userRole !== 'admin' && !onboardingCompleto) {
  // Mostrar formulario de onboarding
  const { startOnboarding } = await import('../modules/onboarding/index.js');
  await startOnboarding({ user: session.user, perfil });
  return;
}
// Si onboarding completo → cargar layout normal
```

**Entonces**:
- Si `onboarding_completo` es `false` o `null` → se carga el módulo de onboarding
- Si `onboarding_completo` es `true` → se carga el dashboard normal
- Si el rol es `admin` → se salta el onboarding

---

### 4. MÓDULO DE ONBOARDING POR ROL (`modules/onboarding/index.js` y específicos)
**Acción**: Mostrar formulario de "Completar perfil" según rol

#### 4.1 Onboarding para ASPIRANTE (`onboarding-aspirante.js`)
```javascript
// ✅ CAMPOS DEL FORMULARIO
- interes_academico (obligatorio)
- institucion (opcional)

// ✅ COLUMNAS ACTUALIZADAS (línea 104-106)
{
  interes_academico: data.interes.trim(),
  institucion: data.institucion?.trim() || null,
  onboarding_completo: true  // ← CRUCIAL
}
```

#### 4.2 Onboarding para ESTUDIANTE (`onboarding-estudiante.js`)
```javascript
// ✅ CAMPOS DEL FORMULARIO
- matricula (obligatorio)
- grado (obligatorio)
- institucion (obligatorio)

// ✅ COLUMNAS ACTUALIZADAS (línea 116-118)
{
  matricula: data.matricula.trim(),
  grado: data.grado,
  institucion: data.institucion.trim(),
  onboarding_completo: true  // ← CRUCIAL
}
```

#### 4.3 Onboarding para FORMADOR (`onboarding-formador.js`)
```javascript
// ✅ CAMPOS DEL FORMULARIO
- area_expertise (obligatorio)
- experiencia (obligatorio)
- institucion (opcional)

// ✅ COLUMNAS ACTUALIZADAS (línea 115-117)
{
  area_expertise: data.area.trim(),
  experiencia: parseInt(data.experiencia, 10),
  institucion: data.institucion?.trim() || null,
  onboarding_completo: true  // ← CRUCIAL
}
```

#### 4.4 Para ADMIN
⚠️ **NO hay módulo de onboarding** (línea 102: `if (userRole !== 'admin' && !onboardingCompleto)`)

---

## 📊 ANÁLISIS DE COLUMNAS

### ✅ COLUMNAS IMPRESCINDIBLES

| Columna | Lectura | Escritura | Propósito | Crítica |
|---------|---------|-----------|-----------|---------|
| `id` | Login, Dashboard, Onboarding | Registro | FK con auth.users | **CRÍTICA** |
| `nombre` | Múltiples módulos | Registro | Identificación usuario | **CRÍTICA** |
| `email` | Registro | Registro | Contacto/Identificación | **CRÍTICA** |
| `rol` | Login, Dashboard, Nav | Onboarding/Asignación | Determina permisos y flujo | **CRÍTICA** |
| `onboarding_completo` | Dashboard | Onboarding | Controla si mostrar formulario | **CRÍTICA** |

**Resumen**: 5 columnas IMPRESCINDIBLES

---

### ⚠️ COLUMNAS OPCIONALES (Específicas por rol)

#### Para ASPIRANTE:
| Columna | Lectura | Escritura | Propósito | ¿Se puede eliminar? |
|---------|---------|-----------|-----------|----------------------|
| `interes_academico` | Onboarding (solo escritura) | Onboarding | Información adicional | ❌ NO (requerida en form) |
| `institucion` | Aspirante.seguimiento | Onboarding | Procedencia del aspirante | ✅ SÍ (opcional en form) |
| `grado` | Aspirante.seguimiento | Onboarding | Grado académico | ❌ NO (requerida en display) |

**Nota**: `grado` es escrito en onboarding-aspirante pero NO está en la lista de formulario explícita. Se parece que está copiada de estudiante.

#### Para ESTUDIANTE:
| Columna | Lectura | Escritura | Propósito | ¿Se puede eliminar? |
|---------|---------|-----------|-----------|----------------------|
| `matricula` | Estudiante.progreso | Onboarding | Identificación académica | ❌ NO (requerida) |
| `grado` | Estudiante.progreso | Onboarding | Grado académico | ❌ NO (requerida) |
| `institucion` | Estudiante.progreso | Onboarding | Institución actual | ❌ NO (requerida) |
| `programaEducativo` | Estudiante.progreso | ❓ Desconocido | Programa inscrito | ⚠️ NO se escribe en onboarding |
| `tutorAsignado` | Estudiante.progreso | ❓ Desconocido | Tutor asignado | ⚠️ NO se escribe en onboarding |

**Nota**: `programaEducativo` y `tutorAsignado` son leídas pero NUNCA se escriben en onboarding. Posiblemente se asignan por admin o batch.

#### Para FORMADOR:
| Columna | Lectura | Escritura | Propósito | ¿Se puede eliminar? |
|---------|---------|-----------|-----------|----------------------|
| `area_expertise` | ❓ No encontrada | Onboarding | Especialidad | ❌ NO (requerida) |
| `experiencia` | ❓ No encontrada | Onboarding | Años de experiencia | ❌ NO (requerida) |
| `institucion` | ❓ No encontrada | Onboarding | Institución actual | ✅ SÍ (opcional) |

---

### ❌ COLUMNAS NO UTILIZADAS

| Columna | Esperada en docs | Usada en código | Acción |
|---------|------------------|-----------------|--------|
| `onboarding_paso` | NO | NO | ❌ ELIMINAR |
| `onboarding_fecha` | NO | NO | ❌ ELIMINAR |
| `onboarding_iniciado` | NO | NO | ❌ ELIMINAR |
| `created_at` | Documentada | NO (no se consulta) | ✅ Mantener (estándar Supabase) |
| `updated_at` | NO | NO | ⚠️ Considerar mantener |

**Búsqueda exhaustiva**: Se buscaron `onboarding_paso`, `onboarding_fecha`, `onboarding_iniciado` en todo el proyecto y NO aparecen en el código JavaScript. ✅ Son **candidatas a eliminar**.

---

## 🎯 PROBLEMA IDENTIFICADO: FALTA EL CAMPO `rol` EN REGISTRO

### Situación actual:

1. **En `registro.js`** (línea 54-60):
```javascript
.insert([{
  id: userId,
  nombre,
  email
  // ❌ NO INSERTA rol
}])
```

2. **En `login.js`** (línea 106):
```javascript
.select('rol')
```
Si el usuario se acaba de registrar, `rol` será **NULL**.

3. **Consecuencia**:
```javascript
const userRole = perfil?.rol || 'aspirante';  // Dashboard.js línea 60
```
Se asume el rol `'aspirante'` por defecto, lo que puede ser incorrecto si el usuario debería ser otro rol.

### ✅ SOLUCIÓN RECOMENDADA:
Insertar rol por defecto en `registro.js`:
```javascript
.insert([{
  id: userId,
  nombre,
  email,
  rol: 'aspirante',              // ← AGREGAR
  onboarding_completo: false      // ← AGREGAR (opcional pero clara intención)
}])
```

---

## 🔄 FLUJO COMPLETO CON ESTADOS

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. REGISTRO (registro.html → registro.js)                       │
│                                                                 │
│   INSERT INTO perfiles:                                         │
│   ├─ id: UUID                                                   │
│   ├─ nombre: "Juan"                          ⚠️ FALTA rol      │
│   ├─ email: "juan@example.com"                ⚠️ FALTA onboard │
│   └─ (otros: NULL)                                              │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. CONFIRMACIÓN DE EMAIL (fuera del código)                     │
│                                                                 │
│   Usuario confirma email en Supabase Auth                       │
│   Email se marca como verified                                  │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. LOGIN (login.html → login.js)                                │
│                                                                 │
│   SELECT rol FROM perfiles WHERE id = userId                    │
│   ├─ Si rol IS NULL → asume 'aspirante' (dashboard.js:60)       │
│   └─ Redirige a dashboard.html                                  │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. DASHBOARD (dashboard.html → dashboard.js)                    │
│                                                                 │
│   SELECT id, rol, onboarding_completo FROM perfiles             │
│                                                                 │
│   ¿Es admin?                                                    │
│   ├─ NO y onboarding_completo = false/NULL                      │
│   │  └─ Mostrar formulario de onboarding (modules/onboarding/)  │
│   └─ SÍ o ya completado                                         │
│      └─ Cargar layout normal (layouts/{rol}.html)               │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. ONBOARDING (modules/onboarding/{rol}.js)                     │
│                                                                 │
│   Formulario específico por rol:                                │
│   ├─ ASPIRANTE: interes_academico, institucion                  │
│   ├─ ESTUDIANTE: matricula, grado, institucion                  │
│   └─ FORMADOR: area_expertise, experiencia, institucion         │
│                                                                 │
│   UPDATE perfiles SET:                                          │
│   ├─ [campos específicos del rol]                               │
│   └─ onboarding_completo = true                                 │
│                                                                 │
│   Redirige a dashboard.html (nuevo login)                       │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. DASHBOARD NORMAL                                             │
│                                                                 │
│   onboarding_completo = true → carga layout y módulos           │
│   Módulos leen campos específicos de perfiles                   │
│   ├─ Aspirante.seguimiento: nombre, institucion, grado         │
│   ├─ Estudiante.progreso: nombre, matricula, programa, tutor   │
│   └─ Formador: (no definido aún)                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 TABLA PERFILES RECOMENDADA (MÍNIMA)

### Versión ACTUAL (incompleta pero funcional):
```sql
CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  nombre VARCHAR,
  email VARCHAR,
  -- FALTA:
  rol VARCHAR DEFAULT 'aspirante',
  onboarding_completo BOOLEAN DEFAULT false,
  
  -- Campos específicos ASPIRANTE
  interes_academico VARCHAR,
  grado VARCHAR,
  institucion VARCHAR,
  
  -- Campos específicos ESTUDIANTE
  matricula VARCHAR,
  programaEducativo VARCHAR,
  tutorAsignado VARCHAR,
  
  -- Campos específicos FORMADOR
  area_expertise VARCHAR,
  experiencia INTEGER,
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Problemas**:
- ❌ Columnas de todos los roles mezcladas
- ❌ Falta `rol` en INSERT de registro.js
- ❌ Campos no utilizados: `onboarding_paso`, `onboarding_fecha`, etc.

---

## ✅ CAMBIOS RECOMENDADOS

### CAMBIO 1: Actualizar `registro.js`

**Archivo**: [js/registro.js](js/registro.js#L54-L60)

**Antes**:
```javascript
.insert([
  {
    id: userId,
    nombre,
    email
  }
])
```

**Después**:
```javascript
.insert([
  {
    id: userId,
    nombre,
    email,
    rol: 'aspirante',                // ← AGREGAR
    onboarding_completo: false       // ← AGREGAR (explícito)
  }
])
```

**Justificación**:
- Garantiza que `rol` nunca sea NULL
- Especifica intencionalmente que el onboarding no está completado
- Evita lógica `|| 'aspirante'` en múltiples lugares

**Impacto**: ✅ MÍNIMO - solo cambio en INSERT, sin lógica adicional

---

### CAMBIO 2: Validar `rol` NULL en `login.js` (opcional pero recomendado)

**Archivo**: [js/login.js](js/login.js#L105-L115)

**Añadir validación**:
```javascript
const { data: perfil, error } = await window.supabaseClient
  .from('perfiles')
  .select('rol')
  .eq('id', userId)
  .single();

if (error || !perfil) {
  console.error('Error obteniendo rol:', error);
  setError('No se pudo determinar el tipo de usuario.');
  return;
}

// ✅ NUEVA VALIDACIÓN
if (!perfil.rol) {
  console.warn('⚠️ rol es NULL, asignando aspirante por defecto');
  perfil.rol = 'aspirante';
  // Opcionalmente, actualizar en BD para evitar repetir
}

// Redirigir...
```

**Justificación**: Proporciona claridad y manejo defensivo para usuarios existentes cuyo `rol` sea NULL.

**Impacto**: ✅ BAJO - solo validación, sin cambios en flujo

---

### CAMBIO 3: Limpiar tabla `perfiles` (FUTURO)

**Columnas a eliminar** (después de CAMBIO 1):
- ❌ `onboarding_paso` - nunca se usa
- ❌ `onboarding_fecha` - nunca se usa
- ❌ `onboarding_iniciado` - nunca se usa

**Acción**: Después de confirmar que el código no las usa, ejecutar:
```sql
ALTER TABLE perfiles 
DROP COLUMN IF EXISTS onboarding_paso,
DROP COLUMN IF EXISTS onboarding_fecha,
DROP COLUMN IF EXISTS onboarding_iniciado;
```

**Impacto**: ✅ NINGUNO EN CÓDIGO - son columnas huérfanas

---

### CAMBIO 4: Considerar separar tablas por rol (FUTURO AVANZADO)

**Para mantener `perfiles` mínimo**:

```sql
-- Tabla base (NUEVA)
CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  nombre VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  rol VARCHAR NOT NULL DEFAULT 'aspirante',
  onboarding_completo BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Tabla específica ASPIRANTE
CREATE TABLE perfiles_aspirante (
  id UUID PRIMARY KEY REFERENCES perfiles(id),
  interes_academico VARCHAR,
  institucion VARCHAR,
  grado VARCHAR
);

-- Tabla específica ESTUDIANTE
CREATE TABLE perfiles_estudiante (
  id UUID PRIMARY KEY REFERENCES perfiles(id),
  matricula VARCHAR,
  programaEducativo VARCHAR,
  tutorAsignado VARCHAR
);

-- Tabla específica FORMADOR
CREATE TABLE perfiles_formador (
  id UUID PRIMARY KEY REFERENCES perfiles(id),
  area_expertise VARCHAR,
  experiencia INTEGER,
  institucion VARCHAR
);
```

**Cambios en código necesarios**:
```javascript
// Ejemplo: Leer perfil aspirante
const { data: perfil } = await supabase
  .from('perfiles')
  .select('*')
  .eq('id', userId)
  .single();

const { data: perfilAspirante } = await supabase
  .from('perfiles_aspirante')
  .select('*')
  .eq('id', userId)
  .single();
```

**Ventajas**: ✅ Tabla `perfiles` mínima, escalable, sin campos NULL excesivos
**Desventajas**: ❌ Requiere 3-4 cambios en múltiples módulos
**Recomendación**: **HACER EN FASE 2** (después de validar flujo actual)

---

## 📌 RESUMEN EJECUTIVO

### ✅ Columnas IMPRESCINDIBLES (5)
1. `id` - FK con auth.users
2. `nombre` - Identificación
3. `email` - Contacto
4. `rol` - Determina permisos
5. `onboarding_completo` - Controla flujo de onboarding

### ⚠️ Columnas REQUERIDAS POR ROL (variable según rol)
- **Aspirante**: `interes_academico` (obligatorio), `institucion`, `grado` (si se usa)
- **Estudiante**: `matricula`, `grado`, `institucion`, `programaEducativo`, `tutorAsignado`
- **Formador**: `area_expertise`, `experiencia`, `institucion`
- **Admin**: ninguna específica

### ❌ Columnas NO UTILIZADAS (3) - Eliminar
- `onboarding_paso`
- `onboarding_fecha`
- `onboarding_iniciado`

### 🔧 CAMBIOS INMEDIATOS (FASE 1)
1. ✅ **CAMBIO 1**: Agregar `rol` y `onboarding_completo` en `registro.js`
2. ⚠️ **CAMBIO 2**: Validar `rol` NULL en `login.js` (defensivo)
3. 🗑️ **CAMBIO 3**: Eliminar columnas huérfanas de BD

### 📊 CAMBIOS FUTUROS (FASE 2)
4. 🏗️ **CAMBIO 4**: Separar en tablas `perfiles_*` por rol (escalabilidad)

---

## 🔗 REFERENCIAS EN CÓDIGO

### Lecturas de perfiles
- [login.js#L106](js/login.js#L106) - SELECT rol
- [dashboard.js#L46](js/dashboard.js#L46) - SELECT id, rol, onboarding_completo
- [nav.js#L33](js/nav.js#L33) - SELECT rol
- [aspirante/seguimiento.js#L30](modules/aspirante/seguimiento.js#L30) - SELECT nombre, institucion, grado
- [estudiante/progreso.js#L31](modules/estudiante/progreso.js#L31) - SELECT nombre, programaEducativo, tutorAsignado, matricula
- [admin/usuarios.js#L41](modules/admin/usuarios.js#L41) - SELECT id, nombre, email, rol

### Escrituras en perfiles
- [registro.js#L54](js/registro.js#L54) - INSERT id, nombre, email
- [onboarding-aspirante.js#L106](modules/onboarding/onboarding-aspirante.js#L106) - UPDATE interes_academico, institucion, onboarding_completo
- [onboarding-estudiante.js#L118](modules/onboarding/onboarding-estudiante.js#L118) - UPDATE matricula, grado, institucion, onboarding_completo
- [onboarding-formador.js#L115](modules/onboarding/onboarding-formador.js#L115) - UPDATE area_expertise, experiencia, institucion, onboarding_completo

---

**Fin del análisis** ✅
