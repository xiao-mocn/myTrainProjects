
<template>
  <div class="main-container">
    <input class="input-file" type="file" @change="onFileChange">
    <button @click="uploadFile">Upload</button>
  </div>
</template>


<script setup lang="ts">
import {ref} from 'vue'
import axios from 'axios'

const file = ref<File | null>(null)
const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  file.value = target.files ? target.files[0] : null
}
const uploadFile = async () => {
  if (file.value) {
    const formData = new FormData();
    formData.append('file', file.value);
    try {
      const response = await axios.post('api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(response.data);
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  } else {
    alert('Please select a file first.');
  }
}

</script>

<style scoped>
.read-the-docs {
  color: #888;
}
.main-container {
  width: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.input-file {
  height: 40px;
}
</style>
