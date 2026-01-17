# 📊 RESUMEN VISUAL: Análisis de Columnas de Onboarding

---

## 🎯 VISIÓN GENERAL

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TABLA: perfiles                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ✅ IMPRESCINDIBLES (siempre necesarios)                            │
│  ├─ id ........................ UUID (FK auth.users)                  │
│  ├─ nombre ................... VARCHAR (identificación)              │
│  ├─ email .................... VARCHAR (contacto)                    │
│  ├─ rol ...................... VARCHAR (permisos) ⚠️ FALTA EN REG   │
│  └─ onboarding_completo ...... BOOLEAN (control flujo) ⚠️ FALTA REG │
│                                                                     │
│  ⚠️ OPCIONALES POR ROL (depende del rol del usuario)                │
│  ├─ interes_academico ....... VARCHAR (ASPIRANTE)                   │
│  ├─ matricula ............... VARCHAR (ESTUDIANTE)                   │
│  ├─ grado ................... VARCHAR (ESTUDIANTE/ASPIRANTE)        │
│  ├─ institucion ............. VARCHAR (TODO EXCEPTO ADMIN)          │
│  ├─ programaEducativo ....... VARCHAR (ESTUDIANTE, NO en onboarding)│
│  ├─ tutorAsignado ........... VARCHAR (ESTUDIANTE, NO en onboarding)│
│  ├─ area_expertise .......... VARCHAR (FORMADOR)                     │
│  └─ experiencia ............. INTEGER (FORMADOR)                     │
│                                                                     │
│  ❌ HUÉRFANOS (nunca se usan - ELIMINAR)                            │
│  ├─ onboarding_paso                                                  │
│  ├─ onboarding_fecha                                                 │
│  └─ onboarding_iniciado                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📍 PUNTOS CRÍTICOS IDENTIFICADOS

### 🔴 PROBLEMA 1: `rol` no se inserta en registro.js

```javascript
// ❌ ACTUAL (registro.js línea 54-60)
.insert([{ id, nombre, email }])
       // ↑ FALTA: rol, onboarding_completo

// ✅ SOLUCIÓN
.insert([{ 
  id, nombre, email,
  rol: 'aspirante',              // ← AGREGAR
  onboarding_completo: false      // ← AGREGAR
}])
```

**Consecuencia**: Usuario nuevo tiene `rol = NULL` hasta que se asigne manualmente  
**Riesgo**: dashboard.js asume 'aspirante' (línea 60: `const userRole = perfil?.rol || 'aspirante'`)  
**Solución**: Insertar explícitamente en registro.js

---

### 🔴 PROBLEMA 2: `onboarding_completo` no se inicializa en registro.js

```javascript
// ❌ ACTUAL
// No se inserta onboarding_completo en registro.js
// Es NULL hasta que el usuario completa el onboarding

// ✅ SOLUCIÓN
// Insertar explícitamente como FALSE en registro.js
.insert([{ ..., onboarding_completo: false }])
```

**Consecuencia**: Dashboard.js (línea 58) asume FALSE si es NULL, pero es frágil  
**Riesgo**: Lógica `|| false` es silenciosa y fácil de olvidar  
**Solución**: Ser explícito en el INSERT

---

### 🟡 PROBLEMA 3: Columnas huérfanas en BD

```
Columnas que NUNCA se leen ni se escriben:
├─ onboarding_paso
├─ onboarding_fecha
└─ onboarding_iniciado

Búsqueda exhaustiva: ✅ Confirmado que NO aparecen en 71 archivos JS
```

**Consecuencia**: Ocupan espacio en BD sin propósito  
**Riesgo**: Confusión futura sobre si deberían usarse  
**Solución**: Eliminar con ALTER TABLE

---

## 🔄 FLUJO ACTUAL vs. FLUJO IDEAL

### Flujo ACTUAL (con problemas)

