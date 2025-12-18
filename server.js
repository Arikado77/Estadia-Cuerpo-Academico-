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
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: {
        user: 'utch.tico@gmail.com', 
        pass: 'feixhvusmbqiidtv'  
    }
});

// ===============================================
// CONFIGURACIÓN DE ALMACENAMIENTO (MULTER)
// ===============================================
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. Almacenamiento General (Fotos de perfil)
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'public/uploads/'); },
    filename: (req, file, cb) => {
        cb(null, 'perfil-' + (req.session.userId || Date.now()) + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage }); // Esta es la variable 'upload' que faltaba

// Busca esta parte y déjala así:
const newsStorage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'public/uploads/'); },
    filename: (req, file, cb) => {
        cb(null, 'noticia-' + Date.now() + path.extname(file.originalname));
    }
});

const uploadNews = multer({ 
    storage: newsStorage,
    limits: { 
        fileSize: 20 * 1024 * 1024, // 20 MB en bytes
        fieldSize: 20 * 1024 * 1024 // Para que aguante textos largos con fotos
    } 
});

// ===============================================
// MIDDLEWARES (Orden Crítico)
// ===============================================
app.use(session({
    secret: 'CLAVE_SECRETA_CATICO_2025', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));

app.use(express.json({ limit: '20mb' })); 
app.use(express.urlencoded({ limit: '20mb', extended: true }));

function verificarAutenticacion(req, res, next) {
    if (req.session.isAuthenticated) {
        next();
    } else {
        req.session.originalUrl = req.originalUrl;
        res.redirect('/login.html'); 
    }
}

function verificarAdmin(req, res, next) {
    if (req.session.isAuthenticated && req.session.esAdmin === true) {
        next();
    } else {
        res.status(403).json({ success: false, error: "Acceso denegado: Se requieren permisos de Admin" });
    }
}

// ===============================================
// RUTAS DE PÁGINAS
// ===============================================

app.get('/Noticias.html', verificarAutenticacion, (req, res) => {
    res.sendFile(path.join(__dirname, 'Noticias.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    if (req.session.isAuthenticated) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.use(express.static(__dirname)); 
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ===============================================
// API - GESTIÓN DE USUARIOS
// ===============================================

app.post('/api/login', async (req, res) => {
    const { email, contrasena } = req.body;
    const resultado = await loginUsuario(email, contrasena);

    if (resultado.success) {
        req.session.userId = resultado.userId; 
        req.session.isAuthenticated = true;
        req.session.esAdmin = resultado.esAdmin;
        
        const redirectUrl = req.session.originalUrl || '/index.html';
        delete req.session.originalUrl;

        return res.status(200).json({ success: true, redirect: redirectUrl });
    } else {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
});

app.post('/api/registro', async (req, res) => {
    const resultado = await registrarUsuario(req.body);
    if (resultado.success) {
        res.status(201).json({ success: true });
    } else {
        res.status(400).json({ error: resultado.error });
    }
});

app.get('/api/usuario/perfil', async (req, res) => {
    const userId = req.session.userId; 
    if (!userId) return res.status(401).json({ success: false, error: 'No autorizado' });

    try {
        const result = await db.query(
            'SELECT nombre, email, universidad, ciudad_estado, linea_investigacion, perfil_google_url, orcid_id, foto_url, es_admin FROM usuarios WHERE id = $1', 
            [userId]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false });
        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.post('/api/usuario/actualizar', async (req, res) => {
    const userId = req.session.userId;
    const { nombre, universidad, ciudad_estado, linea_investigacion, perfil_google_url, orcid_id } = req.body;
    if (!userId) return res.status(401).json({ success: false });

    try {
        await db.query(`UPDATE usuarios SET nombre = $1, universidad = $2, ciudad_estado = $3, linea_investigacion = $4, perfil_google_url = $5, orcid_id = $6 WHERE id = $7`, 
            [nombre, universidad, ciudad_estado, linea_investigacion, perfil_google_url, orcid_id, userId]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

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

app.post('/api/usuario/cambiar-contrasena', async (req, res) => {
    const { passwordActual, passwordNueva } = req.body;
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ success: false });

    try {
        const userRes = await db.query('SELECT contrasena_hash FROM usuarios WHERE id = $1', [userId]);
        const match = await bcrypt.compare(passwordActual, userRes.rows[0].contrasena_hash);
        if (!match) return res.json({ success: false, error: 'Actual incorrecta.' });

        const nuevoHash = await bcrypt.hash(passwordNueva, 10);
        await db.query('UPDATE usuarios SET contrasena_hash = $1 WHERE id = $2', [nuevoHash, userId]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.post('/api/auth/olvide-password', async (req, res) => {
    const { email } = req.body;
    try {
        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000);
        const user = await db.query('UPDATE usuarios SET reset_token = $1, reset_expires = $2 WHERE email = $3 RETURNING nombre', [token, expires, email]);
        res.json({ success: true, mensaje: 'Enviado.' });
        if (user.rows.length > 0) {
            const resetUrl = `http://${req.get('host')}/restablecer.html?token=${token}`;
            transporter.sendMail({
                to: email,
                subject: 'Recuperar Contraseña',
                html: `<p>Hola ${user.rows[0].nombre}, click aquí: <a href="${resetUrl}">${resetUrl}</a></p>`
            });
        }
    } catch (error) { res.status(500).json({ success: false }); }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.status(200).json({ success: true });
    });
});

app.post('/api/usuario/actualizar-avatar', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ success: false });
    const { avatarUrl } = req.body;
    try {
        await db.query('UPDATE usuarios SET foto_url = $1 WHERE id = $2', [avatarUrl, req.session.userId]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
});

// ===============================================
// API - GESTIÓN DE NOTICIAS (FUSIONADA)
// ===============================================

app.get('/api/noticias', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT n.*, u.nombre as autor 
            FROM noticias n 
            LEFT JOIN usuarios u ON n.autor_id = u.id 
            ORDER BY n.fecha_creacion DESC
        `);
        res.json({ success: true, noticias: result.rows });
    } catch (error) { res.status(500).json({ success: false }); }
});

// RUTA ÚNICA PARA CREAR Y EDITAR (Soporta Galería)
app.post('/api/noticias', verificarAdmin, uploadNews.single('imagen'), async (req, res) => {
    const { id, titulo, contenido } = req.body;
    const imagen_url = req.file ? '/uploads/' + req.file.filename : null;

    try {
        // MODO EDICIÓN
        if (id && id !== "" && id !== "undefined") {
            if (imagen_url) {
                await db.query('UPDATE noticias SET titulo=$1, contenido=$2, imagen_url=$3 WHERE id=$4', [titulo, contenido, imagen_url, id]);
            } else {
                await db.query('UPDATE noticias SET titulo=$1, contenido=$2 WHERE id=$3', [titulo, contenido, id]);
            }
            return res.json({ success: true, mensaje: "Actualizada" });
        } 
        // MODO CREACIÓN
        else {
            await db.query('INSERT INTO noticias (titulo, contenido, imagen_url, autor_id) VALUES ($1, $2, $3, $4)', 
            [titulo, contenido, imagen_url, req.session.userId]);
            return res.json({ success: true, mensaje: "Creada" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

app.delete('/api/noticias/:id', verificarAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM noticias WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.listen(PORT, () => {
    console.log(`Servidor CATICO en http://localhost:${PORT}`);
});