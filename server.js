// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const multer = require('multer');
const bcrypt = require('bcrypt');
const crypto = require('crypto'); // Para tokens de recuperación
const nodemailer = require('nodemailer'); // Para envío de correos

const app = express();
const PORT = 3000;

// Importar lógica de autenticación y DB
const { registrarUsuario, loginUsuario } = require('./auth.controller'); 
const db = require('./db.config');

// ===============================================
// CONFIGURACIÓN DE NODEMAILER (Para recuperación)
// ===============================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tu_correo@gmail.com', // Reemplazar con tu correo
        pass: 'xxxx xxxx xxxx xxxx'  // Reemplazar con tu contraseña de aplicación
    }
});

// ===============================================
// VALIDACIÓN DE CARPETA UPLOADS
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
        cb(null, 'perfil-' + req.session.userId + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// ===============================================
// MIDDLEWARES (Orden Crítico)
// ===============================================
app.use(session({
    secret: 'CLAVE_SECRETA_CATICO_2025', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Función de protección de rutas
function verificarAutenticacion(req, res, next) {
    if (req.session.isAuthenticated) {
        next();
    } else {
        req.session.originalUrl = req.originalUrl;
        res.redirect('/login.html'); 
    }
}

// ===============================================
// RUTAS DE PÁGINAS (PROTEGIDAS Y PÚBLICAS)
// ===============================================

// 1. Rutas que requieren protección (DEBEN IR ANTES QUE EL STATIC)
app.get('/Noticias.html', verificarAutenticacion, (req, res) => {
    res.sendFile(path.join(__dirname, 'Noticias.html'));
});

// 2. Rutas públicas específicas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    if (req.session.isAuthenticated) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'login.html'));
});

// 3. Servir archivos estáticos (CSS, JS, Imágenes)
app.use(express.static(__dirname)); 
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ===============================================
// API - GESTIÓN DE USUARIOS
// ===============================================

// Login
app.post('/api/login', async (req, res) => {
    const { email, contrasena } = req.body;
    const resultado = await loginUsuario(email, contrasena);

    if (resultado.success) {
        req.session.userId = resultado.userId; 
        req.session.isAuthenticated = true; 
        
        const redirectUrl = req.session.originalUrl || '/index.html';
        delete req.session.originalUrl;

        return res.status(200).json({ 
            success: true,
            redirect: redirectUrl 
        });
    } else {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
});

// Registro
app.post('/api/registro', async (req, res) => {
    const resultado = await registrarUsuario(req.body);
    if (resultado.success) {
        res.status(201).json({ success: true });
    } else {
        res.status(400).json({ error: resultado.error });
    }
});

// Perfil (Consulta)
app.get('/api/usuario/perfil', async (req, res) => {
    const userId = req.session.userId; 
    if (!userId) return res.status(401).json({ success: false, error: 'No autorizado' });

    try {
        const result = await db.query('SELECT nombre, email, universidad, ciudad_estado, linea_investigacion, perfil_google_url, orcid_id, foto_url FROM usuarios WHERE id = $1', [userId]);
        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// Actualizar Datos
app.post('/api/usuario/actualizar', async (req, res) => {
    const userId = req.session.userId;
    const { nombre, universidad, ciudad_estado, linea_investigacion, perfil_google_url, orcid_id } = req.body;
    if (!userId) return res.status(401).json({ success: false });

    try {
        await db.query(`UPDATE usuarios SET nombre = $1, universidad = $2, ciudad_estado = $3, linea_investigacion = $4, perfil_google_url = $5, orcid_id = $6 WHERE id = $7`, 
            [nombre, universidad, ciudad_estado, linea_investigacion, perfil_google_url, orcid_id, userId]);
        res.json({ success: true, mensaje: '¡Perfil actualizado!' });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// Foto de Perfil
app.post('/api/usuario/foto', upload.single('foto'), async (req, res) => {
    if (!req.file || !req.session.userId) return res.status(400).json({ success: false });
    const urlFoto = '/uploads/' + req.file.filename; 
    try {
        await db.query('UPDATE usuarios SET foto_url = $1 WHERE id = $2', [urlFoto, req.session.userId]);
        res.json({ success: true, url: urlFoto });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// Cambiar Contraseña
app.post('/api/usuario/cambiar-contrasena', async (req, res) => {
    const { passwordActual, passwordNueva } = req.body;
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ success: false });

    try {
        const userRes = await db.query('SELECT contrasena_hash FROM usuarios WHERE id = $1', [userId]);
        const match = await bcrypt.compare(passwordActual, userRes.rows[0].contrasena_hash);
        if (!match) return res.json({ success: false, error: 'Contraseña actual incorrecta.' });

        const nuevoHash = await bcrypt.hash(passwordNueva, 10);
        await db.query('UPDATE usuarios SET contrasena_hash = $1 WHERE id = $2', [nuevoHash, userId]);
        res.json({ success: true, mensaje: 'Contraseña actualizada.' });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// Recuperación de Contraseña (Token)
app.post('/api/auth/olvide-password', async (req, res) => {
    const { email } = req.body;
    try {
        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000); 
        const user = await db.query('UPDATE usuarios SET reset_token = $1, reset_expires = $2 WHERE email = $3 RETURNING id', [token, expires, email]);
        
        if (user.rows.length > 0) {
            const resetUrl = `http://${req.get('host')}/restablecer.html?token=${token}`;
            await transporter.sendMail({
                to: email,
                subject: 'Recuperar Contraseña - CATICO',
                html: `<p>Haz clic para restablecer: <a href="${resetUrl}">${resetUrl}</a></p>`
            });
        }
        res.json({ success: true, mensaje: 'Si el correo existe, recibirás instrucciones.' });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.status(200).json({ mensaje: 'Adiós' });
    });
});

// --- CONFIRMAR NUEVA CONTRASEÑA (RESET FINAL) ---
app.post('/api/auth/reset-confirm', async (req, res) => {
    const { token, nuevaPassword } = req.body;

    try {
        // 1. Buscar si el token es válido y no ha expirado
        const queryToken = `
            SELECT id FROM usuarios 
            WHERE reset_token = $1 AND reset_expires > NOW()
        `;
        const userRes = await db.query(queryToken, [token]);

        if (userRes.rows.length === 0) {
            return res.status(400).json({ success: false, error: 'El enlace ha expirado o es inválido.' });
        }

        const userId = userRes.rows[0].id;

        // 2. Hashear la nueva contraseña
        const nuevoHash = await bcrypt.hash(nuevaPassword, 10);

        // 3. Actualizar y limpiar el token para que no se use dos veces
        await db.query(`
            UPDATE usuarios 
            SET contrasena_hash = $1, reset_token = NULL, reset_expires = NULL 
            WHERE id = $2
        `, [nuevoHash, userId]);

        res.json({ success: true, mensaje: 'Contraseña actualizada con éxito.' });
    } catch (error) {
        console.error("Error en reset-confirm:", error);
        res.status(500).json({ success: false, error: 'Error interno del servidor.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor CATICO en http://localhost:${PORT}`);
});