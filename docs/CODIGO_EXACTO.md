# 🔧 CÓDIGO EXACTO A CAMBIAR

**Documento**: Referencias precisas de código para implementar CAMBIO 1 y CAMBIO 2

---

## CAMBIO 1: `js/registro.js` - Agregar `rol` y `onboarding_completo` en INSERT

### Ubicación exacta
**Archivo**: [js/registro.js](js/registro.js)  
**Líneas**: 54-60  
**Función**: `form.addEventListener('submit')`

### Código ACTUAL

```javascript
      // Paso 2: Insertar perfil en tabla 'perfiles'
      const userId = data.user.id;
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

### Código NUEVO

```javascript
      // Paso 2: Insertar perfil en tabla 'perfiles'
      const userId = data.user.id;
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

### Cambios específicos

```diff
          {
            id: userId,
            nombre,
            email
+           rol: 'aspirante',
+           onboarding_completo: false
          }
```

### Validación
Después del cambio, verificar:
```javascript
// ✅ Nuevas líneas agregadas:
- Línea 59: `rol: 'aspirante',`
- Línea 60: `onboarding_completo: false`

// ✅ Sintaxis correcta:
- Coma después de `email`
- Sin coma después de `onboarding_completo`
- Indentación correcta (2 espacios)
```

---

## CAMBIO 2: `js/login.js` - Agregar validación defensiva para `rol` NULL

### Ubicación exacta
**Archivo**: [js/login.js](js/login.js)  
**Líneas**: 105-115  
**Función**: `async function redirectByRole(userId)`

### Código ACTUAL

```javascript
  async function redirectByRole(userId) {
    try {
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

      // ✅ NUEVA ARQUITECTURA: Todos los roles usan dashboard.html
```

### Código NUEVO

```javascript
  async function redirectByRole(userId) {
    try {
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

      // ✅ Validación defensiva para usuarios con rol NULL (datos antiguos)
      if (!perfil.rol) {
        console.warn('⚠️ Rol es NULL para usuario:', userId, '- asignando aspirante por defecto');
        perfil.rol = 'aspirante';
        
        // Actualizar en BD para evitar repetir validación en futuros logins
        try {
          await window.supabaseClient
            .from('perfiles')
            .update({ rol: 'aspirante' })
            .eq('id', userId);
        } catch (err) {
          console.warn('⚠️ No se pudo actualizar rol en BD, continuando con valor local');
        }
      }

      // ✅ NUEVA ARQUITECTURA: Todos los roles usan dashboard.html
```

### Cambios específicos

```diff
      if (error || !perfil) {
        console.error('Error obteniendo rol:', error);
        setError('No se pudo determinar el tipo de usuario.');
        return;
      }

+     // ✅ Validación defensiva para usuarios con rol NULL (datos antiguos)
+     if (!perfil.rol) {
+       console.warn('⚠️ Rol es NULL para usuario:', userId, '- asignando aspirante por defecto');
+       perfil.rol = 'aspirante';
+       
+       // Actualizar en BD para evitar repetir validación en futuros logins
+       try {
+         await window.supabaseClient
+           .from('perfiles')
+           .update({ rol: 'aspirante' })
+           .eq('id', userId);
+       } catch (err) {
+         console.warn('⚠️ No se pudo actualizar rol en BD, continuando con valor local');
+       }
+     }

      // ✅ NUEVA ARQUITECTURA: Todos los roles usan dashboard.html
```

### Validación
Después del cambio, verificar:
```javascript
// ✅ Nuevas líneas agregadas:
- Línea 116-127: Validación de rol NULL

// ✅ Sintaxis correcta:
- if (!perfil.rol) { ... } está correctamente cerrada
- try/catch interno está correctamente cerrado
- console.warn tiene los mensajes descriptivos

// ✅ Indentación correcta (2 espacios)
```

---

## CAMBIO 3: Supabase SQL - Eliminar columnas huérfanas

### Ubicación
**Sistema**: Supabase SQL Editor  
**Tabla**: perfiles  
**Acción**: ALTER TABLE DROP COLUMN

### Pre-requisitos
```sql
-- Verificar que las columnas existen y están vacías
SELECT COUNT(*) as count_paso FROM perfiles WHERE onboarding_paso IS NOT NULL;
SELECT COUNT(*) as count_fecha FROM perfiles WHERE onboarding_fecha IS NOT NULL;
SELECT COUNT(*) as count_iniciado FROM perfiles WHERE onboarding_iniciado IS NOT NULL;

-- Si todos retornan 0, proceder con DROP
```

### Script a ejecutar

```sql
-- Eliminar columnas no utilizadas
ALTER TABLE perfiles 
DROP COLUMN IF EXISTS onboarding_paso,
DROP COLUMN IF EXISTS onboarding_fecha,
DROP COLUMN IF EXISTS onboarding_iniciado;

-- Verificar que se eliminaron
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'perfiles'
ORDER BY ordinal_position;
```

### Validación
Después de ejecutar:
```sql
-- ✅ Las columnas NO deben aparecer en:
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'perfiles';

-- ✅ Tabla debe tener ~14-15 columnas (según tu config)
-- ✅ Sin columnas: onboarding_paso, onboarding_fecha, onboarding_iniciado
```

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN

### Antes de hacer CAMBIO 1

