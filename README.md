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
  - Público
- Interceptores de **Axios** para:
  - Envío automático del token en cada petición
  - Manejo global de errores (401, 403)
- Recuperación de contraseña mediante correo electrónico
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

- **Node.js** v18 o superior
- **npm** (incluido con Node.js)
- Backend NestJS en ejecución
- Navegador web moderno (Chrome, Edge, Firefox)

---

## Instalación del proyecto

Clonar el repositorio:

```bash
git clone https://github.com/Alis0n09/CRM_Admisiones_UTE_Frontend.git
