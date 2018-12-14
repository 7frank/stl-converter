import {Request, Response} from 'express';
import {getOrigin} from "./controller-utils";
import * as fs from "fs"
import * as path from "path";

let pkg = require(__dirname + '/../../package.json');

export let index = (req: Request, res: Response) => {
    res.json({
        message: 'STL to EBU-TT Converter',
        version: pkg.version,
        readme: getOrigin(req, "/Readme"),
        dashboard: getOrigin(req, "/dashboard")
    });
}


const createReadme = () => {

    const showdown = require('showdown');
    showdown.setFlavor('github');
    const converter = new showdown.Converter();

    const markdownCSS = fs.readFileSync(path.resolve(__dirname, "../../github-markdown.css"), "utf8")

    const filename = path.resolve(__dirname, "../../README.md");
    const text = fs.readFileSync(filename, "utf8")


    const html = converter.makeHtml(text);

    const result = `<style>${markdownCSS}</style>
        <body class="markdown-body">${html}</body>`;


    return result

}

const README = createReadme()
export let readme = (req: Request, res: Response) => {
    res.send(README)
}
