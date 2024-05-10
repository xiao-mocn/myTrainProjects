import { Context } from "koa"
import { HttpError } from '../utils/httpError'

// 封装项目错误处理的中间件 
export const errorCatch = () => {
  // 这里使用闭包，闭包允许错误处理逻辑被封装在一个独立的函数中，这样可以在不干扰主逻辑的情况下
  // 专注于错误处理。这种封装不仅使得代码更加模块化，而且也便于管理和维护错误处理逻辑
  return async (ctx: Context, next: () => Promise<void>) => {
    try {
      // 监控执行下一个中间件
      await next()
    } catch (e) {
      const err = e as Error
      const code = e instanceof HttpError ? e.code : 500
      const message = `Error caught in errorCatcher: ${ err.message || err }`
      ctx.body = {
        code,
        message
      }
      // 可以打印出来详细的错误
      console.error('Error caught in errorCatcher: ', err)
    }
  }
  
}