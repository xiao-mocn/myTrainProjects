// import Koa from 'koa'

import Koa from 'koa'
import koaBody from 'koa-body';
import Router from 'koa-router'
import { checkFileController } from './checkFile'
import { uploadFileController } from './uploadFile'
import { mergeChunkController } from './mergeChunk'

export const defaultRouter = (app: Koa) => {
  const router = new Router()

  router.get('/findFile', koaBody(), checkFileController)
  router.post('/upload', koaBody({ multipart: true }), uploadFileController)
  router.post('/merge', koaBody({ multipart: true }), mergeChunkController)

  app.use(router.routes()).use(router.allowedMethods())
}


