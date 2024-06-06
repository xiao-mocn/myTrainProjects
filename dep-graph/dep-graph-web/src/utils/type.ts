import { AxiosRequestConfig, AxiosResponse } from "axios"

// 定义接口用于扩展AxiosResponse，增加自定义的数据类型
export interface HttpResponse<T = any> extends AxiosResponse {
  data: T;
}

// 定义请求配置接口，继承并扩展 AxiosRequestConfig
export interface HttpRequestConfig extends AxiosRequestConfig {
  // 可以根据需要添加自定义配置项
}

export interface Response<T> {
  code: number;
  data: T;
  message?: string;
}

export interface GetDepControllerParams {
  // 文件名
  filePath: string,
  dep?: number
}

export type GetDepControllerResponse = Response<{
  graphOption: GraphOptions
}>;

export interface GraphNode {
  color?: string;
  id: string;
  label: string;
  size?: number;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  sourceID: string;
  targetID: string;
  size?: number;
}

export interface GraphOptions {
  edges: GraphEdge[];
  nodes: GraphNode[];
}