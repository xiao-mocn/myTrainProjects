import Worker from './hashWorker.ts?worker';

import { UploadFile } from 'element-plus';

export const getFileHashNum = (file: UploadFile):Promise<string> => {
  return new Promise(resolve => {
    const worker = new Worker();
    worker.postMessage({ file: file.raw })
    worker.onmessage = (e) => {
      const hash = e.data;
      resolve(hash)
    }
  })
}