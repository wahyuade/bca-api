const axios = require('axios')
const qs = require('qs')

ENDPOINT_GET_ACCESS_TOKEN = '/api/oauth/token'
class BCA {
    constructor() {
        this.refreshAccessToken()
    }
    async refreshAccessToken() {
        const axiosPayload = {
            method: 'post',
            url: process.env.BCA_HOST + ENDPOINT_GET_ACCESS_TOKEN,
            auth: {
                username: process.env.OAUTH_KEY,
                password: process.env.OAUTH_SECRET_KEY
            },
            data: qs.stringify({
                grant_type: 'client_credentials'
            })
        }
        try {
            let response = await axios(axiosPayload)
            if (response.status == 200) {
                this.access_token = response.data.access_token
            }
        } catch(e) {
            console.log(e.response.data)
        }
    }
}

const bca = new BCA()

module.exports = bca