class _Transaction {
    TRANSACTION_UNPAID = '0'
    TRANSACTION_PAID = '1'
    async create(pg, transaction) {
        const timestamp = new Date()
        const expired = new Date(timestamp.getTime() + (1000 * transaction.expired_in_second))
        if (await self.isExist(pg, transaction.trx_id)) {
            throw {
                trx_id: ['trx_id is already exist']
            }
        }
        await pg.connection.query(
            `INSERT INTO ${self.getTable()} (
                trx_id,
                customer_number,
                currency,
                customer_name,
                amount,
                callback_url,
                status,
                expired_in_second,
                expired,
                payment_ref,
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
                transaction.trx_id,
                transaction.customer_number,
                transaction.currency,
                transaction.customer_name,
                transaction.amount,
                transaction.callback_url,
                transaction.status,
                transaction.expired_in_second,
                expired,
                null,
                timestamp
            ]
        )
    }

    async find(pg, customer_number, transaction_date) {
        const { rows: transaction } = await pg.connection.query(
            `SELECT * FROM ${self.getTable()} WHERE customer_number = $1 AND created <= $2 AND expired >= $2 LIMIT 1 FOR UPDATE`, [
                customer_number,
                transaction_date
            ]
        )
        if (transaction.length == 1) {
            return transaction[0]
        }
    }

    async isExist(pg, trx_id) {
        const { rowCount } = await pg.connection.query(
            `SELECT trx_id FROM ${self.getTable()} WHERE trx_id = $1`, [trx_id]
        )
        return rowCount == 1
    }

    async flagPayment(pg, trx_id, payment_ref) {
        await pg.connection.query(
            `UPDATE ${self.getTable()} SET status = $1, payment_ref = $2, updated = $3 WHERE trx_id = $4`, [
                self.TRANSACTION_PAID,
                payment_ref,
                new Date(),
                trx_id
            ]
        )
    }

    getTable() {
        return "transaction"
    }
}

const Transaction = new _Transaction()
const self = Transaction
module.exports = Transaction