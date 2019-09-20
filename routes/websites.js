const Router = require('koa-router')
const boom = require ('koa-boom')
const router = new Router()
const {Website} = require('../lib/models')

router.get('/', async (ctx) => {
    try {
        const websites = await Website.query()
            .eagerAlgorithm(Website.NaiveEagerAlgorithm)
            .eager(`[pingChecks(latestThree) as lastCheck]`)

        ctx.body = websites;
    } catch(error) {
        console.error(error)
        ctx.throw(error)
    }
})

router.post('/', async (ctx) => {
    try {
        // Data shoud contain name url and emails with coma separated
        const data = ctx.request.body

        if (!data) ctx.throw(422);

        const insertWebsite = await Website.query().insert({
            ...data,
            emails: data.emails ? data.emails.split(',') : []
        })

        ctx.body = insertWebsite
    } catch(error) {
        console.error(error)
        ctx.throw(error)
    }
})

router.put('/:id', async (ctx) => {
    try {
        const data = ctx.request.body
        if (!data.emails) ctx.throw(422)

        const updated = await Website.query()
            .findById(ctx.params.id)
            .patch({
                emails: data.emails.split(',')
            })

        ctx.body = updated
    } catch(error) {
        console.error(error)
        ctx.throw(error)
    }
})

router.delete('/:id', async (ctx) => {
    try {
        const deleted = await Website.query()
            .findById(ctx.params.id)
            .delete()

        ctx.body = {
            status: 'ok'
        }
    } catch(error) {
        console.error(error)
        ctx.throw(error)
    }
})


module.exports = router.routes()
