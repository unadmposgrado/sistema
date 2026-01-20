# 🧪 Guía de Testing - Módulo de Gestión de Usuarios

## ✅ Verificaciones Previas

Antes de probar el módulo, asegúrate de:

1. **Usuarios en Supabase**
   - [ ] Tabla `perfiles` existe en Supabase
   - [ ] Registros de prueba (al menos 2 usuarios no-admin)
   - [ ] Estructura: id, nombre, email, rol, onboarding_completo

2. **RLS Configurado**
   - [ ] Admin puede leer tabla `perfiles`
   - [ ] Admin puede actualizar `rol` y `onboarding_completo`
   - [ ] Otros roles no pueden leer/actualizar tabla

3. **Sesión Admin**
   - [ ] Acceso como usuario con rol = "admin"
   - [ ] Sesión activa en Supabase Auth

---

## 🚀 Pasos de Testing

### 1. Verificar Carga del Módulo
```javascript
// Abrir DevTools (F12) → Console
// Buscar mensajes:
✅ "📦 Inicializando módulo de usuarios admin..."
✅ "✅ Se obtuvieron X usuarios"
✅ "✅ Módulo de usuarios inicializado correctamente"

// Si hay error ❌, revisar console.error
```

### 2. Verificar Carga de Tabla
```
Debería aparecer:
┌─────────────────────────────────────────────┐
│ Nombre | Email | Rol | Onboarding | Acciones │
├─────────────────────────────────────────────┤
│ (datos de perfiles)                          │
└─────────────────────────────────────────────┘
```

- [ ] Tabla visible y completa
- [ ] Todas las columnas presentes
- [ ] Datos correctos de Supabase
- [ ] Badges de estado visibles

### 3. Test de Búsqueda
```
Input: "nombre de usuario"
Resultado esperado:
- [ ] Filtra en tiempo real
- [ ] Busca por nombre Y email
- [ ] Sin recargar página
- [ ] Vuelve a mostrar todos al borrar
```

Ejemplo:
```
1. Escribe "juan" → Muestra solo Juan García
2. Escribe "email.com" → Muestra usuarios con ese email
3. Borra input → Vuelve a mostrar todos
```

### 4. Test de Filtro por Rol
```
Select: "estudiante"
Resultado esperado:
- [ ] Solo muestra estudiantes
- [ ] Mantiene búsqueda si hay
- [ ] Sin recargar página
- [ ] Vuelve a mostrar todos al seleccionar "Todos los roles"
```

### 5. Test de Cambiar Rol ⭐ CRÍTICO
```
1. En tabla, selecciona rol diferente de un usuario
2. Debería aparecer: "¿Cambiar el rol a '...'?"
3. Haz clic en "Aceptar"
   ✅ Esperado:
      - Badge cambia a "⚠ Pendiente"
      - Rol se actualiza en Supabase inmediatamente
      - Sin recargar página
      - Usuario sigue logueado
   
4. Verifica en Supabase:
   - [ ] Campo `rol` cambió
   - [ ] Campo `onboarding_completo` = false
   - [ ] `updated_at` actualizado
```

Verificación en Supabase:
```sql
SELECT id, nombre, rol, onboarding_completo 
FROM perfiles 
WHERE id = 'usuario_que_modificaste';
```

### 6. Test de Resetear Onboarding ⭐ CRÍTICO
```
1. Haz clic en botón "🔄 Reset"
2. Debería aparecer: "¿Resetear el onboarding de este usuario?"
3. Haz clic en "Aceptar"
   ✅ Esperado:
      - Badge cambia a "⚠ Pendiente" (si estaba completado)
      - Rol NO cambia
      - Sin recargar página
      - Usuario sigue logueado

4. Verifica en Supabase:
   - [ ] Campo `rol` sin cambios
   - [ ] Campo `onboarding_completo` = false
   - [ ] `updated_at` actualizado
```

### 7. Test de Combinación Búsqueda + Filtro
```
Búsqueda: "maria"
Filtro: "facilitador"
Resultado: Muestra solo facilitadores llamados Maria
- [ ] Funciona sin recargar
- [ ] Filtros se aplican correctamente
```

### 8. Test de Estadísticas
```
Cambiar rol de un usuario y verificar:
- [ ] Contador "Total de usuarios" (no cambia)
- [ ] "Estudiantes activos" (aumenta/disminuye)
- [ ] "Facilitadores" (aumenta/disminuye)
- [ ] "Monitores en revisión" (aumenta/disminuye)
```

