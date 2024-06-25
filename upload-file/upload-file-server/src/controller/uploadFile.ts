
import fs from 'fs-extra'
import path from 'path'
import { Context } from "koa"
import { UPLOAD_DIR, isValidString, fileExists } from "../utils"

export async function uploadFileController (ctx: Context) {
  const { fileName, hash } = ctx.request.body
  

  const chunkFile = ctx.request.files?.chunk
  if (!chunkFile || Array.isArray(chunkFile)) {
    throw new Error(`上传无效的文件切片：${fileName}`)
  }
  const chunk = await fs.readFile(chunkFile.filepath)
  // 对每个切片的入参做校验
  if (!isValidString(fileName)) {
    throw new Error(`请传入正确的参数: fileName`)
  }
  if (!isValidString(hash)) {
    throw new Error(`请传入正确的参数: hash`)
  }
  if (!chunk || chunk.length === 0) {
    throw new Error(`请传入正确的参数: chunk`)
  }

  // 判断文件目录是否存在，不存在则创建该目录
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR)
  }

  // 切片存在直接返回
  if (await fileExists(fileName)) {
    ctx.body = {
      code: 2,
      message: 'chunk exist',
      data: { fileName: fileName }
    }
    return
  }
  await fs.move(chunkFile.filepath, `${UPLOAD_DIR}/${fileName}`)
  ctx.body = {
    code: 0,
    message: 'received file chunk',
    data: { fileName: fileName }
  }

}