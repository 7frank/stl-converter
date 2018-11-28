const { xsltProcess, xmlParse } = require("xslt-processor");

import * as fs from "fs";

function stlxml2ebutt(xmlString, xsltFile) {
  // const xmlString = fs.readFileSync(inputFile, "utf8");
  const xsltString = fs.readFileSync(xsltFile, "utf8");

  const xml = xmlParse(xmlString); // xmlString: string of xml file contents
  const xslt = xmlParse(xsltString); // xsltString: string of xslt file contents

  // FIXME does generate  empty string
  const outXmlString = xsltProcess(xml, xslt);

  // npm i saxon-xslt
  // var transform = require('Saxon');
  // var outXmlString = TransformFromStrings(xmlString,xsltString);

  fs.writeFile("./files/ebutt-out.xml", outXmlString, function(err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  });
}

export { stlxml2ebutt };
