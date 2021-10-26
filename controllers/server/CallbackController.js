const axios = require('axios')
const { performance } = require('perf_hooks')
const Logger = require('../../repositories/Logger')

class _CallbackController {
    async queue(transaction, payment, uuid) {
        let execution_start = performance.now()
        let status_code = 503
        let response = null
        let request = {
            uuid,
            payment_ref: payment.reference,
            payment_datetime: payment.transaction_date,
            currency: payment.currency_code,
            amount: payment.paid_amount,
            trx_id: transaction.trx_id,
            customer_number: transaction.customer_number
        }
        let header = {
            secret: process.env.SECRET
        }
        const config = {
            method: 'post',
            url: transaction.callback_url,
            data: request,
            timeout: 5000,
            headers: header
        }
        try {
            let clientResponse = await axios(config)
            status_code = clientResponse.status
            response = Object.keys(clientResponse.data).length > 0 ? clientResponse.data : null
        } catch (e) {
            console.log(e)
        }
        let response_time = (performance.now() - execution_start) / 100
        let callbackLog = {
            uuid,
            trx_id: transaction.trx_id,
            url: `POST ${transaction.callback_url}`,
            header,
            request,
            response,
            response_time,
            status_code
        }
        Logger.saveCallbackLog(callbackLog)
    }
}

const CallbackController = new _CallbackController()
module.exports = CallbackController