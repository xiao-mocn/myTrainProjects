import { UploadFile } from 'element-plus'
import { FilePiece } from '../type'
import { DEFAULT_CHUNK_MAX_COUNT, DEFAULT_CHUNK_SIZE } from '../const'

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