Ejemplo:
```
ANTES: Estudiantes = 5, Facilitadores = 2
Cambias a un estudiante a facilitador
DESPUÉS: Estudiantes = 4, Facilitadores = 3
```

### 9. Test de Manejo de Errores
```
1. Desconecta internet temporalmente
2. Intenta cambiar rol
3. Debería haber error en console y alerta en UI
   - [ ] console.error() muestra error
   - [ ] UI muestra "Error al cambiar el rol"
   - [ ] Campo vuelve al valor anterior

4. Reconecta y reintenta
   - [ ] Funciona nuevamente
```

### 10. Test Responsive (Móvil)
```
DevTools → Device Toolbar (iPhone/iPad)
- [ ] Tabla se ve correctamente
- [ ] Input de búsqueda funciona
- [ ] Select de filtro funciona
- [ ] Botones son clickeables
- [ ] Sin overflow horizontal
```

---

## 🐛 Problemas Comunes y Soluciones

### Problema: "Tabla no carga / muestra 'Cargando usuarios...'"
```
Soluciones:
1. Abre Console (F12)
2. Busca error: "Error obteniendo perfiles"
3. Revisa:
   - ¿Usuario es admin?
   - ¿Tiene RLS configurado correctamente?
   - ¿Tabla perfiles existe?
   - ¿Hay datos en perfiles?
```

### Problema: "Cambio de rol no se refleja en Supabase"
```
Soluciones:
1. Verifica RLS permite UPDATE:
   - Supabase → Table perfiles → RLS Policies
   - Política UPDATE debe permitir al admin
2. Revisa console por errores
3. Verifica que admin es propietario del registro
```

### Problema: "Búsqueda muy lenta"
```
Nota: Búsqueda es en JavaScript (lado del cliente)
Esto es normal si hay muchos usuarios.
Optimización futura: implementar búsqueda en backend
```

### Problema: "Módulo no carga en absoluto"
```
Soluciones:
1. ¿Los 3 archivos existen?
   - modules/admin/usuarios.js ✅
   - modules/admin/usuarios.api.js ✅
   - modules/admin/usuarios.ui.js ✅

2. ¿dashboard.js tiene type="module" en usuariosModule?
   - Línea ~296: usuariosModule.type = 'module'; ✅

3. Revisa console.error()
4. Verifica que #usersList existe en admin.html
```

---

## 📊 Tabla de Validación Final

| Aspecto | ¿Funciona? | Notas |
|---------|-----------|-------|
| Módulo carga | [ ] | Mensajes en console |
| Tabla se renderiza | [ ] | Datos de Supabase |
| Búsqueda | [ ] | Por nombre/email |
| Filtro rol | [ ] | Todos los roles |
| Cambiar rol | [ ] | Con confirmación |
| Reset onboarding | [ ] | Con confirmación |
| Estadísticas actualizan | [ ] | Contadores correctos |
| Sin recargar página | [ ] | AJAX/dinámico |
| Usuario sigue logueado | [ ] | Sin desconexión |
| Supabase actualiza | [ ] | Verified en DB |
| Responsive | [ ] | Móvil funciona |
| Error handling | [ ] | console.error visible |

---

## 🎯 Checklist Final

Antes de dar por finalizado el testing:

- [ ] Todos los tests de funcionalidad pasaron
- [ ] No hay errores en console
- [ ] Cambios se reflejan en Supabase inmediatamente
- [ ] Usuario admin sigue logueado después de cambios
- [ ] Otros usuarios ven cambios en próximo login
- [ ] Página es responsiva en móvil
- [ ] Mensajes de error son claros
- [ ] Badges de estado son visuales

---

## 📞 Logs Útiles

Para debugging, busca estos mensajes en Console:

```javascript
✅ "📦 Inicializando módulo de usuarios admin..."
✅ "Se obtuvieron X usuarios"
✅ "Módulo de usuarios inicializado correctamente"

// Cambio de rol
✅ "Cambiando rol de [ID] a [nuevoRol]..."
✅ "Rol actualizado exitosamente"

// Reset onboarding
✅ "Reseteando onboarding de [ID]..."
✅ "Onboarding reseteado exitosamente"

// Errores
❌ "Error obteniendo perfiles:"
❌ "Error cambiando rol:"
❌ "Error reseteando onboarding:"
```

---

## 🚀 Conclusión

Si todos los tests pasan: **¡Módulo listo para producción!** ✅

Si hay problemas: Revisa los logs, la consola y las soluciones comunes arriba.

Fecha de testing: ________________
Resultado: [ ] ✅ EXITOSO [ ] ❌ FALLÓ - Notas: _______________
