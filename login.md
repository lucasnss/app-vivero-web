# 🛡️ Plan de Implementación: Login de Administrador Seguro (JWT + Cookie HttpOnly + AuthContext)

---

## 1️⃣ Backend: Endpoints de Autenticación

### 1.1. Crear endpoint `/api/auth/login`
- Recibe: `{ email, password }`
- Valida credenciales.
- Si son correctas:
  - Genera JWT (con rol y expiración corta, ej: 15 min).
  - (Opcional) Genera refresh token (expiración larga, ej: 7 días).
  - Devuelve:
    - `Set-Cookie: jwt=...; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=900`
    - (Opcional) `Set-Cookie: refresh=...; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
    - Respuesta JSON: `{ success: true, user: { id, email, role } }`

### 1.2. Crear endpoint `/api/auth/me`
- Lee la cookie `jwt`.
- Si es válida, responde con los datos del usuario (id, email, role).
- Si no, responde 401.

### 1.3. Crear endpoint `/api/auth/logout`
- Borra la cookie `jwt` (y refresh si existe) con `Set-Cookie` expirado.
- Responde `{ success: true }`.

### 1.4. (Opcional) Endpoint `/api/auth/refresh`
- Lee la cookie `refresh`.
- Si es válida, genera un nuevo JWT y lo setea en cookie.
- Responde `{ success: true }`.

---

## 2️⃣ Backend: Middleware y Protección de Rutas

### 2.1. Middleware global
- En cada endpoint protegido (`/api/admin/*`, `/api/products` POST/PUT/DELETE, etc.):
  - Lee y valida la cookie `jwt`.
  - Si no es válida, responde 401.
  - Si el rol no es admin/super_admin, responde 403.

### 2.2. Roles y permisos
- Ya implementado: verifica el rol en el JWT y los permisos en cada endpoint.

---

## 3️⃣ Frontend: Contexto de Autenticación y UI

### 3.1. Crear `AuthContext`
- Al iniciar la app, llama a `/api/auth/me`:
  - Si responde 200, guarda el usuario en contexto y setea `isAuthenticated = true`.
  - Si responde 401, setea `isAuthenticated = false`.
- Expone métodos: `login`, `logout`, `user`, `isAuthenticated`, `loading`.

### 3.2. Formulario de login
- Envía email+password a `/api/auth/login` (POST).
- Si responde OK, recarga el contexto (llama a `/api/auth/me`).
- Si error, muestra mensaje.

### 3.3. Logout
- Llama a `/api/auth/logout`.
- Limpia el contexto y redirige a `/login`.

### 3.4. Protección de rutas
- Crea un componente `<PrivateRoute>` o usa un hook en cada página admin:
  - Si `!isAuthenticated && !loading`, redirige a `/login`.
- (Opcional) Si el usuario no tiene el rol adecuado, muestra “No tienes permisos”.

### 3.5. Interceptor global de errores
- Si cualquier fetch a la API devuelve 401/403:
  - Llama a `logout` y redirige a `/login`.
  - (Evita loops de logout si hay varias peticiones concurrentes).

---

## 4️⃣ Frontend: UI y permisos

### 4.1. Mostrar/ocultar UI según rol
- Si `isAuthenticated`, muestra la UI de admin.
- Si hay más roles en el futuro, usa un “permissions map” para mostrar/ocultar botones.

### 4.2. Feedback de errores
- Si una acción devuelve 403, muestra un toast: “No tienes permisos para esta acción”.

---

## 5️⃣ Seguridad y buenas prácticas

- Usa `Secure` y `SameSite=Lax` en cookies.
- Usa `HttpOnly` para que el token no sea accesible por JS.
- Configura CORS si frontend y backend están en dominios distintos.
- (Opcional) Implementa refresh token para sesiones largas.
- Documenta el flujo en el README del proyecto.

---

## 6️⃣ Integración con tareas pendientes

- **FASE 4:** El login y la protección de rutas refuerzan la seguridad de los endpoints ya protegidos por roles y permisos.
- **FASE 5:** Cuando integres el frontend, ya tendrás el contexto de auth y la protección de rutas lista.
- **FASE 6:** Los tests de endpoints deben incluir casos de login/logout y acceso con/ sin permisos.
- **FASE 7:** Antes de deploy, revisa que las cookies sean `Secure` y que CORS esté bien configurado.

---

## Checklist de tareas concretas

1. [ ] Implementar `/api/auth/login` (JWT en cookie HttpOnly)
2. [ ] Implementar `/api/auth/me`
3. [ ] Implementar `/api/auth/logout`
4. [ ] (Opcional) `/api/auth/refresh`
5. [ ] Middleware backend para validar JWT en cookies en endpoints protegidos
6. [ ] Crear `AuthContext` en frontend
7. [ ] Crear formulario de login y lógica de login/logout
8. [ ] Proteger rutas admin en frontend con `<PrivateRoute>` o hook
9. [ ] Interceptor global para manejar 401/403
10. [ ] Mostrar/ocultar UI según rol/permisos
11. [ ] Documentar el flujo y las decisiones en el README

---

**Notas:**
- Este plan está alineado con la arquitectura y tareas actuales del proyecto ViveroWeb.
- Cada paso puede integrarse progresivamente sin romper el flujo actual.
- El sistema es escalable para futuros roles, permisos y mejoras de seguridad. 