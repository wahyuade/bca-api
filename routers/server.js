const express = require('express')
const VirtualAccountController = require('../controllers/server/VirtualAccountController')
const ServerMiddleware = require('../middlewares/Server')

const server = express.Router()
server.use(ServerMiddleware.through)

server.post('/va/bills', VirtualAccountController.bills)
server.post('/va/payments', VirtualAccountController.payments)

module.exports = server