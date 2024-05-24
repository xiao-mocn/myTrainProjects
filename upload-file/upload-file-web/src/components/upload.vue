
<template>
  <div class="main-container">
    <div class="select-file">
      <el-upload
        ref="upload"
        class="upload-demo"
        multiple
        :on-change="onFileChange"
        :on-remove="handleRemove"
        :on-exceed="handleExceed"
        :action="''"
        :limit="3"
        :auto-upload="false"
        :show-file-list="true"
        :fileList="fileList"
      >
        <template #trigger>
          <el-button type="primary">请选择文件</el-button>
        </template>
        <el-button class="ml-3" type="success" @click="submitUpload" :loading="uploadLoadding"> 上传文件 </el-button>
        <el-button class="ml-3" type="success" @click="handlePause"> {{ uploading ? '暂停上传' : '继续上传'}} </el-button>
      </el-upload>
      
    </div>

    <el-progress
      class="upload-progress"
      :text-inside="true"
      :percentage="progressPercentage"
      :stroke-width="14"
      :format="percentageFormat"
    ></el-progress>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted} from 'vue'
import axios from 'axios';
import { getFileHashNum } from '../utils/hash'
import { FilePiece, splitFile } from '../utils/file'
import { ElMessage, UploadFile, UploadProps, UploadInstance } from 'element-plus'
import { checkFile, uploadChunk, mergeFile } from '../api/uploadFile'
import { openDB, getData, addData } from '../utils/indexDb'

const upload = ref<UploadInstance>()
const fileList = ref<UploadFile[]>([])
let fileHash: string = ('')
const progressPercentage = ref(0)
const uploadLoadding = ref(false)
const CancelToken = axios.CancelToken;
let source = CancelToken.source();
const uploading = ref(true)
let db: IDBDatabase = {} as IDBDatabase
onMounted(async () => {
  db = await openDB('uploadFile', 2)
});

const onFileChange: UploadProps['onChange']  = (uploadFile) => {
  console.log('uploadFile ===', uploadFile);
  progressPercentage.value = 0
  fileList.value.push(uploadFile)
}
const handleRemove = (file: UploadFile) => {
  fileList.value.splice(fileList.value.indexOf(file), 1)
  
}
const handleExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning('最多只能上传3个文件')
}
const percentageFormat = () => {
  return `${progressPercentage.value}%`
}
const submitUpload = async () => {
  if (!fileList.value.length) {
    ElMessage.warning('请选择文件再进行上传')
    return
  }
  uploadLoadding.value = true
  for (const file of fileList.value) {
    console.time('checkFile')
    const fileIsExists: any = await checkFile({ fileName: file.name })  
    if (fileIsExists.isExists) {
      progressPercentage.value = 100
      ElMessage.success(`${file.name} 上传成功`)
      uploadLoadding.value = false
      continue
    }
    console.timeEnd('checkFile')
    await uploadFile(file)
  }
  uploadLoadding.value = false
}
const uploadFile = async (file: UploadFile) => {
  progressPercentage.value = 0
  console.time('getFileHashNum')
  const hash = await getData(db, 'hash', file.name)
  if (hash) {
    fileHash = hash.value
  } else {
    fileHash = await getFileHashNum(file)
    await addData(db, 'hash', { name: file.name, value: fileHash })
  }
  console.timeEnd('getFileHashNum')
  console.time('storgeChunk')
  const storgeChunk = await getData(db, 'chunks', file.name)
  console.timeEnd('storgeChunk')
  let fileChunks: FilePiece[] = []
  if (storgeChunk) {
    fileChunks = storgeChunk.value
  } else {
    fileChunks = splitFile(file, fileHash)
    await addData(db, 'chunks', { name: file.name, value: fileChunks })
  }
  await runTasksWithConcurrencyLimit(file, fileChunks, 3)
}
const uploadTask = async (chunk: FilePiece) => {
  const fileIsExists: any  = await checkFile({ fileName: chunk.pieceName })
  if (!fileIsExists.isExists) {
    await uploadChunk({
      chunk: chunk.chunk,
      hash: fileHash,
      fileName: chunk.pieceName,
      cancelToken: source.token
    })
  }
}
const runTasksWithConcurrencyLimit = async (file: UploadFile, fileChunks: FilePiece[], limit: number = 3) => {
  let progress = 0
  const executing = new Set<Promise<any>>()
  for (const chunk of fileChunks) {
    // 当点击取消时，则暂停循环
    if (!uploading.value) {
      return
    }
    // 当达到并发限制时，等待其中一个任务完成
    if (executing.size >= limit) {
      await Promise.race(executing)
    }
    const task = uploadTask(chunk).then(() => {
      executing.delete(task)
      progress++
      progressPercentage.value = parseFloat((progress  * 100 / fileChunks.length).toFixed(2))
    })
    executing.add(task)
    
  }
  // 等待剩余的所有任务完成
  await Promise.all([...executing])
  if (progress === fileChunks.length) {
    await  mergeFile({ fileName: file!.name, hash: fileHash })
    ElMessage.success(`${file!.name} 上传成功`) 
  }
}

const handlePause = () => {
  uploading.value = !uploading.value
  if (!uploading.value) {
    source.cancel('终止上传！')
  } else {
    source = CancelToken.source()
    submitUpload()
  }
}

</script>

<style scoped>
.main-container {
  width: 540px;
  height: 300px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.input-file {
  height: 40px;
}
.select-file {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.upload-progress {
  width: 350px;
  margin: 30px;
}
.ml-3 {
  margin-left: 30px;
}
::v-deep(.el-upload-list--text) {
  min-width: 200px;
}
</style>
