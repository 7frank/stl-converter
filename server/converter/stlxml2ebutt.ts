
import * as fs from "fs";


/**
 * TODO have second version that uses streams from client and back
 * @param xmlString
 * @param xslPath
 */
function stlxml2ebutt(xmlPath, xslPath, outputPath) {



    const jarPath = "./saxon99he.jar"


    function errorHandler(err) {
        console.log(err);
    }


    const saxon = require('./saxon-stream2');

    const xsltStream = saxon(jarPath, xslPath, {timeout: 30000});
    xsltStream
        .on('error', errorHandler)
      /*  .on('data', function (cont) {
            success()
        })*/


    const readStream = fs.createReadStream(xmlPath, {encoding: 'utf-8'})
    readStream.on('error', errorHandler);
    const writeStream = fs.createWriteStream(outputPath)
    writeStream.on('error', errorHandler);

    readStream.pipe(xsltStream).pipe(writeStream);

    //TODO stream
    return xsltStream

}

function stlxml2ebuttStream(readStream, xslPath, outputPath) {



    const jarPath = "./saxon99he.jar"


    function errorHandler(err) {
        console.log(err);
    }


    const saxon = require('./saxon-stream2');

    const xsltStream = saxon(jarPath, xslPath, {timeout: 30000});
    xsltStream
        .on('error', errorHandler)

   // const readStream = fs.createReadStream(xmlPath, {encoding: 'utf-8'})
    readStream.on('error', errorHandler);


    const writeStream = fs.createWriteStream(outputPath)
    writeStream.on('error', errorHandler);

    readStream.pipe(xsltStream).pipe(writeStream);

    //TODO stream
    return xsltStream

}




export {
    //stlxml2ebutt, stlxml2ebuttSAXON,
    stlxml2ebutt,stlxml2ebuttStream};
