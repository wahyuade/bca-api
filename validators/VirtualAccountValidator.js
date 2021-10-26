const Validator = require("./Validator")

class _VirtualAccountValidator extends Validator {
    constructor() {
        super()
        this.virtual_account = ['string:max=18', 'string:must_in=0123456789']
        this.company_code = ['number']
        this.expired = ['datetime']
    }

    model() {
        console.log('it work')
        return 'ok'
    }

    #test() {
    }
}

const VirtualAccountValidator = new _VirtualAccountValidator()

module.exports = VirtualAccountValidator