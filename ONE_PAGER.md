# 🎯 ONE-PAGER: Optimización de tabla `perfiles`

**Fecha**: 16 de enero de 2026 | **Proyecto**: Sistema de Seguimiento UnADM | **Estado**: ✅ ANÁLISIS COMPLETADO

---

## 📊 PROBLEMA IDENTIFICADO

| Aspecto | Situación | Impacto |
|---------|-----------|---------|
| Campo `rol` en registro | ❌ No se inserta → NULL | Frágil, asume 'aspirante' implícitamente |
| Campo `onboarding_completo` | ❌ No se inicializa → NULL | Frágil, asume false implícitamente |
| Columnas huérfanas | ❌ Existen 3 columnas no usadas | Ruido en BD, posible confusión futura |
| Validación en login | ❌ No detecta rol NULL | Punto de fallo silencioso |

---

## 💡 SOLUCIÓN PROPUESTA (FASE 1)

### 3 Cambios mínimos de bajo riesgo

| # | Cambio | Ubicación | Acción | Tiempo | Riesgo |
|---|--------|-----------|--------|--------|--------|
| 1️⃣ | Actualizar `registro.js` | Líneas 54-60 | Agregar `rol: 'aspirante'` y `onboarding_completo: false` en INSERT | 5 min | 🟢 BAJO |
| 2️⃣ | Validar en `login.js` | Líneas 105-130 | Agregar validación defensiva si `rol` es NULL | 10 min | 🟢 BAJO |
| 3️⃣ | Limpiar BD | Supabase SQL | Eliminar columnas huérfanas con ALTER TABLE | 5 min | 🟢 BAJO |

**Total**: 30 minutos | **Riesgo**: BAJO | **Impacto**: ALTO (estabilidad mejorada)

---

## 📋 COLUMNAS IDENTIFICADAS

### ✅ IMPRESCINDIBLES (5)
```
id, nombre, email, rol, onboarding_completo
```
Presentes en todo usuario, nunca NULL

### ⚠️ OPCIONALES POR ROL (9-10)
```
ASPIRANTE:    interes_academico, grado, institucion
ESTUDIANTE:   matricula, grado, institucion, programaEducativo, tutorAsignado
FORMADOR:     area_expertise, experiencia, institucion
ADMIN:        ninguno
```

### ❌ HUÉRFANAS (3)
```
onboarding_paso, onboarding_fecha, onboarding_iniciado
Nunca se usan en el código → ELIMINAR
```

---

## 🔄 ANTES Y DESPUÉS

```
┌─ ANTES ─────────────────────────┐  ┌─ DESPUÉS ────────────────────────┐
│                                 │  │                                  │
│ Registro:                       │  │ Registro:                        │
│ ├─ id, nombre, email            │  │ ├─ id, nombre, email             │
│ ├─ rol: NULL ❌                 │  │ ├─ rol: 'aspirante' ✅           │
│ └─ onboarding: NULL ❌          │  │ └─ onboarding: false ✅          │
│                                 │  │                                  │
│ Login: SELECT rol               │  │ Login: SELECT rol                │
│ ├─ Obtiene NULL ❌              │  │ ├─ Obtiene 'aspirante' ✅        │
│ └─ Asume por defecto ⚠️         │  │ ├─ Validación defensiva ✅       │
│                                 │  │ └─ Claro y robusto ✅            │
│                                 │  │                                  │
│ Tabla: 17-18 columnas           │  │ Tabla: 14-15 columnas            │
│ ├─ 5 imprescindibles            │  │ ├─ 5 imprescindibles             │
│ ├─ 9-10 específicos             │  │ ├─ 9-10 específicos              │
│ └─ 3 huérfanas ❌               │  │ └─ 0 huérfanas ✅                │
│                                 │  │                                  │
└─────────────────────────────────┘  └──────────────────────────────────┘
```

---

## 🎯 IMPACTO Y BENEFICIOS

### Mejoras de Código
- ✅ Menos lógica implícita (`|| 'aspirante'`)
- ✅ Datos más consistentes (valores explícitos desde el inicio)
- ✅ Mejor debugging (valores predecibles)
- ✅ Código más robusto y mantenible

