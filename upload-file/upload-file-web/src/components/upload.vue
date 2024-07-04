
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
        <el-button class="ml-3" type="success" @click="submitUpload" :loading="uploading"> 上传文件 </el-button>
        <el-button class="ml-3" type="success" @click="handlePause"> {{ uploading ? '继续上传' : '暂停上传'}} </el-button>
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
import { splitFile } from '../utils/file'
import { ElMessage, UploadFile, UploadProps, UploadInstance } from 'element-plus'
import { FilePiece, RunTasksWithConcurrencyLimitParams} from '../type'
import { checkFile, uploadChunk, mergeFile } from '../api/uploadFile'
import { openDB, getData, addData, deleteRecord } from '../utils/indexDb'

const upload = ref<UploadInstance>()
const fileList = ref<UploadFile[]>([])
const progressPercentage = ref(0)
const CancelToken = axios.CancelToken;
const uploading = ref(false)
let source = CancelToken.source();
let db: IDBDatabase
onMounted(async () => {
  db = await getDbInstance()
});

async function getDbInstance() {
  if (!db) {
    db = await openDB('uploadFile', 2);
  }
  return db;
}

const onFileChange: UploadProps['onChange']  = (uploadFile) => {
  console.log('uploadFile ===', uploadFile);
  progressPercentage.value = 0
  fileList.value.push(uploadFile)
}
const handleRemove = (file: UploadFile) => {
  const index = fileList.value.indexOf(file)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }
}
const handleExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning('最多只能上传3个文件')
}
const percentageFormat = () => {
  return `${progressPercentage.value.toFixed(2)}%`
}
const submitUpload = async () => {
  if (!fileList.value.length) {
    ElMessage.warning('请选择文件再进行上传')
    return
  }
  uploading.value = true
  for (const file of fileList.value) {
    await uploadFile(file)
  }
  uploading.value = false
}
const uploadFile = async (file: UploadFile) => {
  // 将fileHash移入函数内，避免竞态冲突
  let fileHash: string = ('')
  progressPercentage.value = 0
  console.time('getFileHashNum')
  const hash = await getData(db, 'hash', file.name)
  if (hash) {
    fileHash = hash.value
  } else {
    fileHash = await getFileHashNum(file)
    await addData(db, 'hash', { name: file.name, value: fileHash })
  }
  const fileIsExists: any = await checkFile({ fileName: `${fileHash}_${file.name}` })  
  if (fileIsExists.isExists) {
    progressPercentage.value = 100
    ElMessage.success(`${file.name} 上传成功`)
    return
  }
  console.timeEnd('getFileHashNum')
  console.time('storageChunk')
  // storageChunk => storageChunk
  const storageChunk = await getData(db, 'chunks', file.name)
  console.timeEnd('storageChunk')
  let fileChunks: FilePiece[] = []
  if (storageChunk) {
    fileChunks = storageChunk.value
  } else {
    fileChunks = splitFile(file, fileHash)
    // 存入indexdb，便于后续不需要重新切片，可以直接获取并直接上传
    await addData(db, 'chunks', { name: file.name, value: fileChunks })
  }
  await runTasksWithConcurrencyLimit({file, fileHash, fileChunks, limit: 3})
}
const uploadTask = async (chunk: FilePiece, fileHash: string) => {
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

// 这个函数应该抽出去？
const runTasksWithConcurrencyLimit = async (params: RunTasksWithConcurrencyLimitParams) => {
  const { file, fileChunks, fileHash, limit } = params
  let progress = 0
  // 这个实现倒是挺精妙的，还不错
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
    const task = uploadTask(chunk, fileHash).then(() => {
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
    // 再上传成功之后移除indexdb中的数据
    deleteRecord(db, 'hash', file!.name)
    deleteRecord(db, 'chunks', file!.name)
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
