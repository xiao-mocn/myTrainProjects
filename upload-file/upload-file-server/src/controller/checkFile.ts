import { Context } from "koa";
import { UPLOAD_DIR } from "../utils";
import fs from 'fs-extra'
import path from 'path'
import { FindFileControllerResponse } from '../../../type'

export async function findFileController (ctx: Context) {
  const { fileName } = ctx.request.query;

  // 讲道理，这个 exists 的判断应该要调用很多次
  // 理论上应该抽出去作为 utils？
  const fileExists = async (fileName: any) => {
    if (typeof fileName !== 'string') {
      return false
    }
    const filePath = path.join(UPLOAD_DIR, fileName)
    try {
      await fs.promises.access(filePath, fs.constants.F_OK)
      return true
    } catch(e) {
      return false
    }
  }

  // 假如文件不存在，这里似乎并没必要 mkdir？
  // check file 接口应该是幂等的，不要做不必要的副作用
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
  }
  const isExists = await fileExists(fileName)
  ctx.body = {
    code: 0,
    data: {
      isExists: isExists
    },
  } satisfies FindFileControllerResponse;
}