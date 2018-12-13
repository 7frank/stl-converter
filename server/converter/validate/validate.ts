import {Readable} from "stream";

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

import  * as ValidationStream from 'pipe-validation-stream';

export function createXMLValidationStream(xsdFile,onValidationFailed?:(any)=>void) {

    let validationStream = new ValidationStream.ValidationStream(-1, function (data) {
        return new Promise((resolve, reject) => {
            // TODO see if streams are useful here with param 1
            //validator.validateXML(xmlStream, ...);
            validator.validateXML(data, xsdFile, function (err, result) {
                 if (err) {
                     reject(err);
                 }

                resolve(result); // true
            });

        })
    });

    //TODO
    validationStream.on(ValidationStream.VALIDATION_FAILED_EVENT, function(...args) {
        console.log("Validation failed: ",args);
        if (onValidationFailed)
        onValidationFailed(args);
    })



    return validationStream
}
