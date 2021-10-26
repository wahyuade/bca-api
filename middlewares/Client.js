const uuid = require('uuid')

class _ClientMiddleware {
    async through(req, res, next) {
        req.uuid = uuid.v4()
        req.type = 'client'
        next()
    }
}

const ClientMiddleware = new _ClientMiddleware()
module.exports = ClientMiddleware