const swaggerJsDoc = require("swagger-jsdoc");

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
        title: 'User-Service Node.js Documentation',
        version: '1.0.0',
        description: 'Documentation de l\'API du service d\'utilisateur avec Swagger',
        },
        servers: [
            {
                //url: 'http://31.220.93.146:8079/SERVICE-DEMAND',
                url: 'http://service-proxy:8079/USER-SERVICE',
            },
        ],
    },
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

module.exports = swaggerSpec;