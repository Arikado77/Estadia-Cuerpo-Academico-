const { Pool } = require('pg'); // Necesario para definir "Pool"

// Si tu app usa db.query, esto es lo que necesita ser exportado

// Configuración del pool de conexiones usando variables de entorno
// Las variables se leerán del archivo .env
const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD, 
    port: process.env.PG_PORT, 
    ssl: {
        rejectUnauthorized: false // Esto permite aceptar el certificado de DigitalOcean
    }
});

// Mensaje de prueba de conexión (opcional, para depuración)
pool.on('connect', () => {
    console.log('Conectado exitosamente a PostgreSQL.');
});

// Exporta la función query para que otros archivos puedan hacer: db.query(...)
module.exports = {
    // Si otros archivos usan 'db.query', esta es la forma correcta:
    query: (text, params) => pool.query(text, params),
};

// NOTA: Si tu código usa db.pool, agrega: pool: pool, al objeto exportado.