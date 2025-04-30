const { query } = require('express');
const { Pool, Client } = require('pg');

require('dotenv').config();


const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});


async function createDatabase(dbname) {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DEFAULT_DB_NAME || "postgres",
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
  try
  {
    await client.connect();
    const res = await client.query(`SELECT datname FROM pg_database WHERE datname = '${dbname}'`);
    if(res.rowCount == 0)
    {
      await client.query(`CREATE DATABASE ${dbname}`);
      console.log("Base de données crée avec succès");
    }
    else console.log("La base de données existe déjà");
  } catch (err)
  {
    console.error("Erreur pendant le processus : " + err)
  } finally {
    await client.end();
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  createDb: (dbname) => createDatabase(dbname)
};