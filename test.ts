import {Options, PythonShell} from "python-shell";

const exec = require('child_process').exec;

function testJavaInstalled() {

    const n = (e) => console.error(e)

    var cmd = exec('java -version', {timeout: 1000}, function (err, stdout, stderr) {
        if (err) return n(err);
        if (stderr) return n(stderr);
        if (stdout !== '') {
            console.log(stdout);
        }
    });

    cmd.on('exit', function (code, sig) {
        console.log(code, sig)
    })

}

/**
 * TODO use default options
 */
export
async function testPythonInstalled() {
    return new Promise(function (resolve, reject) {
        const options: Options = {

            // pythonOptions: ["-u"]
        };
        if (process.platform != "win32")
            options.pythonPath = "/usr/bin/python"

        PythonShell.runString('x=1+1;print(x)', options, function (err, data) {
            if (err) reject(err);
            else if (!data || data[0] != "2") reject(new Error("Python Shell wrong configuration. Does not return data from stdout."));
            else resolve()

        });
    })
}