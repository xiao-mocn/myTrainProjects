// 引入spark-md5

import SparkMD5 from 'spark-md5'

const ctx: Worker = self as any
// 函数参数应该有类型
ctx.onmessage = (e) => {
  const { file } = e.data
  // 需要适当做一些防御性编程，例如判断 file 是否为空
  const fileReader = new FileReader()

  fileReader.onload = (e) => {
    // 这里一次性怼进去，总感觉：
    // 1. 性能会很差；
    // 2. 文件很大的时候会超出内存限制，报错；
    const hash = SparkMD5.ArrayBuffer.hash(e.target!.result as ArrayBuffer);
    self.postMessage(hash)
  }

  fileReader.onerror = (e) => {
    self.postMessage(e)
  }

  fileReader.readAsArrayBuffer(file)
}