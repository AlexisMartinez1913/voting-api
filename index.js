//endpoints api

const express = require('express')
const pool = require('./db')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3000

app.use(express.json()) 


// votantes
//post /voters: registrar votante
app.post('/voters', async (req, res) => {
    const { name, email } = req.body
    try {
        //validar q no sea candidato
        const isCandidate = await pool.query('SELECT * FROM candidates WHERE name = $1', [name])
        if (isCandidate.rows.length > 0) {
            return res.status(400).json({error: 'Este nombre ya esta registrado como candidato'})
        }

        const result = await pool.query(
            'INSERT INTO voters (name, email) VALUES ($1, $2) RETURNING *',
            [name, email]
        )
        res.status(201).json(result.rows[0])

    } catch (err) {
        res.status(500).json({eror: err.message})

    }
})