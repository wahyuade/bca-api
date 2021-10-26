const Helper = require("../libs/helper")


MAX_ITERATION = 3

class _VirtualAccount {
    async generate(pg, expired_in_second) {
        const virtual_account = await self.#recursiveGeneration(pg)
        await self.create(pg, virtual_account, expired_in_second)
        return virtual_account
    }
    async create(pg, virtual_account, expired_in_second) {
        const timestamp = new Date()
        const expired = new Date(timestamp.getTime() + (1000 * expired_in_second))
        if (await self.isExist(pg, virtual_account)) {
            if (await self.isActive(pg, virtual_account)) {
                throw {
                    virtual_account: ['virtual_account is currently active']
                }
            }
            await pg.connection.query(
                `UPDATE ${self.getTable()} 
                SET expired = $1, updated = $2
                WHERE virtual_account = $3`, [
                    expired,
                    timestamp,
                    virtual_account
                ])
        } else {
            await pg.connection.query(`INSERT INTO ${self.getTable()} (
                virtual_account,
                company_code,
                expired,
                created,
                updated
            ) VALUES (
                $1,
                $2,
                $3,
                $4,
                $4
            )`, [
                virtual_account,
                process.env.COMPANY_CODE_VA,
                expired,
                timestamp
            ])
        }
    }
    async #recursiveGeneration(pg, i=0) {
        i = i+1
        if (i > MAX_ITERATION) {
            throw {
                virtual_account: ['Insufficent random virtual_account, please try again']
            }
        }
        const virtual_account = `${process.env.COMPANY_CODE_VA}${Helper.randomNumber(10)}`
        if (await self.isExist(pg, virtual_account)) {
            return self.#recursiveGeneration(pg, i)
        }
        return virtual_account
    }
    async isExist(pg, virtual_account) {
        const { rowCount } = await pg.connection.query(
            `SELECT virtual_account
            FROM ${self.getTable()}
            WHERE virtual_account = $1`,
            [
                virtual_account
            ]
        )
        return rowCount == 1
    }
    async isActive(pg, virtual_account) {
        const timestamp = new Date()
        const { rowCount } = await pg.connection.query(
            `SELECT virtual_account
            FROM ${self.getTable()}
            WHERE virtual_account = $1 AND expired > $2
            FOR UPDATE`,
            [
                virtual_account,
                timestamp
            ]
        )
        return rowCount == 1
    }
    async deactive(pg, virtual_account) {
        const timestamp = new Date()
        await pg.connection.query(
            `UPDATE ${self.getTable()} SET expired = $1 WHERE virtual_account = $2`, [
                timestamp, virtual_account
            ]
        )
    }
    getTable() {
        return 'virtual_account'
    }
}

const VirtualAccount = new _VirtualAccount()
const self = VirtualAccount
module.exports = VirtualAccount