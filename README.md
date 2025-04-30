# USER-SERVICE

# Application NodeJS

## Description
Service node.js et express.js permet l'authentification des utilisateurs via génération d'un token d'accès. Elle utilise **Postgresql** comme sgbd, **sequelize** comme ORM, **RabbitMQ** comme serveur de messagerie, et peut se connecter au serveur **eureka**;


## 📋 Prérequis

- Node.js (version 22.12.0+)
- npm (version 10.9.0)

## 🛠️ Installation

### Clonage du Projet

```bash
git clone https://github.com/IAAS-Firecracker/user-service.git
cd user-service
```

### Installation des Dépendances

```bash
npm install
```

## 🔧 Configuration

1. Créez un fichier `.env` à la racine du projet
2. Ajoutez les variables d'environnement suivantes :

### version non dockerisée
```
JWT_SECRET=jwt_secret

DB_HOST=localhost
DB_USER=firecracker
DB_NAME=user_service_db
DB_PASSWORD=fireCracker
DB_PORT=5432

DEFAULT_DB_NAME=postgres

PORT=3000

NODE_ENV=development

CONFIG_SERVER_URL=http://localhost:8080
SERVICE_NAME=user-service

RABBITMQ_URL=amqp://localhost
USER_EXCHANGE=UserExchange
USER_NOTIFICATION_EXCHANGE=UserNotificationExchange

ADMIN_NAME=Admin
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=1234567a
```

### version dockerisée
```
JWT_SECRET=jwt_secret

DB_HOST=postgres
DB_USER=firecracker
DB_NAME=user_service_db
DB_PASSWORD=fireCracker
DB_PORT=5432

DEFAULT_DB_NAME=firecracker

PORT=3000

NODE_ENV=development

CONFIG_SERVER_URL=http://service-config:8080
SERVICE_NAME=user-service

RABBITMQ_URL=amqp://rabbitmq
USER_EXCHANGE=UserExchange
USER_NOTIFICATION_EXCHANGE=UserNotificationExchange

ADMIN_NAME=Admin
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=1234567a
```

## 🚦 Démarrage de l'Application

```bash
npm start
```

## 📡 Points de Terminaison API

### Authentification

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion

### Utilisateurs

- `GET /api/users` - Liste des utilisateurs
- `GET /api/users/:id` - Récupérer un utilisateur

## 🧪 Tests

```bash
npm test
```

## 🔒 Sécurité

- Authentification par JWT
- Validation des entrées
- Protection contre les attaques CSRF et XSS

## 📦 Dépendances Principales

- Express.js
- bcrypt
- jsonwebtoken
- dotenv
- cors
- sequelize
- amqplib
- eureka-js-client

## 📝 Structure du Projet

```
app/
│
├── controllers/
├── middleware/
├── models/ 
├── routes/
│
├── .env
├── .gitignore
├── db.js
├── Dockerfile
├── package.json
├── rabbit-config.js
├── rabbit-ops.js
├── sequelize.js
└── README.md
```

## 🤝 Contribution

1. Forkez le projet
2. Créez votre branche de fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commitez vos modifications (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📜 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

## 📞 Contact

Mac Dallas - [roylexstephane@gmail.com]

Lien du Projet: [https://github.com/IAAS-Firecracker/user-service.git](https://github.com/IAAS-Firecracker/user-service)