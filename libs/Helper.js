class _Helper {
    randomString(length) {
        var result           = ''
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        var charactersLength = characters.length
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength))
        }
        return result
    }
    randomNumber(length) {
        var result           = ''
        var characters       = '0123456789'
        var charactersLength = characters.length
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength))
        }
        return result
    }
    stringLocalTimeToDate(string_date) {
        let date = string_date.slice(0, 10).split('/')
        let time = string_date.slice(11)
        if(time.length != 8) {
            return null
        }
        let date_formated = `${date[2]}-${date[1]}-${date[0]} `
        let datetime = new Date(`${date_formated}${time}`)
        if (datetime.getDate() != Number(date[0])) {
            return null
        }
        if ((datetime.getMonth() + 1) != Number(date[1])) {
            return null
        }
        if(datetime != 'Invalid Date') {
            return datetime
        }
    }
    dateToStringLocalTime(date) {
        let day = String(date.getDate()).padStart(2, '0')
        let month = String(date.getMonth() + 1).padStart(2, '0')
        let year = String(date.getFullYear())

        let hour = date.getHours()
        let minute = date.getMinutes()
        let second = date.getSeconds()
        return `${day}/${month}/${year} ${hour}:${minute}:${second}`
    }
}

const Helper = new _Helper()
module.exports = Helper