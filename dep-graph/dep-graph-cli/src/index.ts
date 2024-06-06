import Koa from 'koa'
import { errorCatch } from './utils/errorCatch'
import { defaultRoute } from './controller'

const app = new Koa()
app.use(errorCatch())
defaultRoute(app)

app.listen(3000, ()=> {
  console.log('server is running on port 3000')
})