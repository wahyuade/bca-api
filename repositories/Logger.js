const { performance } = require('perf_hooks')
const Postgresql = require('../libs/postgresql')

class _Logger {
    watch(req, res, next) {
        const defaultWrite = res.write
        const defaultEnd = res.end

        let chunks = []
        let body = ''
        req.executionStart = performance.now()
        res.write = (...restArgs) => {
            defaultWrite.apply(res, restArgs)
            chunks.push(new Buffer.from(restArgs[0]))
        };

        res.end = (...restArgs) => {
            defaultEnd.apply(res, restArgs)
            if (restArgs[0]) {
                chunks.push(new Buffer.from(restArgs[0]))
            }
            body = Buffer.concat(chunks).toString('utf8')
        };
        
        res.on('finish', () => {
            let cookie = JSON.parse(JSON.stringify(req.cookies))
            let isCookieExist = Object.keys(cookie).length > 0
            cookie = isCookieExist ? cookie : undefined
            let logger = {
                uuid: req.uuid,
                trx_id: req.trx_id,
                ip: req.headers['x-real-ip'],
                cookie,
                header: req.headers,
                url: `${req.method} ${req.originalUrl}`,
                request: "",
                response: JSON.parse(body),
                timestamp: new Date(),
                response_time: (performance.now() - req.executionStart) / 1000,
                status_code: res.statusCode,
                type: req.type
            }
            if (req.rawBody) {
                logger.request = JSON.parse(req.rawBody.toString())
            }
            Logger.saveLog(logger)
        })

        next()
    }
    async saveLog(logger) {
        const pg = new Postgresql()
        let table = ''
        switch (logger.type) {
            case 'client':
                table = 'client_log'
                break
            case 'server':
                table = 'server_log'
                break
            }
            await pg.connection.query(
                `INSERT INTO ${table} (
                    uuid,
                    trx_id,
                    ip,
                    url,
                    header,
                    cookie,
                    request,
                    response,
                    response_time,
                    status_code,
                    created,
                    updated
                ) VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8,
                    $9,
                    $10,
                    $11, 
                    $11 
                )`, [
                    logger.uuid,
                    logger.trx_id,
                    logger.ip,
                    logger.url,
                    logger.header,
                    logger.cookie,
                    logger.request,
                    logger.response,
                    logger.response_time,
                    logger.status_code,
                    logger.timestamp
                ]
            )
    }
    async saveCallbackLog(callbackLog) {
        const pg = new Postgresql()
        const timestamp = new Date()
        await pg.connection.query(
            `INSERT INTO "callback_log" (
                uuid,
                trx_id,
                url,
                header,
                request,
                response,
                response_time,
                status_code,
                created,
                updated
            ) VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $9
            )`, [
                callbackLog.uuid,
                callbackLog.trx_id,
                callbackLog.url,
                callbackLog.header,
                callbackLog.request,
                callbackLog.response,
                callbackLog.response_time,
                callbackLog.status_code,
                timestamp
            ]
        )
    }
}

const Logger = new _Logger()
module.exports = Logger