// db.config.js

const { Pool } = require('pg');

// Crea un nuevo Pool de conexión. 
// Asegúrate de cambiar estos datos por tus credenciales de PostgreSQL.
const pool = new Pool({
  user: 'tu_usuario_postgres',       // Ej: postgres
  host: 'localhost',                  // O la IP de tu servidor de BD
  database: 'tu_nombre_de_base_datos', // Ej: ca_web_db
  password: 'tu_contraseña_segura',
  port: 5432,                         // Puerto estándar de PostgreSQL
});

// Mensaje de prueba de conexión (opcional, para depuración)
pool.on('connect', () => {
  console.log('Conectado exitosamente a PostgreSQL.');
});

// Exporta el Pool para usarlo en el resto de la aplicación
module.exports = {
  query: (text, params) => pool.query(text, params),
};