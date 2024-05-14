import RequestServer from "../utils/request"
import {
  BASE_URL,
  HTTP_TIMEOUT,
  API_FIND_FILE,
  API_UPLOAD_CHUNK,
  API_MERGE_FILE
} from "../const"
import {
  FindFileControllerParams,
  FindFileControllerResponse,
  uploadChunkControllerParams,
  uploadChunkControllerReponse,
  mergeFileControllerParams,
  mergeFileControllerReponse
} from '../../../type'

const uploadApi = new RequestServer({
  baseURL: BASE_URL,
  timeout: HTTP_TIMEOUT
})

export async function checkFile(params: FindFileControllerParams) {
  const res = await uploadApi.Get<FindFileControllerResponse>({
    url: `${ API_FIND_FILE }?fileName=${ params.fileName }`
  });
  return res.data;
}

export async function uploadChunk(params: uploadChunkControllerParams ) {
  const { chunk, hash, fileName } = params;
  const formData = new FormData();
  formData.append('hash', hash);
  formData.append('chunk', chunk);
  formData.append('fileName', fileName);
  
  const res = await uploadApi.Post<uploadChunkControllerReponse>({
    url: API_UPLOAD_CHUNK,
    data: formData,
    headers: {
      'content-type': 'multipart/form-data'
    }
  })
  return res.data
}
export async function mergeFile(params: mergeFileControllerParams ) {
  const res = await uploadApi.Post<mergeFileControllerReponse>({
    url: API_MERGE_FILE,
    data: params,
  })
  return res.data
}