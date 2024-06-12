import { Context } from 'koa'
import { HttpError } from './index'

export const errorCatch = () => {
  return async (ctx: Context, next: () => Promise<void>) => {
    try {
      // 监控执行下一个中间件
      await next()
    } catch (e: any) {
      const err = e as Error
      const code = e instanceof HttpError ? e.code : 500
      const message = `Error caught in errorCatcher: ${ err.message || err }`
      ctx.body = {
        code,
        message
      }
    }
  }
}