```
REGISTRO
├─ INSERT: id, nombre, email
├─ rol: NULL           ❌ Problematico
└─ onboarding_completo: NULL  ❌ Problematico
         ↓
LOGIN
├─ SELECT rol  (retorna NULL)
├─ dashboard.js asume 'aspirante'  ⚠️ Implícito
└─ Redirect a dashboard.html
         ↓
DASHBOARD
├─ SELECT onboarding_completo  (retorna NULL)
├─ dashboard.js asume false  ⚠️ Implícito
├─ onboarding_completo == false? YES
└─ Mostrar formulario de onboarding
         ↓
ONBOARDING
├─ Usuario completa formulario
├─ UPDATE onboarding_completo = true
└─ UPDATE campos específicos (interes_academico, matricula, etc.)
         ↓
DASHBOARD NORMAL
├─ onboarding_completo == true
└─ Carga layout según rol
```

---

### Flujo IDEAL (después de cambios)

```
REGISTRO  (✅ CAMBIO 1: registro.js)
├─ INSERT: id, nombre, email, rol='aspirante', onboarding_completo=false
└─ Valores explícitos, nunca NULL
         ↓
LOGIN  (✅ CAMBIO 2: login.js validación)
├─ SELECT rol  (retorna 'aspirante')
├─ Validar que no es NULL (defensivo)
└─ Redirect a dashboard.html
         ↓
DASHBOARD
├─ SELECT rol, onboarding_completo  (valores concretos)
├─ onboarding_completo == false? YES
└─ Mostrar formulario de onboarding
         ↓
ONBOARDING
├─ Usuario completa formulario
├─ UPDATE onboarding_completo = true
└─ UPDATE campos específicos
         ↓
DASHBOARD NORMAL
├─ onboarding_completo == true
└─ Carga layout según rol
```

---

## 📊 MATRIZ DE COLUMNAS POR ROL

```
COLUMNA                 INSCRITO-REGISTRO  INSCRITO-ONBOARDING  LEÍDO-DASHBOARD  LEÍDO-OTROS
═══════════════════════════════════════════════════════════════════════════════════════════════
id                      ✅ SÍ              ❌ NO               ✅ SÍ            ✅ SÍ (admin)
nombre                  ✅ SÍ              ❌ NO               ❌ NO            ✅ SÍ (varios)
email                   ✅ SÍ              ❌ NO               ❌ NO            ❌ NO
rol                     ❌ NO (PROBLEMA)   ❌ NO               ✅ SÍ            ✅ SÍ (nav)
onboarding_completo     ❌ NO (PROBLEMA)   ✅ SÍ               ✅ SÍ            ❌ NO

ASPIRANTE:
interes_academico       ❌ NO              ✅ SÍ               ❌ NO            ❌ NO
institucion             ❌ NO              ✅ SÍ               ❌ NO            ✅ (seguimiento)
grado                   ❌ NO              ✅ SÍ               ❌ NO            ✅ (seguimiento)

ESTUDIANTE:
matricula               ❌ NO              ✅ SÍ               ❌ NO            ✅ (progreso)
grado                   ❌ NO              ✅ SÍ               ❌ NO            ❌ NO
institucion             ❌ NO              ✅ SÍ               ❌ NO            ❌ NO
programaEducativo       ❌ NO              ❌ NO               ❌ NO            ✅ (progreso)
tutorAsignado           ❌ NO              ❌ NO               ❌ NO            ✅ (progreso)

FORMADOR:
area_expertise          ❌ NO              ✅ SÍ               ❌ NO            ❌ NO
experiencia             ❌ NO              ✅ SÍ               ❌ NO            ❌ NO
institucion             ❌ NO              ✅ SÍ               ❌ NO            ❌ NO

ADMIN:
(ningún campo específico)

HUÉRFANOS (nunca se usan):
onboarding_paso         ❌ NO              ❌ NO               ❌ NO            ❌ NO  ← ELIMINAR
onboarding_fecha        ❌ NO              ❌ NO               ❌ NO            ❌ NO  ← ELIMINAR
onboarding_iniciado     ❌ NO              ❌ NO               ❌ NO            ❌ NO  ← ELIMINAR
```

