const amqp = require('amqplib');
const { User, Bank } = require('./models/models');
require('dotenv').config();

//const RABBITMQ_URL = process.env["RABBIT.URL"];
const RABBITMQ_URL = process.env.RABBITMQ_URL;
const USER_EXCHANGE = process.env.USER_EXCHANGE;
// const USER_OFFER_EXCHANGE = process.env.USER_OFFER_EXCHANGE;
// const USER_NOTIFICATION_EXCHANGE = process.env.USER_NOTIFICATION_EXCHANGE;
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
        //await channel.assertQueue(QUEUE_NAME, { durable: true });

        console.log("Connecté à RabbitMQ");

    } catch (error) {
        console.error("Erreur de connexion à RabbitMQ : ", error);
        reconnect();
    }

    // Création des echanges si ils n'existent pas
    await channel.assertExchange(USER_EXCHANGE, 'fanout', { durable: true });
    //await channel.assertExchange(USER_OFFER_EXCHANGE, 'fanout', { durable: true });
    //await channel.assertExchange(USER_NOTIFICATION_EXCHANGE, 'fanout', { durable: true });
    //await channel.assertExchange(USER_ZONE_EXCHANGE, 'fanout', { durable: true });

    // Création des queues si elles n'existent pas (userNotificationQueue) | userId, message, createdAt
    
    // For request exchange
    let queues = [ ZONE_QUEUE, NOTIFICATION_QUEUE, OFFER_QUEUE ];
    queues.forEach(async (queue) => {
        await channel.assertQueue(queue, { durable: true });
    });

    await channel.bindQueue(ZONE_QUEUE, USER_EXCHANGE, "user.create");

    await channel.bindQueue(NOTIFICATION_QUEUE, USER_EXCHANGE, "notification.create");

    await channel.bindQueue(OFFER_QUEUE, USER_EXCHANGE, "user.create");
    
    /*// For request exchange
    let queues = [ "userOfferQueue", "userNotificationQueue", "userZoneQueue"];
    queues.forEach(async (queue) => {
        await channel.assertQueue(queue, { durable: true });
    });

    // For offer user exchange
    let offerQueues = ["userOfferQueue"];
    offerQueues.forEach(async (queue) => {
        await channel.assertQueue(queue, { durable: true });
    });

    // For user zone exchange
    let zoneQueues = ["userZoneQueue"];
    zoneQueues.forEach(async (queue) => {
        await channel.assertQueue(queue, { durable: true });
    });

    // For request notifications exchange
    let notifsQueues = [ "userNotificationQueue" ];
    notifsQueues.forEach(async (queue) => {
        await channel.assertQueue(queue, { durable: true });
    });

    let zonesQueues = [ "userZoneQueue" ];
    zonesQueues.forEach(async (queue) => {
        await channel.assertQueue(queue, { durable: true });
    });
    
    // Liaison entre échange et queues
    queues.forEach(async (queue) => {
        await channel.bindQueue(queue, USER_EXCHANGE, "");
    });

    offerQueues.forEach(async (queue) => {
        await channel.bindQueue(queue, USER_OFFER_EXCHANGE, "");
    });

    notifsQueues.forEach(async (queue) => {
        await channel.bindQueue(queue, USER_NOTIFICATION_EXCHANGE, "");
    });

    notifsQueues.forEach(async (queue) => {
        await channel.bindQueue(queue, USER_ZONE_EXCHANGE, "");
    });*/

    return channel;
};
