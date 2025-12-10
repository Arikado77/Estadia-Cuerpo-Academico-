const { Pool } = require('pg');

// Configuración de la conexión a la base de datos PostgreSQL
const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD, 
    port: process.env.PG_PORT, 
    ssl: {
        rejectUnauthorized: false 
    }
});


pool.on('connect', () => {
    console.log('Conectado exitosamente a PostgreSQL.');
});


module.exports = {
    query: (text, params) => pool.query(text, params),
};

