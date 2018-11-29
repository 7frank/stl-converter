import {Options, PythonShell} from "python-shell";
import * as path from "path";
import * as Stream from "stream";


/* tslint:disable */
function arrayToReadableStream(array) {
    const readable = new Stream.Readable();

    array.forEach(i => readable.push(i));
    readable.push(null);
    return readable;
}


/**
 * Promise returns a stream containing the data
 *
 * @param inputFile
 */
async function stl2stlxml(inputFile) {


    const root = path.resolve(__dirname, ".");

    const pythonScript = path.resolve(root, "./stl2stlxml.py");
    const files = path.resolve(root, "./files");
    inputFile = path.resolve(files, inputFile);


    const options: Options = {
        args: [
            inputFile,
            // "-x "+outputFile,
            "-p",
            "-s"
        ],
        mode: "text",
        pythonOptions: ["-u"], // get print results in real-time

        // scriptPath: 'path/to/my/scripts'
    };


    if (process.platform != "win32")
        options.pythonPath = "/usr/bin/python"

    return new Promise((resolve, reject) => {

        // TODO use streams
        PythonShell.run(pythonScript, options, (err, results) => {
            if (err) reject(err);
            // results is an array consisting of messages collected during execution

            const dataStream = arrayToReadableStream(results)

            resolve(dataStream);
        });


    })

}


export {stl2stlxml};
