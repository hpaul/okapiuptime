const Koa = require('koa')
const Router = require('koa-router')
const Logger = require('koa-logger')
const Cors = require('@koa/cors')
const BodyParser = require('koa-bodyparser')
const Helmet = require('koa-helmet')
const respond = require('koa-respond')
const serve = require('koa-static')

const errorHandler = require('koa-better-error-handler');
const koa404Handler = require('koa-404-handler');

const app = new Koa()
// override koa's undocumented error handler
// eslint-disable-next-line unicorn/prefer-add-event-listener
app.context.onerror = errorHandler;
// specify that this is our api
app.context.api = true;
// use koa-404-handler
app.use(koa404Handler);
const router = new Router()

app.use(Helmet())

if (process.env.NODE_ENV === 'development') {
  app.use(Logger())
}

app.use(Cors())
app.use(BodyParser({
  enableTypes: ['json'],
  jsonLimit: '5mb',
  strict: true,
  onerror: function (err, ctx) {
    ctx.throw('body parse error', 422)
  }
}))

app.use(respond())

app.use(serve('public', { gzip: true }))
// API routes
require('./routes')(router)
app.use(router.routes())
app.use(router.allowedMethods())

module.exports = app
