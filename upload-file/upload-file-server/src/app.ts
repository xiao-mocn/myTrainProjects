import Koa from "koa";
import koaBody from 'koa-body';
import { PORT, MAX_FILE_SIZE } from './const/index'
import { defaultRouter } from './controller/index'
import { errorCatch } from './middleware/errorCatch'

const app = new Koa();
// 使用错误处理中间件
// 需要注意的点：将这个错误处理中间件添加Koa应用中，并确保它是第一个被注册的中间件，这样它就可以捕获后续中间件中抛出的任何错误。
app.use(errorCatch())
defaultRouter(app)

app.listen(PORT, () => {
  console.log(`启动的服务的端口是http://localhost:${PORT}`)
});