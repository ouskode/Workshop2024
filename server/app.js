const express = require('express');
const { google } = require('googleapis');
const cookieSession = require('cookie-session');
require('dotenv').config();

const app = express();
const PORT = 3000;

const client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000,
  keys: [process.env.SECRET_COOKIE],
}));

app.get('/', (req, res) => {
    res.send('EPITECH > EPSI > WIS');
});

app.get('/auth/login', (req, res) => {
  const authUrl = client.generateAuthUrl({
    scope: [
        'https://www.googleapis.com/auth/fitness.activity.read',
        'https://www.googleapis.com/auth/fitness.body.read',
        'https://www.googleapis.com/auth/fitness.nutrition.read',
        'https://www.googleapis.com/auth/fitness.sleep.read',
        'https://www.googleapis.com/auth/fitness.heart_rate.read',
        'https://www.googleapis.com/auth/fitness.blood_glucose.read',
        'https://www.googleapis.com/auth/fitness.blood_pressure.read',
        'https://www.googleapis.com/auth/fitness.body_temperature.read',
        'https://www.googleapis.com/auth/fitness.location.read',
        'https://www.googleapis.com/auth/fitness.oxygen_saturation.read',
        'https://www.googleapis.com/auth/fitness.reproductive_health.read'
    ],
    prompt: 'consent',
  });
  res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  
  req.session.tokens = tokens;

  res.send('Vous êtes authentifié avec Google Fit !');
});

async function getRequest(req, res, dataSourceId, dataTypeName, startTimeMillis, endTimeMillis) {
    if (!req.session.tokens) {
        return res.redirect('/auth/login');
    }

    client.setCredentials(req.session.tokens);

    const fitness = google.fitness({ version: 'v1', auth: client });

    const requestBody = {
        aggregateBy: [{
            dataTypeName,
            dataSourceId,
        }],
        bucketByTime: { durationMillis: 24 * 60 * 60 * 1000 }, // 1 jour
        startTimeMillis,
        endTimeMillis,
    };

    try {
        const response = await fitness.users.dataset.aggregate({
            userId: 'me',
            requestBody: requestBody,
        });
        res.send(response.data);
    } catch (err) {
        return res.status(500).send('Erreur lors de la récupération des données : ' + err.message);
    }
}

app.get('/fit/steps', async (req, res) => {
    getRequest(req, res,
        `derived:com.google.step_count.delta:com.google.ios.fit:appleinc.:iphone:${process.env.DEVICE_UID}:top_level`,
        'com.google.step_count.delta',
        Date.now() - 7 * 24 * 60 * 60 * 1000,
        Date.now()
    );
});

app.get('/fit/distance', async (req, res) => {
    getRequest(req, res,
        `derived:com.google.distance.delta:com.google.ios.fit:appleinc.:iphone:${process.env.DEVICE_UID}:top_level`,
        'com.google.distance.delta',
        Date.now() - 7 * 24 * 60 * 60 * 1000,
        Date.now()
    );
});

app.get('/fit/calories', async (req, res) => {
    getRequest(req, res,
        `derived:com.google.calories.expended:com.google.ios.fit:appleinc.:iphone:${process.env.DEVICE_UID}:top_level`,
        'com.google.calories.expended',
        Date.now() - 7 * 24 * 60 * 60 * 1000,
        Date.now()
    );
});

app.get('/fit/active-minutes', async (req, res) => {
    getRequest(req, res,
        `derived:com.google.active_minutes:com.google.ios.fit:appleinc.:iphone:${process.env.DEVICE_UID}:top_level`,
        'com.google.active_minutes',
        Date.now() - 7 * 24 * 60 * 60 * 1000,
        Date.now()
    );
});

app.get('/fit/sleep', async (req, res) => {
    getRequest(req, res,
        'derived:com.google.sleep.segment:com.google.android.gms:merge_sleep_segments',
        'com.google.sleep.segment',
        Date.now() - 7 * 24 * 60 * 60 * 1000,
        Date.now()
    );
});

app.get('/fit/heart-minutes', async (req, res) => {
    getRequest(req, res,
        `derived:com.google.heart_minutes:com.google.ios.fit:appleinc.:iphone:${process.env.DEVICE_UID}:top_level`,
        'com.google.heart_minutes',
        Date.now() - 7 * 24 * 60 * 60 * 1000,
        Date.now()
    );
});

app.get('/fit/activity', async (req, res) => {
    getRequest(req, res,
        `derived:com.google.activity.segment:com.google.ios.fit:appleinc.:iphone:${process.env.DEVICE_UID}:top_level`,
        'com.google.activity.segment',
        Date.now() - 7 * 24 * 60 * 60 * 1000,
        Date.now()
    );
});

app.get('/fit/weight', async (req, res) => {
    getRequest(req, res,
        'derived:com.google.weight:com.google.android.gms:merge_weight',
        'com.google.weight',
        Date.now() - 7 * 24 * 60 * 60 * 1000,
        Date.now()
    );
});

app.get('/fit/height', async (req, res) => {
    getRequest(req, res,
        'derived:com.google.height:com.google.android.gms:merge_height',
        'com.google.height',
        Date.now() - 7 * 24 * 60 * 60 * 1000,
        Date.now()
    );
});

app.get('/fit', async (req, res) => {
  if (!req.session.tokens) {
    return res.redirect('/auth/login');
  }

  client.setCredentials(req.session.tokens);
  
  const fitness = google.fitness({ version: 'v1', auth: client });
  
  fitness.users.dataSources.list({ userId: 'me' }, (err, response) => {
    if (err) {
      return res.status(500).send('Erreur lors de la récupération des données Google Fit');
    }
    res.send(response.data);
  });
});

app.get('/fit/:uid', async (req, res) => {
    if (!req.session.tokens) {
        return res.redirect('/auth/login');
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
        return res.redirect('/auth/login');
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

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
