// Importar módulos esenciales
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Importar la lógica de registro de usuarios
// Asumiendo que el archivo login.js está en el mismo directorio.
const { registrarUsuario } = require('./login'); 

// ===============================================
// MIDDLEWARE (Manejo de Datos y Archivos Estáticos)
// ===============================================

// Middleware para procesar datos de formularios POST
// 1. Permite a Express leer el cuerpo de las solicitudes como JSON (útil para APIs)
app.use(express.json()); 
// 2. Permite a Express leer el cuerpo de las solicitudes de formularios HTML (url-encoded)
app.use(express.urlencoded({ extended: true }));

// Middleware para servir archivos estáticos (CSS, JS cliente, imágenes, HTML)
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


// --- Ruta para manejar el registro de usuarios (POST) ---

app.post('/api/registro', async (req, res) => {
    // req.body contiene todos los datos enviados desde el formulario HTML
    const datosRegistro = req.body; 

    // Llama a la función que guarda los datos en PostgreSQL
    const resultado = await registrarUsuario(datosRegistro);

    if (resultado.success) {
        // Redirigir al usuario al login o a una página de éxito
        // Opcional: puedes enviar un JSON o redirigir
        return res.status(201).json({ 
            mensaje: 'Usuario registrado exitosamente. Ahora puedes iniciar sesión.'
        });
        // Si quieres redirigir a login.html: res.redirect('/login');
    } else {
        // Error de registro (ej. email ya existe)
        return res.status(400).json({ 
            error: resultado.error || 'Fallo en el registro. Inténtalo de nuevo.' 
        });
    }
});


// ===============================================
// INICIO DEL SERVIDOR
// ===============================================
app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
    console.log('Presiona CTRL+C para detener el servidor.');
});