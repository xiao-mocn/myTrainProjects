
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
        <el-button class="ml-3" type="success" @click="submitUpload"> 上传文件 </el-button>
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
import { getFileHashNum } from '../utils/hash'
import { FilePiece, splitFile } from '../utils/file'
import { ElMessage, UploadFile, UploadProps, genFileId, UploadInstance } from 'element-plus'
import { checkFile, uploadChunk, mergeFile } from '../api/uploadFile'

const upload = ref<UploadInstance>()
const file = ref<UploadFile | null>(null)
const hash = ref<string>('')
const fileChunks = ref<FilePiece[]>([])
const isShowProgress = ref(false)
const progressPercentage = ref(0)

const onFileChange: UploadProps['onChange']  = (uploadFile) => {
  console.log('uploadFile ===', uploadFile);
  progressPercentage.value = 0
  file.value = uploadFile
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
  isShowProgress.value = true
  // const failedChunks = []
  // let progress = 0
  
  
  if (!file.value) {
    ElMessage.warning('请选择文件再进行上传')
    return
  }
  const fileIsExists: any = await checkFile({ fileName: file.value.name })  
  if (fileIsExists.isExists) {
    progressPercentage.value = 100
    ElMessage.success('上传成功')
    return
  }
  hash.value = await getFileHashNum(file.value)
  fileChunks.value = splitFile(file.value, hash.value)
  // const totalChunks = fileChunks.value.length
  for(let i = 0; i < fileChunks.value.length; i++) {
    const piece = fileChunks.value[i]
    const { isExists }: any = await checkFile({ fileName: piece.pieceName })
    if (!isExists) {
      await uploadChunk({
        chunk: piece.chunk,
        hash: hash.value,
        fileName: piece.pieceName
      })
    }
    progressPercentage.value = parseFloat(((i + 1) / fileChunks.value.length).toFixed(2)) * 100
    if (i === fileChunks.value.length - 1) {
      // 都上传完成，可以merge文件了
      await mergeFile({ fileName: file.value.name, hash: hash.value })
      ElMessage.success('上传成功') 
    }
  }
  
  // const uploadChunkWithQueue = async (chunks: any[], max = 3 ) => {
  //   const size = max
  //   const pool = []
  //   for (let i = 0; i < chunks.length; i++) {
  //     const chunk = chunks[i];
  //     pool.push(uploadTask(chunk))
  //     if (pool.length === size) {
  //       await Promise.race(pool)
  //     }
  //   }
  // }

  // const uploadTask = async (params: any) => {
  //   try {
  //     const { isExists }: any  = await checkFile({ fileName: params.piece.pieceName });
  //     if (!isExists) {
  //       return await uploadChunk({
  //         chunk: params.piece.chunk,
  //         hash: hash.value,
  //         fileName: params.piece.pieceName
  //       })
  //     }
  //   } catch (error) {
  //     console.error(`Chunk upload failed for ${params.piece.pieceName}:`, error);
  //     failedChunks.push(params);
  //   } finally {
  //     progress++;
  //     progressPercentage.value = parseFloat((progress / totalChunks).toFixed(2)) * 100;
  //   }
  // }
  // uploadChunkWithQueue(fileChunks.value)
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
  width: 300px;
  margin: 30px;
}
.ml-3 {
  margin-left: 30px;
}
::v-deep(.el-upload-list--text) {
  min-width: 200px;
}
</style>
