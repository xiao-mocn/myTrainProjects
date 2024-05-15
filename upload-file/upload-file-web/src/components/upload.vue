
<template>
  <div class="main-container">
    <div class="select-file">
      <el-upload
        ref="upload"
        class="upload-demo"
        :on-change="onFileChange"
        :on-exceed="handleExceed"
        :action="''"
        :limit="1"
        :auto-upload="false"
        :show-file-list="true"
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
import {ref} from 'vue'
import axios from 'axios';
import { getFileHashNum } from '../utils/hash'
import { FilePiece, splitFile } from '../utils/file'
import { ElMessage, UploadFile, UploadProps, genFileId, UploadInstance, UploadRawFile } from 'element-plus'
import { checkFile, uploadChunk, mergeFile } from '../api/uploadFile'

const upload = ref<UploadInstance>()
const file = ref<UploadFile | null>(null)
const hash = ref<string>('')
const fileChunks = ref<FilePiece[]>([])
const isShowProgress = ref(false)
const progressPercentage = ref(0)
const uploadLoadding = ref(false)
const CancelToken = axios.CancelToken;
let source = CancelToken.source();
const uploading = ref(true)
let uploadedChunks:string[] = []

const onFileChange: UploadProps['onChange']  = (uploadFile) => {
  console.log('uploadFile ===', uploadFile);
  progressPercentage.value = 0
  file.value = uploadFile
  uploadedChunks = []
}
const handleExceed: UploadProps['onExceed'] = (files) => {
  upload.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  upload.value!.handleStart(file)
}
const percentageFormat = () => {
  return `${progressPercentage.value}%`
}
const submitUpload = async () => {
  if (!file.value) {
    ElMessage.warning('请选择文件再进行上传')
    return
  }
  isShowProgress.value = true
  uploadLoadding.value = true
  const fileIsExists: any = await checkFile({ fileName: file.value.name })  
  if (fileIsExists.isExists) {
    progressPercentage.value = 100
    ElMessage.success('上传成功')
    uploadLoadding.value = false
    return
  }
  hash.value = await getFileHashNum(file.value)
  fileChunks.value = splitFile(file.value, hash.value)
  const totalChunks = fileChunks.value.length
  let failedChunks: FilePiece[] = []
  let progress = 0
  const pool = new Set()
  const uploadFileChunks = async (chunks: FilePiece[], max = 3 ) => {
    const size = max
    for (let i = 0; i < chunks.length; i++) {
      if (!uploading.value) {
        break;
      }
      const chunk = chunks[i];
      // 判断是否上传过
      if (uploadedChunks.includes(chunk.pieceName)) {
        progress++;
        progressPercentage.value = parseFloat((progress  * 100 / totalChunks).toFixed(2))
        continue
      }
      if (pool.size >= size) {
        await Promise.race(pool)
      }
      const task = uploadTask(chunk).then(async () => {
        // 收集上传成功的chunk
        uploadedChunks.push(chunk.pieceName)
        progress++;
        progressPercentage.value = parseFloat((progress  * 100 / totalChunks).toFixed(2))
        pool.delete(task)
        if (progress === totalChunks) {
          await mergeFile({ fileName: file.value!.name, hash: hash.value })
          ElMessage.success('上传成功') 
          uploadLoadding.value = false
        }
      }).catch((error) => {
        console.error(`Chunk upload failed for ${chunk.pieceName}:`, error);
        failedChunks.push(chunk);
      })
      pool.add(task)
    }
  }

  const uploadTask = async (chunk: FilePiece) => {
    const { isExists }: any  = await checkFile({ fileName: chunk.pieceName });
    if (!isExists) {
      console.log(source.token)
      return await uploadChunk({
        chunk: chunk.chunk,
        hash: hash.value,
        fileName: chunk.pieceName,
        cancelToken: source.token
      })
    }
    if (failedChunks.length > 0) {
      const chunks = failedChunks
      failedChunks = []
      await uploadFileChunks(chunks)
    }
  }
  await uploadFileChunks(fileChunks.value)
}

const handlePause = () => {
  uploading.value = !uploading.value
  if (!uploading.value) {
    source.cancel('终止上传！');
  } else {
    source = CancelToken.source();
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
