import Koa from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-body';
import { analysisDependencies } from './analysisDependencies';

export const defaultRoute = (app: Koa) => {
  const router = new Router()
  router.post('/getDependencies', koaBody(), analysisDependencies)
  app.use(router.routes()).use(router.allowedMethods())
};
