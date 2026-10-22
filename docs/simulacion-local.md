# Simulación local

La aplicación funciona como sitio estático: no necesita conexión con Supabase, claves, cuentas reales ni servicios remotos. Sírvela desde un servidor web local y abre `index.html`; no la abras directamente con `file://`, porque el navegador bloquea la carga de algunos módulos y layouts en ese modo.

## Acceso por rol

En `login.html`, puedes elegir un perfil para iniciar sesión con un clic. También puedes escribir el correo correspondiente y usar la contraseña común `posgrado`.

| Rol | Correo |
| --- | --- |
| Administrador | `danyhertiz@gmail.com` |
| Monitor | `hertizivea@gmail.com` |
| Facilitador | `unadmpogrado@gmail.com` |
| Estudiante | `unadmusuario@gmail.com` |

Cada cuenta abre el panel correspondiente a su rol. El administrador puede consultar y cambiar los roles de los perfiles desde la gestión de usuarios.

## Datos locales

Perfiles, registros, sesión y cambios se guardan en el almacenamiento del navegador. Los documentos del monitor se guardan en IndexedDB. Los datos solo existen en ese navegador y dispositivo; borrar los datos del sitio reinicia la simulación y no hay sincronización entre usuarios o dispositivos.

Este modo es exclusivamente para demostración. Las cuentas y los datos viven en el cliente y no deben utilizarse para proteger información real ni para producción.
