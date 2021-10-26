const Validator = require("./Validator")

class _TransactionValidator extends Validator {
    constructor() {
        super()
        this.trx_id = ['string:max=255']
        this.customer_number = ['string:max=18', 'string:must_in=0123456789']
        this.currency = ['uppercase', 'enum:IDR']
        this.customer_name = ['string:max=30']
        this.amount = ['number']
        this.callback_url = ['string:max=999']
        this.status = ['enum:0,1']
        this.expired_in_second = ['number']
        this.payment_ref = []
    }
}

const TransactionValidator = new _TransactionValidator()
module.exports = TransactionValidator