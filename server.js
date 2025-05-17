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

app.use(cors({
  origin: '*',  // Autoriser toutes les origines
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

//const port = process.env.PORT || 3000;
let port = process.env['SERVER.PORT'] || 3000;

const configServerUrl = process.env.CONFIG_SERVER_URL;
const applicationName = process.env.SERVICE_NAME;
const profile = process.env.NODE_ENV || 'development';


// Start of any route
let routeHead = "/api";

async function dbConfigurations() {
  // créer la base de donées si elle n'existe pas
  await db.createDb(process.env.DB_NAME || 'user_service_db');
  
  // Synchroniser les modèles avec la base de données
  //sequelize.sync({ force: true })
  sequelize.sync({ alter: true })
  .then(async () => {
    console.log("Les tables ont été synchronisées")
  })
  .catch((err) => console.log("Erreur : " + err));
}

// Routes

async function loadConfiguration(){
  try {
    const response = await axios.get(`${configServerUrl}/${applicationName}/${profile}`);
    const properties = response.data.propertySources[0].source;

    Object.entries(properties).forEach(([key, value]) => {
        process.env[key.toUpperCase()] = value;
    }); 

    console.log("Configuration spring boot...");
    return properties;
  } catch (err) {
    console.log(" : " + err);
  }
}

function setupEurekaClient(config) {
  
  port = process.env['SERVER.PORT'] || 3000;

  const client = new Eureka({
    instance: {
      app: applicationName,
      hostName: 'user-service',
      instanceId: applicationName,
      ipAddr: 'user-service',
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
      }/*,
      registerWithEureka: true,
      fetchRegistry: true */
    },
    eureka: {
      host: 'service-registry', // || 'localhost' process.env["EUREKA.HOST"]  || 
      port: 8761,// process.env["EUREKA.PORT"] ||
      servicePath: '/eureka/apps/',
      maxRetries: 10,
      requestRetryDelay: 2000
    }
  });

  return client;
}

async function startApplication() {
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
    app.post('/refresh', async (req, res) => {
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
    });

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
}

startApplication();