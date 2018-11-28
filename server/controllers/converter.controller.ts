import * as express from "express";

import { stl2stlxml } from "../converter/convert";
import { stlxml2ebutt } from "../converter/stlxml2ebutt";

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
  // TODO fix paths with tsc build option
  //meanwhile assume "." to be  "scr/converter/files/"
  const inputFile = "./stl/test.stl";
  const outputFile = "./out/test-stlxml.xml";
  stl2stlxml(inputFile, outputFile, function(data) {
    // const dataStream= arrayToReadableStream(data)

    stlxml2ebutt(data.join("\n"), "./STLXML2EBU-TT.xslt");
  });

  res.send("converter");
}

