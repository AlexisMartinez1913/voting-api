//conexion a la db

const { Pool } = require('pg')
require('dotenv').config()
//cargar las variables de entorno para conectar con PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
})

module.exports = pool