import * as express from 'express';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';
import * as path from 'path'
import * as homeController from './controllers/home.controller';

import {checkQueue, getCurrentStateOfSTLQueue} from './controllers/converter.controller';
import {queuesSocket} from "./socket/queues";
import {TransformationState} from "./controllers/transform-utils";
import Socket = NodeJS.Socket;

let dotFile = process.platform == "win32" ? "windows.env" : "linux.env"

const result = dotenv.config({path: dotFile});


if (result.error) {
    throw result.error
}

console.log("--------------------")
console.log(dotFile)
console.log("--------------------")
console.log(result.parsed)
console.log("--------------------")
console.log(process.env.PATH)


const app = express();

app.set('view engine', 'ejs');
app.get('/dashboard', function (req, res) {
    res.render('index');
});


app.all('/*', function (req, response, next) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "x-ijt, Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});


app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.get('/', homeController.index);
app.get('/Readme', homeController.readme);


//app.get('/stream', streamTest);

app.get('/queue', checkQueue);

app.use("/out", express.static(path.join(__dirname, './converter/files/out')));
app.use("/stl", express.static(path.join(__dirname, './converter/files/stl')));


const http = require('http')
const server = http.createServer(app);

//-----------------------------------------
queuesSocket(server, '/queues', function (socket: Socket) {

    // TODO send list once
    socket.emit("data", getCurrentStateOfSTLQueue())
    // TODO send queued items as batch with timeout

    const noNone = (v: TransformationState) => v != TransformationState.none

    setInterval(() => socket.emit("data", getCurrentStateOfSTLQueue(noNone)), 2000)


    // TODO set progress changes of transformationPipeline as batch with timeout


});

//-----------------------------------------

server.listen(app.get('port'), () => {
    console.log(('App is running at http://localhost:%d in %s mode'),
        app.get('port'), app.get('env'));
    console.log('Press CTRL-C to stop\n');

})


module.exports = app;
