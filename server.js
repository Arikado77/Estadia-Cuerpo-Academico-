// server.js
const express = require('express');
const path = require('path');
const fs = require('fs'); // <-- AGREGADO para manejar carpetas
const session = require('express-session');
const multer = require('multer'); // <-- Movido arriba por orden
const app = express();
const PORT = 3000;

// Importar lógica
const { registrarUsuario, loginUsuario } = require('./auth.controller'); 
const db = require('./db.config');
const bcrypt = require('bcrypt');

// ===============================================
// VALIDACIÓN DE CARPETA UPLOADS (SOLUCIONA EL ERROR 502)
// ===============================================
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ===============================================
// CONFIGURACIÓN DE MULTER
// ===============================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        // Usamos el ID de la sesión para nombrar el archivo de forma única
        cb(null, 'perfil-' + req.session.userId + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// ===============================================
// MIDDLEWARES
// ===============================================
app.use(session({
    secret: 'CLAVE_SECRETA_CATICO_2025', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Cambiar a true solo si ya tienes HTTPS activo
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); 
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Función de protección de rutas
function verificarAutenticacion(req, res, next) {
    if (req.session.isAuthenticated) {
        next();
    } else {
        req.session.originalUrl = req.originalUrl;
        res.redirect('/login'); 
    }
}

// ===============================================
// RUTAS
// ===============================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    if (req.session.isAuthenticated) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/noticias', verificarAutenticacion, (req, res) => {
    res.sendFile(path.join(__dirname, 'Noticias.html'));
});

// --- API PERFIL ---
app.get('/api/usuario/perfil', async (req, res) => {
    const userId = req.session.userId; 
    if (!userId) return res.status(401).json({ success: false, error: 'No autorizado' });

    try {
        const queryText = 'SELECT nombre, email, universidad, ciudad_estado, linea_investigacion, perfil_google_url, orcid_id, foto_url FROM usuarios WHERE id = $1';
        const result = await db.query(queryText, [userId]);
        if (result.rows.length > 0) {
            res.json({ success: true, user: result.rows[0] });
        } else {
            res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error de servidor' });
    }
});

// --- API ACTUALIZAR DATOS ---
app.post('/api/usuario/actualizar', async (req, res) => {
    const userId = req.session.userId;
    const { nombre, universidad, ciudad_estado, linea_investigacion, perfil_google_url, orcid_id } = req.body;
    if (!userId) return res.status(401).json({ success: false });

    try {
        const queryText = `UPDATE usuarios SET nombre = $1, universidad = $2, ciudad_estado = $3, linea_investigacion = $4, perfil_google_url = $5, orcid_id = $6 WHERE id = $7`;
        await db.query(queryText, [nombre, universidad, ciudad_estado, linea_investigacion, perfil_google_url, orcid_id, userId]);
        res.json({ success: true, mensaje: '¡Perfil actualizado!' });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// --- API FOTO ---
app.post('/api/usuario/foto', upload.single('foto'), async (req, res) => {
    // Verificamos que haya archivo y sesión
    if (!req.file || !req.session.userId) {
        return res.status(400).json({ success: false, error: 'No hay archivo o sesión' });
    }

    // CORRECCIÓN: La URL para el navegador no debe llevar "/public"
    const urlFoto = '/uploads/' + req.file.filename; 
    
    try {
        // Guardamos la URL en la base de datos
        await db.query('UPDATE usuarios SET foto_url = $1 WHERE id = $2', [urlFoto, req.session.userId]);
        
        // Devolvemos éxito y la URL correcta al frontend
        res.json({ success: true, url: urlFoto });
    } catch (error) {
        console.error("Error en DB al actualizar foto:", error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});

// --- API LOGIN / LOGOUT ---
app.post('/api/login', async (req, res) => {
    const { email, contrasena } = req.body;
    const resultado = await loginUsuario(email, contrasena);

    if (resultado.success) {
        req.session.userId = resultado.userId; 
        req.session.isAuthenticated = true; 
        
        // Si existe una URL guardada (como /noticias), la usamos. Si no, va al inicio /.
        const redirectUrl = req.session.originalUrl || '/';
        delete req.session.originalUrl; // Limpiamos para la próxima vez

        return res.status(200).json({ 
            success: true,
            mensaje: 'Inicio exitoso',
            redirect: redirectUrl // <-- Le enviamos la ruta al JS del cliente
        });
    } else {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
});

app.get('/api/status', async (req, res) => {
    if (req.session.isAuthenticated) {
        try {
            // Buscamos el nombre del usuario en la DB
            const result = await db.query('SELECT nombre FROM usuarios WHERE id = $1', [req.session.userId]);
            const nombreUsuario = result.rows[0].nombre;

            return res.json({ 
                isAuthenticated: true, 
                nombre: nombreUsuario // <-- Enviamos el nombre real
            });
        } catch (error) {
            return res.json({ isAuthenticated: true, nombre: 'Usuario' });
        }
    }
    res.json({ isAuthenticated: false });
});

app.post('/api/usuario/cambiar-contrasena', async (req, res) => {
    const { passwordActual, passwordNueva } = req.body;
    const userId = req.session.userId;

    if (!userId) return res.status(401).json({ success: false, error: 'Sesión expirada' });

    try {
        // 1. Obtener el hash actual
        const userRes = await db.query('SELECT contrasena_hash FROM usuarios WHERE id = $1', [userId]);
        
        if (userRes.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }

        // 2. Comparar con bcrypt
        const match = await bcrypt.compare(passwordActual, userRes.rows[0].contrasena_hash);

        if (!match) {
            return res.json({ success: false, error: 'La contraseña actual es incorrecta.' });
        }

        // 3. Hashear la nueva y guardar
        const nuevoHash = await bcrypt.hash(passwordNueva, 10);
        await db.query('UPDATE usuarios SET contrasena_hash = $1 WHERE id = $2', [nuevoHash, userId]);

        res.json({ success: true, mensaje: 'Contraseña actualizada correctamente.' });
    } catch (error) {
        console.error("Error al cambiar pass:", error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.status(200).json({ mensaje: 'Adiós' });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor CATICO en http://localhost:${PORT}`);
});