import * as express from "express";
import * as fs from "fs";
import * as path from "path";


import {stl2stlxml} from "../converter/convert";
import {stlxml2ebutt, stlxml2ebuttStream} from "../converter/stlxml2ebutt";

import * as Stream from "stream";
import {Request} from "express";
import {Response} from "express";
import {validate} from "../converter/validate/validate";



export function getOrigin(_req: express.Request,path =""):string
{
 return _req.protocol + '://' + _req.get('host')+path

}


/**
 * TODO refactor into test case for stl => stlxml
 */

// tslint:disable:variable-name
export function stl2xml(_req: express.Request, res: express.Response) {

    const inputFile = "./stl/test.stl";

    const base = path.basename(inputFile)

    const outputFile = `./out/${base}-stlxml.xml`;
    stl2stlxml(inputFile).then(function (dataStream) {
        res.json({
            input: inputFile,
            output: outputFile,
        });
    }).catch(e => res.json({
        error: e.message,

    }));


}
/**
 * TODO refactor into test case for stlxml => ebu
 */

export function stlxml2ebu(_req: express.Request, res: express.Response) {

    const input_outputFile = "./server/converter/files/out/static.stl.xml";
    const dataString = fs.readFileSync(input_outputFile, "utf8");
    // stlxml2ebuttSAXON(dataString, "./server/converter/STLXML2EBU-TT.xslt");

    const ebuttOutputPath = "./server/converter/files/out/static5.ebutt.xml"
    const xsl = "./server/converter/STLXML2EBU-TT.xslt"


    stlxml2ebutt(input_outputFile, xsl, ebuttOutputPath).on('data', () => {

        res.json({
            input: input_outputFile,
            xslt: xsl,
            output: ebuttOutputPath,
        });

    });


}

/**
 * Controller that uses the whole work flow from stl => stlxml => backup => ebutt
 * @param _req
 * @param res
 */
// tslint:disable:variable-name
export async function stl2ebu(_req: express.Request, res: express.Response) {
    const inputFile = "./stl/test.stl";

    console.log("converting: " + inputFile)

    const base = path.basename(inputFile, ".stl")

    console.log("step 1: stl-stlxml")

    const dataStream = await stl2stlxml(inputFile) as any;

    const stlxmlOutputPath = `./server/converter/files/out/${base}.stl.xml`

    const ebuttOutputPath = `./server/converter/files/out/${base}.ebutt.xml`
    const xsl = "./server/converter/STLXML2EBU-TT.xslt"


    function responseCallback(report: any) {

        var fullUrl = getOrigin(_req) //+ req.originalUrl;

        const obj = {
            input: inputFile,
            xslt: xsl,
            output: ebuttOutputPath,
            outputURL: fullUrl+"/out/"+path.basename(ebuttOutputPath),
            stlxml: fullUrl+"/out/"+path.basename(stlxmlOutputPath),
            valid: report.valid,
            messages: report.messages
        }
        res.json(obj);

    }

    console.log("step 1.5: backup stlxml")
    const writeStream = fs.createWriteStream(stlxmlOutputPath)
    writeStream.on('error', console.error);
    dataStream.pipe(writeStream)



    console.log("step 2: stlxml-ebu")
    stlxml2ebuttStream(dataStream, xsl, ebuttOutputPath).on('data', () => {




        const ebuttXSD = `./server/converter/validate/ebutt.xsd`
        console.log("step 3: validate-ebu")
        validate(ebuttOutputPath, ebuttXSD).then(responseCallback).catch(console.error)


    });


}

