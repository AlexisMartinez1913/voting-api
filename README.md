# Voting API

Una API RESTful desarrollada en Node.js para gestionar un sistema de votaciones. Permite registrar votantes, candidatos y votos, asegurando que cada votante emita un único voto. Incluye estadísticas de votación y está documentada con Swagger.

## Características
- **Votantes**: Registro, listado, consulta por ID y eliminación.
- **Candidatos**: Registro, listado, consulta por ID y eliminación.
- **Votos**: Emisión de votos con validaciones (un voto por votante) y estadísticas detalladas.
- **Base de datos**: PostgreSQL para almacenamiento persistente.
- **Documentación**: Interfaz interactiva con Swagger en `/api-docs`.

## Tecnologías utilizadas
- **Backend**: Node.js, Express
- **Base de datos**: PostgreSQL
- **Documentación**: Swagger (OpenAPI 3.0)
- **Dependencias**: `express`, `pg`, `dotenv`, `swagger-ui-express`, `yamljs`

## Requisitos previos
- Node.js v20.x o superior
- PostgreSQL instalado y corriendo
- Git para clonar el repositorio

## Instalación
1. Clona el repositorio:
   ```bash
   git clone https://github.com/AlexisMartinez1913/voting-api.git
   cd voting-api

2. Instala las dependencias
   ```bash
   npm install

3. Configura las variables de entorno
   ```bash
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_NAME=voting_db
   DB_PORT=5432
   PORT=3000
   
5. Crea la base de datos y las tablas en PostreSQL
   ```bash
    CREATE DATABASE voting_db;
   \c voting_db
   CREATE TABLE voters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    has_voted BOOLEAN DEFAULT FALSE
   );
    CREATE TABLE candidates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    party VARCHAR(100),
    votes INT DEFAULT 0
    );
    CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    voter_id INT REFERENCES voters(id),
    candidate_id INT REFERENCES candidates(id),
    UNIQUE(voter_id)
    );

7. Inicia el servidor
   ```bash
   npm run dev

## USO

Accede a la API en http://localhost:3000.

Explora y prueba los endpoints en la documentación Swagger: http://localhost:3000/api-docs.

Endpoints principales
POST /voters: Registra un votante.

GET /voters: Lista todos los votantes.

POST /candidates: Registra un candidato.

GET /candidates: Lista todos los candidatos.

POST /votes: Emite un voto.

GET /votes/statistics: Obtiene estadísticas de votación.

## EJEMPLO

 http://localhost:3000/voters -H "Content-Type: application/json" -d '{"name": "Johana", "email": "joha@example.com"}'

## Capturas en swagger de los enpoints.
![Endpoints](/screenshots/swagger-endpoints.png)
## Voters
![Endpoints](/screenshots/voters.png)
## Candidates
![Endpoints](/screenshots/candidates.png)
## voters by id
![Endpoints](/screenshots/votersid.png)
## votes
![Endpoints](/screenshots/votes.png)

## Capturas de las estadísticas generadas
![Endpoints](/screenshots/prom.png)

## Contribución
Si deseas contribuir, haz un fork del repositorio, crea una rama con tu feature y envía un pull request.

## Endpoints principales
POST /voters: Registra un votante.

GET /voters: Lista todos los votantes.

POST /candidates: Registra un candidato.

GET /candidates: Lista todos los candidatos.

POST /votes: Emite un voto.

GET /votes/statistics: Obtiene estadísticas de votación.

## Licencia
MIT License 







   
