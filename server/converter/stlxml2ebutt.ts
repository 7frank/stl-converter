import * as path from "path";


function XML_via_XSLT_TransformStream(xslPath) {
    const jarPath = "./saxon99he.jar"
    const saxon = require('./saxon-stream2');
    const xsltStream = saxon(jarPath, xslPath, {timeout: 30000});
    return xsltStream

}


interface XSLTTransformInterface {
    id: string;
    file: string;
    stream?: NodeJS.ReadWriteStream;
    validate?: boolean;
}

function xsltstreams(): Array<XSLTTransformInterface> {
    const xsltStuff: Array<XSLTTransformInterface> = [
        {id: "STLXML_to_EBUTT", file: "./xslt/STLXML2EBU-TT.xslt"},
        {id: "EBU-TT2EBU-TT-D", file: "./xslt/EBU-TT2EBU-TT-D.xslt"},
        {id: "EBU-TT-D2EBU-TT-D-Basic-DE", file: "./xslt/EBU-TT-D2EBU-TT-D-Basic-DE.xslt", validate: true}
    ]

    xsltStuff.forEach(o => {

        o.file = path.resolve(__dirname, o.file)
        o.stream = XML_via_XSLT_TransformStream(o.file)

    })


    return xsltStuff


}


export {
    //stlxml2ebutt, stlxml2ebuttSAXON,
    XML_via_XSLT_TransformStream, xsltstreams
};
