const { Pool } = require('pg')

const config = {
    connectionString: process.env.SQL_URI,
    max: 1
}

const poolConfig = config
poolConfig.max = 100
const pool = new Pool(poolConfig);

(async ()=> {
    try {
        await pool.query(`SELECT NOW()`)
        console.log('CONNECT TO DATABASE: SUCCESS')
    } catch (e) {
        console.log(e.message)
    }
})();

class Postgresql {
    constructor () {
        this.connection = pool
    }

    async startTransaction () {
        this.connection = new Pool(config)
        await this.connection.query('BEGIN')
    }

    async commit () {
        await this.connection.query('COMMIT')
        this.connection.end()
    }

    async rollback () {
        await this.connection.query('ROLLBACK')
        this.connection.end()
    }
}

module.exports = Postgresql