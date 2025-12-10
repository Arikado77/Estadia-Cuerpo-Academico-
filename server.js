// server.js
// Importar módulos esenciales
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Importar la lógica de registro/login de usuarios
// Ambos deben estar en auth.controller.js
const { registrarUsuario, loginUsuario } = require('./auth.controller'); 

// ===============================================
// MIDDLEWARE (Manejo de Datos y Archivos Estáticos)
// ===============================================

// Middleware para procesar datos de formularios POST
// 1. Permite a Express leer el cuerpo de las solicitudes como JSON (útil para APIs)
app.use(express.json()); 
// 2. Permite a Express leer el cuerpo de las solicitudes de formularios HTML (url-encoded)
app.use(express.urlencoded({ extended: true }));

// Middleware para servir archivos estáticos (CSS, JS cliente, imágenes, HTML)
// Esto permite que el navegador cargue login.js, login.css, index.html, etc.
app.use(express.static(__dirname)); 

// ===============================================
// DEFINICIÓN DE RUTAS (GET y POST)
// ===============================================

// --- Rutas para servir páginas HTML (GET) ---

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Ruta de Noticias
app.get('/noticias', (req, res) => {
    res.sendFile(path.join(__dirname, 'Noticias.html'));
});

// Ruta ¿Qué es CA?
app.get('/ca', (req, res) => {
    res.sendFile(path.join(__dirname, 'CA.html'));
});

// Ruta Líneas de Conocimiento
app.get('/conocimiento', (req, res) => {
    res.sendFile(path.join(__dirname, 'Conocimiento.html'));
});


// --- Ruta para manejar el REGISTRO de usuarios (POST /api/registro) ---

app.post('/api/registro', async (req, res) => {
    // req.body contiene todos los datos enviados desde el formulario
    const datosRegistro = req.body; 

    // Llama a la función que guarda los datos en PostgreSQL
    const resultado = await registrarUsuario(datosRegistro);

    if (resultado.success) {
        return res.status(201).json({ 
            mensaje: 'Usuario registrado exitosamente. Ahora puedes iniciar sesión.'
        });
    } else {
        // Error de registro (ej. email ya existe)
        return res.status(400).json({ 
            error: resultado.error || 'Fallo en el registro. Inténtalo de nuevo.' 
        });
    }
});


// --- Ruta para manejar el LOGIN (POST /api/login) ---

app.post('/api/login', async (req, res) => {
    // req.body solo contiene el email y la contraseña
    const { email, contrasena } = req.body;

    // Llama a la función que verifica las credenciales en PostgreSQL
    const resultado = await loginUsuario(email, contrasena);

    if (resultado.success) {
        // Enviar token o cookie de sesión (aquí iría tu lógica de sesión)
        return res.status(200).json({ 
            mensaje: 'Inicio de sesión exitoso.', 
            userId: resultado.userId 
        });
    } else {
        // Credenciales inválidas
        return res.status(401).json({ error: resultado.error || 'Credenciales inválidas.' });
    }
});


// ===============================================
// INICIO DEL SERVIDOR
// ===============================================
app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
    console.log('Presiona CTRL+C para detener el servidor.');
});