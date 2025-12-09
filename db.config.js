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

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // DigitalOcean requiere SSL
    })
  : new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      ssl: false
    });

pool.connect((err, client, release) => {
  if (err) return console.error('❌ Error al conectar con PostgreSQL:', err.message);
  console.log('✅ Conexión exitosa a PostgreSQL!');
  release();
});

module.exports = { query: (text, params) => pool.query(text, params), pool };
