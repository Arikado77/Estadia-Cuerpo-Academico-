// server.js
// Importar módulos esenciales
const express = require('express');
const path = require('path');
const session = require('express-session'); // <-- ¡IMPORTANTE! Módulo de Sesión
const app = express();
const PORT = 3000;

// Importar la lógica de registro/login de usuarios
const { registrarUsuario, loginUsuario } = require('./auth.controller'); 
const db = require('./db.config');

// server.js - Añade esta función cerca del inicio, después de las importaciones
function verificarAutenticacion(req, res, next) {
    if (req.session.isAuthenticated) {
        // Si está autenticado, pasa a la siguiente función (carga la página)
        next();
    } else {
        // 1. GUARDA LA URL ORIGINAL a la que el usuario intentaba acceder
        req.session.originalUrl = req.originalUrl;
        
        // 2. Redirige al login
        res.redirect('/login'); 
    }
}

// ===============================================
// MIDDLEWARE DE SESIÓN (¡CRÍTICO PARA EL LOGIN!)
// ===============================================
app.use(session({
    secret: 'CLAVE_SECRETA_LARGA_Y_DIFICIL_DE_ADIVINAR_12345', // <-- ¡CAMBIA ESTO!
    resave: false, // Evita guardar la sesión si no ha cambiado
    saveUninitialized: false, // Evita guardar sesiones nuevas que no tienen datos
    cookie: { secure: false } // Usar 'false' para HTTP (desarrollo), 'true' para HTTPS (producción)
}));

// ===============================================
// MIDDLEWARE (Manejo de Datos y Archivos Estáticos)
// ===============================================

// Middleware para procesar datos de formularios POST (JSON y URL-encoded)
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


// Middleware para servir archivos estáticos (CSS, JS cliente, imágenes, HTML)
// Nota: Esto permite acceder a archivos como login.html, public/js/login.js, etc.
app.use(express.static(__dirname)); 

// ===============================================
// DEFINICIÓN DE RUTAS (GET y POST)
// ===============================================

// --- Rutas para servir páginas HTML (GET) ---

// Ruta principal
app.get('/', (req, res) => {
    // Si la sesión existe, envía el index.html
    if (req.session.isAuthenticated) {
        // En un proyecto real, aquí cargarías datos del usuario logueado
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

// Ruta de Noticias (Ejemplo)
// server.js
// Protege la ruta usando el middleware verificarAutenticacion
app.get('/noticias', verificarAutenticacion, (req, res) => {
    res.sendFile(path.join(__dirname, 'Noticias.html'));
});

// --- Ruta para manejar el REGISTRO de usuarios (POST /api/registro) ---

app.post('/api/registro', async (req, res) => {
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

// En tu server.js o archivo de rutas
app.get('/api/usuario/perfil', async (req, res) => {
    const userId = req.session.userId; 

    if (!userId) {
        // Si no hay ID en la sesión, respondemos con 401
        return res.status(401).json({ success: false, error: 'No autorizado' });
    }
    try {
        // Ahora 'db' ya existe porque lo importamos arriba
        const queryText = 'SELECT nombre, email, universidad, ciudad_estado, linea_investigacion, perfil_google_url, orcid_id FROM usuarios WHERE id = $1';
        const result = await db.query(queryText, [userId]);

        if (result.rows.length > 0) {
            res.json({ success: true, user: result.rows[0] });
        } else {
            res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error("Error en DB:", error);
        res.status(500).json({ success: false, error: 'Error de servidor' });
    }
});


// --- Ruta para manejar el LOGIN (POST /api/login) ---

// server.js
app.post('/api/login', async (req, res) => {
    const { email, contrasena } = req.body;
    const resultado = await loginUsuario(email, contrasena);

    if (resultado.success) {
        req.session.userId = resultado.userId; 
        req.session.isAuthenticated = true; 
        
        // **NUEVA LÓGICA DE REDIRECCIÓN AQUÍ**
        const redirectUrl = req.session.originalUrl || '/';
        delete req.session.originalUrl; // Limpia la URL guardada

        // En lugar de devolver un JSON, le decimos al cliente a dónde ir.
        // NOTA: Como el login viene de un fetch (JS del cliente), debemos decirle al cliente que se redirija.
        return res.status(200).json({ 
            mensaje: 'Inicio de sesión exitoso.',
            redirect: redirectUrl // <-- Enviamos la URL de destino al cliente
        });
        
    } else {
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

// server.js - Añade esta ruta junto a tus otras app.get y app.post

app.get('/api/status', (req, res) => {
    // Si req.session.isAuthenticated es true, envía el estado 'logueado'
    if (req.session.isAuthenticated) {
        return res.json({ 
            isAuthenticated: true, 
            // Opcional: puedes enviar el ID para mostrar el nombre del usuario
            userId: req.session.userId 
        });
    }
    
    // Si no hay sesión, envía el estado 'deslogueado'
    res.json({ isAuthenticated: false });
});

// ===============================================
// INICIO DEL SERVIDOR
// ===============================================
app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
    console.log('Presiona CTRL+C para detener el servidor.');
});