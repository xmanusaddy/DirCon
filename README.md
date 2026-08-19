# DirCon

DirCon es una app web para administrar contactos de forma simple y visual. Permite guardar la informacion principal de cada persona, consultar sus datos rapidamente y mantener un directorio ordenado desde una interfaz clara.

## Que permite hacer

- Crear, editar, buscar y eliminar contactos.
- Guardar nombre, telefono, correo, empresa y notas.
- Subir una foto para cada contacto.
- Agregar links extra como GitHub, Discord, LinkedIn, Instagram, sitio web u otros enlaces.
- Copiar telefono, correo y datos extra con un clic.
- Abrir enlaces externos directamente desde el panel del contacto.
- Cambiar tema, color de acento, idioma y orden de los contactos.

## Tecnologias

### Frontend

- HTML
- CSS
- JavaScript
- Fetch API

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- Multer para subida de imagenes
- Dotenv para variables de entorno

## Estructura

```text
DirCon/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── css/
│   ├── js/
│   └── index.html
└── README.md
```

## Uso local

### Backend

En la carpeta `backend`, crea un archivo `.env` con las variables necesarias:

```env
PORT=3000
MONGODB_URI=tu_conexion_de_mongodb
```

Luego instala dependencias y ejecuta el servidor:

```bash
cd backend
npm install
npm start
```

La API queda disponible en:

```text
http://localhost:3000
```

### Frontend

Sirve la carpeta `frontend` en un servidor local, por ejemplo en el puerto `5173`.

```text
http://localhost:5173
```

El frontend consume la API desde `http://localhost:3000/api/contacts`.
