import { Options, PythonShell } from "python-shell";
import * as path from "path";

function stl2stlxml(inputFile, outputFile, success) {
  // const pythonScript= path.resolve(__dirname,'stl2stlxml.py');
  // TODO the paths are a mess build with webpack maybe
    console.log("--------------------",__dirname)
  const root = path.resolve(__dirname, "../../server/converter/");
  const files = path.resolve(root, "./files");
  const pythonScript = path.resolve(root, "./stl2stlxml.py");

  inputFile = path.resolve(files, inputFile);
  outputFile = path.resolve(files, outputFile);

  const options: Options = {
    args: [
      inputFile,
      "-x "+outputFile,
      "-p",
      "-s"
    ],
    mode: "text",
    pythonOptions: ["-u"], // get print results in real-time

    // scriptPath: 'path/to/my/scripts'
  };


    if (process.platform!="win32")
      options.pythonPath= "/usr/bin/python"


  // TODO use streams
  PythonShell.run(pythonScript, options, (err, results) => {
    if (err) throw err;
    // results is an array consisting of messages collected during execution
    success(results);
  });
}

export { stl2stlxml };
