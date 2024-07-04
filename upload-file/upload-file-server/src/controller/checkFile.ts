import { Context } from "koa"
import { UPLOAD_DIR } from "../utils"
import fs from 'fs-extra'
import { fileExists } from "../utils"

export async function findFileController (ctx: Context) {
  const { fileName } = ctx.request.query
  // 修改成--当前文件目录是否存在，如不存在则直接返回false，存在则去搜索
  let isExists = false
  // 要求：所有文件操作都调整成异步操作
  if (await fs.pathExists(UPLOAD_DIR)) {
    isExists = await fileExists(fileName)
  }
  ctx.body = {
    code: 0,
    data: {
      isExists: isExists
    },
  }
}