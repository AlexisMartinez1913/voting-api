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
        //console.log(err.message)
        res.status(500).json({error: err.message})

    }
})

//get/voters - lista de votantes
app.get('/voters', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM voters')
        res.json(result.rows)
    } catch(err) {
        res.status(500).json({error: err.message})
    }
})

//GET /voters/:id Detalles votantes
app.get('/voters/:id', async (req, res) => {
    const { id } = req.params
    try {
        const result = await pool.query('SELECT * FROM voters WHERE id = $1', [id])
        if (result.rows.length === 0) return res.status(404).json({ error: 'Votante NO ENCONTRADO'})
        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message})
    }
})

// DELETE /voters/:id Eliminar votante
app.delete('/voters/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM voters WHERE id = $1 RETURNING *', [id])
        if (result.rows.length === 0) return res.status(404).json({ error: 'Votante no encontrado'})
        res.json({ message: 'Votante ELIMINADO con exito', voter: result.rows[0]})
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Candidatos
app.post('/candidates', async (req, res) => {
    const { name, party} = req.body

    try {
        //validacion que no sea votante
        const isVoter = await pool.query('SELECT * FROM voters WHERE name = $1', [name])
        if (isVoter.rows.length > 0) {
            return res.status(400).json({ error: 'ESTE NOMBRE ya está REGISTRADO'})
        }

        const result = await pool.query(
            'INSERT INTO candidates (name, party) VALUES ($1, $2) RETURNING *',
            [name, party]
        )

        res.status(201).json(result.rows[0])
    } catch (err) {
        res.status(500).json( {error: err.message})

    }
})

// GET /candidates - Lista de candidatos
app.get('/candidates', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM candidates')
        res.json(result.rows)
    } catch (err) {
        res.status(500).json( {error: err.message})

    }
})




//iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`)
})