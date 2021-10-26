class _Payment {
    async create(pg, payment) {
        const timestamp = new Date()
        try {
            var { rows: payment } = await pg.connection.query(
                `INSERT INTO ${self.getTable()} (
                    reference,
                    company_code,
                    customer_number,
                    request_id,
                    channel_type,
                    customer_name,
                    currency_code,
                    paid_amount,
                    total_amount,
                    sub_company,
                    transaction_date,
                    flag_advice,
                    additional_data,
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
                    $12,
                    $13,
                    $14,
                    $14
                ) RETURNING *`, [
                    payment.Reference,
                    payment.CompanyCode,
                    payment.CustomerNumber,
                    payment.RequestID,
                    payment.ChannelType,
                    payment.CustomerName,
                    payment.CurrencyCode,
                    payment.PaidAmount,
                    payment.TotalAmount,
                    payment.SubCompany,
                    payment.TransactionDate,
                    payment.FlagAdvice,
                    payment.AdditionalData,
                    timestamp
                ]
            )
        } catch (e) {
            var { rows: payment } = await pg.connection.query(
                `SELECT * FROM ${self.getTable()} WHERE reference = $1`, [
                    payment.Reference
                ]
            )
        }
        if (payment.length == 1) {
            return payment[0]
        }
    }
    getTable() {
        return 'payment'
    }
}

const Payment = new _Payment()
const self = Payment
module.exports = Payment
