//(Anterior codigo)

// db.config.js

//const { Pool } = require('pg');

// Crea un nuevo Pool de conexión. 
// Asegúrate de cambiar estos datos por tus credenciales de PostgreSQL.
//const pool = new Pool({
// user: 'tu_usuario_postgres',       // Ej: postgres
//  host: 'localhost',                  // O la IP de tu servidor de BD
//  database: 'tu_nombre_de_base_datos', // Ej: ca_web_db
//  password: 'tu_contraseña_segura',
//  port: 5432,                         // Puerto estándar de PostgreSQL
//});

// Mensaje de prueba de conexión (opcional, para depuración)
//pool.on('connect', () => {
//  console.log('Conectado exitosamente a PostgreSQL.');
//});

// Exporta el Pool para usarlo en el resto de la aplicación
//module.exports = {
//  query: (text, params) => pool.query(text, params),
//}



// db.config.js
// Configuración de la conexión a PostgreSQL (DigitalOcean)

// 1. Cargar variables de entorno desde el archivo .env
require('dotenv').config(); 

// Importar la librería de PostgreSQL
const { Pool } = require('pg');

// 2. Crear el objeto de configuración usando las variables separadas del .env
// ESTO ES CLAVE para solucionar el error de "password must be a string".
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    // Configuración SSL obligatoria para DigitalOcean
    ssl: {
        rejectUnauthorized: false
    }
};

// 3. Crear el pool de conexiones
const pool = new Pool(config);

// Opcional: Probar la conexión al iniciar el servidor
pool.connect((err, client, release) => {
    if (err) {
        // Mostrar el error de conexión si falla
        return console.error('❌ Error al conectar con PostgreSQL:', err.message);
    }
    console.log('✅ Conexión exitosa a PostgreSQL!');
    release(); // Liberar el cliente, pero el pool sigue activo
});

// 4. Exportar la función 'query'
module.exports = {
    query: (text, params) => pool.query(text, params),
    pool // Exportar el pool por si se necesita control avanzado
};