import path from 'path'
import fs from 'fs-extra'

// 通过使用 process.cwd() 获取当前工作目录：这样可以确保路径相对于项目根目录。
const currentDir = process.cwd()
export const UPLOAD_DIR = path.resolve(currentDir, 'uploadFile')

export const isValidString = (s: any) => typeof s === 'string' && s.length > 0

export const fileExists = async (fileName: any) => {
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