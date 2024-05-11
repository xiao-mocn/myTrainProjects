import RequestServer from "../utils/request"
import { BASE_URL, HTTP_TIMEOUT } from "../const"

const uploadApi = new RequestServer({
  baseURL: BASE_URL,
  timeout: HTTP_TIMEOUT
})

export function checkFile() {
  return uploadApi.Get('')
}

export function uploadChunk() {

}

export function mergeFile() {

}