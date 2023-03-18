import {NextApiRequest, NextApiResponse} from "next";
import path from "path";
import fs from "fs";

async function getFileFromFileSystem(filePath){
    const directory = process.env['PROJECT_DIR']
    const combinedPath = path.join(directory, '..', filePath);
    if (!combinedPath.startsWith(directory)) throw 'invalid path'
    return fs.readFileSync(combinedPath)
}
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    try{
        const content =(await getFileFromFileSystem(req.query.path)).toString()
        res.status(200).json({
            content
        })
    }catch (e) {
        res.status(404).json({})
    }
}
