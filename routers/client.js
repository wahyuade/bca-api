const express = require('express')
const VirtualAccountController = require('../controllers/client/VirtualAccountController')
const ClientMiddleware = require('../middlewares/Client')

const client = express.Router()
client.use(ClientMiddleware.through)

client.post('/virtual-account', VirtualAccountController.create)

module.exports = client