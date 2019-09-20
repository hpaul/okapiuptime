require('dotenv').config();
const server = require('./server')
const uptimejob = require('./lib/uptimejob')
const mailerjob = require('./lib/mailerjob')
uptimejob.start()
mailerjob.start()

const port = process.env.PORT || 3000
server.listen(port, '0.0.0.0', () => console.log(`API server started on ${port}`))
