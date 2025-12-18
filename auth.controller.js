// auth.controller.js
// CÓDIGO QUE SE EJECUTA EN EL SERVIDOR (Node.js)

const db = require('./db.config'); 
const bcrypt = require('bcrypt');
const saltRounds = 10; 

// ===============================================
// 1. FUNCIÓN DE REGISTRO (CORREGIDA)
// ===============================================
async function registrarUsuario(datosRegistro) {
    try {
        // 1. Hashing de la contraseña (Seguridad)
        // LEEMOS LA LLAVE CORRECTA: datosRegistro.contrasena_hash
        const contrasenaHashGuardado = await bcrypt.hash(datosRegistro.contrasena_hash, saltRounds); // <-- ¡CORRECCIÓN AQUÍ!

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
            contrasenaHashGuardado // <-- Usamos el hash que acabamos de crear
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
// 2. FUNCIÓN DE LOGIN (NECESARIA PARA server.js)
// ===============================================
async function loginUsuario(email, contrasena) {
    try {
        // 1. Buscamos al usuario incluyendo el campo es_admin
        const queryText = 'SELECT contrasena_hash, id, es_admin FROM usuarios WHERE email = $1';
        const res = await db.query(queryText, [email]);

        if (res.rows.length === 0) {
            return { success: false, error: 'Usuario no encontrado.' };
        }

        const usuario = res.rows[0];
        
        // 2. Comparar la contraseña ingresada con el hash guardado
        const match = await bcrypt.compare(contrasena, usuario.contrasena_hash);

        if (match) {
            // Devolvemos success, el ID y el valor de es_admin
            return { 
                success: true, 
                userId: usuario.id, 
                esAdmin: usuario.es_admin // <--- IMPORTANTE: Esto lo leerá server.js
            };
        } else {
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
    loginUsuario
};