# ⚡ INSTRUCCIONES RÁPIDAS - Tabla de Gestión de Usuarios

## 🎯 Lo Que Necesitas Saber

La **tabla de gestión de usuarios ya está completamente integrada** en el dashboard del administrador.

---

## ✅ Lo Que Debe Aparecer

Al entrar como admin al dashboard, verás:

```
GESTIÓN DE USUARIOS
┌──────────────────────────────────┐
│ Buscar: [_______]  Rol: [▼]      │
├──────────────────────────────────┤
│ Nombre | Email | Rol | Onb | Act │
├──────────────────────────────────┤
│ Datos de usuarios de Supabase...  │
└──────────────────────────────────┘
```

---

## 🔍 ¿Cómo Verificar que Funciona?

### Opción 1: Revisar Console (F12)
```
Abre: F12 → Console
Busca: "✅ Módulo de usuarios inicializado correctamente"
Si ves este mensaje → ¡Funciona! ✓
```

### Opción 2: Revisar en el Dashboard
```
1. Haz login como admin
2. Mira la sección "GESTIÓN DE USUARIOS"
3. Debe aparecer:
   - Input de búsqueda
   - Select de filtro
   - Tabla con usuarios
   - Botones de acción
```

### Opción 3: Prueba Funcionalidad
```
Búsqueda:    Escribe un nombre → Filtra en tiempo real
Filtro:      Selecciona rol → Muestra solo ese rol
Cambiar rol: Cambia rol en select → Confirma → Actualiza
Reset:       Haz clic en "🔄 Reset" → Confirma → Actualiza
```

---

## ⚙️ ¿Qué Cambió?

Solo 2 cambios mínimos:

1. **[modules/admin/usuarios.js](modules/admin/usuarios.js)**
   - Ahora exporta función `inicializarModuloUsuarios()`
   - Se ejecuta cuando dashboard.js lo llama

2. **[js/dashboard.js](js/dashboard.js#L293-L313)**
   - Importa dinámicamente usuarios.js
   - Llama a la función en el momento correcto

**Resultado:** La tabla aparece cuando el HTML está completamente listo.

---

## 🚀 ¿Qué Puedes Hacer Ahora?

### Cambiar Rol de Usuario
```
1. Selecciona nuevo rol en el dropdown
2. Haz clic "Aceptar" en la confirmación
3. ¡Se actualiza en Supabase automáticamente!
4. Badge de onboarding cambia a "⚠ Pendiente"
5. Usuario verá onboarding en próximo login
```

### Resetear Onboarding
```
1. Haz clic en botón "🔄 Reset"
2. Haz clic "Aceptar" en la confirmación
3. ¡Se actualiza en Supabase!
4. Rol NO cambia, solo onboarding
5. Usuario verá onboarding en próximo login
```

### Buscar/Filtrar Usuarios
```
Búsqueda:  Escribe nombre o email
Filtro:    Selecciona un rol específico
Combina:   Ambos funcionan juntos
```

---

## 📋 Checklist Rápido

- [ ] ¿Ves la sección "GESTIÓN DE USUARIOS" en el dashboard?
- [ ] ¿Aparece tabla con datos de Supabase?
- [ ] ¿Funciona la búsqueda?
- [ ] ¿Funciona el filtro de rol?
- [ ] ¿Puedes cambiar rol?
- [ ] ¿Puedes resetear onboarding?
- [ ] ¿Console (F12) no tiene errores rojos?

Si todos son ✓, **¡está funcionando perfectamente!**

---

## 🆘 ¿Problemas?

### "No veo la tabla"
```
1. Abre F12 → Console
2. Busca errores (rojo) o mensajes ✅
3. ¿Eres admin? (rol = admin en Supabase)
4. ¿Hay datos en tabla perfiles?
5. Refresca la página (Ctrl+R)
```

### "La tabla aparece pero sin datos"
```
1. Revisa Supabase → tabla perfiles
2. ¿Hay registros?
3. Verifica RLS permite SELECT al admin
4. Refresca (Ctrl+R)
```

### "Cambios no se guardan"
```
1. Abre F12 → Network
2. Haz un cambio
3. Busca petición a Supabase
4. ¿Status 200? (éxito)
5. ¿Ves datos en Supabase?
```

---

## 📞 Archivos Importantes

Si necesitas más información:

- [CORRECCION_RESUMEN.md](CORRECCION_RESUMEN.md) - Cómo funciona ahora
- [USUARIOS_QUICK_START.md](USUARIOS_QUICK_START.md) - Guía rápida
- [docs/USUARIOS_TESTING_GUIDE.md](docs/USUARIOS_TESTING_GUIDE.md) - Testing paso a paso
- [docs/USUARIOS_NOTAS_TECNICAS.md](docs/USUARIOS_NOTAS_TECNICAS.md) - Detalles técnicos

---

## ✨ Resumen

La funcionalidad está **100% integrada y lista**. 

No necesitas hacer nada más.

Solo entra como admin y verás la tabla.

**¡Que lo disfrutes!** 🎉

---

**Implementado:** 20 de enero de 2026  
**Status:** 🟢 LISTO
