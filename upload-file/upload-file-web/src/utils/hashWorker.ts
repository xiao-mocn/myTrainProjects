// 引入spark-md5
import SparkMD5 from 'spark-md5'

// 函数参数应该有类型
interface MessageData {
  file: File;
}
const ctx: Worker = self as any
// 函数参数应该有类型
ctx.onmessage = (e : MessageEvent<MessageData>) => {
  const { file } = e.data
  // 需要适当做一些防御性编程，例如判断 file 是否为空
  // 判断文件是否存在，如不存在则抛出错误
  if (!file) {
    throw new Error('file is empty')
  }

  // 通过设置chunkSize来设置每次读取文件的大小
  const chunkSize = 10 * 1024 * 1024 // 10MB
  const chunkSizeNum = Math.ceil(file.size / chunkSize)
  const spark = new SparkMD5.ArrayBuffer()
  const fileReader = new FileReader()
  let currentChunk = 0
  fileReader.onload = (e) => {
    if (e.target?.result) {
      spark.append(e.target?.result as ArrayBuffer)
      currentChunk++
      if (currentChunk < chunkSizeNum) {
        loadChunk()
      } else {
        const hash = spark.end()
        self.postMessage(hash)
      }
    }
  }
  loadChunk()
  fileReader.onerror = (e) => {
    self.postMessage(e)
  }
  function loadChunk() {
    const start = currentChunk * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    fileReader.readAsArrayBuffer(file.slice(start, end));
  }
}

