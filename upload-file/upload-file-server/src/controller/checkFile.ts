import { Context } from "koa";
import { UPLOAD_DIR } from "../utils";
import fs from 'fs-extra'
import path from 'path'
import { FindFileControllerResponse } from '../../../type'

export async function findFileController (ctx: Context) {
  const { fileName } = ctx.request.query;

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