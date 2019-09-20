const cron = require('node-cron')
const nodemailer = require('nodemailer');
const {Website,PingCheck} = require('./models')

// Run after 5 seconds of every minute
const cronExpression = process.env.CRON_EXP || '5 * * * * *'

const transporter = async () => {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    // let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let trans = nodemailer.createTransport({
        sendmail: true,
        newline: 'unix',
        path: '/usr/sbin/sendmail'
    });

    return trans;
}


console.log('MAILER: Starting cron ...')
const uptimejob = cron.schedule(cronExpression, async () => {
    const trans = await transporter()
    const websites = await Website.query()
            .eagerAlgorithm(Website.NaiveEagerAlgorithm)
            .eager(`[pingChecks(latestThree)]`)

    for (let id in websites) {
        const checks = websites[id].pingChecks
            .map(item => item.status)
            .filter(item => item === 'OK')
        // If last three uptime checks are not ok send email to subscriber
        if (checks.length === 0) {
            console.log(`MAILER: Webiste ${websites[id].url} down, sending mails ...`)
            let info = await trans.sendMail({
                from: '"OkapiUptime 🚨" <uptime@okapistudio.com>',
                to: websites[id].emails.join(', '),
                subject: `❗❗❗Check what happens with ${websites[id].url}`,
                text: `Last three access of ${websites[id].url} did not look good, check the website.`,
            })
        }
    }
})


module.exports = uptimejob
