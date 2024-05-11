import { Context } from "koa";
import { UPLOAD_DIR } from "../utils";
import fs from 'fs-extra'
import { FindFileControllerResponse } from '../../../type'

export async function findFileController (ctx: Context) {
  // const { fileName, hash } = ctx.request.query;

  let fileList: string[] = []
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
  }
  const list = await fs.readdir(UPLOAD_DIR) || []
  fileList = list.sort()
  ctx.body = {
    code: 0,
    data: {
      isExists: true,
      fileList: []
    },
  } satisfies FindFileControllerResponse;
}