const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// para cualquier ruta devolver index.html (single page apps)
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => console.log('Server listening on port', PORT));