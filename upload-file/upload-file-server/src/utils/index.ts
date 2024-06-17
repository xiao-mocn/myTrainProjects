import path from 'path'

// 其实这种写法并不是很靠谱，设想你吧 server 部署在服务器的 /home/upload-file-server 目录下
// 那么这里解析出来的就是空目录了，会报错
export const UPLOAD_DIR = path.resolve(__dirname, '../../../', 'uploadFile')

// 创建临时文件夹用于临时存储 chunk
export const getChunkDir = (fileHash: string): string => path.resolve(UPLOAD_DIR, `chunkDir_${fileHash}`)

export const isValidString = (s: any) => typeof s === 'string' && s.length > 0