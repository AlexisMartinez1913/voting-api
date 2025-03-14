//endpoints api

const express = require('express')
const pool = require('./db')
const swagger = require('swagger-ui-express')  //modulo no nativo -  swagger
const YAML = require('yamljs') //modulo de yamljs
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3000

//poner la documentación de swagger desde el archivo YAML
const swaggerDocument = YAML.load('./swagger.yaml')

app.use(express.json()) 

//configurar swagger en la ruta /api-docs
app.use('/api-docs', swagger.serve, swagger.setup(swaggerDocument))

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

// get /candidates/:id - detalles de un candidato
app.get('/candidates/:id', async (req, res) => {
    const { id } = req.params
    try {
        const result = await pool.query('SELECT * FROM candidates WHERE id = $1', [id])
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Candidato NO ENCONTRADO'})
        }
        res.json(result.rows[0])

    } catch (err) {
        res.status(500).json( {error: err.message})

    }
})

//DELETE /candidates/:id
app.delete('/candidates/:id', async (req, res) => {
    const { id } = req.params
    try {
        const result = await pool.query('DELETE FROM candidates WHERE id = $1 RETURNING *', [id])
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Candidato NO ENCONTRADO'})
        }
        res.json({ message: 'Candidato ELIMINADO', candidate: result.rows[0]})
    } catch (err) {
        res.status(500).json({ error: err.message})
    }
})


// VOTOS  
//POST /votes votar
app.post('/votes', async (req, res) => {
    const { voter_id, candidate_id } = req.body

    try {
        //validar  que el votante exista y no haya votado
        const voterCheck = await pool.query('SELECT * FROM voters WHERE id = $1', [voter_id])
        if (voterCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Votante no encontrado'})
        }

        if (voterCheck.rows[0].has_voted) {
            return res.status(404).json({ error: 'El votante ya ha emitido un voto'})
        }


        //validacr q el candidato si existe
        const candidateCheck = await pool.query('SELECT * FROM candidates WHERE id = $1', [candidate_id])
        if (candidateCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Candidato no encontrado'})
        }

        //crear voto
        const vote = await pool.query(
            'INSERT INTO votes (voter_id, candidate_id) VALUES ($1, $2) RETURNING *',
            [voter_id, candidate_id]
        )

        //actualizar la variable has_voted del votante
        await pool.query('UPDATE voters SET has_voted = TRUE WHERE id = $1', [voter_id])

        //incrementar el conteo de votos en candidato
        await pool.query('UPDATE candidates SET votes = votes + 1 WHERE id = $1', [candidate_id])

        res.status(201).json(vote.rows[0])


    } catch (err) {
        res.status(500).json({error: err.message})
    }
})


// GET /votes: Lista de votos
app.get('/votes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM votes')
        res.json(result.rows)
    } catch (err) {
        res.status(500).json({error: err.message})
    }
})


// GET /votes/statistics: Estadísticas de votación
app.get('/votes/statistics', async (req, res) => {
    try {
        //mostrar total de votantes
        const votersVoted = await pool.query('SELECT COUNT(*) FROM voters WHERE has_voted = TRUE')
        const totalVoters = parseInt(votersVoted.rows[0].count)

        //total de votos por candidato
        const votesPerCandidate = await pool.query(
            'SELECT c.id, c.name, c.party, c.votes FROM candidates c ORDER BY c.votes DESC'
        )

        //vtotal de votos emitidos
        const totalVotes = votesPerCandidate.rows.reduce((sum, candidate) => sum + candidate.votes, 0)

        //porcentaje de candidato

        const stats = votesPerCandidate.rows.map(candidate => ({
            id: candidate.id,
            name: candidate.name,
            party: candidate.party,
            votes: candidate.votes,
            percentage: totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(2) : 0,
        }))

        res.json({
            totalVoters,
            totalVotes,
            candidates: stats
        })

    } catch (err) {
        res.status(500).json({error: err.message})
    }
})

//iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`)
})