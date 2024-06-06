import { PackageInfo, GraphEdge, GraphOptions } from './type'

export enum HttpStatus {
  OK = 200,
  NO_FOUND = 404,
  PARAMS_ERRO = 400,
  INTERNAL_ERROR = 500,
}
export class HttpError extends Error {
  constructor(public code: HttpStatus, message: string) {
    super(message)
  }
}

export const doGraphParse = (dependencies: Record<string, PackageInfo>, dep: number) => {
  const graphOptions: GraphOptions = {
    nodes: [],
    edges: []
  }
  Object.keys(dependencies).forEach(key => {
    const value: PackageInfo  = dependencies[key]
    graphOptions.nodes.push({
      id: key,
      label: `${key}`,
      color: getRandomColor(),
      ...getRandomPosition()
    })
    if (value.dependencies && Object.keys(value.dependencies).length > 0) {
      parseDependencies(key, value.dependencies, dep, graphOptions.edges)
    }
  })
  return graphOptions
}

function  parseDependencies(parentId: string, dependencies: Record<string, PackageInfo | string>, dep: number, edges: GraphEdge[]) {
  let level = dep - 1
  if (level < 0) {
    return
  }
  Object.keys(dependencies).forEach(key => {
    const value: PackageInfo | string  = dependencies[key]
    edges.push({
      sourceID: parentId,
      targetID: key,
    })
    if (typeof value != 'string' && value.dependencies && Object.keys(value.dependencies).length > 0) {
      parseDependencies(key, value.dependencies, level, edges)
    }
  })
}

export const getRandomColor = () => {
  return '#' + Math.floor(Math.random() * 0xffffff).toString(16)
}

export const getRandomPosition = () => {
  return {
    x: Math.random() * 1000,
    y: Math.random() * 1000
  }
}