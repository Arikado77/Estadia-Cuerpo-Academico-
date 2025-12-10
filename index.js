const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Opción 2: Usar app.use() para capturar todas las rutas (el fallback)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log('Server listening on port', PORT));