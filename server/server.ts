import * as express from 'express';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';
import * as path from 'path'
import * as homeController from './controllers/home.controller';

import {stl2xml,stlxml2ebu, stl2ebu} from './controllers/converter.controller';



dotenv.config();

const app = express();

app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', homeController.index);
app.get('/stl-xml', stl2xml);
app.get('/xml-ebu', stlxml2ebu);
app.get('/stl-ebu', stl2ebu);


app.use("/out", express.static(path.join(__dirname , './converter/files/out')));
app.use("/stl", express.static( path.join(__dirname ,'./converter/files/stl')));



app.listen(app.get('port'), () => {
  console.log(('App is running at http://localhost:%d in %s mode'),
    app.get('port'), app.get('env'));
  console.log('Press CTRL-C to stop\n');
});

module.exports = app;
