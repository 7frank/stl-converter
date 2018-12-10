import * as express from 'express';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';
import * as path from 'path'
import * as homeController from './controllers/home.controller';

import {stl2xml,stlxml2ebu, stl2ebu} from './controllers/converter.controller';
import {queuesSocket} from "./socket/queues";



dotenv.config();

const app = express();

app.all('/*', function(req, response, next) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "x-ijt, Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});


app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', homeController.index);
app.get('/stl-xml', stl2xml);
app.get('/xml-ebu', stlxml2ebu);
app.get('/stl-ebu', stl2ebu);

app.get('/queue',function(req,res){

    // TODO the files will be loaded via batch similar to cors
    const obj = { files:[{id:1,name:'test123.stl',progress:0.5},{id:3,name:'testqwe.stl',progress:1},{id:3,name:'testasd.stl',progress:0.2}]
    }
    res.json(obj);
});




app.use("/out", express.static(path.join(__dirname , './converter/files/out')));
app.use("/stl", express.static( path.join(__dirname ,'./converter/files/stl')));


/*
app.listen(app.get('port'), () => {
  console.log(('App is running at http://localhost:%d in %s mode'),
    app.get('port'), app.get('env'));
  console.log('Press CTRL-C to stop\n');
});*/


const http = require('http')
//import * as socketServer from 'socket.io';


const server = http.createServer(app);
//const io = socketServer(serve);

queuesSocket(server);

server.listen(app.get('port'),()=> {
    console.log(('App is running at http://localhost:%d in %s mode'),
        app.get('port'), app.get('env'));
    console.log('Press CTRL-C to stop\n');

})



module.exports = app;
