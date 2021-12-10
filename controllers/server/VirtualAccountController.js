const Helper = require("../../libs/Helper")
const Postgresql = require("../../libs/postgresql")
const Payment = require("../../repositories/Payment")
const Transaction = require("../../repositories/Transaction")
const VirtualAccount = require("../../repositories/VirtualAccount")
const VirtualAccountServerValidator = require("../../validators/VirtualAccountServerValidator")
const Controller = require("../Controller")
const CallbackController = require("./CallbackController")


class _BaseResponse {
    CompanyCode = process.env.COMPANY_CODE_VA
    DetailBills = null
    FreeTexts = []

    constructor(request_id, customer_number) {
        this.RequestID = request_id
        this.CustomerNumber = customer_number
    }

    setError(indonesia, english) {
        this.setDefaultErrorValue()
        if (indonesia != undefined && english != undefined) {
            if (this instanceof _InquiryResponse) {
                this.InquiryReason = {
                    Indonesian: indonesia,
                    English: english
                }
            } else if (this instanceof _PaymentResponse) {
                this.PaymentFlagReason = {
                    Indonesian: indonesia,
                    English: english
                }
            }
        }
    }
    setDefaultErrorValue() {
        // this.Error = error
        if (this instanceof _InquiryResponse) {
            this.SubCompany = ""
            this.CustomerName = ""
            this.CurrencyCode = ""
            this.AdditionalData = ""
            this.TotalAmount = ""
        } else if (this instanceof _PaymentResponse) {
            this.CustomerName = ""
            this.CurrencyCode = ""
            this.PaidAmount = ""
            this.TotalAmount = ""
            this.TransactionDate = Helper.dateToStringLocalTime(new Date())
            this.AdditionalData = ""
        }
    }
}

class _InquiryResponse extends _BaseResponse {
    InquiryStatus = "01"
    InquiryReason = {
        Indonesian: "Terjadi kesalahan internal server",
        English: "Internal Server Error"
    }
    SubCompany = process.env.SUB_COMPANY_CODE_VA
    constructor(request_id, customer_number) {
        super(request_id, customer_number)
    }
    setTransaction(transaction) {
        this.CustomerName = transaction.customer_name
        this.CurrencyCode = transaction.currency
        this.AdditionalData = ""
        this.TotalAmount = transaction.amount
        this.InquiryStatus = "00"
        this.InquiryReason = {
            Indonesian: "Sukses",
            English: "Success"
        }
    }
}

class _PaymentResponse extends _BaseResponse {
    PaymentFlagStatus = "01"
    PaymentFlagReason = {
        Indonesian: "Terjadi kesalahan internal server",
        English: "Internal Server Error"
    }

    constructor(request_id, customer_number) {
        super(request_id, customer_number)
    }
    setPayment(payment) {
        this.PaymentFlagStatus = '00'
        this.PaymentFlagReason = {
            Indonesian: "Sukses",
            English: "Success"
        }
        this.CustomerName = payment.customer_name
        this.CurrencyCode = payment.currency_code
        this.PaidAmount = payment.paid_amount
        this.TotalAmount = payment.total_amount
        this.TransactionDate = Helper.dateToStringLocalTime(payment.transaction_date)
        this.AdditionalData = ""
    }
}

