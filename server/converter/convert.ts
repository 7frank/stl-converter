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
       //  pythonOptions: ["-u"], // get print results in real-time  // TODO this did result in windows not returning data at all

        // scriptPath: 'path/to/my/scripts'
    };


    if (process.platform != "win32")
        options.pythonPath = "/usr/bin/python"
    //  else
    //      options.pythonPath = "C:/Python27/python.EXE"


    return new Promise((resolve, reject) => {
        // TODO use streams
        PythonShell.run(pythonScript, options, (err, results) => {
            if (err) {
                reject(err);
                return
            }
            // results is an array consisting of messages collected during execution

            if (results == null) {
                reject(new Error("Python shell did not return data."))
                return
            }

            const dataStream = arrayToReadableStream(results)

            resolve(dataStream);
        });


    })

}


export {stl2stlxml};
