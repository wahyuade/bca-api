const Postgresql = require("./../../libs/postgresql")
const VirtualAccount = require("../../repositories/VirtualAccount")
const TransactionValidator = require("../../validators/TransactionValidator")
const Controller = require("../Controller")
const Transaction = require("../../repositories/Transaction")

class _VirtualAccountController extends Controller {
    async create(req, res) {
        let response = {}
        const pg = new Postgresql()
        await pg.startTransaction()

        try {
            let transaction = await TransactionValidator.validate(
                req.body,
                [
                    'trx_id',
                    'customer_name',
                    'currency',
                    'amount',
                    'callback_url',
                    'expired_in_second'
                ]
            )
            if (transaction.customer_number == undefined) {
                transaction.customer_number = await VirtualAccount.generate(pg, transaction.expired_in_second)
            } else {
                await VirtualAccount.create(pg, transaction.customer_number, transaction.expired_in_second)
            }
            transaction.status = Transaction.TRANSACTION_UNPAID
            transaction.uuid = req.uuid
            await Transaction.create(pg, transaction)
            response = self.response(transaction)
            await pg.commit()
        } catch (e) {
            console.log(e)
            response = self.response(e, false, 'Failed')
            await pg.rollback()
        }
        res.json(response)
    }
}

const VirtualAccountController = new _VirtualAccountController()
const self = VirtualAccountController

module.exports = VirtualAccountController
