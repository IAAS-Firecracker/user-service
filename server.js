const express = require('express');
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const db = require("./db");
const sequelize = require("./sequelize");
const { Eureka } = require('eureka-js-client');
const { default: axios } = require('axios');
const { rabbitConfig } = require('./rabbit-config');
const { Bank } = require('./models/models');
/*const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');*/
const cors = require("cors");
const createAdmin = require('./db/init');
const bodyParser = require('body-parser');

const app = express();

app.use(express.json());
app.use(bodyParser.json());
//app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/*app.use(cors({
  origin: '*',  // Autoriser toutes les origines
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));*/

app.use(cors({
  origin: (origin, callback) => {
    // Liste des origines autorisées
    const allowedOrigins = ['http://localhost:3000', 'http://example.com'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Autorise les cookies et les en-têtes d'authentification
}));

app.options('*', cors());

//const port = process.env.PORT || 3000;
let port = process.env['SERVER.PORT'] || 5501;

const configServerUrl = process.env.CONFIG_SERVER_URL;
const applicationName = process.env.SERVICE_NAME;
const profile = process.env.NODE_ENV || 'development';


// Start of any route
let routeHead = "/api";

async function dbConfigurations() {
  console.log("Début de la fonction dbConfigurations");
  // créer la base de donées si elle n'existe pas
  await db.createDb(process.env.DB_NAME || 'user_service_db');
  
  // Synchroniser les modèles avec la base de données
  //sequelize.sync({ force: true })
  sequelize.sync({ alter: true })
  .then(async () => {
    console.log("Les tables ont été synchronisées")
  })
  .catch((err) => console.log("Erreur : " + err));
  console.log("Fin de la fonction dbConfigurations");
}

// Routes

async function loadConfiguration(){
  console.log("Début de la fonction loadConfiguration");
  try {
    console.log("ROUTE", `${configServerUrl}/${applicationName}/${profile}`);
    try {
      const response = await axios.get(`${configServerUrl}/${applicationName}/${profile}`, { timeout: 10000 });
      const properties = response.data.propertySources[0].source;

      Object.entries(properties).forEach(([key, value]) => {
        process.env[key.toUpperCase()] = value;
      });

      console.log("Configuration spring boot...");
      return properties;
    } catch (error) {
      console.error("Erreur lors de la récupération de la configuration, utilisation des configurations par défaut ");
      return {
        'server.port': '5501',
        'server.address': '0.0.0.0',
        'management.endpoints.web.exposure.include': '*',
        'management.endpoints.health.show-details': 'always',
        'management.info.git.mode': 'full',
        'eureka.client.service-url.defaultZone': 'http://localhost:8761/eureka/',
        'eureka.instance.prefer-ip': 'true',
        'logging.level.org.springframework.amqp': 'DEBUG',
        'logging.level.org.springframework': 'DEBUG',
        'spring.rabbitmq.host': 'localhost',
        'spring.rabbitmq.port': '5672',
        'spring.rabbitmq.username': 'guest',
        'spring.rabbitmq.password': 'guest'
      }; // Retourne un objet vide ou les configurations par défaut
    }
  } catch (err) {
    console.log(" : " + err);
  }
  console.log("Fin de la fonction loadConfiguration");
}

function setupEurekaClient(config) {
  console.log("Début de la fonction setupEurekaClient");
  
  port = process.env['SERVER.PORT'] || 5501;

  const client = new Eureka({
    instance: {
      app: applicationName,
      hostName: 'localhost', // user-service
      instanceId: applicationName,
      ipAddr: '0.0.0.0', // user-service
      statusPageUrl: `http://localhost:${port}/health`,
      homePageUrl: `http://localhost:${port}`,
      port: {
        '$': port,
        '@enabled': true
      },
      vipAddress: applicationName,
      dataCenterInfo: {
        '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
        name: 'MyOwn',
      },
      metadata: {
        'configuration': JSON.stringify(config)
      },
      /*registerWithEureka: true,
      fetchRegistry: true*/
    },
    eureka: {
      host: process.env.EUREKA_HOST || "localhost", // || 'localhost' process.env["EUREKA.HOST"]  || 
      port: 8761,// process.env["EUREKA.PORT"] ||
      servicePath: '/eureka/apps/',
      maxRetries: 10,
      requestRetryDelay: 2000
    }
  });

  console.log("Fin de la fonction setupEurekaClient");
  return client;
}
    

async function startApplication() {
  console.log("Début de la fonction startApplication");
  try {
    await dbConfigurations();
    
    const config = await loadConfiguration();
    
    const eurekaClient = setupEurekaClient(config);

    eurekaClient.start(error => {
      console.log(error || 'Client Eureka démarré avec succès');
    });

    // Routes
    app.use(`${routeHead}/auth`, authRoutes);
    app.use(`${routeHead}/users`, userRoutes);

    // Route pour rafraîchir la configuration
    /*app.post('/refresh', async (req, res) => {
      try {
        const newConfig = await loadConfiguration();
        res.json({
          message: 'Configuration',
          config: newConfig
        });

      } catch(err) {
        res.status(500).json({
          message: 'Erreur lors du rafraichissement de la configuration',
          "error": err
        });
      }
    });*/

    // Connexion à rabbitmq
    await rabbitConfig();

    // Create admin
    await createAdmin();

    // Démarrage du serveur
    app.listen(port, () => {
      console.log(`L'API est disponible via localhost:${port}`);
    });
    /*app.listen(port, '0.0.0.0', () => {
      console.log(`L'API est disponible via 0.0.0.0:${port}`);
    });*/

    // Arret Eureka
    process.on('SIGINT', () => {
      eurekaClient.stop(error => {
        console.log(error || "Client Eureka arrêté");
        process.exit();
      });
    });

  } catch (err) {
    console.error('Erreur lors du démarrage de l\'application : ' + err);
    process.exit(1);
  }
  console.log("Fin de la fonction startApplication");
}

startApplication().then(() => { console.log("APPLICATION START SUCCESSFULLY"); }).catch((err) => { console.log("ERROR", err) });