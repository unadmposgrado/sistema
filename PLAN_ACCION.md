# 🚀 PLAN DE ACCIÓN: Optimización de tabla `perfiles`

**Documento**: Plan de implementación de cambios  
**Fase**: FASE 1 (Inmediato)  
**Riesgo**: BAJO  
**Estimado**: 30 minutos

---

## 📋 CHECKLIST DE CAMBIOS

### ✅ CAMBIO 1: Actualizar `registro.js` para insertar `rol` y `onboarding_completo`

**Archivo**: `js/registro.js` (líneas 54-60)

**Acción**:
- [ ] Leer líneas 54-60 de registro.js
- [ ] Agregar `rol: 'aspirante'` en el INSERT
- [ ] Agregar `onboarding_completo: false` en el INSERT
- [ ] Validar que el cambio sea correcto
- [ ] Verificar que no rompe el flujo de login

**Código actual**:
```javascript
const { error: profileError } = await supabaseClient
  .from('perfiles')
  .insert([
    {
      id: userId,
      nombre,
      email
    }
  ]);
```

**Código nuevo**:
```javascript
const { error: profileError } = await supabaseClient
  .from('perfiles')
  .insert([
    {
      id: userId,
      nombre,
      email,
      rol: 'aspirante',
      onboarding_completo: false
    }
  ]);
```

**Justificación**:
- Garantiza que `rol` nunca sea NULL (evita lógica `|| 'aspirante'`)
- Documenta explícitamente que el usuario no ha completado onboarding
- El login y dashboard.js ya están preparados para este cambio

---

### ⚠️ CAMBIO 2: Validación defensiva en `login.js` (RECOMENDADO)

**Archivo**: `js/login.js` (líneas 105-125)

**Acción**:
- [ ] Leer líneas 105-125 de login.js
- [ ] Agregar validación para `rol` NULL
- [ ] Agregar log de advertencia si es NULL
- [ ] Opcionalmente actualizar en BD si es NULL (para datos existentes)

**Código actual**:
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
```

**Código nuevo**:
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

// ✅ Validación defensiva para usuarios existentes con rol NULL
if (!perfil.rol) {
  console.warn('⚠️ Rol es NULL para usuario:', userId, '- asignando aspirante por defecto');
  perfil.rol = 'aspirante';
  
  // Actualizar en BD para evitar repetir validación
  try {
    await window.supabaseClient
      .from('perfiles')
      .update({ rol: 'aspirante' })
      .eq('id', userId);
  } catch (err) {
    console.warn('No se pudo actualizar rol en BD, continuando con valor local');
  }
}
```

**Justificación**:
- Proporciona compatibilidad con usuarios registrados ANTES de aplicar CAMBIO 1
- Evita errores silenciosos (más fácil de debuggear)
- Actualiza automáticamente datos inconsistentes

---

### 🗑️ CAMBIO 3: Limpiar tabla `perfiles` (Ejecutar después de CAMBIO 1 + 2)

**Acción**:
- [ ] Conectar a Supabase SQL Editor
- [ ] Ejecutar script SQL para eliminar columnas huérfanas
- [ ] Verificar que no hay datos en esas columnas
- [ ] Confirmar que el código sigue funcionando

**Script SQL**:
```sql
-- Verificar que no hay datos no-NULL en columnas a eliminar
SELECT COUNT(*) as with_onboarding_paso FROM perfiles WHERE onboarding_paso IS NOT NULL;
SELECT COUNT(*) as with_onboarding_fecha FROM perfiles WHERE onboarding_fecha IS NOT NULL;
SELECT COUNT(*) as with_onboarding_iniciado FROM perfiles WHERE onboarding_iniciado IS NOT NULL;

-- Si todos retornan 0, proceder a eliminar:
ALTER TABLE perfiles 
DROP COLUMN IF EXISTS onboarding_paso,
DROP COLUMN IF EXISTS onboarding_fecha,
DROP COLUMN IF EXISTS onboarding_iniciado;
```

**Justificación**:
- Estas columnas nunca se escriben ni se leen en el código JavaScript
- Eliminarlas reduce ruido en la tabla
- No afecta ningún flujo (verificado en análisis)

---

## 🔄 ORDEN DE IMPLEMENTACIÓN

### Paso 1: CAMBIO 1 en `registro.js`
**Riesgo**: BAJO  
**Tiempo**: 5 minutos  
**Rollback**: Cambiar los 2 campos en INSERT

```bash
✅ Solo afecta NUEVOS registros a partir de este momento
✅ Usuarios existentes no se ven afectados
✅ El login ya soporta esta estructura
```

### Paso 2: CAMBIO 2 en `login.js`
**Riesgo**: MUY BAJO  
**Tiempo**: 10 minutos  
**Rollback**: Eliminar la validación nueva

```bash
✅ Es defensivo, no cambia lógica existente
✅ Proporciona compatibilidad hacia atrás
✅ Ayuda a migrar datos antiguos
```

### Paso 3: Verificar flujo completo
**Pruebas**:
- [ ] Registrar nuevo usuario
- [ ] Confirmar email
- [ ] Login como nuevo usuario
- [ ] Verificar que aparece formulario de onboarding
- [ ] Completar formulario según rol
- [ ] Verificar que se redirige a dashboard
- [ ] Verificar que `onboarding_completo` está en TRUE

### Paso 4: CAMBIO 3 en Supabase
**Riesgo**: BAJO (pero DESPUÉS de pasos 1-3)  
**Tiempo**: 5 minutos  
**Rollback**: Recrear columnas (complejo, no recomendado)

```bash
⚠️ IMPORTANTE: Esperar 1-2 días después de PASO 1 para confirmar que
   el nuevo código de registro está funcionando bien.
⚠️ Hacer backup de tabla antes de ejecutar DROP COLUMN
```

