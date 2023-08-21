const express = require('express');
const app = express();
const router = express.Router();
//Rotas
const index = require('./routes/index');
const macRoute = require('./routes/MacRoute');


function verifyJWT(req, res, next){
    const path = require('path'); 
    require('dotenv').config({ path: path.join(__dirname, '.env') })
    let token = req.params.token;
    if(token == process.env.TOKEN){
        next();
    }else{
        res.status(401).send("Token invalid");
    }
   
}

app.use('/', index);
app.use('/api/mac/:token', verifyJWT, macRoute);
module.exports = app;

