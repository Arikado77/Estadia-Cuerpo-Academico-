// auth.controller.js
// CÓDIGO QUE SE EJECUTA EN EL SERVIDOR (Node.js)

const db = require('./db.config'); // Importa la conexión al Pool de PostgreSQL
const bcrypt = require('bcrypt');
const saltRounds = 10; // Nivel de seguridad de hashing

// ===============================================
// 1. FUNCIÓN DE REGISTRO (Ya existente, revisada)
// ===============================================
async function registrarUsuario(datosRegistro) {
    try {
        // 1. Hashing de la contraseña (Seguridad)
        const contrasena_hash = await bcrypt.hash(datosRegistro.contrasena, saltRounds);

        // 2. Comando SQL de inserción
        const queryText = `
            INSERT INTO usuarios (
                nombre, 
                email, 
                universidad, 
                ciudad_estado, 
                linea_investigacion, 
                perfil_google_url, 
                orcid_id, 
                contrasena_hash
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id;
        `;
        
        const values = [
            datosRegistro.nombre,
            datosRegistro.email,
            datosRegistro.universidad,
            datosRegistro.ciudad_estado,
            datosRegistro.linea_investigacion,
            datosRegistro.perfil_google_url,
            datosRegistro.orcid_id,
            contrasena_hash
        ];

        const res = await db.query(queryText, values);
        
        return { success: true, userId: res.rows[0].id };

    } catch (error) {
        if (error.code === '23505') { 
            return { success: false, error: 'El correo electrónico ya se encuentra registrado.' }; 
        }
        console.error('Error de registro en DB:', error.stack);
        return { success: false, error: 'Fallo interno del servidor.' };
    }
}

// ===============================================
// 2. FUNCIÓN DE LOGIN (Nueva: Verifica las credenciales)
// ===============================================
async function loginUsuario(email, contrasena) {
    try {
        // 1. Buscar al usuario por email
        const queryText = 'SELECT contrasena_hash, id FROM usuarios WHERE email = $1';
        const res = await db.query(queryText, [email]);

        if (res.rows.length === 0) {
            // Usuario no encontrado
            return { success: false, error: 'Usuario no encontrado.' };
        }

        const usuario = res.rows[0];
        
        // 2. Comparar la contraseña ingresada con el hash guardado
        const match = await bcrypt.compare(contrasena, usuario.contrasena_hash);

        if (match) {
            // Contraseña correcta
            return { success: true, userId: usuario.id };
        } else {
            // Contraseña incorrecta
            return { success: false, error: 'Contraseña incorrecta.' };
        }

    } catch (error) {
        console.error('Error de login en DB:', error.stack);
        return { success: false, error: 'Fallo interno del servidor.' };
    }
}


// Exportar ambas funciones para que server.js las pueda usar
module.exports = {
    registrarUsuario,
    loginUsuario // ¡NUEVA FUNCIÓN EXPORTADA!
};