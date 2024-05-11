
import fs from 'fs-extra'
import path from 'path'
import { Context } from "koa"
import { UPLOAD_DIR } from "../utils"

export async function uploadFileController (ctx: Context) {
  // console.log('ctx.request.body ===', ctx.request.body)
  // const { fileName, fileHash, hash } = ctx.request.body
  // const chunkFile = ctx.request.files?.chunk
  // if (!chunkFile || Array.isArray(chunkFile)) {
  //   throw new Error(`无效的块文件参数`)
  // }
  // const chunk = await fs.readFile(chunkFile.filepath)

  // if (!fs.existsSync(UPLOAD_DIR)) {
  //   fs.mkdirSync(UPLOAD_DIR);
  // }

  // // 判断文件是否存在，如已存在直接返回
  // // 文件存在直接返回
  // const filePath = path.resolve(UPLOAD_DIR, `${fileName}`)
  // if (await fs.pathExists(filePath)) {
  //   ctx.body = {
  //     code: 1,
  //     message: 'file exist',
  //     data: { hash: fileHash }
  //   }
  //   return
  // }
  // // 切片存在直接返回
  // const chunkPath = path.resolve(UPLOAD_DIR, `${fileName}`)
  // if (await fs.pathExists(chunkPath)) {
  //   ctx.body = {
  //     code: 2,
  //     message: 'chunk exist',
  //     data: { hash: fileHash }
  //   }
  //   return
  // }
  // await fs.move(chunkFile.filepath, `${UPLOAD_DIR}/chunks_dir/${hash}`)
  ctx.body = {
    code: 0,
    message: 'received file chunk',
    data: { hash: 'fileHash' }
  }

}