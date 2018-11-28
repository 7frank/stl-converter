import * as express from "express";
import * as fs from "fs";

import { stl2stlxml } from "../converter/convert";
import { stlxml2ebuttSAXONJAVA} from "../converter/stlxml2ebutt";

import * as Stream from "stream";
import {Request} from "express";
import {Response} from "express";
/* tslint:disable */
function arrayToReadableStream(array) {
  const readable = new Stream.Readable();

  array.forEach(i => readable.push(i));
  readable.push(null);
  return readable;
}

// tslint:disable:variable-name
export function getDefault(_req: express.Request, res: express.Response) {

  const inputFile = "./stl/test.stl";
  const outputFile = "./out/test-stlxml.xml";
  stl2stlxml(inputFile, outputFile, function(data) {
    // const dataStream= arrayToReadableStream(data)

      // TODO stream
    //stlxml2ebutt(data.join("\n"), "./STLXML2EBU-TT.xslt");
  });

  res.send("converter");
}



export function testStep2(_req: express.Request, res: express.Response) {
    // TODO fix paths with tsc build option
    //meanwhile assume "." to be  "scr/converter/files/"

    const input_outputFile = "./server/converter/files/out/static.stl.xml";
    const dataString = fs.readFileSync(input_outputFile, "utf8");
   // stlxml2ebuttSAXON(dataString, "./server/converter/STLXML2EBU-TT.xslt");

    const ebuttOutputPath="./server/converter/files/out/static4.ebutt.xml"
    const xsl="./server/converter/STLXML2EBU-TT.xslt"
    stlxml2ebuttSAXONJAVA(input_outputFile, xsl,ebuttOutputPath,()=>{

        res.json({
            input:input_outputFile,
            xslt:xsl,
            output:ebuttOutputPath,
        });

    });



}

