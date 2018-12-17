import * as express from "express";
import {duplex, finished, pipe, pipeline} from "mississippi";
import {Queue} from 'queue-typescript';
import {initialize, transformationPipe, TransformationState, withValidation} from "./transform-utils";
import * as path from "path";
import * as fs from "fs";
import * as rimraf from "rimraf";


/**
 *
 *  FIXME fix performance no files are in the queue but cpu is at 100 pct.
 *
 * Controller that uses the whole work flow from stl => stlxml => backup => ebutt
 *
 * - read file
 * - generate stlxml
 * - transform xml file n times via xslt and each time write to file system and validate
 *
 *  TODO only write to filesystem if next transformation step does fail ?
 *

 * work flow
 * - we du have a queue
 * - we can add one or more items to the queue
 *      - query for new files within a specified directory and simulate creating them instead for better use case tests
 *      - have demo files in stl folder
 *      - copy from there into in folder
 * - timeout that checks the queue and starts converting entries
 * - have a route to add entries
 * - have a route to check state of current queue
 *
 *
 * TODO decouple convert and validate?
 *      - in case the queue gets too big we could disable the validation to keep up with converting data and could validate them later on
 * TODO find out how the current file work flow is
 *      - file is created in folder
 *      - where does the ebu have to be stored?
 *      - is the stl file deleted afterwards?
 *      - FIXME in case the folder is fixed, make sure that a service restart does not reconvert all files once again
 *
 **/


const simulatedFilesInterval = 4000;// create a test file every 50 seconds
const emptyQueueIdleTimeout = 5100;
const inBetweenQueueIdleTimeout = 1100;


const fileScanInterval = 20025;


const testFiles = [
    // "../../tests/stl/Test 1.stl",
    // "../../tests/stl/Test 2.stl",
    // "../../tests/stl/Test 3.stl",
    // "../converter/files/stl/test.stl"
];

let queue = new Queue<string>(...testFiles)
// temp folder for testing
const temp = path.resolve(__dirname, "../../tests/_temp_src/")


/**
 * the main transformation loop. Will go idle for a certain amount if no files need to be converted
 */
function transformQueueLoop() {
    console.log("transformQueueLoop")

    //get files from queue TODO
    let inputFiles = [queue.dequeue(),  queue.dequeue()]

    inputFiles = inputFiles.filter(v => v)

    if (inputFiles.length == 0)
        setTimeout(() => transformQueueLoop(), emptyQueueIdleTimeout)
    else
        stlebu_next_batch(inputFiles).then(function (values) {
            // const response = newEntries.map((filename, i) => ({result: values[i], filename}))
            console.log("Promises all, resolved:", values)

            setTimeout(() => transformQueueLoop(), inBetweenQueueIdleTimeout)

        })


}


/**
 * copies files from test folder to source folder
 * where the actual
 * TODO simulate varying file load & validation_pending
 */
function simulateFiles() {
    console.log("simulateFiles")

    // initialize - delete source folder

    const root = path.resolve(__dirname, "../../tests/stl/")


    // delete temp source folder
    if (fs.existsSync(temp))
        rimraf.sync(temp);

    // create temp source folder again
    if (!fs.existsSync(temp)) {
        fs.mkdirSync(temp, 0o744);
    }

    // copy files every n seconds


    const copyTempFile = () => {
        //copy files with random names
        fs.copyFile(root + '/Test 1.stl', temp + `/Test ${Date.now()}.stl`, (err) => {
            if (err) console.log(err);
        });
    }

    setInterval(copyTempFile, simulatedFilesInterval)
    copyTempFile()
    setTimeout(copyTempFile, 55)
    // setTimeout(copyTempFile, 150)


}


simulateFiles()
transformQueueLoop()
setInterval(() => scanForNewFiles(), fileScanInterval)


// TODO implement from abstract/interface with promise or callback to only fetch file if needed
function scanForNewFiles() {
    console.log("scanForNewFiles")
    fs.readdirSync(temp).forEach(file => {

        const filename = temp + "/" + file
        if (!transformationPipe.get(filename)) {
            transformationPipe.set(filename, TransformationState.none)
            queue.enqueue(filename)
            console.log("added file to queue: ", filename);
        }
    })


}


/**
 * convert the next batch of files
 *
 */
function stlebu_next_batch(inputFiles: Array<string>) {
    console.log("stlebu_next_batch")
    // filter only new entries that are not already at least queued
    const newEntries = inputFiles.filter(filename => !transformationPipe.get(filename) || transformationPipe.get(filename) == TransformationState.none)
    newEntries.forEach(initialize)
    newEntries.forEach(filename => transformationPipe.set(filename, TransformationState.queued))


    // execute the stl xml transformation
    let promises = newEntries.map(withValidation)

    promises= promises.map( (p:any) => p.catch(e => console.log(e.message)))


    return Promise.all(promises)
}


export async function checkQueue(_req: express.Request, res: express.Response) {

    // get current state info and return
    const currentStates = getCurrentStateOfSTLQueue()
    res.json(currentStates)


}

export function getCurrentStateOfSTLQueue(myFilter?:(val:any,key:number)=>any) {
    let entries = Array.from(transformationPipe.keys())

   if (myFilter)
        entries = entries.filter(myFilter)
    const currentStates = entries.map(filename => {
        let val = transformationPipe.get(filename)
        return {filename, state: val}

    })




    return currentStates

}

