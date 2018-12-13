
import * as fs from "fs";
import * as path from "path";


/**
 * TODO have second version that uses streams from client and back
 * @deprecated
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



function XML_via_XSLT_TransformStream( xslPath) {



    const jarPath = "./saxon99he.jar"


    const saxon = require('./saxon-stream2');

    const xsltStream = saxon(jarPath, xslPath, {timeout: 30000});


    //TODO stream
    return xsltStream

}





interface XSLTTransformInterface {
    id:string;
    file:string;
    stream?:NodeJS.ReadWriteStream;
}

function xsltstreams():Array<XSLTTransformInterface>
{
    const xsltStuff:Array<XSLTTransformInterface>=[
        {id:"STLXML_to_EBUTT",file:"./xslt/STLXML2EBU-TT.xslt"},
        {id:"EBU-TT2EBU-TT-D",file:"./xslt/EBU-TT2EBU-TT-D.xslt"},
        {id:"EBU-TT-D2EBU-TT-D-Basic-DE",file:"./xslt/EBU-TT-D2EBU-TT-D-Basic-DE.xslt"}
    ]

    xsltStuff.forEach(o => {

        o.file=path.resolve(__dirname,o.file)
        o.stream=XML_via_XSLT_TransformStream(o.file)

    })



return xsltStuff


}






export {
    //stlxml2ebutt, stlxml2ebuttSAXON,
    stlxml2ebutt,stlxml2ebuttStream, XML_via_XSLT_TransformStream,xsltstreams};
