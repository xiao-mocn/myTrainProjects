import path from 'path'

export const UPLOAD_DIR = path.resolve(__dirname, '../../../', 'uploadFile')

// 创建临时文件夹用于临时存储 chunk
export const getChunkDir = (fileHash: string): string => path.resolve(UPLOAD_DIR, `chunkDir_${fileHash}`)

export const isValidString = (s: any) => typeof s === 'string' && s.length > 0