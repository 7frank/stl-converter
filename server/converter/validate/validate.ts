var validator = require('xsd-schema-validator');

/**
 *
 * Note reject is not called instead use the result.valid flag of the response to handle invalid results
 * @param xmlFile
 * @param xsdFile
 */
export function validate(xmlFile, xsdFile) {

 return new Promise((resolve, reject) => {
     // TODO see if streams are useful here with param 1
     //validator.validateXML(xmlStream, ...);
     validator.validateXML({file: xmlFile}, xsdFile, function (err, result) {
        /* if (err) {
             reject(err);
         }*/

         resolve(result); // true
     });

 })

}

export function validateStream(xmlStream, xsdFile) {


       return validator.validateXML(xmlStream, xsdFile,function (err, result) {
            if (err) {
                console.error(err);
            }

           console.log(result); // true
       })

}