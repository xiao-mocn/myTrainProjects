export interface PackageInfo {
  version?: string;
  resolved?: string;
  integrity?: string;
  dev?: boolean;
  name?: string;
  requires?: Record<string, string>;
  dependencies?: Record<string, PackageInfo | string>;
}

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