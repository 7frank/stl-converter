import * as express from "express";
import * as fs from "fs";
import * as path from "path";


import {stl2stlxml} from "../converter/convert";
import {stlxml2ebutt, stlxml2ebuttStream, xsltstreams} from "../converter/stlxml2ebutt";

import * as Stream from "stream";
import {Request} from "express";
import {Response} from "express";
import {validate, validateStream} from "../converter/validate/validate";
import {Lower, renderer, Upper, xformer} from "../converter/transform";


export function getOrigin(_req: express.Request, path = ""): string {
    return _req.protocol + '://' + _req.get('host') + path

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


    const xsl = "./server/converter/xslt/STLXML2EBU-TT.xslt"


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
export async function stl2ebu(_req: express.Request, res: express.Response,) {
    //const mFilePath = "./stl/test.stl";


    const inputFile = "../../tests/stl/Test 1.stl";


    const mFilePath = path.resolve(__dirname, inputFile)
    console.log("converting: " + mFilePath)
    if (!fs.existsSync(mFilePath)) {

        throw new Error("File_NOT_FOUND")

    }


    const base = path.basename(mFilePath, ".stl")

    console.log("step 1: stl-stlxml")

    const dataStream = await stl2stlxml(mFilePath) as any;

    const stlxmlOutputPath = `./server/converter/files/out/${base}.stl.xml`

    const ebuttOutputPath = `./server/converter/files/out/${base}.ebutt.xml`


    const stlxml_ebutt_xsl = "./server/converter/xslt/STLXML2EBU-TT.xslt"
    const ebutt_ebuttd_xsl = "./server/converter/EBU-TT2EBU-TT-D.xslt"
    const ebuttd_ebuttd_basic_de_xsl = "./server/converter/EBU-TT-D2EBU-TT-D-Basic-DE.xslt"


    function responseCallback(report: any) {

        var fullUrl = getOrigin(_req) //+ req.originalUrl;

        const obj = {
            input: mFilePath,
            xslt: stlxml_ebutt_xsl,
            output: ebuttOutputPath,
            outputURL: fullUrl + "/out/" + path.basename(ebuttOutputPath),
            stlxml: fullUrl + "/out/" + path.basename(stlxmlOutputPath),
            valid: report.valid,
            messages: report.messages
        }
        res.json(obj);

    }

    console.log("step 1.5: backup stlxml")
    const writeStream = fs.createWriteStream(stlxmlOutputPath)
    writeStream.on('error', console.error);
    dataStream.pipe(writeStream)


    console.log("step 2: stlxml-ebutt")
    /*stlxml2ebuttStream(dataStream, xsl, ebuttOutputPath).on('data', () => {




        const ebuttXSD = `./server/converter/validate/ebutt.xsd`
        console.log("step 3: validate-ebu")
        validate(ebuttOutputPath, ebuttXSD).then(responseCallback).catch(console.error)


    });*/

    stlxml2ebuttStream(dataStream, stlxml_ebutt_xsl, ebuttOutputPath).on('data', () => {

        const ebuttXSD = `./server/converter/validate/ebutt.xsd`
        console.log("step 3: validate-ebu")
        validate(ebuttOutputPath, ebuttXSD).then(responseCallback).catch(console.error)

    });


}

import {pipeline, duplex, pipe, finished} from "mississippi";

function getProgressSpy(id: string) {
    const progress = require('progress-stream');

    //const  stat = fs.statSync(filename);
    const str = progress({

        //  length: stat.size,
        time: 100 /* ms */
    });
    str.on('progress', function (progress) {
        console.log("id:" + id, progress.percentage);
    });

    return str
}

/**
 * - read file
 * - generate stlxml
 *
 * - transform xml file n times via xslt and each time write to file system and validate
 *
 */




export async function streamTest(_req: express.Request, res: express.Response,) {



    //const inputFile = "../converter/files/stl/test.stl";
    const inputFile = "../../tests/stl/Test 1.stl";


    const mFilePath = path.resolve(__dirname, inputFile)
    console.log("stream test: " + mFilePath)
    if (!fs.existsSync(mFilePath)) {

        throw new Error("File_NOT_FOUND")

    }

    // TODO split into file stream and stl2stlxml stream
    // const dataStream = fs.createReadStream(mFilePath)

    const dataStream = await stl2stlxml(mFilePath) as any;


    // create director
    const parsedSource = path.parse(mFilePath)
    const targetPath=path.resolve(parsedSource.dir,"../out/")
    if (!fs.existsSync(targetPath)){
        fs.mkdirSync(targetPath);
    }

    // map xslt transformations
    const xsltTransformationStreams = xsltstreams().map(o => {



        const parsed = path.parse(o.file)
        const targetFilename = parsedSource.name+"."+parsed.name+".xml"
        const writeStream=fs.createWriteStream(path.resolve(targetPath,targetFilename))




        const ebuttXSD = `./server/converter/validate/ebutt.xsd`
        // TODO pipe...
       // const xmlStream = fs.createReadStream(path.resolve(targetPath,targetFilename));
       //  const mValidateStream= validateStream(xmlStream, ebuttXSD)

        // TODO o.stream//.pipe(writeFile)//.pipe(validate).pipe(writeValidateFile)

        //o.stream.pipe(getProgressSpy(o.id)).pipe(writeStream)//.pipe(mValidateStream)



        o.stream.pipe(getProgressSpy(o.id)).pipe(writeStream)

        return o.stream

    })

    // pipe all above - and return to client
    const all=pipe(dataStream, ...xsltTransformationStreams)

    finished(all, function (err) {
        if (err)
            res.send('pipe error!' + err.message)
        else
            res.send("ok")
    })


}