---

## 📈 TAMAÑO IDEAL DE LA TABLA

### Versión ACTUAL (con problemas)

```sql
5 IMPRESCINDIBLES (siempre presentes):
├─ id, nombre, email, rol, onboarding_completo

9-10 ESPECÍFICOS POR ROL (muchos NULL):
├─ ASPIRANTE: interes_academico, grado, institucion
├─ ESTUDIANTE: matricula, grado, institucion, programaEducativo, tutorAsignado
├─ FORMADOR: area_expertise, experiencia, institucion

3 HUÉRFANOS (nunca se usan):
├─ onboarding_paso, onboarding_fecha, onboarding_iniciado

TOTAL: ~17-18 columnas (con muchos NULL excesivos)
```

### Versión IDEAL FASE 1 (rápida)

```sql
5 IMPRESCINDIBLES (siempre presentes):
├─ id, nombre, email, rol, onboarding_completo

9-10 ESPECÍFICOS POR ROL (muchos NULL - pero es aceptable):
├─ ASPIRANTE: interes_academico, grado, institucion
├─ ESTUDIANTE: matricula, grado, institucion, programaEducativo, tutorAsignado
├─ FORMADOR: area_expertise, experiencia, institucion

TOTAL: ~14-15 columnas (3 menos, sin huérfanos)

CAMBIOS: Actualizar registro.js + validar login.js + eliminar huérfanos
RIESGO: BAJO
TIEMPO: 30 minutos
```

### Versión IDEAL FASE 2 (escalable)

```sql
TABLA PERFILES (MÍNIMA):
├─ id, nombre, email, rol, onboarding_completo, created_at, updated_at
└─ 7 columnas (MÍNIMO ABSOLUTO)

TABLAS ESPECÍFICAS POR ROL:
├─ perfiles_aspirante: id (FK), interes_academico, grado, institucion
├─ perfiles_estudiante: id (FK), matricula, grado, institucion, programaEducativo, tutorAsignado
└─ perfiles_formador: id (FK), area_expertise, experiencia, institucion

VENTAJAS:
├─ perfiles nunca tiene NULL excesivos
├─ Escalable fácilmente con nuevos roles
├─ Queries más rápidas (menos índices por tabla)
└─ Mejor separación de responsabilidades

DESVENTAJAS:
├─ Requiere JOINS en múltiples módulos
├─ 3-4 cambios de código en lecturas
└─ Más complicado de mantener inicialmente

CAMBIOS: 10-15 más líneas de código en módulos
RIESGO: MEDIO
TIEMPO: 2-3 horas
```

---

## ✅ RECOMENDACIÓN FINAL

### HACER AHORA (FASE 1):

1. ✅ **registro.js**: Agregar `rol: 'aspirante'` y `onboarding_completo: false` en INSERT
2. ✅ **login.js**: Agregar validación defensiva para `rol` NULL
3. ✅ **Supabase**: Eliminar columnas huérfanas (`onboarding_paso`, `onboarding_fecha`, `onboarding_iniciado`)

**Tiempo**: 30 minutos  
**Riesgo**: BAJO  
**Impacto**: ALTO (estabilidad mejorada)

### HACER EN FASE 2 (después de estabilizar FASE 1):

4. 🚀 **Opcional**: Separar en tablas específicas por rol para mejor escalabilidad

---

## 🔗 REFERENCIAS RÁPIDAS

**Documentos de análisis**:
- [ANALISIS_ONBOARDING.md](ANALISIS_ONBOARDING.md) - Análisis completo detallado
- [PLAN_ACCION.md](PLAN_ACCION.md) - Plan de implementación paso a paso

**Archivos a modificar**:
- [js/registro.js](js/registro.js#L54) - Agregar 2 campos en INSERT
- [js/login.js](js/login.js#L105) - Agregar validación NULL
- Supabase SQL Editor - Ejecutar DROP COLUMN

---

**Fin del resumen visual** ✅
