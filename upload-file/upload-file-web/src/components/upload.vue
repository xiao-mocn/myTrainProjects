
<template>
  <div class="main-container">
    <div class="select-file">
      <el-upload
        class="upload-demo"
        :on-change="onFileChange"
        :action="''"
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
      :percentage="0"
    ></el-progress>
  </div>
</template>


<script setup lang="ts">
import {ref} from 'vue'
import { getFileHashNum } from '../utils/hash'
import { FilePiece, splitFile } from '../utils/file'
import { ElMessage, UploadFile, UploadProps } from 'element-plus'
import { checkFile, uploadChunk } from '../api/uploadFile'

const file = ref<UploadFile | null>(null)
const hash = ref<string>('')
const fileChunks = ref<FilePiece[]>([])

const onFileChange: UploadProps['onChange']  = (uploadFile) => {
  console.log('uploadFile ===', uploadFile);
  file.value = uploadFile
}
const submitUpload = async () => {
  if (!file.value) {
    ElMessage.warning('请选择文件再进行上传')
    return
  }
  hash.value = await getFileHashNum(file.value)
  console.log('hash ===', hash);
  fileChunks.value = splitFile(file.value, hash.value)
  console.log('fileChunks ===', fileChunks);
  const data = await checkFile({ fileName: fileChunks.value[0].pieceName, hash: hash.value})
  console.log('data ===', data)
  for(let i = 0; i < fileChunks.value.length; i++) {
    const piece = fileChunks.value[i]
    await uploadChunk({
      chunk: piece.chunk,
      hash: hash.value,
      fileName: file.value.name
    })
  }
  
}


// // 获取文件的哈希值
// const getFileHash = () => {

// }

// 验证文件是否已经上传，获取服务器已经上传的相关切片
// const 


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
  margin: 30px;
}
.ml-3 {
  margin-left: 30px;
}
::v-deep(.el-upload-list--text) {
  min-width: 200px;
}
</style>
