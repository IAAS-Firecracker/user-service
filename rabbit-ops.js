const amqp = require('amqplib');
const { User } = require('./models/models');
const { rabbitConfig } = require('./rabbit-config');
require('dotenv').config();

const USER_EXCHANGE = process.env.USER_EXCHANGE;
const USER_OFFER_EXCHANGE = process.env.USER_OFFER_EXCHANGE;
const USER_NOTIFICATION_EXCHANGE = process.env.USER_NOTIFICATION_EXCHANGE;
const USER_ZONE_EXCHANGE = process.env.USER_ZONE_EXCHANGE;


exports.rabbitPublish = async (msg) => {
    const ch = await rabbitConfig();
    ch.publish(USER_EXCHANGE, "", Buffer.from(msg));
    console.log(`Message envoyé : ${msg}`);
}

exports.rabbitPublishNotification = async (msg) => {
    const ch = await rabbitConfig();
    ch.publish(USER_NOTIFICATION_EXCHANGE, "", Buffer.from(msg));
    console.log(`Message envoyé : ${msg}`);
}

exports.rabbitPublishOffer = async (msg) => {
    const ch = await rabbitConfig();
    ch.publish(USER_OFFER_EXCHANGE, "", Buffer.from(msg));
    console.log(`Message envoyé : ${msg}`);
}

exports.rabbitPublishZone = async (msg) => {
    const ch = await rabbitConfig();
    ch.publish(USER_ZONE_EXCHANGE, "", Buffer.from(msg));
    console.log(`Message envoyé : ${msg}`);
}