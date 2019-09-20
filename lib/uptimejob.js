const cron = require('node-cron')
const fetch = require('node-fetch')
const {Website,PingCheck} = require('./models')

// Run after 5 seconds of every minute
const cronExpression = process.env.CRON_EXP || '5 * * * * *'

const fetchOptions = {
    method: 'GET',
    headers: {
        'User-Agent': 'OkapiUptime 1.0'
    },
    timeout: process.env.REQUEST_TIMEOUT || 5000 // 5 seconds timeout
}

const buildUrl = (url) => `http://${url}`

console.log('SCHEDULER: Starting cron ...')
const uptimejob = cron.schedule(cronExpression, async () => {
    const websites = await Website.query()
    console.log(`SCHEDULER: Running job for ${websites.length} websites ... `)

    for (let id in websites) {
        const website = websites[id]
        const pingerData = {
            websiteId: website.id,
            timestamp: 1,
            responseTime: 0.1,
            response: '',
            status: '',
        }

        const startTime = new Date()
        try {
            const response = await fetch(buildUrl(website.url), {
                ...fetchOptions,
            })
            const responseData = await response.text()
            const endTime = new Date()
            pingerData.timestamp = endTime
            pingerData.responseTime = endTime - startTime
            pingerData.response = responseData
            pingerData.status = `${response.statusText}`
        } catch(error) {
            const endTime = new Date()
            pingerData.timestamp = endTime
            pingerData.responseTime = endTime - startTime
            pingerData.response = error.message
            pingerData.status = 'ERROR'
        }

        const pinger = await PingCheck.query().insert(pingerData)
    }

    console.log(`SCHEDULER: Done`)
})

module.exports = uptimejob
