import { AxiosRequestConfig, AxiosResponse } from "axios"

// 定义接口用于扩展AxiosResponse，增加自定义的数据类型
export interface HttpResponse<T = any> extends AxiosResponse {
  data: T;
}

// 定义请求配置接口，继承并扩展 AxiosRequestConfig
export interface HttpRequestConfig extends AxiosRequestConfig {
  // 可以根据需要添加自定义配置项
  // url: string,
  // data?: any,
  // headers?: {
  //   'content-type': string
  // },
}