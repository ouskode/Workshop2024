const express = require('express');
const { google } = require('googleapis');
const cookieSession = require('cookie-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const client = new google.auth.OAuth2(
    process.env.CLIENT_ID,  // Remplacez par votre ID client
    process.env.CLIENT_SECRET, // Remplacez par votre secret client
    process.env.REDIRECT_URI // URI de redirection
);

// Middleware pour gérer les sessions
app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000, // 24 heures
  keys: [process.env.SECRET_COOKIE], // Remplacez par une clé secrète
}));

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Route pour démarrer le processus d'authentification
app.get('/auth/google', (req, res) => {
  const authUrl = client.generateAuthUrl({
    scope: ['https://www.googleapis.com/auth/fitness.activity.read'],
  });
  res.redirect(authUrl);
});

// Route de retour après l'authentification
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  
  // Sauvegardez les tokens dans la session
  req.session.tokens = tokens;

  res.send('Vous êtes authentifié avec Google Fit !');
});

app.get('/fit/steps', async (req, res) => {
    if (!req.session.tokens) {
        return res.redirect('/auth/google');
    }

    client.setCredentials(req.session.tokens);

    const fitness = google.fitness({ version: 'v1', auth: client });

    // Calculer les timestamps pour les 7 derniers jours
    const endTime = Date.now(); // Maintenant
    const startTime = endTime - 7 * 24 * 60 * 60 * 1000; // 7 jours en millisecondes

    // ID de la source de données pour les pas
    const dataSourceId = 'derived:com.google.step_count.delta:com.google.ios.fit:appleinc.:iphone:770f269f:top_level';

    // Créer une requête d'agrégation
    const requestBody = {
        aggregateBy: [{
            dataTypeName: 'com.google.step_count.delta',
            dataSourceId: dataSourceId,
        }],
        bucketByTime: { durationMillis: 24 * 60 * 60 * 1000 }, // 1 jour
        startTimeMillis: startTime,
        endTimeMillis: endTime,
    };

    try {
        const response = await fitness.users.dataset.aggregate({
            userId: 'me',
            requestBody: requestBody,
        });
        res.send(response.data);
    } catch (err) {
        return res.status(500).send('Erreur lors de la récupération des données de pas : ' + err.message);
    }
});

app.get('/fit/calories', async (req, res) => {
    if (!req.session.tokens) {
        return res.redirect('/auth/google');
    }

    client.setCredentials(req.session.tokens);

    const fitness = google.fitness({ version: 'v1', auth: client });

    // Calculer les timestamps pour les 7 derniers jours
    const endTime = Date.now(); // Maintenant
    const startTime = endTime - 7 * 24 * 60 * 60 * 1000; // 7 jours en millisecondes

    // ID de la source de données pour les pas
    const dataSourceId = 'derived:com.google.calories.expended:com.google.ios.fit:appleinc.:iphone:770f269f:top_level';

    // Créer une requête d'agrégation
    const requestBody = {
        aggregateBy: [{
            dataTypeName: 'com.google.calories.expended',
            dataSourceId: dataSourceId,
        }],
        bucketByTime: { durationMillis: 24 * 60 * 60 * 1000 }, // 1 jour
        startTimeMillis: startTime,
        endTimeMillis: endTime,
    };

    try {
        const response = await fitness.users.dataset.aggregate({
            userId: 'me',
            requestBody: requestBody,
        });
        res.send(response.data);
    } catch (err) {
        return res.status(500).send('Erreur lors de la récupération des données de pas : ' + err.message);
    }
});

// Exemple de route protégée pour accéder aux données Google Fit
app.get('/fit', async (req, res) => {
  if (!req.session.tokens) {
    return res.redirect('/auth/google');
  }

  client.setCredentials(req.session.tokens);
  
  // Utilisez l'API Google Fit pour récupérer des données (exemple)
  const fitness = google.fitness({ version: 'v1', auth: client });
  
  // Exemple de récupération des données d'activité
  fitness.users.dataSources.list({ userId: 'me' }, (err, response) => {
    if (err) {
      return res.status(500).send('Erreur lors de la récupération des données Google Fit');
    }
    res.send(response.data);
  });
});

app.get('/fit/:uid', async (req, res) => {
    if (!req.session.tokens) {
        return res.redirect('/auth/google');
    }

    client.setCredentials(req.session.tokens);
    const fitness = google.fitness({ version: 'v1', auth: client });

    try {
        // Récupérer toutes les sources de données
        const dataSourcesResponse = await fitness.users.dataSources.list({ userId: 'me' });

        const dataSources = dataSourcesResponse.data.dataSource;

        const allData = [];
        for (const dataSource of dataSources) {
            if (dataSource.device?.uid === process.env.DEVICE_UID) {
                allData.push(dataSource);
            }
        }

        res.send(allData);
    } catch (err) {
        console.error('Erreur lors de la récupération des sources de données:', err);
        res.status(500).send('Erreur lors de la récupération des données Google Fit.');
    }
});
  

app.get('/fit/devices', async (req, res) => {
    if (!req.session.tokens) {
        return res.redirect('/auth/google');
    }

    client.setCredentials(req.session.tokens);

    const fitness = google.fitness({ version: 'v1', auth: client });

    try {
        const response = await fitness.users.dataSources.list({
            userId: 'me',
        });
        res.send(response.data);
    } catch (err) {
        return res.status(500).send('Erreur lors de la récupération des appareils : ' + err.message);
    }
});

// Démarrez le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
