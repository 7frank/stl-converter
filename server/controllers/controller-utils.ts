import * as express from "express";

export function getOrigin(_req: express.Request, path = ""): string {
    return _req.protocol + '://' + _req.get('host') + path

}