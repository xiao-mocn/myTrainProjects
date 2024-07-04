import { UploadFile } from 'element-plus'

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

// 注意变量命名风格保持统一
// uploadChunkControllerParams => UploadChunkControllerParams
export interface UploadChunkControllerParams {
  // 分片内容
  chunk: Blob;
  // 文件 hash 值
  hash: string;
  // 分片索引
  fileName: string;
}

// typo
// uploadChunkControllerReponse => UploadChunkControllerResponse
export type UploadChunkControllerReponse = Response<{
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

export interface FilePiece {
  chunk: Blob;
  size: number;
  hash: string
  pieceName: string
}

export interface RunTasksWithConcurrencyLimitParams {
  file: UploadFile;
  fileChunks: FilePiece[];
  fileHash: string;
  limit: number;
}