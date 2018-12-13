import * as express from "express";
import * as fs from "fs";
import * as path from "path";


import {stl2stlxml} from "../converter/convert";
import {xsltstreams} from "../converter/stlxml2ebutt";

import {validate, createXMLValidationStream} from "../converter/validate/validate";
import {Lower, renderer, Upper, xformer} from "../converter/transform";


export function getOrigin(_req: express.Request, path = ""): string {
    return _req.protocol + '://' + _req.get('host') + path

}


import {pipeline, duplex, pipe, finished} from "mississippi";

function createProgressSpyStream(id: string) {
    const progress = require('progress-stream');

    //const  stat = fs.statSync(filename);
    const str = progress({

        //  length: stat.size,
        time: 10 /* ms */
    });
    str.on('progress', function (progress) {
        console.log("id:" + id, progress.percentage);
    });

    return str
}

/**
 *
 * Controller that uses the whole work flow from stl => stlxml => backup => ebutt
 *
 * - read file
 * - generate stlxml
 * - transform xml file n times via xslt and each time write to file system and validate
 *
 *  TODO only write to filesystem if next transformation step does fail ?
 *
 */




export async function stl2ebu(_req: express.Request, res: express.Response) {


    //const inputFile = "../converter/files/stl/test.stl";
    const inputFile = "../../tests/stl/Test 1.stl";

    convertFile(inputFile, function (err) {
        if (err)
            res.send('pipe error!' + err.message)
    }, function (report: any) {
        res.json(report)
    })
}


enum TransformationState {
    none="none",
    queued="queued",
    progress="progress",
    converted="converted",
    validated="validated"


}


const transformationPipe: Map<string, TransformationState> = new Map()


export async function stl2ebu_batch(_req: express.Request, res: express.Response) {


    //const inputFile = "../converter/files/stl/test.stl";
    const inputFiles = [
        "../../tests/stl/Test 1.stl",
        "../../tests/stl/Test 2.stl",
        "../../tests/stl/Test 3.stl"
    ];

    // filter only new entries that are not already at least queued
    const newEntries = inputFiles.filter(filename => !transformationPipe.get(filename) || transformationPipe.get(filename) == TransformationState.none)


    const currentStates = inputFiles.map(filename => {

        let val = transformationPipe.get(filename)

        if (val === undefined) {
            val = TransformationState.none

        }
        transformationPipe.set(filename, val)

        return {filename,state:val}


    })


    const withValidation = inputFile => {
        return new Promise((resolve, reject) => {

                convertFile(inputFile, function (err) {
                    if (err)
                        reject(err)

                    transformationPipe.set(inputFile,TransformationState.converted)

                }, function (report: any) {
                    resolve(report)

                    transformationPipe.set(inputFile,TransformationState.validated)

                })
            }
        )
    }


    const withoutValidation = inputFile => {
        return new Promise((resolve, reject) => {

                convertFile(inputFile, function (err) {

                    if (err)
                        reject(err)
                    else
                        resolve(err)

                    transformationPipe.set(inputFile,TransformationState.converted)

                })
            }
        )
    }

    newEntries.forEach(filename => transformationPipe.set(filename, TransformationState.queued))

    const promises = newEntries.map(withValidation)


    Promise.all(promises).then(function (values) {

        const response = newEntries.map((filename, i) => ({result: values[i], filename}))

        //.map(f => getOrigin(_req,f))
        // TODO have meaningful output even without validation



        console.log("Promise all:", response)
    })


    res.json(currentStates)


}


async function convertFile(inputFile: string, onFinished: Function, onValidated?: Function) {


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
    const targetPath = path.resolve(parsedSource.dir, "../out/")
    if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath);
    }

    // map xslt transformations
    const xsltTransformationStreams = xsltstreams().map(o => {


        const parsed = path.parse(o.file)
        const targetFilename = parsedSource.name + "." + parsed.name + ".xml"
        const target = path.resolve(targetPath, targetFilename)
        const writeStream = fs.createWriteStream(target)


        const ebuttXSD = `./server/converter/validate/ebutt.xsd`

        o.stream.pipe(createProgressSpyStream(o.id))
        // .pipe(createXMLValidationStream(ebuttXSD)) //TODO make validation via pipe

            .pipe(writeStream)


            .on("finish", function () {
                console.log('written output')
                if (o.validate && onValidated) {
                    console.log('validating result')


                    validate(target, ebuttXSD).then(function responseCallback(report: any) {

                        const obj = {
                            input: mFilePath,
                            output: target,
                            valid: report.valid,
                            messages: report.messages
                        }
                        onValidated(obj);

                    }).catch(console.error)//TODO error handling
                } else console.log('NOT validating result')
            })


        return o.stream

    })

    // pipe all above - and return to client
    const all = pipe(dataStream, ...xsltTransformationStreams)

    finished(all, onFinished)


}


