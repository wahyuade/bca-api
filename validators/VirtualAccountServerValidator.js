const Validator = require("./Validator");

class _VirtualAccountServerValidator extends Validator {
    constructor() {
        super()
        this.CompanyCode = ['string:max=5', 'string:must_in=0123456789']
        this.CustomerNumber = ['string:must_in=0123456789']
        this.RequestID = ['trim']
        this.ChannelType = ['enum:6010,6011,6012,6013,6014,6015,6016,6017,6018']
        this.FlagAdvice = ['enum:Y,N']
        this.TransactionDate = ['string:max=19', 'string:must_in=0123456789 /:', 'local_datetime']
        this.PaidAmount = ['number']
        this.TotalAmount = ['number']
        this.Reference = ['string:max=15']
        this.SubCompany = ['string:max=5']
        this.CurrencyCode = ['string:max=3']
        this.CustomerName = ['string:max=30']
        this.AdditionalData = ['string:max=999']
    }

}

const VirtualAccountServerValidator = new _VirtualAccountServerValidator()
module.exports = VirtualAccountServerValidator