module.exports = (router) => {
    router.prefix('api')
    router.use('/websites', require('./websites'))
}
