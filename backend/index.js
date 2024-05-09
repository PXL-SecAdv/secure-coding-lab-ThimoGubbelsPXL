require('dotenv').config();
const pg = require('pg');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors')

const port=3000;

const pool = new pg.Pool({
    user: process.env.DB_USERNAME,
    host: 'db',
    database: 'pxldb',
    password: process.env.DB_PASSWORD,
    port: 5432,
    connectionTimeoutMillis: 5000
})

console.log("Connecting...:")
const frontendDomain = "http://localhost:8080";
const corsOptions={
    origin: frontendDomain,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

const checkOrigin = (req, res, next)=>{
    const origin = req.head.origin;
    if(origin !== frontendDomain){
        return res.status(403).send('Forbidden');
    }
    next();
};

app.use((req)=>{
    if(req.path === '/authenticate'){
        next();
    }else{
        checkOrigin(req,res,next);
    }
});

app.get('/authenticate/:username/:password', async (request, response) => {
    const username = request.params.username;
    const password = request.params.password;

    const query = `SELECT * FROM users WHERE user_name=$1 and password= crypt($2, password)`;
    console.log(query);
    pool.query(query, (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)});
      
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})

