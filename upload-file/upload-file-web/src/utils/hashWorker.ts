// 引入spark-md5

import SparkMD5 from 'spark-md5'

const ctx: Worker = self as any
ctx.onmessage = (e) => {
  const { file } = e.data
  const fileReader = new FileReader()

  fileReader.onload = (e) => {
    const hash = SparkMD5.ArrayBuffer.hash(e.target!.result as ArrayBuffer);
    self.postMessage(hash)
  }

  fileReader.onerror = (e) => {
    self.postMessage(e)
  }

  fileReader.readAsArrayBuffer(file)
}