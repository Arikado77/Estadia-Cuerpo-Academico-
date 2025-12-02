// Importar el módulo Express
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000; // Puedes usar cualquier puerto que esté libre

// Middleware para servir archivos estáticos
// Esto le dice a Express que todos los archivos (HTML, CSS, JS, imágenes)
// están en la carpeta actual del proyecto.
app.use(express.static(__dirname)); 

// ===============================================
// Definición de Rutas
// ===============================================

// Ruta principal o de inicio (index.html)
app.get('/', (req, res) => {
    // Envía el archivo index.html cuando alguien accede a la ruta raíz (/)
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta de Login (login.html)
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Ruta de Noticias (Noticias.html)
app.get('/noticias', (req, res) => {
    res.sendFile(path.join(__dirname, 'Noticias.html'));
});

// Ruta ¿Qué es CA? (CA.html)
app.get('/ca', (req, res) => {
    res.sendFile(path.join(__dirname, 'CA.html'));
});

// Ruta Líneas de Conocimiento (Conocimiento.html)
app.get('/conocimiento', (req, res) => {
    res.sendFile(path.join(__dirname, 'Conocimiento.html'));
});


// ===============================================
// Inicio del Servidor
// ===============================================
app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
    console.log('Presiona CTRL+C para detener el servidor.');
});