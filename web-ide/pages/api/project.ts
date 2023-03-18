// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import path from "path";
import fs from "fs";

async function getDirectoryStructure(dirPath) {
  const stats = fs.statSync(dirPath);
  if (!stats.isDirectory()) {
    throw new Error('Path is not a directory');
  }

  const files = fs.readdirSync(dirPath);

  const result = {
    name: path.basename(dirPath),
    children: [],
  };

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const fileStats = fs.statSync(filePath);
    if (fileStats.isDirectory()) {
      result.children.push(await getDirectoryStructure(filePath));
    } else {
      result.children.push({
        name: file,
      });
    }
  }

  return result;
}
async function loadProjectFromFileSystem(){
  const directory = process.env['PROJECT_DIR']
  return getDirectoryStructure(directory)
}



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json(await loadProjectFromFileSystem())
}
