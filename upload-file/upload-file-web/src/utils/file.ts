import { UploadFile } from 'element-plus'
import { DEFAULT_CHUNK_MAX_COUNT, DEFAULT_CHUNK_SIZE } from '../const'
import ts from 'typescript';

export interface FilePiece {
  chunk: Blob;
  size: number;
  hash: string
  pieceName: string
}

export const splitFile = (file: UploadFile, hash: string) => {
  const fileChunks: FilePiece[] = []
  let cur = 0, index = 0;
  // 通过判断，限制分片数量最大值为100
  const split_count = Math.ceil(file.size!/ DEFAULT_CHUNK_SIZE )
  const real_chunk_size = split_count > DEFAULT_CHUNK_MAX_COUNT ? (file.size! / split_count) : DEFAULT_CHUNK_SIZE

  while (cur < file.size!) {
    const piece = file.raw!.slice(cur, cur + real_chunk_size)
    fileChunks.push({
      chunk: piece,
      size: piece.size,
      hash: hash,
      pieceName: `${ hash }_${ index + 1 }`
    })
    index++
    cur += real_chunk_size
  }

  return fileChunks
}

export function ConcurrentProcessor (params: any) {
  const { max, progressTasks } = params
  const maxTask = max | 5
  const pool: any[] = []
  let finish = 0
  const failList = []
  for (let i = 0; i < progressTasks.length; i++) {
    const task = progressTasks[i]
    task.then(() => {
      finish++
      const j = pool.findIndex(t => t === task);
      pool.splice(j);
    }).catch(() => {
      failList.push(task)
    })
    
  }
}
