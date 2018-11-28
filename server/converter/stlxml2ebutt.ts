//const {xsltProcess, xmlParse} = require("xslt-processor");

import * as fs from "fs";

/**
 * @deprecated
 * FIXME get the xslt-processor to work with the files
 * the processor itself is working but the xslt does require a specific redundant xsl:function
 * using the native java saxon.jar it will work soo....
 * NOTE: also processor is slow..
 */
/*
function stlxml2ebutt(xmlString, xsltFile) {
    // const xmlString = fs.readFileSync(inputFile, "utf8");
    const xsltString = fs.readFileSync(xsltFile, "utf8");

    const xml = xmlParse(xmlString); // xmlString: string of xml file contents
    const xslt = xmlParse(xsltString); // xsltString: string of xslt file contents

    // FIXME does generate  empty string
    let outXmlString = xsltProcess(xml, xslt);


    fs.writeFile("./server/converter/files/out/ebutt-out.xml", outXmlString, function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}
*/
/**
 * @deprecated
 * Note Saxonjs is licensed as enterprise which is far to costly
 * @param xmlString
 * @param xsltFile
 */
/*
function stlxml2ebuttSAXON(xmlString, xsltFile) {
    // const xmlString = fs.readFileSync(inputFile, "utf8");
    const xsltString = fs.readFileSync(xsltFile, "utf8");

    const xml = xmlParse(xmlString); // xmlString: string of xml file contents
    const xslt = xmlParse(xsltString); // xsltString: string of xslt file contents


    var transform = require('saxon-xslt');
    var outXmlString = transform(xmlString, xsltString);

    fs.writeFile("./server/converter/files/out/ebutt-out.xml", outXmlString, function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("SAXON! The file was saved!");
    });

}
*/

/**
 * TODO have second version that uses streams from client and back
 * @param xmlString
 * @param xslPath
 */
function stlxml2ebuttSAXONJAVA(xmlPath, xslPath,outputPath,success) {



    const jarPath = "./saxon99he.jar"


    function errorHandler(err) {
        console.log(err);
    }


    const saxon = require('saxon-stream2');

    const xsltStream = saxon(jarPath, xslPath, {timeout: 30000});
    xsltStream
        .on('error', errorHandler)
        .on('data', function (cont) {
            success()
        })


    const readStream = fs.createReadStream(xmlPath, {encoding: 'utf-8'})
    readStream.on('error', errorHandler);
    const writeStream = fs.createWriteStream(outputPath)
    writeStream.on('error', errorHandler);

    readStream.pipe(xsltStream).pipe(writeStream);

    //TODO stream
    return xsltStream

}

export {
    //stlxml2ebutt, stlxml2ebuttSAXON,
    stlxml2ebuttSAXONJAVA};
