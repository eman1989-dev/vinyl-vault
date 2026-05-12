# 🎵 Vinyls & More

Plataforma de e-commerce especializada en la venta de música en formato físico, incluyendo vinilos, CDs, cassettes y artículos de segunda mano.

## 📌 Descripción

**Vinyls & More** es una tienda en línea desarrollada con tecnologías modernas del stack MERN que permite a los usuarios:

* Comprar productos musicales físicos
* Explorar productos nuevos y de segunda mano
* Gestionar órdenes y usuarios
* Administrar inventario
* Realizar autenticación segura
* Interactuar con un chatbot asistente

El proyecto fue desarrollado como una solución completa de comercio electrónico enfocada en coleccionistas y amantes de la música física.

---

# 🚀 Tecnologías Utilizadas

## Frontend

* React
* TypeScript
* Vite
* TailwindCSS
* Shadcn/UI
* Axios
* React Router DOM

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcryptjs

## Otras herramientas

* Groq API (Chatbot)
* Git & GitHub

---

# 📂 Estructura del Proyecto

```bash
Vinyls-More/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── security/
│   ├── controllers/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   └── vite.config.ts
│
└── README.md
```

---

# ⚙️ Instalación

## 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/eman1989-dev/Vinyls-More.git
cd Vinyls-More
```

---

# 🖥️ Configuración del Backend

## Instalar dependencias

```bash
cd backend
npm install
```

## Variables de entorno

Crear un archivo `.env` dentro de `backend/`

```env
PORT=5000
MONGO_URI=tu_uri_de_mongodb
JWT_SECRET=tu_clave_secreta
API_KEY=tu_api_key_de_groq
```

## Ejecutar servidor

```bash
npm run dev
```

El backend correrá en:

```bash
http://localhost:5000
```

---

# 🎨 Configuración del Frontend

## Instalar dependencias

```bash
cd frontend
npm install
```

## Ejecutar frontend

```bash
npm run dev
```

La aplicación estará disponible en:

```bash
http://localhost:5173
```

---

# 🔐 Funcionalidades Principales

## 👤 Usuarios

* Registro e inicio de sesión
* Autenticación con JWT
* Roles de usuario y administrador

## 🛒 Tienda

* Catálogo de productos
* Carrito de compras
* Gestión de órdenes
* Productos de segunda mano

## 🛠️ Panel Administrador

* Gestión de usuarios
* Gestión de inventario
* Administración de órdenes

## 🤖 Chatbot

* Integración con Groq API
* Asistencia interactiva para usuarios

---

# 🗄️ Base de Datos

El proyecto utiliza **MongoDB** con modelos definidos mediante **Mongoose**.

Colecciones principales:

* Users
* Products
* Orders
* SecondHandSubmissions

---

# 📸 Capturas de Pantalla

> Puedes agregar aquí imágenes del sistema:

```md
![Home](./screenshots/home.png)
![Admin](./screenshots/admin.png)
```

---

# 📦 Scripts Disponibles

## Backend

```bash
npm run dev
npm start
```

## Frontend

```bash
npm run dev
npm run build
npm run preview
```

---

# 🔒 Seguridad

* Contraseñas encriptadas con bcryptjs
* Autenticación JWT
* Protección de rutas privadas
* Validación de datos

---

# 🌎 Futuras Mejoras

* Pasarela de pagos
* Wishlist
* Sistema de reseñas
* Panel de estadísticas
* Deploy en producción
* Integración con APIs musicales

---

# 👨‍💻 Autor

Desarrollado por Emanuel Fallas.

GitHub:
https://github.com/eman1989-dev

---

# 📄 Licencia

Este proyecto es de uso académico y educativo.
