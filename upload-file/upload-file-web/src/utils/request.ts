/**
 * 对axios的封装
 */

import axios, { AxiosInstance } from "axios"
import { HttpRequestConfig, HttpResponse } from "./type"

class RequestServer {
  instance: AxiosInstance
  constructor(config: HttpRequestConfig) {
    this.instance = axios.create(config)
    // 针对每个实例请求都做拦截
    this.instance.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    )

    this.instance.interceptors.response.use(
      (res) => {
        return res.data
      },
      (err) => {
        return err
      }
    )
  }
  // 定义方法
  Get<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.instance.get(url, config)
  }
  Post<T>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.instance.post(url, data, config)
  }
}

export default RequestServer

