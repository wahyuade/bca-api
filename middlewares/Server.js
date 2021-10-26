const uuid = require('uuid')
const axios = require('axios')

class _UnauthorizedResponse {
    Error = "Please authorize with correct OAuth client"
}

class _ServerMiddleware {
    async through(req, res, next) {
        req.uuid = uuid.v4()
        req.type = 'server'

        const isAuthorizationHeaderExist = Object.keys(req.headers).includes('authorization')
        if (!isAuthorizationHeaderExist) {
            res.status(403)
            res.json(new _UnauthorizedResponse())
            return
        }

        const authorization = req.headers.authorization

        try {
            await axios({
                method: 'GET',
                url: process.env.OAUTH_SERVER_TOKEN_VALIDATION,
                headers: {
                    authorization
                }
            })
            next()
        } catch (e) {
            res.status(403)
            res.json(new _UnauthorizedResponse())
        }
    }
}

const ServerMiddleware = new _ServerMiddleware()
module.exports = ServerMiddleware