---

## 🧪 TESTING CHECKLIST

Después de cada cambio, verificar:

### Test 1: Registro Nuevo
```bash
1. Ir a registro.html
2. Ingresar datos válidos
3. Verificar en Supabase que el registro tiene:
   ✅ id: [UUID]
   ✅ nombre: [ingresado]
   ✅ email: [ingresado]
   ✅ rol: 'aspirante' (NUEVO)
   ✅ onboarding_completo: false (NUEVO)
```

### Test 2: Login Nuevo Usuario
```bash
1. Ir a login.html
2. Ingresar credenciales del nuevo usuario
3. Verificar en consola que no hay errores
4. Verificar que se redirige a dashboard.html
5. Verificar que aparece formulario de onboarding
```

### Test 3: Onboarding Según Rol
```bash
Para cada rol (aspirante, estudiante, formador):
1. Cambiar manualmente rol en BD a ese valor
2. Hacer logout
3. Login nuevamente
4. Verificar que el formulario es el correcto
5. Completar formulario
6. Verificar que onboarding_completo = true
7. Verificar que dashboard carga con datos del formulario
```

### Test 4: Usuario Admin (sin onboarding)
```bash
1. Cambiar rol a 'admin' en BD
2. Login
3. Verificar que NO aparece formulario de onboarding
4. Verificar que carga layout admin
```

### Test 5: Usuario Existente (rol NULL)
```bash
SOLO si tienes datos antiguos con rol = NULL:
1. Ejecutar login con esos usuarios
2. Verificar en consola la advertencia de validación
3. Verificar que se asigna 'aspirante' automáticamente
4. Verificar que la BD se actualiza a 'aspirante'
```

---

## 📊 IMPACTO EN FLUJOS ACTUALES

### ✅ Impacto MÍNIMO
| Componente | Cambio | Impacto |
|------------|--------|---------|
| registro.js | Agrega 2 campos en INSERT | ✅ Solo INSERTS nuevos |
| login.js | Agrega validación NULL | ✅ Solo log defensivo |
| dashboard.js | Sin cambios | ✅ Ya soporta estructura |
| onboarding/*.js | Sin cambios | ✅ Sin cambios |
| modules/* | Sin cambios | ✅ Sin cambios |
| layouts/* | Sin cambios | ✅ Sin cambios |

### ✅ Mejoras de Estabilidad
- ❌ Menos lógica `|| 'aspirante'` implícita
- ✅ Datos más consistentes (rol nunca NULL)
- ✅ Mejor debugging (valores explícitos)
- ✅ Menor riesgo de errores futuros

---

## 📝 DOCUMENTACIÓN A ACTUALIZAR

Después de implementar, actualizar:

- [ ] **docs/ARQUITECTURA.md** - Actualizar definición de tabla `perfiles` (línea ~170)
- [ ] **docs/GUIA_RAPIDA.md** - Actualizar ejemplo de INSERT
- [ ] **docs/README.md** - Si menciona el flujo

### Ejemplo de actualización para ARQUITECTURA.md:

```markdown
### Tabla: `perfiles`
```sql
- id (UUID, PK)
- email (VARCHAR)
- nombre (VARCHAR)
- rol (VARCHAR: 'aspirante'|'estudiante'|'formador'|'admin', DEFAULT 'aspirante') ✅ NUEVO
- onboarding_completo (BOOLEAN, DEFAULT false) ✅ NUEVO
- interes_academico (VARCHAR, para aspirante)
- grado (VARCHAR)
- matricula (VARCHAR, para estudiante)
- programaEducativo (VARCHAR)
- tutorAsignado (VARCHAR)
- institucion (VARCHAR)
- area_expertise (VARCHAR, para formador)
- experiencia (INTEGER, para formador)
- created_at (TIMESTAMP)
```
```

---

## 🚨 ADVERTENCIAS

### ⚠️ Importante: Validar en tu BD actual

Antes de ejecutar cualquier cambio:

```sql
-- Verificar columnas actuales
\d perfiles  -- En psql

-- O en Supabase:
SELECT * FROM information_schema.columns 
WHERE table_name = 'perfiles';
```

Si tu tabla NO tiene todas estas columnas, puede fallar el código. Asegúrate de que tu BD tiene:
- ✅ `id`
- ✅ `nombre`
- ✅ `email`
- ⚠️ `rol` (¿existe? ¿es NULL o vacío?)
- ⚠️ `onboarding_completo` (¿existe? ¿es NULL o false?)

### ⚠️ Rollback si algo falla

Si después de CAMBIO 1 hay errores:

```javascript
// Revertir en registro.js:
.insert([{
  id: userId,
  nombre,
  email
  // Comentar o eliminar:
  // rol: 'aspirante',
  // onboarding_completo: false
}])
```

Luego, ejecutar en BD:

```sql
UPDATE perfiles SET rol = 'aspirante' WHERE rol IS NULL;
UPDATE perfiles SET onboarding_completo = false WHERE onboarding_completo IS NULL;
```

---

## ✅ CRITERIOS DE ÉXITO

Al finalizar todos los cambios:

- ✅ Nuevos usuarios se registran con `rol = 'aspirante'` y `onboarding_completo = false`
- ✅ Login funciona sin errores
- ✅ Dashboard detecta correctamente usuarios sin onboarding completado
- ✅ Formulario de onboarding se muestra según rol
- ✅ Después de completar onboarding, `onboarding_completo = true`
- ✅ Dashboard normal carga después de onboarding
- ✅ Admin no ve formulario de onboarding
- ✅ No hay errores en consola relacionados con `rol` NULL

---

**Fin del plan de acción** ✅

**Siguiente paso**: Proceder con CAMBIO 1 si todas las verificaciones son satisfactorias.
