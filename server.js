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
    secure: true, // Use SSL
    auth: {
        user: 'utch.tico@gmail.com', // Reemplazar con tu correo
        pass: 'feixhvusmbqiidtv'  // Reemplazar con tu contraseña de aplicación
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

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Función de protección de rutas
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
        req.session.esAdmin = resultado.esAdmin;
        
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
    const result = await db.query('SELECT ..., es_admin FROM usuarios WHERE id = $1', [userId]);
    res.json({ success: true, user: result.rows[0] });
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
        // 1. Verificar si el usuario existe y generar token
        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hora de validez
        
        const user = await db.query(
            'UPDATE usuarios SET reset_token = $1, reset_expires = $2 WHERE email = $3 RETURNING id, nombre', 
            [token, expires, email]
        );

        // 2. Responder de inmediato al cliente para evitar el Error 504
        // No confirmamos si el correo existe por seguridad, pero liberamos la conexión.
        res.json({ 
            success: true, 
            mensaje: 'Si el correo está registrado, recibirás un enlace de recuperación en unos minutos.' 
        });

        // 3. Si el usuario existe, intentar enviar el correo en segundo plano
        if (user.rows.length > 0) {
            const nombreUsuario = user.rows[0].nombre;
            const resetUrl = `http://${req.get('host')}/restablecer.html?token=${token}`;

            // No usamos 'await' aquí para que no bloquee la respuesta anterior
            transporter.sendMail({
                to: email,
                subject: 'Recuperar Contraseña - CATICO',
                html: `
                    <div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #1a2a4d;">Hola, ${nombreUsuario}</h2>
                        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en el portal <strong>CATICO</strong>.</p>
                        <p>Haz clic en el botón de abajo para elegir una nueva contraseña:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer Contraseña</a>
                        </div>
                        <p style="font-size: 0.8em; color: #777;">Este enlace expirará en 1 hora. Si no solicitaste este cambio, puedes ignorar este correo.</p>
                    </div>
                `
            }).then(() => {
                console.log(`✅ Correo enviado con éxito a: ${email}`);
            }).catch(err => {
                console.error("❌ Error al enviar correo con Nodemailer:", err);
            });
        }

    } catch (error) {
        console.error("❌ Error en la ruta de olvido-password:", error);
        // Solo enviamos error 500 si la base de datos falla antes de la respuesta
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Error interno del servidor.' });
        }
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

// RUTA DE CAMBIO DIRECTO (Sin correo)
app.post('/api/auth/cambio-directo', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Verificar si el usuario existe
        const userCheck = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);
        
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'El correo no está registrado.' });
        }

        // 2. Hashear la nueva contraseña
        const nuevoHash = await bcrypt.hash(password, 10);

        // 3. Actualizar directamente en la DB
        await db.query('UPDATE usuarios SET contrasena_hash = $1 WHERE email = $2', [nuevoHash, email]);

        res.json({ success: true, mensaje: 'Contraseña actualizada con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error interno del servidor.' });
    }
});

app.post('/api/usuario/actualizar-avatar', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ success: false });

    const { avatarUrl } = req.body;

    try {
        await db.query('UPDATE usuarios SET foto_url = $1 WHERE id = $2', [avatarUrl, req.session.userId]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// ===============================================
// API - GESTIÓN DE NOTICIAS (DINÁMICO)
// ===============================================

// --- OBTENER NOTICIAS (Todos pueden ver) ---
app.get('/api/noticias', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM noticias ORDER BY fecha_creacion DESC');
        res.json({ success: true, noticias: result.rows });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// --- PUBLICAR NOTICIA (SOLO ADMINS) ---
// Aquí usamos 'verificarAdmin' como filtro
app.post('/api/noticias', verificarAdmin, async (req, res) => {
    const { titulo, contenido, imagen_url } = req.body;
    try {
        await db.query(
            'INSERT INTO noticias (titulo, contenido, imagen_url, autor_id) VALUES ($1, $2, $3, $4)',
            [titulo, contenido, imagen_url, req.session.userId]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// --- ELIMINAR NOTICIA (SOLO ADMINS) ---
app.delete('/api/noticias/:id', verificarAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM noticias WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor CATICO en http://localhost:${PORT}`);
});