import { Transform, Readable, Writable } from "stream";


export class TestStream extends Transform {

    constructor(options) {
        super(options);
    }

    _write(chunk: any, encoding: string, callback: (err?: Error) => void): void {
        super._write(chunk, encoding, callback);
    }




}

var util = require('util');


export class Upper extends Transform {


    _transform (chunk, enc, cb) {
        const upperChunk = chunk.toString().toUpperCase();
        this.push(upperChunk);
        cb();
    }

}


export class Lower extends Transform {


    _transform (chunk, enc, cb) {
        const upperChunk = chunk.toString().toLowerCase();
        this.push(upperChunk);
        cb();
    }

}




export class XSLTTransformStream extends Transform {



    _transform (chunk, enc, cb) {
        const upperChunk = chunk.toString().toUpperCase();
        this.push(upperChunk);
        cb();
    }

}

export
function renderer () {
    return new Writable({
        objectMode: true,
        write: (data, _, done) => {
            console.log('<-', data)
            done()
        }
    })
}

export
function xformer () {
    let count = 0

    return new Transform({
        objectMode: true,
        transform: (data, _, done) => {
            done(null, { data, index: count++ })
        }
    })
}