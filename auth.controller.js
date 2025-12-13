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
// ... (El resto del código es correcto)