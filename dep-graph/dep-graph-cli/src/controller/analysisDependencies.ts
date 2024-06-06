import path from 'path'
import { Context } from 'koa'
import { doGraphParse } from '../utils'
import { GetDepControllerResponse } from '../utils/type'
import { getNpmDependencies } from './packageLock'
import { getPnpmDependencies } from './pnpmLock'
import { getYarnDependencies } from './yarnLock'

export const analysisDependencies = async (cxt: Context) => {
  const { filePath, dep } = cxt.request.body
  if (!filePath) {
    throw new Error(`请传入正确的参数: path`)
  }
  let dependencies
  const packagePath = path.resolve(__dirname, filePath);
  // 根据传入的文件后缀，进行分别处理
  if (filePath.endsWith('package-lock.json')) {
    dependencies = await getNpmDependencies(packagePath)
  } else if (filePath.endsWith('yarn.lock')) {
    dependencies =  await getYarnDependencies(packagePath)
  } else if (filePath.endsWith('pnpm-lock.yaml')) {
    dependencies = await getPnpmDependencies(packagePath)
  }
  
  cxt.body = {
    code: 0,
    data: {
      data: {
        graphOption: doGraphParse(dependencies, dep)
        // graphOption: dependencies
      }
    }
  }
}