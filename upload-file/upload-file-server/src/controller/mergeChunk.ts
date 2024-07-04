import { Context } from 'koa'
import fs from 'fs-extra'
import path from 'path'
import { UPLOAD_DIR } from "../utils";

export async function mergeChunkController (ctx: Context) {
  const { hash, fileName } = ctx.request.body
  const files = await fs.readdir(UPLOAD_DIR)
  // 筛选chunk，并且根据文件的index进行排序
  // 这个 chunks 有可能是空数组
  const chunks = files.filter(file => {
    return file.split('_')[0] === hash
  }).sort((a, b) => {
    const aIndex = parseInt(a.split('_')[1], 10);
    const bIndex = parseInt(b.split('_')[1], 10);
    return aIndex - bIndex
  })
  // 如果 chunks 为空数组，直接返回错误信息
  if (chunks.length === 0) {
    ctx.body = {
      code: 1,
      data: {
        message: '没有找到任何文件块',
      }
    };
    return;
  }
  const writeStream = fs.createWriteStream(`${UPLOAD_DIR}/${hash}_${fileName}`);
  // 改用promise.all方法，并行执行所以chunk文件的读取，提升读取大文件效率
  const mergeChunkController = chunks.map(chunk => readChunkContent(chunk))
  await Promise.all(mergeChunkController)
  // 按照顺讯进行文件合并操作，保证顺序
  for (const content of mergeChunkController) {
    writeStream.write(content);
  }
  writeStream.end();
  ctx.body = {
    code: 0,
    data: {
      fileName: `${hash}_${fileName}`
    },
  }
}
// 读取chunk的文件内容 
function readChunkContent(chunk: string) {
  return new Promise<Buffer>((resolve, reject) => {
    const filePath = path.join(UPLOAD_DIR, chunk);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error('读取文件出错:', err)
        reject(err);
      } else {
        fs.unlinkSync(filePath) // 删除已读取的文件
        resolve(data);
      }
    })
  })
}