### Mejoras de BD
- ✅ Tabla más limpia (sin columnas no usadas)
- ✅ Menos espacio en disco
- ✅ Esquema más claro
- ✅ Facilita migraciones futuras

### Mejoras de Estabilidad
- ✅ No hay riesgo de NULL inesperados
- ✅ Flujo de onboarding garantizado
- ✅ Menor riesgo de errores silenciosos
- ✅ Mejor para escalabilidad futura

---

## 📈 MATRIZ DE DECISIÓN

| Criterio | CAMBIO 1 | CAMBIO 2 | CAMBIO 3 |
|----------|----------|----------|----------|
| Urgencia | 🔴 ALTA | 🟡 MEDIA | 🟢 BAJA |
| Riesgo | 🟢 BAJO | 🟢 BAJO | 🟢 BAJO |
| Reversibilidad | ✅ Fácil | ✅ Fácil | ⚠️ Difícil |
| Impacto | 🟢 ALTO | 🟢 MEDIO | 🟢 BAJO |
| **RECOMENDACIÓN** | **🚀 AHORA** | **🚀 AHORA** | **⏰ DESPUÉS** |

---

## 🚀 ROADMAP

```
FASE 1 (AHORA - 30 minutos)
├─ Cambio 1: Actualizar registro.js
├─ Cambio 2: Validar login.js
├─ Cambio 3: Limpiar tabla perfiles
└─ Resultado: Tabla mínima, estable, consistente

FASE 2 (FUTURO - 2-3 horas, OPCIONAL)
├─ Separar en tablas por rol (perfiles_aspirante, etc.)
└─ Resultado: Escalabilidad mejorada, sin NULL excesivos
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

**PRE-IMPLEMENTACIÓN**
- [ ] Leer documentación (CONCLUSIONES.md + CODIGO_EXACTO.md)
- [ ] Hacer backup de tabla `perfiles`
- [ ] Revisar líneas exactas en archivos

**IMPLEMENTACIÓN**
- [ ] Cambio 1 en registro.js (5 min)
- [ ] Cambio 2 en login.js (10 min)
- [ ] Testing: Registrar nuevo usuario
- [ ] Cambio 3 en Supabase (después de 1-2 días si todo OK)

**VALIDACIÓN**
- [ ] Nuevo usuario tiene rol='aspirante'
- [ ] Nuevo usuario tiene onboarding_completo=false
- [ ] Login funciona sin errores
- [ ] Dashboard muestra onboarding
- [ ] Admin no ve onboarding
- [ ] Columnas huérfanas eliminadas

---

## 📚 DOCUMENTACIÓN

| Documento | Propósito | Duración |
|-----------|-----------|----------|
| [CONCLUSIONES.md](CONCLUSIONES.md) | Resumen ejecutivo | 15 min |
| [RESUMEN_VISUAL.md](RESUMEN_VISUAL.md) | Diagramas y gráficas | 10 min |
| [CODIGO_EXACTO.md](CODIGO_EXACTO.md) | Código a cambiar | 20 min |
| [PLAN_ACCION.md](PLAN_ACCION.md) | Guía paso a paso | 25 min |
| [ANALISIS_ONBOARDING.md](ANALISIS_ONBOARDING.md) | Análisis completo | 45 min |

---

## 🎓 RECOMENDACIÓN FINAL

### Para Ejecutivos
✅ **APROBAR CAMBIOS**: Mejora estabilidad sin riesgo, toma 30 minutos

### Para Técnicos
✅ **IMPLEMENTAR AHORA**: Cambios mínimos, documentación clara, bajo riesgo

### Para DevOps/DBA
✅ **PREPARAR BD**: Backup y SQL listo, ejecutar después de validación

---

**Decisión recomendada**: ✅ **IMPLEMENTAR FASE 1 INMEDIATAMENTE**

**Próximo paso**: Leer [CONCLUSIONES.md](CONCLUSIONES.md) (15 minutos)

---

*Análisis completado: 16/01/2026 | Generado por: Análisis Técnico Automático | Estado: ✅ LISTO PARA ACCIÓN*