- [ ] Hacer backup de tabla `perfiles` en Supabase (exportar datos)
- [ ] Verificar que el archivo `js/registro.js` existe y es accesible
- [ ] Abrir `js/registro.js` en editor
- [ ] Ubicar línea 54 (`// Paso 2: Insertar perfil`)

### Implementar CAMBIO 1

- [ ] Copiar el código NUEVO de `js/registro.js`
- [ ] Reemplazar líneas 54-60 exactamente como se muestra
- [ ] Guardar archivo (`Ctrl+S`)
- [ ] Verificar que el archivo se guardó

### Antes de hacer CAMBIO 2

- [ ] Verificar que `js/login.js` existe
- [ ] Abrir `js/login.js` en editor
- [ ] Ubicar línea 105 (`async function redirectByRole`)

### Implementar CAMBIO 2

- [ ] Copiar el código NUEVO de `js/login.js`
- [ ] Agregar las 12 líneas nuevas después de `if (error || !perfil)` block
- [ ] Guardar archivo (`Ctrl+S`)
- [ ] Verificar que el archivo se guardó

### Testing CAMBIO 1 + 2

- [ ] Abrir registro.html en navegador
- [ ] Registrar nuevo usuario con datos válidos
- [ ] Verificar en Supabase que se insertó `rol: 'aspirante'`
- [ ] Verificar en Supabase que se insertó `onboarding_completo: false`
- [ ] Hacer login con el nuevo usuario
- [ ] Verificar en consola (F12) que no hay errores de rol NULL
- [ ] Verificar que aparece formulario de onboarding

### Antes de hacer CAMBIO 3

- [ ] Esperar 1-2 días después de CAMBIO 1+2 para confirmar estabilidad
- [ ] Hacer backup completo de BD en Supabase
- [ ] Conectar a Supabase SQL Editor
- [ ] Copiar script de pre-requisitos

### Implementar CAMBIO 3

- [ ] Ejecutar script de pre-requisitos en Supabase SQL Editor
- [ ] Confirmar que todos retornan COUNT = 0
- [ ] Copiar script de ALTER TABLE
- [ ] Ejecutar ALTER TABLE en Supabase SQL Editor
- [ ] Verificar que no hay errores

### Testing CAMBIO 3

- [ ] Ejecutar SELECT column_name para verificar que se eliminaron
- [ ] Hacer login con usuario existente
- [ ] Verificar que el dashboard carga normalmente
- [ ] Verificar que el onboarding aún funciona

---

## 🚨 ERRORES COMUNES

### Error 1: "Sintaxis SQL no válida"

**Síntoma**: Error en Supabase SQL Editor al ejecutar ALTER TABLE  
**Causa**: Columnas no existen o hay error de sintaxis  
**Solución**:
```sql
-- Verificar que las columnas existen:
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'perfiles' 
AND column_name IN ('onboarding_paso', 'onboarding_fecha', 'onboarding_iniciado');

-- Si no aparecen, ya están eliminadas (OK)
-- Si aparecen y hay error, verificar la sintaxis del ALTER TABLE
```

### Error 2: "rol es undefined" en dashboard.js

**Síntoma**: Error en consola al acceder a dashboard después de login  
**Causa**: Olviste agregar rol en registro.js O datos antiguos con rol NULL  
**Solución**:
```javascript
// Verificar que CAMBIO 1 se aplicó correctamente
// Verificar que CAMBIO 2 se aplicó correctamente
// Si aún falla, ejecutar en Supabase SQL:
UPDATE perfiles SET rol = 'aspirante' WHERE rol IS NULL;
```

### Error 3: "onboarding_completo es undefined"

**Síntoma**: Error en dashboard.js línea 58  
**Causa**: Columna `onboarding_completo` no existe en BD O no se inserta en registro.js  
**Solución**:
```javascript
// Verificar que CAMBIO 1 se aplicó correctamente
// Verificar que la columna existe en BD:
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'perfiles' 
AND column_name = 'onboarding_completo';
```

### Error 4: "INSERT falla con error de columna desconocida"

**Síntoma**: Error al registrar nuevo usuario después de CAMBIO 1  
**Causa**: `rol` o `onboarding_completo` no existen en tabla  
**Solución**:
```sql
-- Agregar columnas a tabla si no existen:
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS rol VARCHAR DEFAULT 'aspirante';
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS onboarding_completo BOOLEAN DEFAULT false;
```

---

## ✅ VERIFICACIÓN POST-CAMBIOS

Ejecutar en navegador (consola F12) después de cada cambio:

```javascript
// CAMBIO 1 - Verificar registro
// Después de registrar nuevo usuario, en Supabase:
SELECT id, nombre, rol, onboarding_completo FROM perfiles 
WHERE email = 'test@example.com' LIMIT 1;

// CAMBIO 2 - Verificar login sin errores
// Abrir F12, pestaña Console, hacer login
// NO debe haber: "rol es undefined" o "cannot read property 'rol'"
// DEBE haber: "✅ Sesión validada" y "🎭 Rol del usuario: aspirante"

// CAMBIO 3 - Verificar eliminación de columnas
// En Supabase SQL:
SELECT COUNT(*) as columnas_totales FROM information_schema.columns 
WHERE table_name = 'perfiles';

// Debe ser ~14-15, NO ~17-18
```

---

**Fin de código exacto a cambiar** ✅

**Próximo paso**: Ejecutar los cambios siguiendo el orden y checklist anterior.
