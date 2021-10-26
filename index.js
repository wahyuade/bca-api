require('dotenv').config()
const express = require('express')
const Logger = require('./repositories/Logger')

const app = express()
const port = process.env.API_PORT || 8000
app.disable('x-powered-by')
app.use(Logger.watch)
app.use(require('cookie-parser')())
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf
    }
}))
// const bca = require('./libs/bca')
app.use('/client', require('./routers/client'))
app.use('/server', require('./routers/server'))
app.use(function (err, req, res, next) {
    console.log(req.originalUrl)
    res.status(500).json({status: false, message: "Internal server error"})
})
app.use(function (req, res, next) {
    res.status(404).json({status: false, message: "Sorry, We don't know the endpoint target"})
})

app.listen(port, () => {
    console.log(`API BCA Wrapper is running on port ${port}...`)
})