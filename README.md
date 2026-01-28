
# CRM + Sistema de Admisiones UTE – Frontend
Frontend desarrollado en **ReactJS con TypeScript y Vite** para la gestión de un **CRM y sistema de admisiones universitarias**.  
El sistema se conecta a un backend desarrollado en **NestJS** mediante API REST y permite administrar usuarios, roles, clientes, postulaciones, matrículas y becas, integrando autenticación mediante **JWT** y una interfaz moderna con **Material-UI**.
---
## Características principales
- Interfaz de usuario moderna con **Material-UI (MUI)**
- Autenticación con **JWT**
  - Login
  - Almacenamiento del token en `localStorage`
  - Protección de rutas por rol
- Gestión completa de:
  - Usuarios y roles
  - Clientes del CRM
  - Postulaciones
  - Matrículas
  - Becas
- Layouts diferenciados por rol:
  - Administrador
  - Asesor
  - Aspirante
- Interceptores de **Axios** para:
  - Envío automático del token en cada petición
  - Manejo global de errores (401, 403)
- Navegación protegida con **React Router**
- Uso de **TypeScript** para tipado estático y mejor mantenimiento del código
---
## Tecnologías utilizadas
- **React** 19.2.0
- **TypeScript** 5.9.3
- **Vite** 7.2.4
- **Material-UI (MUI)** 7.3.7
- **React Router DOM** 7.12.0
- **Axios** 1.13.2
- **Emotion** 11.14.0
---
## Requisitos previos
Antes de instalar y ejecutar el proyecto, asegúrate de tener instalado:
- **Node.js** v18 o superior ([Descargar Node.js](https://nodejs.org/))
- **npm** (incluido con Node.js) o **yarn**
- **Backend NestJS** ejecutándose (ver [repositorio del backend](https://github.com/Alis0n09/CRM_Admisiones_UTE))
- **Navegador web moderno** (Chrome, Edge, Firefox, Safari)
### Verificar instalación
# Verificar versión de Node.js
node --version
# Verificar versión de npm
npm --version
________________________________________
Instalación del proyecto
1. Clonar el repositorio
git clone https://github.com/Alis0n09/CRM_Admisiones_UTE_Frontend.git
cd CRM_Admisiones_UTE_Frontend
2. Instalar dependencias
npm install
3. Configurar variables de entorno
Crear un archivo .env en la raíz del proyecto:
VITE_API_URL=http://localhost:3000
Nota: Si el backend está ejecutándose en un puerto diferente o en otro servidor, ajusta la URL según corresponda.
4. Iniciar el servidor de desarrollo
npm run dev
El frontend estará disponible en http://localhost:5173 (puerto por defecto de Vite).
________________________________________

Cómo conectarse a la API
El frontend se conecta automáticamente al backend mediante Axios. La configuración se encuentra en src/services/api.ts.
Configuración de la API
URL base
La URL base se obtiene de la variable de entorno VITE_API_URL o usa http://localhost:3000 por defecto:
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});
Autenticación con JWT
Los tokens JWT se envían automáticamente en el header Authorization de todas las peticiones:
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
Manejo de errores
El interceptor de respuesta maneja automáticamente errores 401 (no autorizado):
api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e?.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(e);
  }
);
Servicios disponibles
El proyecto incluye servicios para interactuar con los siguientes módulos del backend:
•	auth.service.ts - Autenticación (login, perfil, recuperación de contraseña)
•	usuario.service.ts - Gestión de usuarios
•	rol.service.ts - Gestión de roles
•	cliente.service.ts - Gestión de clientes
•	empleado.service.ts - Gestión de empleados
•	carrera.service.ts - Gestión de carreras
•	postulacion.service.ts - Gestión de postulaciones
•	documentoPostulacion.service.ts - Documentos de postulaciones
•	matricula.service.ts - Gestión de matrículas
•	beca.service.ts - Gestión de becas
•	becaEstudiante.service.ts - Relación beca-estudiante
•	seguimiento.service.ts - Seguimiento CRM
•	tarea.service.ts - Tareas CRM
Ejemplo de uso
1. Iniciar sesión
import { login } from './services/auth.service';
// Login
const response = await login('usuario@example.com', 'password123');
localStorage.setItem('token', response.access_token);
localStorage.setItem('user', JSON.stringify(response.user));
2. Realizar peticiones autenticadas
import { getUsuarios } from './services/usuario.service';
// El token se envía automáticamente en el header
const usuarios = await getUsuarios();
3. Crear un nuevo recurso
import { createUsuario } from './services/usuario.service';
const nuevoUsuario = await createUsuario({
  email: 'nuevo@example.com',
  password: 'password123',
  rolesIds: ['rol-id-1']
});
Endpoints del backend utilizados
El frontend consume los siguientes endpoints del backend:
Autenticación
•	POST /auth/login - Iniciar sesión
•	GET /auth/me - Obtener perfil del usuario
•	POST /auth/forgot-password - Solicitar restablecimiento de contraseña
•	POST /auth/reset-password - Restablecer contraseña con token
Módulos principales
•	Usuarios: /usuario (GET, POST, PUT, PATCH, DELETE)
•	Roles: /rol (GET, POST, PUT, PATCH, DELETE)
•	Contactos: /contacto (GET, POST, PUT, PATCH, DELETE)
•	Aspirantes: /aspirante (GET, POST, PUT, PATCH, DELETE)
•	Carreras: /carrera (GET, POST, PUT, PATCH, DELETE)
•	Postulaciones: /postulacion (GET, POST, PUT, PATCH, DELETE)
•	Matrículas: /matricula (GET, POST, PUT, PATCH, DELETE)
•	Becas: /beca (GET, POST, PUT, PATCH, DELETE)
________________________________________
Credenciales de prueba
Para probar el sistema, necesitas tener usuarios creados en el backend. Si el backend tiene usuarios de prueba configurados, puedes usarlos para iniciar sesión.Nota: Las credenciales de prueba deben ser proporcionadas por el administrador del sistema o configuradas en el backend durante la instalación.
Flujo de autenticación
1.	Accede a la ruta /login en el navegador
2.	Ingresa tu email y contraseña
3.	El sistema autenticará las credenciales con el backend
4.	Si las credenciales son correctas:
•	Se almacenará el token JWT en localStorage
•	Se guardará la información del usuario
•	Serás redirigido según tu rol (Admin, Asesor, Aspirante)




Verificar conexión con el backend
Si tienes problemas para conectarte al backend:
1.	Verifica que el backend esté ejecutándose en el puerto configurado (por defecto http://localhost:3000)
2.	Revisa la variable VITE_API_URL en tu archivo .env
3.	Asegúrate de que no haya problemas de CORS en el backend
4.	Abre las herramientas de desarrollador del navegador (F12) y revisa la pestaña "Network" para ver las peticiones HTTP

El frontend no se conecta al backend
1.	Verifica que el backend esté ejecutándose en el puerto configurado
2.	Revisa la variable VITE_API_URL en el archivo .env
3.	Asegúrate de que no haya problemas de CORS en el backend
4.	Verifica que el backend esté escuchando en la URL correcta
Error 401 (No autorizado)
1.	Verifica que el token JWT esté almacenado en localStorage (herramientas de desarrollador → Application → Local Storage)
2.	Asegúrate de haber iniciado sesión correctamente
3.	El token puede haber expirado, intenta iniciar sesión nuevamente
4.	Verifica que el backend esté configurado correctamente para validar tokens JWT

Autores
•	Alison Venegas
•	Victoria Chicaiza
•	Victoria Solórzano
Universidad UTE 
Tecnología en Desarrollo de Software

