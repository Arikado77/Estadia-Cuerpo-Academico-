// auth.controller.js
// CÓDIGO QUE SE EJECUTA EN EL SERVIDOR (Node.js)

const db = require('./db.config'); // Importa la conexión al Pool de PostgreSQL
const bcrypt = require('bcrypt');
const saltRounds = 10; // Nivel de seguridad de hashing

async function registrarUsuario(datosRegistro) {
    try {
        // 1. Hashing de la contraseña (Seguridad)
        const contrasena_hash = await bcrypt.hash(datosRegistro.contrasena, saltRounds);

        // 2. Comando SQL de inserción
        const queryText = `
            INSERT INTO usuarios (
                email, contrasena_hash, nombre, universidad, ciudad_estado, 
                linea_investigacion, perfil_google_url, orcid_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id;
        `;
        
        // El orden de los valores DEBE coincidir con el orden de los campos en la consulta SQL
        const values = [
            datosRegistro.email,
            contrasena_hash,
            datosRegistro.nombre,
            datosRegistro.universidad,
            datosRegistro.ciudad_estado,
            datosRegistro.linea_investigacion,
            datosRegistro.perfil_google_url,
            datosRegistro.orcid_id
        ];

        const res = await db.query(queryText, values);
        
        return { success: true, userId: res.rows[0].id };

    } catch (error) {
        // Manejar error 23505: Email ya existe (porque lo definimos como UNIQUE)
        if (error.code === '23505') { 
            return { success: false, error: 'El correo electrónico ya se encuentra registrado.' }; 
        }
        console.error('Error de registro en DB:', error.stack);
        return { success: false, error: 'Fallo interno del servidor.' };
    }
}

// Exportar la función para que server.js la pueda usar
module.exports = {
    registrarUsuario
};