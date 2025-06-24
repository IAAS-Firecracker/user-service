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

EUREKA_HOST=localhost

ADMIN_NAME=Admin
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=adminpassword

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=handsome.nearby@gmail.com
SMTP_PASS=user_smtp_password
FROM_EMAIL_NAME="IAAS Firecracker"
FROM_EMAIL_ADDRESS=handsome.nearby@gmail.com
```

### version dockerisée
```
JWT_SECRET=jwt_secret

DB_HOST=postgres
DB_USER=firecracker
DB_NAME=user_service_db
DB_PASSWORD=fireCracker
DB_PORT=5433

DEFAULT_DB_NAME=firecracker

PORT=3000

NODE_ENV=development

CONFIG_SERVER_URL=http://service-config:8080
SERVICE_NAME=user-service

RABBITMQ_URL=amqp://rabbitmq
USER_EXCHANGE=UserExchange
USER_NOTIFICATION_EXCHANGE=UserNotificationExchange

EUREKA_HOST=service-registry

ADMIN_NAME=Admin
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=adminpassword

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=handsome.nearby@gmail.com
SMTP_PASS=user_smtp_password
FROM_EMAIL_NAME="IAAS Firecracker"
FROM_EMAIL_ADDRESS=handsome.nearby@gmail.com
```

## 🚦 Démarrage de l'Application

#### Version non dockerisée
```bash
npm run dev
```

#### Version dockerisée
```
docker compose up --build
```

Retirer le *--build* si vous ne souhaitez pas reconstruire l'image


## 📡 Points de Terminaison API

### Authentification

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/send-reset-code` - Envoyer le code de reinitialisation du mot de passe par email
- `POST /api/auth/reset-password` - Reinitialiser le mot de passe a partir du code envoye par mail

### Utilisateurs

- `GET /api/users` - Liste des utilisateurs ( Accès admin )
- `GET /api/users/:id` - Récupérer un utilisateur ( Accès utilisateur )
- `PATCH /api/users/:id` - Modifier un utilisateur ( Accès admin )
- `PATCH /api/users/update-profile` - Modifier le profil de l'utilisateur courant ( Accès utilisateur )
- `DELETE /api/users/:id` - SUpprimer un utilisateur ( Accès admin )
- `DELETE /api/users/delete-profile` - Supprimer le profil de l'utilisateur courant ( Accès utilisateur )
- `POST /api/users/create-admin` - Creer un admin ( Accès admin )

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