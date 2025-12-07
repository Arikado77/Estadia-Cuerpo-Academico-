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
//};



// db.config.js

// 1. Cargar variables de entorno (al inicio del archivo)
require('dotenv').config(); 

// Importar la librería de PostgreSQL
const { Pool } = require('pg');

// 2. Crear un pool de conexión usando la variable DATABASE_URL del archivo .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Lee la URI de conexión
});

// Opcional: Probar la conexión al iniciar
pool.connect((err, client, release) => {
  if (err) {
    // Si hay un error, el servidor debe fallar
    return console.error('❌ Error al conectar con PostgreSQL:', err.message);
  }
  console.log('✅ Conexión exitosa a PostgreSQL!');
  release(); // Liberar el cliente inmediatamente, pero el pool sigue activo
});

// 3. Exportar el pool para que otros archivos lo usen (ej. login.js)
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool // Exportar el pool directamente por si se necesita
};