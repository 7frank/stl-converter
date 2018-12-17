import * as path from "path";
import * as fs from "fs";
import {stl2stlxml} from "../converter/convert";
import {xsltstreams} from "../converter/stlxml2ebutt";
import {validate} from "../converter/validate/validate";

import {duplex, finished, pipe, pipeline} from "mississippi";


export enum TransformationState {
    none = "none",
    pending = "pending",
    queued = "queued",
    progress = "progress",
    converted = "converted",
    validated = "validated",
    error ="error"
}


interface STLTransformationResult {
}


export interface Transformation {
    state: TransformationState;
    result: STLTransformationResult;

}

export const transformationPipe: Map<string, TransformationState> = new Map()
/**
 * potential use case with validation
 * @param inputFile
 */

export const withValidation = inputFile => {
    return new Promise((resolve, reject) => {

            convertFile(inputFile, function (err) {
                if (err) {


                    transformationPipe.set(inputFile,TransformationState.error)

                    reject(err)
                    return
                }

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


export const initialize = filename => {

    let val = transformationPipe.get(filename)

    if (val === undefined) {
        val = TransformationState.none
        transformationPipe.set(filename, val)

    }
}

async function convertFile(inputFile: string, onFinished: Function, onValidated?: Function) {


    const mFilePath = path.resolve(__dirname, inputFile)
    console.log("converting STL to EBU-TT-D-Basic-DE : " + mFilePath)
    if (!fs.existsSync(mFilePath)) {

        throw new Error("File_NOT_FOUND")

    }

    // TODO split into file stream and stl2stlxml stream
    // const dataStream = fs.createReadStream(mFilePath)


    const promise=stl2stlxml(mFilePath).catch((e)=>{

        onFinished(e)



       // console.log(e)

    })

    const dataStream = await promise as any;


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