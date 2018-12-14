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



interface STLTransformationResult {
}

enum TransformationState {
    none = "none",
    queued = "queued",
    progress = "progress",
    converted = "converted",
    validated = "validated"


}


interface Transformation {
    state: TransformationState;
    result: STLTransformationResult;

}


const transformationPipe: Map<string, TransformationState> = new Map()


/**
 * potential use case with validation
 * @param inputFile
 */

const withValidation = inputFile => {
    return new Promise((resolve, reject) => {

            convertFile(inputFile, function (err) {
                if (err)
                    reject(err)

                transformationPipe.set(inputFile, TransformationState.converted)

            }, function (report: any) {
                resolve(report)

                transformationPipe.set(inputFile, TransformationState.validated)

            })
        }
    )
}


/**
 * potential use case without validation
 * @param inputFile
 */
const withoutValidation = inputFile => {
    return new Promise((resolve, reject) => {

            convertFile(inputFile, function (err) {

                if (err)
                    reject(err)
                else
                    resolve(err)

                transformationPipe.set(inputFile, TransformationState.converted)

            })
        }
    )
}


const initialize = filename => {

    let val = transformationPipe.get(filename)

    if (val === undefined) {
        val = TransformationState.none
        transformationPipe.set(filename, val)

    }
}


//const inputFile = "../converter/files/stl/test.stl";
const testFiles = [
    "../../tests/stl/Test 1.stl",
    "../../tests/stl/Test 2.stl",
    "../../tests/stl/Test 3.stl"
];

import {Queue} from 'queue-typescript';

let queue = new Queue<string>(...testFiles)

setInterval(() => {


    stlebuuuuu()


}, 5000)


/**
 * copies files from test folder to source folder
 * where the actual
 */
function simulateFiles()
{

    // initialize - delete source folder

    const root="."


    setInterval(() => {

        //copy files with random names

       console.log("add file")


    }, 1000)

}
simulateFiles()



// TODO implement from abstract/interface with promise or callback to only fetch file if needed
function scanForNewFiles()
{
    console.log("query for new files")
    queue.enqueue( "../../tests/stl/Test 1.stl")
}

/**
 * work flow todo
 * - we du have a queue
 * - we can add one or more items to the queue
 *      - query for new files within a specified directory and simulate creating them instead for better use case tests
 *      - have demo files in stl folder
 *      - copy from there into in folder
 * - timeout that checks the queue and starts converting entries
 * - have a route to add entries
 * - have a route to check state of current queue
 *
 * @param _req
 * @param res
 */





export async function addQueueItem(_req: express.Request, res: express.Response) {

    scanForNewFiles()

    res.send("added to queue size:"+queue.length)
   // res.redirect('/queue')

}



function stlebuuuuu()
{
    //get files from queue TODO
    const inputFiles = [queue.dequeue(), queue.dequeue(), queue.dequeue()]

    // filter only new entries that are not already at least queued
    const newEntries = inputFiles.filter(filename => !transformationPipe.get(filename) || transformationPipe.get(filename) == TransformationState.none)
    newEntries.forEach(initialize)
    newEntries.forEach(filename => transformationPipe.set(filename, TransformationState.queued))



    // execute the stl xml transformation
    const promises = newEntries.map(withValidation)
    Promise.all(promises).then(function (values) {
        const response = newEntries.map((filename, i) => ({result: values[i], filename}))
        console.log("Promise all:", response)
    })


}


export async function checkQueue(_req: express.Request, res: express.Response) {



    // get current state info and return
    const currentStates = Array.from(transformationPipe.keys()).map(filename => {
        let val = transformationPipe.get(filename)
        return {filename, state: val}

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