class _VirtualAccountController extends Controller {
    async bills(req, res) {
        const inquiryRequest = req.body
        const inquiryResponse = new _InquiryResponse(inquiryRequest.RequestID, inquiryRequest.CustomerNumber)
        const pg = new Postgresql()
        await pg.startTransaction()
        try {
            try {
                await VirtualAccountServerValidator.validate(
                    inquiryRequest,
                    [
                        'CompanyCode',
                        'CustomerNumber',
                        'RequestID',
                        'ChannelType',
                        'TransactionDate'
                    ]
                )
            } catch (e) {
                throw {
                    indonesia: "Permintaan tidak sesuai format",
                    english: "Request format does not correct"
                }
            }
            if (String(inquiryRequest.CompanyCode) !== String(inquiryResponse.CompanyCode)) {
                throw {
                    indonesia: "CompanyCode tidak sesuai",
                    english: "CompanyCode is not match"
                }
            }
            inquiryRequest.CustomerNumber = `${inquiryRequest.CompanyCode}${inquiryRequest.CustomerNumber}`
            if (!(await VirtualAccount.isActive(pg, inquiryRequest.CustomerNumber))) {
                throw {
                    indonesia: "Tagihan tidak ditemukan",
                    english: "Transaction does not exist"
                }
            }
            inquiryRequest.TransactionDate = Helper.stringLocalTimeToDate(inquiryRequest.TransactionDate)
            let transaction = await Transaction.find(
                pg,
                inquiryRequest.CustomerNumber,
                inquiryRequest.TransactionDate
            )
            if (transaction == null) {
                throw {
                    indonesia: "Tagihan tidak ditemukan",
                    english: "Transaction does not exist"
                }
            }
            inquiryResponse.setTransaction(transaction)
            await pg.commit()
            /**
             * Logging purpose
             */
            req.trx_id = transaction.trx_id
        } catch(e) {
            console.log(e)
            inquiryResponse.setError(e.indonesia, e.english)
            await pg.rollback()
        }
        res.json(inquiryResponse)
    }
    async payments(req, res) {
        const paymentRequest = req.body
        const paymentResponse = new _PaymentResponse(paymentRequest.RequestID, paymentRequest.CustomerNumber)
        const pg = new Postgresql()
        await pg.startTransaction()
        try {
            try {
                await VirtualAccountServerValidator.validate(
                    paymentRequest,
                    [
                        'CompanyCode',
                        'SubCompany',
                        'CustomerNumber',
                        'RequestID',
                        'ChannelType',
                        'CustomerName',
                        'CurrencyCode',
                        'PaidAmount',
                        'TotalAmount',
                        'TransactionDate',
                        'FlagAdvice',
                        'Reference',
                    ]
                )
            } catch (e) {
                throw {
                    indonesia: "Permintaan tidak sesuai format",
                    english: "Request format does not correct"
                }
            }
            if (String(paymentRequest.CompanyCode) !== String(paymentResponse.CompanyCode)) {
                throw {
                    indonesia: "CompanyCode tidak sesuai",
                    english: "CompanyCode is not match"
                }
            }
            paymentRequest.TransactionDate = Helper.stringLocalTimeToDate(
                paymentRequest.TransactionDate
            )
            paymentRequest.CustomerNumber = `${paymentRequest.CompanyCode}${paymentRequest.CustomerNumber}`
            let transaction = await Transaction.find(
                pg,
                paymentRequest.CustomerNumber,
                paymentRequest.TransactionDate
            )
            if (transaction == null) {
                throw {
                    indonesia: "Tagihan tidak ditemukan",
                    english: "Transaction does not exist"
                }
            }
            let payment = await Payment.create(pg, paymentRequest)
            if (payment == null) {
                throw {
                    indonesia: "Gagal menerima pembayaran",
                    english: "Failed to receive the payment"
                }
            }
            if (transaction.amount != payment.total_amount) {
                throw {
                    indonesia: "Nominal pembayaran tidak sesuai",
                    english: "Amount does not match with the billing"
                }
            }
            if (transaction.status == Transaction.TRANSACTION_PAID) {
                throw {
                    indonesia: "Tagihan sudah lunas",
                    english: "Transaction already paid"
                }
            }
            if (transaction.status == Transaction.TRANSACTION_UNPAID) {
                await Transaction.flagPayment(pg, transaction.trx_id, payment.reference)
                await VirtualAccount.deactive(pg, paymentRequest.CustomerNumber)
                CallbackController.queue(transaction, payment, req.uuid)
            }
            paymentResponse.setPayment(payment)
            await pg.commit()
        } catch(e) {
            console.log(e)
            paymentResponse.setError(e.indonesia, e.english)
            await pg.rollback()
        }
        res.json(paymentResponse)
    }
}
const VirtualAccountController = new _VirtualAccountController()
module.exports = VirtualAccountController