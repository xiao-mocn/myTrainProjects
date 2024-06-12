import RequestServer from "../utils/request"
import {
  BASE_URL,
  HTTP_TIMEOUT
} from "../const/index"
import {
  GetDepControllerParams,
  GetDepControllerResponse
} from '../utils/type'

const api = new RequestServer({
  baseURL: BASE_URL,
  timeout: HTTP_TIMEOUT
})

export async function getDependencies(params: GetDepControllerParams) {
  const res = await api.Post<GetDepControllerResponse>({
    url: 'api/getDependencies',
    data: params,
  })
  return res.data.data
}