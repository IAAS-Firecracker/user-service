const amqp = require('amqplib');
const { User, Bank } = require('./models/models');
require('dotenv').config();

//const RABBITMQ_URL = process.env["RABBIT.URL"];
const RABBITMQ_URL = process.env.RABBITMQ_URL;
const USER_EXCHANGE = process.env.USER_EXCHANGE;
const USER_NOTIFICATION_EXCHANGE = process.env.USER_NOTIFICATION_EXCHANGE;
// const USER_OFFER_EXCHANGE = process.env.USER_OFFER_EXCHANGE;
// const USER_ZONE_EXCHANGE = process.env.USER_ZONE_EXCHANGE;

const OFFER_QUEUE = "offerQueue";
const NOTIFICATION_QUEUE = "notificationQueue";
const ZONE_QUEUE = "zoneQueue";

// Gérer la reconnexion à rabbitmq
const reconnect = async (err) => {
console.log("Tentative de reconnexion... " + err);
    await new Promise(res => setTimeout(res, 5000));
    await this.rabbitConfig();
};

exports.rabbitConfig = async () => {
    
    const cnx = await amqp.connect(RABBITMQ_URL);
    let channel = await cnx.createChannel();

    try {
        cnx.on("error", reconnect);
        cnx.on("close", reconnect);

        channel = await cnx.createChannel();

        console.log("Connecté à RabbitMQ");

    } catch (error) {
        console.error("Erreur de connexion à RabbitMQ : ", error);
        reconnect();
    }

    // Création des echanges si ils n'existent pas
    await channel.assertExchange(USER_EXCHANGE, 'fanout', { durable: true });
    await channel.assertExchange(USER_NOTIFICATION_EXCHANGE, 'fanout', { durable: true });

    // Création des queues si elles n'existent pas (userNotificationQueue) | userId, message, createdAt
    
    // For request exchange
    let queues = [ ZONE_QUEUE, NOTIFICATION_QUEUE, OFFER_QUEUE ];
    queues.forEach(async (queue) => {
        await channel.assertQueue(queue, { durable: true });
    });

    await channel.bindQueue(ZONE_QUEUE, USER_EXCHANGE, ""); // user.crud operations to zone-service

    //await channel.bindQueue(NOTIFICATION_QUEUE, USER_EXCHANGE, ""); // notification.create operations to notification-service
    await channel.bindQueue(NOTIFICATION_QUEUE, USER_NOTIFICATION_EXCHANGE, ""); // notification.create operations to notification-service

    await channel.bindQueue(OFFER_QUEUE, USER_EXCHANGE, ""); // user.crud operations to offer service

    return channel;
};
