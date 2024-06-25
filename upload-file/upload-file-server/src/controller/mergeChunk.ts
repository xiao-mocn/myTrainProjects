import { Context } from 'koa'
import fs from 'fs-extra'
import path from 'path'
import { UPLOAD_DIR } from "../utils";

export async function mergeChunkController (ctx: Context) {
  const { hash, fileName } = ctx.request.body
  const files = await fs.readdir(UPLOAD_DIR)
  // 筛选chunk，并且根据文件的index进行排序
  const chunks = files.filter(file => {
    return file.split('_')[0] === hash
  }).sort((a, b) => {
    const aIndex = parseInt(a.split('_')[1], 10);
    const bIndex = parseInt(b.split('_')[1], 10);
    return aIndex - bIndex
  })
  const writeStream = fs.createWriteStream(`${UPLOAD_DIR}/${hash}_${fileName}`);
  // 改用promise.all方法，并行执行所有合并操作，提升大文件合并的效率
  const mergeChunkController = chunks.map(chunk => appendChunkContent(chunk, writeStream))
  await Promise.all(mergeChunkController)
  writeStream.end();
  ctx.body = {
    code: 0,
    data: {
      fileName: `${hash}_${fileName}`
    },
  }
}

function appendChunkContent(chunk: string, writeStream: fs.WriteStream) {
  return new Promise(resolve => {
    const filePath = path.join(UPLOAD_DIR, chunk)
    const readStream = fs.createReadStream(filePath)
    readStream.pipe(writeStream, { end: false })
    readStream.on('end', () => {
      fs.unlinkSync(filePath)
      resolve(true)
    })
    readStream.on('error', (err) => {
      console.error('读取文件出错:', err);
    });
  })
}