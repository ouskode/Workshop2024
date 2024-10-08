const express = require('express');
const app = express();
const PORT = 3000;

// Middleware pour analyser le corps des requêtes JSON
app.use(express.json());

// Route par défaut
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
