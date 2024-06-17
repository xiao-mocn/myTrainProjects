// 代码文件应该都放在某个 package 目录下
// 这个 type.ts 不应该脱离 package 控制
export interface Response<T> {
  code: number;
  data: T;
  message?: string;
}

export interface FindFileControllerParams {
  // 文件名
  fileName: string
}

export type FindFileControllerResponse = Response<{
  isExists: boolean
}>;


export interface uploadChunkControllerParams {
  // 分片内容
  chunk: Blob;
  // 文件 hash 值
  hash: string;
  // 分片索引
  fileName: string;
}

export type uploadChunkControllerReponse = Response<{
  index: number;
  hash: string;
}>;


export interface mergeFileControllerParams {
  fileName: string;
  hash: string;
}

export type mergeFileControllerReponse = Response<{
  fileName: string;
  path: string;
}>;