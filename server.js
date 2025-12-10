// server.js
// Importar módulos esenciales
const express = require('express');
const path = require('path');
// *** NUEVA IMPORTACIÓN PARA SESIONES ***
const session = require('express-session'); 
const app = express();
const PORT = 3000;

// Importar la lógica de registro/login de usuarios
const { registrarUsuario, loginUsuario } = require('./auth.controller'); 

// ===============================================
// MIDDLEWARE (Manejo de Datos y Archivos Estáticos)
// ===============================================

// Middleware para procesar datos de formularios POST
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


// *** CONFIGURACIÓN DE EXPRESS-SESSION ***
app.use(session({
    // ¡CLAVE SECRETA CRUCIAL! Cambia esta cadena por una cadena aleatoria y muy larga en producción.
    secret: 'FXMy4ar9CZjHJ2025RRRA',
    resave: false, // Evita guardar la sesión si no hay cambios
    saveUninitialized: false, // Evita crear sesiones para usuarios no logueados
    cookie: { 
        maxAge: 3600000 // Sesión válida por 1 hora (en milisegundos)
    }
}));


// Middleware para servir archivos estáticos (CSS, JS cliente, imágenes, HTML)
app.use(express.static(__dirname)); 

// ===============================================
// DEFINICIÓN DE RUTAS (GET y POST)
// ===============================================

// --- Rutas para servir páginas HTML (GET) ---

// Modificamos la ruta principal para verificar si el usuario está logueado
app.get('/', (req, res) => {
    // Si la sesión existe, envía el index.html
    if (req.session.isAuthenticated) {
        return res.sendFile(path.join(__dirname, 'index.html'));
    }
    // Si no está autenticado, puedes redirigir a login, o solo enviar el index.html
    return res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    // Si ya está autenticado, redirige al inicio para evitar que entre de nuevo al login
    if (req.session.isAuthenticated) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Ruta de Noticias (Ejemplo de ruta protegida/no protegida)
app.get('/noticias', (req, res) => {
    res.sendFile(path.join(__dirname, 'Noticias.html'));
});

// ... (Resto de rutas GET: /ca, /conocimiento son iguales) ...

// --- Ruta para manejar el REGISTRO de usuarios (POST /api/registro) ---

app.post('/api/registro', async (req, res) => {
    // ... (Lógica de registro es la misma) ...
    const datosRegistro = req.body; 
    const resultado = await registrarUsuario(datosRegistro);

    if (resultado.success) {
        return res.status(201).json({ 
            mensaje: 'Usuario registrado exitosamente. Ahora puedes iniciar sesión.'
        });
    } else {
        return res.status(400).json({ 
            error: resultado.error || 'Fallo en el registro. Inténtalo de nuevo.' 
        });
    }
});


// --- Ruta para manejar el LOGIN (POST /api/login) ---

app.post('/api/login', async (req, res) => {
    const { email, contrasena } = req.body;
    const resultado = await loginUsuario(email, contrasena);

    if (resultado.success) {
        // *** 1. INICIAR SESIÓN (Guarda datos en la sesión/cookie) ***
        req.session.userId = resultado.userId; 
        req.session.isAuthenticated = true; 

        // 2. Responde al cliente (login.js) con éxito para que pueda redirigir
        return res.status(200).json({ 
            mensaje: 'Inicio de sesión exitoso.'
        });
    } else {
        // Credenciales inválidas
        return res.status(401).json({ error: resultado.error || 'Credenciales inválidas.' });
    }
});

// --- RUTA PARA CERRAR SESIÓN ---
app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Fallo al cerrar sesión.' });
        }
        res.clearCookie('connect.sid'); // Limpia la cookie de sesión del cliente
        res.status(200).json({ mensaje: 'Sesión cerrada.' });
    });
});


// ===============================================
// INICIO DEL SERVIDOR
// ===============================================
app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
    console.log('Presiona CTRL+C para detener el servidor.');
});