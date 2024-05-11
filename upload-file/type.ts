export interface Response<T> {
  code: number;
  data: T;
  message?: string;
}

export interface FindFileControllerParams {
  // 文件名
  fileName: string,
  hash: string
}

export type FindFileControllerResponse = Response<{ isExists: boolean, fileList: string[] }>;


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